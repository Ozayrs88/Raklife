'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import DashboardLayout from '@/components/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Plus, Edit, Trash2, DollarSign, Package, Users, Sparkles, Zap, Copy } from 'lucide-react'

interface Service {
  id: string
  name: string
  price: number
}

interface PricingOption {
  id?: string
  sessions_per_week: number
  price: number
}

interface PricingPlan {
  id: string
  service_id: string
  name: string
  type: 'monthly' | 'term' | 'sibling' | 'custom'
  sessions_per_week: number | null
  duration_weeks: number | null
  price: number
  sibling_discount_percent: number | null
  description: string | null
  is_active: boolean
  services: { name: string } | null
  pricing_options?: PricingOption[]
}

interface Business {
  id: string
  name: string
}

interface Props {
  business: Business
  services: Service[]
  pricingPlans: PricingPlan[]
}

const PLAN_TYPES = [
  { value: 'monthly', label: 'Monthly Package', icon: Package, color: 'blue' },
  { value: 'term', label: 'Term Package', icon: Package, color: 'purple' },
  { value: 'sibling', label: 'Sibling Discount', icon: Users, color: 'green' },
  { value: 'custom', label: 'Custom Pricing', icon: Sparkles, color: 'orange' },
]

export default function PricingContent({ business, services, pricingPlans: initialPlans }: Props) {
  const [pricingPlans, setPricingPlans] = useState(initialPlans)
  const [showDialog, setShowDialog] = useState(false)
  const [editingPlan, setEditingPlan] = useState<PricingPlan | null>(null)
  const [loading, setLoading] = useState(false)
  const [quickSetupData, setQuickSetupData] = useState({
    service_id: '',
    base_price: '',
    create_monthly: true,
    create_term: true,
    create_sibling: true,
    monthly_options: [{ sessions: '1', discount: '0', price: '' }, { sessions: '2', discount: '0', price: '' }] as Array<{sessions: string, discount: string, price: string}>,
    term_weeks: '12',
    term_options: [{ sessions: '1', discount: '0', price: '' }, { sessions: '2', discount: '0', price: '' }] as Array<{sessions: string, discount: string, price: string}>,
    sibling_discount: '10',
  })

  const router = useRouter()
  const supabase = createClient()

  const handleEdit = (plan: PricingPlan) => {
    setEditingPlan(plan)
    
    // Pre-fill the form with existing data
    setQuickSetupData({
      service_id: plan.service_id,
      base_price: '',
      create_monthly: plan.type === 'monthly',
      create_term: plan.type === 'term',
      create_sibling: !!plan.sibling_discount_percent,
      monthly_options: plan.type === 'monthly' && plan.pricing_options?.length 
        ? plan.pricing_options.map(opt => ({ sessions: opt.sessions_per_week.toString(), discount: '0', price: opt.price.toString() }))
        : [{ sessions: '1', discount: '0', price: '' }, { sessions: '2', discount: '0', price: '' }],
      term_weeks: plan.duration_weeks?.toString() || '12',
      term_options: plan.type === 'term' && plan.pricing_options?.length
        ? plan.pricing_options.map(opt => ({ sessions: opt.sessions_per_week.toString(), discount: '0', price: opt.price.toString() }))
        : [{ sessions: '1', discount: '0', price: '' }, { sessions: '2', discount: '0', price: '' }],
      sibling_discount: plan.sibling_discount_percent?.toString() || '10',
    })
    
    setShowDialog(true)
  }

  const handleQuickSetup = async () => {
    setLoading(true)

    const basePrice = quickSetupData.base_price ? parseFloat(quickSetupData.base_price) : null
    const plansToCreate: any[] = []

    // If editing, update existing plan and options
    if (editingPlan) {
      const updatedPlan = {
        name: editingPlan.type === 'monthly' ? 'Monthly Package' : `Term Package (${quickSetupData.term_weeks} weeks)`,
        duration_weeks: editingPlan.type === 'monthly' ? 4 : parseInt(quickSetupData.term_weeks),
        sibling_discount_percent: quickSetupData.create_sibling ? parseFloat(quickSetupData.sibling_discount) : null,
        description: editingPlan.type === 'monthly' 
          ? `Flexible monthly sessions${quickSetupData.create_sibling ? ` • ${quickSetupData.sibling_discount}% sibling discount applies` : ''}`
          : `Flexible ${quickSetupData.term_weeks}-week term${quickSetupData.create_sibling ? ` • ${quickSetupData.sibling_discount}% sibling discount applies` : ''}`,
      }

      const { error: updateError } = await supabase
        .from('pricing_plans')
        .update(updatedPlan)
        .eq('id', editingPlan.id)

      if (updateError) {
        console.error('Error updating plan:', updateError)
        alert('Error updating plan')
        setLoading(false)
        return
      }

      // Get current options from form
      const formOptions = (editingPlan.type === 'monthly' ? quickSetupData.monthly_options : quickSetupData.term_options)
        .filter(opt => opt.sessions && opt.price)
        .map(opt => ({
          sessions_per_week: parseInt(opt.sessions),
          price: parseFloat(opt.price),
        }))

      // Get existing options from database
      const existingOptions = editingPlan.pricing_options || []
      
      // Find options to update, add, and delete
      const toUpdate: any[] = []
      const toAdd: any[] = []
      const existingIds = new Set()

      formOptions.forEach(formOpt => {
        const existing = existingOptions.find(e => e.sessions_per_week === formOpt.sessions_per_week)
        if (existing) {
          existingIds.add(existing.id)
          // Only update if price changed
          if (existing.price !== formOpt.price) {
            toUpdate.push({ id: existing.id, ...formOpt })
          }
        } else {
          toAdd.push({ pricing_plan_id: editingPlan.id, ...formOpt })
        }
      })

      // Find options to delete (existed before but not in form now)
      const toDelete = existingOptions.filter(e => !existingIds.has(e.id)).map(e => e.id)

      // Execute updates
      for (const opt of toUpdate) {
        const { id, ...updateData } = opt
        await supabase
          .from('pricing_options')
          .update(updateData)
          .eq('id', id)
      }

      // Add new options
      if (toAdd.length > 0) {
        await supabase
          .from('pricing_options')
          .insert(toAdd)
      }

      // Delete removed options
      if (toDelete.length > 0) {
        await supabase
          .from('pricing_options')
          .delete()
          .in('id', toDelete)
      }

      setShowDialog(false)
      setEditingPlan(null)
      setQuickSetupData({
        service_id: '',
        base_price: '',
        create_monthly: true,
        create_term: true,
        create_sibling: true,
        monthly_options: [{ sessions: '1', discount: '0', price: '' }, { sessions: '2', discount: '0', price: '' }],
        term_weeks: '12',
        term_options: [{ sessions: '1', discount: '0', price: '' }, { sessions: '2', discount: '0', price: '' }],
        sibling_discount: '10',
      })
      router.refresh()
      alert('✅ Plan updated successfully!')
      setLoading(false)
      return
    }

    // Creating new plans (existing code)
    // Monthly Package (if selected)
    if (quickSetupData.create_monthly) {
      const monthlyPlan = {
        service_id: quickSetupData.service_id,
        name: `Monthly Package`,
        type: 'monthly',
        sessions_per_week: null,
        duration_weeks: 4,
        price: 0,
        sibling_discount_percent: quickSetupData.create_sibling ? parseFloat(quickSetupData.sibling_discount) : null,
        description: `Flexible monthly sessions${quickSetupData.create_sibling ? ` • ${quickSetupData.sibling_discount}% sibling discount applies` : ''}`,
        is_active: true,
      }

      // Create the plan first, then add options
      const { data: planData, error: planError } = await supabase
        .from('pricing_plans')
        .insert(monthlyPlan)
        .select()
        .single()

      if (!planError && planData) {
        // Create pricing options
        const options = quickSetupData.monthly_options
          .filter(opt => opt.sessions && (basePrice || opt.price))
          .map(opt => {
            const sessionsPerWeek = parseInt(opt.sessions)
            const totalSessions = sessionsPerWeek * 4
            
            let optionPrice
            if (basePrice) {
              const fullPrice = totalSessions * basePrice
              const discount = parseFloat(opt.discount) / 100
              optionPrice = fullPrice * (1 - discount)
            } else {
              optionPrice = parseFloat(opt.price)
            }

            return {
              pricing_plan_id: planData.id,
              sessions_per_week: sessionsPerWeek,
              price: optionPrice,
            }
          })

        console.log('Creating monthly options:', options)

        const { data: optionsData, error: optionsError } = await supabase
          .from('pricing_options')
          .insert(options)
          .select()

        if (optionsError) {
          console.error('Error creating monthly options:', optionsError)
        } else {
          console.log('Successfully created options:', optionsData)
          plansToCreate.push({ ...planData, pricing_options: optionsData })
        }
      } else if (planError) {
        console.error('Error creating monthly plan:', planError)
      }
    }

    // Term Package (if selected)
    if (quickSetupData.create_term) {
      const termWeeks = parseInt(quickSetupData.term_weeks)
      const termPlan = {
        service_id: quickSetupData.service_id,
        name: `Term Package (${termWeeks} weeks)`,
        type: 'term',
        sessions_per_week: null,
        duration_weeks: termWeeks,
        price: 0,
        sibling_discount_percent: quickSetupData.create_sibling ? parseFloat(quickSetupData.sibling_discount) : null,
        description: `Flexible ${termWeeks}-week term${quickSetupData.create_sibling ? ` • ${quickSetupData.sibling_discount}% sibling discount applies` : ''}`,
        is_active: true,
      }

      const { data: planData, error: planError } = await supabase
        .from('pricing_plans')
        .insert(termPlan)
        .select()
        .single()

      if (!planError && planData) {
        const options = quickSetupData.term_options
          .filter(opt => opt.sessions && (basePrice || opt.price))
          .map(opt => {
            const sessionsPerWeek = parseInt(opt.sessions)
            const totalSessions = sessionsPerWeek * termWeeks
            
            let optionPrice
            if (basePrice) {
              const fullPrice = totalSessions * basePrice
              const discount = parseFloat(opt.discount) / 100
              optionPrice = fullPrice * (1 - discount)
            } else {
              optionPrice = parseFloat(opt.price)
            }

            return {
              pricing_plan_id: planData.id,
              sessions_per_week: sessionsPerWeek,
              price: optionPrice,
            }
          })

        console.log('Creating term options:', options)

        const { data: optionsData, error: optionsError } = await supabase
          .from('pricing_options')
          .insert(options)
          .select()

        if (optionsError) {
          console.error('Error creating term options:', optionsError)
        } else {
          console.log('Successfully created term options:', optionsData)
          plansToCreate.push({ ...planData, pricing_options: optionsData })
        }
      } else if (planError) {
        console.error('Error creating term plan:', planError)
      }
    }

    if (plansToCreate.length > 0) {
      setPricingPlans([...plansToCreate, ...pricingPlans])
      setShowDialog(false)
      setQuickSetupData({
        service_id: '',
        base_price: '',
        create_monthly: true,
        create_term: true,
        create_sibling: true,
        monthly_options: [{ sessions: '1', discount: '0', price: '' }, { sessions: '2', discount: '0', price: '' }],
        term_weeks: '12',
        term_options: [{ sessions: '1', discount: '0', price: '' }, { sessions: '2', discount: '0', price: '' }],
        sibling_discount: '10',
      })
      router.refresh()
      alert(`✅ Created ${plansToCreate.length} pricing plans successfully!`)
    } else {
      alert('❌ No plans were created. Check console for errors.')
    }

    setLoading(false)
  }

  const handleDelete = async (planId: string) => {
    if (!confirm('Delete this pricing plan? This cannot be undone.')) return

    const { error } = await supabase
      .from('pricing_plans')
      .delete()
      .eq('id', planId)

    if (!error) {
      setPricingPlans(pricingPlans.filter(p => p.id !== planId))
      router.refresh()
    } else {
      alert(`Error: ${error.message}`)
    }
  }

  const getPlanIcon = (type: string) => {
    const plan = PLAN_TYPES.find(p => p.value === type)
    return plan?.icon || Package
  }

  const getPlanColor = (type: string) => {
    const colors = {
      monthly: 'border-gray-200 bg-white',
      term: 'border-gray-200 bg-white',
      sibling: 'border-green-200 bg-green-50',
      custom: 'border-gray-200 bg-white',
    }
    return colors[type as keyof typeof colors] || colors.monthly
  }

  // Group plans by service
  const plansByService = services.map(service => ({
    service,
    plans: pricingPlans.filter(p => p.service_id === service.id),
  }))

  return (
    <DashboardLayout businessName={business.name}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold">Pricing & Packages</h2>
            <p className="text-gray-600 mt-1">Manage pricing options for your services</p>
          </div>
          <Button
            onClick={() => setShowDialog(true)}
            disabled={services.length === 0}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Pricing Plans
          </Button>
        </div>

        {/* Pricing Types Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {PLAN_TYPES.map((type) => {
            const Icon = type.icon
            const count = pricingPlans.filter(p => p.type === type.value).length
            return (
              <Card key={type.value}>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <Icon className="w-8 h-8 text-gray-600" />
                    <div>
                      <p className="text-2xl font-bold">{count}</p>
                      <p className="text-sm text-gray-600">{type.label}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {services.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <DollarSign className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No services yet</h3>
              <p className="text-gray-600 mb-4">Create services first before adding pricing plans</p>
              <Button onClick={() => router.push('/dashboard/services')}>
                Go to Services
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {plansByService.map(({ service, plans }) => (
              <Card key={service.id}>
                <CardHeader>
                  <div>
                    <CardTitle>{service.name}</CardTitle>
                    <CardDescription>
                      Drop-in: AED {service.price} • {plans.length} pricing {plans.length === 1 ? 'plan' : 'plans'}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  {plans.length === 0 ? (
                    <p className="text-sm text-gray-500">No pricing plans yet. Drop-in rate only.</p>
                  ) : (
                    <div className="space-y-3">
                      {plans.map((plan) => {
                        const Icon = getPlanIcon(plan.type)
                        return (
                          <div
                            key={plan.id}
                            className={`border rounded-lg ${getPlanColor(plan.type)}`}
                          >
                            {/* Header */}
                            <div className="flex items-center justify-between px-4 py-3 border-b">
                              <div className="flex items-center gap-3">
                                <Icon className="w-5 h-5 text-gray-600" />
                                <div>
                                  <h4 className="font-semibold text-gray-900">
                                    {plan.name}
                                    {plan.sibling_discount_percent && (
                                      <span className="text-sm font-normal text-green-600 ml-2">
                                        • Sibling discount {plan.sibling_discount_percent}% applies
                                      </span>
                                    )}
                                  </h4>
                                  {plan.description && (
                                    <p className="text-xs text-gray-500 mt-0.5">{plan.description}</p>
                                  )}
                                </div>
                              </div>
                              <div className="flex gap-1">
                                <button
                                  onClick={() => handleEdit(plan)}
                                  className="p-2 hover:bg-gray-100 rounded text-gray-400 hover:text-blue-600"
                                  title="Edit"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete(plan.id)}
                                  className="p-2 hover:bg-gray-100 rounded text-gray-400 hover:text-red-600"
                                  title="Delete"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                            
                            {/* Pricing Options */}
                            <div className="px-4 py-2">
                              {plan.pricing_options && plan.pricing_options.length > 0 ? (
                                <div className="space-y-1">
                                  {plan.pricing_options.map((opt, idx) => (
                                    <div key={idx} className="flex items-center justify-between py-2 text-sm border-b last:border-0">
                                      <span className="text-gray-600">
                                        {opt.sessions_per_week}x per week
                                        <span className="text-gray-400 ml-2">
                                          ({opt.sessions_per_week * (plan.duration_weeks || 4)} sessions)
                                        </span>
                                      </span>
                                      <span className="font-semibold text-gray-900">AED {opt.price}</span>
                                    </div>
                                  ))}
                                </div>
                              ) : plan.type === 'sibling' ? (
                                <div className="py-2 text-sm text-gray-600">
                                  Applied automatically when booking 2nd+ child
                                </div>
                              ) : (
                                <div className="flex items-center justify-between py-2 text-sm">
                                  <span className="text-gray-600">
                                    {plan.sessions_per_week}x per week • {plan.duration_weeks} weeks
                                  </span>
                                  <span className="font-semibold text-gray-900">AED {plan.price}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Add/Edit Pricing Plans Dialog */}
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingPlan ? 'Edit Pricing Plan' : 'Add Pricing Plans'}</DialogTitle>
              <DialogDescription>
                {editingPlan ? 'Update pricing options for this plan' : 'Create monthly, term, and sibling discount plans in one go'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="quick-service">Service *</Label>
                <Select
                  value={quickSetupData.service_id}
                  onValueChange={(value) => setQuickSetupData({ ...quickSetupData, service_id: value || '' })}
                  disabled={!!editingPlan}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a service" />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map((service) => (
                      <SelectItem key={service.id} value={service.id}>
                        {service.name} (Drop-in: AED {service.price})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="base-price">Base Price per Session (AED)</Label>
                <Input
                  id="base-price"
                  type="number"
                  step="0.01"
                  value={quickSetupData.base_price}
                  onChange={(e) => setQuickSetupData({ ...quickSetupData, base_price: e.target.value })}
                  placeholder="e.g., 50 (leave empty to set prices manually)"
                />
                <p className="text-xs text-gray-600">
                  {quickSetupData.base_price 
                    ? "We'll calculate prices automatically with your discount %"
                    : "Leave empty to set custom prices for each plan"}
                </p>
              </div>

              <div className="border rounded-lg p-4 space-y-3">
                <p className="font-medium">Select plans to create:</p>
                
                {/* Monthly Package */}
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="create-monthly"
                    checked={quickSetupData.create_monthly}
                    onChange={(e) => setQuickSetupData({ ...quickSetupData, create_monthly: e.target.checked })}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <label htmlFor="create-monthly" className="font-medium cursor-pointer">
                      📦 Monthly Package (4 weeks)
                    </label>
                    {quickSetupData.create_monthly && (
                      <div className="mt-2 space-y-2">
                        {quickSetupData.monthly_options.map((opt, idx) => (
                          <div key={idx} className="grid grid-cols-3 gap-2 p-2 bg-gray-50 rounded">
                            <div>
                              <Label className="text-xs">Sessions/week</Label>
                              <Input
                                type="number"
                                value={opt.sessions}
                                onChange={(e) => {
                                  const newOpts = [...quickSetupData.monthly_options]
                                  newOpts[idx].sessions = e.target.value
                                  setQuickSetupData({ ...quickSetupData, monthly_options: newOpts })
                                }}
                                min="1"
                                max="7"
                              />
                            </div>
                            {quickSetupData.base_price ? (
                              <div>
                                <Label className="text-xs">Discount %</Label>
                                <Input
                                  type="number"
                                  value={opt.discount}
                                  onChange={(e) => {
                                    const newOpts = [...quickSetupData.monthly_options]
                                    newOpts[idx].discount = e.target.value
                                    setQuickSetupData({ ...quickSetupData, monthly_options: newOpts })
                                  }}
                                  min="0"
                                  max="100"
                                  placeholder="0"
                                />
                              </div>
                            ) : (
                              <div>
                                <Label className="text-xs">Price (AED)</Label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={opt.price}
                                  onChange={(e) => {
                                    const newOpts = [...quickSetupData.monthly_options]
                                    newOpts[idx].price = e.target.value
                                    setQuickSetupData({ ...quickSetupData, monthly_options: newOpts })
                                  }}
                                  placeholder="e.g., 350"
                                />
                              </div>
                            )}
                            <div className="flex items-end">
                              {idx > 0 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    const newOpts = quickSetupData.monthly_options.filter((_, i) => i !== idx)
                                    setQuickSetupData({ ...quickSetupData, monthly_options: newOpts })
                                  }}
                                  className="text-red-600"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setQuickSetupData({
                              ...quickSetupData,
                              monthly_options: [...quickSetupData.monthly_options, { sessions: (quickSetupData.monthly_options.length + 1).toString(), discount: '0', price: '' }]
                            })
                          }}
                        >
                          <Plus className="w-4 h-4 mr-1" /> Add Another Option
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Term Package */}
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="create-term"
                    checked={quickSetupData.create_term}
                    onChange={(e) => setQuickSetupData({ ...quickSetupData, create_term: e.target.checked })}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <label htmlFor="create-term" className="font-medium cursor-pointer">
                      📦 Term Package
                    </label>
                    {quickSetupData.create_term && (
                      <div className="mt-2 space-y-2">
                        <div className="mb-2">
                          <Label className="text-xs">Duration (weeks)</Label>
                          <Input
                            type="number"
                            value={quickSetupData.term_weeks}
                            onChange={(e) => setQuickSetupData({ ...quickSetupData, term_weeks: e.target.value })}
                            min="8"
                            className="w-32"
                          />
                        </div>
                        {quickSetupData.term_options.map((opt, idx) => (
                          <div key={idx} className="grid grid-cols-3 gap-2 p-2 bg-gray-50 rounded">
                            <div>
                              <Label className="text-xs">Sessions/week</Label>
                              <Input
                                type="number"
                                value={opt.sessions}
                                onChange={(e) => {
                                  const newOpts = [...quickSetupData.term_options]
                                  newOpts[idx].sessions = e.target.value
                                  setQuickSetupData({ ...quickSetupData, term_options: newOpts })
                                }}
                                min="1"
                                max="7"
                              />
                            </div>
                            {quickSetupData.base_price ? (
                              <div>
                                <Label className="text-xs">Discount %</Label>
                                <Input
                                  type="number"
                                  value={opt.discount}
                                  onChange={(e) => {
                                    const newOpts = [...quickSetupData.term_options]
                                    newOpts[idx].discount = e.target.value
                                    setQuickSetupData({ ...quickSetupData, term_options: newOpts })
                                  }}
                                  min="0"
                                  max="100"
                                  placeholder="0"
                                />
                              </div>
                            ) : (
                              <div>
                                <Label className="text-xs">Price (AED)</Label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={opt.price}
                                  onChange={(e) => {
                                    const newOpts = [...quickSetupData.term_options]
                                    newOpts[idx].price = e.target.value
                                    setQuickSetupData({ ...quickSetupData, term_options: newOpts })
                                  }}
                                  placeholder="e.g., 900"
                                />
                              </div>
                            )}
                            <div className="flex items-end">
                              {idx > 0 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    const newOpts = quickSetupData.term_options.filter((_, i) => i !== idx)
                                    setQuickSetupData({ ...quickSetupData, term_options: newOpts })
                                  }}
                                  className="text-red-600"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setQuickSetupData({
                              ...quickSetupData,
                              term_options: [...quickSetupData.term_options, { sessions: (quickSetupData.term_options.length + 1).toString(), discount: '0', price: '' }]
                            })
                          }}
                        >
                          <Plus className="w-4 h-4 mr-1" /> Add Another Option
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Sibling Discount */}
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="create-sibling"
                    checked={quickSetupData.create_sibling}
                    onChange={(e) => setQuickSetupData({ ...quickSetupData, create_sibling: e.target.checked })}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <label htmlFor="create-sibling" className="font-medium cursor-pointer">
                      👨‍👩‍👧‍👦 Sibling Discount
                    </label>
                    {quickSetupData.create_sibling && (
                      <div className="mt-2">
                        <Label className="text-xs">Discount %</Label>
                        <Input
                          type="number"
                          value={quickSetupData.sibling_discount}
                          onChange={(e) => setQuickSetupData({ ...quickSetupData, sibling_discount: e.target.value })}
                          min="0"
                          max="100"
                          className="w-24"
                        />
                        <p className="text-xs text-gray-600 mt-1">
                          Applied to 2nd+ children
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg text-sm">
                <p className="font-medium text-blue-900 mb-2">💡 How it works:</p>
                <ul className="text-blue-700 space-y-1 text-xs">
                  <li>• <strong>With base price:</strong> Auto-calculate (sessions × base price) minus discount %</li>
                  <li>• <strong>Without base price:</strong> Set custom prices manually for each option</li>
                  <li>• <strong>Multiple options:</strong> Add as many session frequencies as you need (1x, 2x, 3x/week, etc.)</li>
                  <li>• Example: Monthly package with 1x/week = AED 200, 2x/week = AED 350, 3x/week = AED 500</li>
                </ul>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleQuickSetup}
                disabled={loading || !quickSetupData.service_id || 
                  (quickSetupData.create_monthly && quickSetupData.monthly_options.every(opt => !opt.sessions || (!quickSetupData.base_price && !opt.price))) ||
                  (quickSetupData.create_term && quickSetupData.term_options.every(opt => !opt.sessions || (!quickSetupData.base_price && !opt.price)))}
              >
                {loading ? 'Saving...' : editingPlan ? 'Update Plan' : 'Create Plans'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
