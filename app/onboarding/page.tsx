'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

type OnboardingStep = 1 | 2 | 3 | 4 | 5

interface BusinessData {
  name: string
  category: string
  description: string
  phone: string
  location: string
  email: string
}

interface ServiceData {
  name: string
  description: string
  duration: string
  price: string
  capacity: string
}

const CATEGORIES = [
  'Kids Sports Academy',
  'Fitness Studio',
  'Salon & Beauty',
  'Tutoring & Education',
  'Wellness Clinic',
  'Workshop & Camp',
  'Other',
]

export default function OnboardingPage() {
  const [step, setStep] = useState<OnboardingStep>(1)
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [businessData, setBusinessData] = useState<BusinessData>({
    name: '',
    category: '',
    description: '',
    phone: '',
    location: '',
    email: '',
  })
  const [serviceData, setServiceData] = useState<ServiceData>({
    name: '',
    description: '',
    duration: '60',
    price: '',
    capacity: '10',
  })
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
      } else {
        setUserId(user.id)
        if (user.user_metadata?.business_name) {
          setBusinessData(prev => ({ ...prev, name: user.user_metadata.business_name }))
        }
      }
    }
    getUser()
  }, [supabase, router])

  const progress = (step / 5) * 100

  const handleBusinessSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // First, ensure user profile exists
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      alert('User not found. Please log in again.')
      setLoading(false)
      return
    }

    // Check if user profile exists, if not create it
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('id', user.id)
      .single()

    if (!existingUser) {
      const { error: userError } = await supabase
        .from('users')
        .insert({
          id: user.id,
          email: user.email!,
          full_name: user.user_metadata?.business_name || 'Business Owner',
          user_type: 'business_owner',
        })

      if (userError) {
        console.error('Error creating user profile:', userError)
        alert(`Error creating user profile: ${userError.message}`)
        setLoading(false)
        return
      }
    }

    // Generate slug from business name
    const slug = businessData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      + '-' + Math.random().toString(36).substring(2, 8)

    // Map category to business_type
    const businessTypeMap: { [key: string]: string } = {
      'Kids Sports Academy': 'sports',
      'Fitness Studio': 'fitness',
      'Salon & Beauty': 'beauty',
      'Tutoring & Education': 'education',
      'Wellness Clinic': 'wellness',
      'Workshop & Camp': 'education',
      'Other': 'other',
    }

    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .insert({
        slug,
        name: businessData.name,
        business_type: businessTypeMap[businessData.category] || 'other',
        description: businessData.description,
        phone: businessData.phone,
        address: businessData.location,
        email: businessData.email,
      })
      .select()
      .single()

    if (businessError) {
      console.error('Error creating business:', businessError)
      alert(`Error creating business: ${businessError.message || 'Please try again.'}`)
      setLoading(false)
      return
    }

    // Link business to user as owner
    if (business && userId) {
      const { error: staffError } = await supabase
        .from('business_staff')
        .insert({
          business_id: business.id,
          user_id: userId,
          role: 'owner',
        })

      if (staffError) {
        console.error('Error linking business to user:', staffError)
        alert(`Error linking business: ${staffError.message || 'Please check Supabase RLS policies'}`)
        setLoading(false)
        return
      }
    }

    setStep(2)
    setLoading(false)
  }

  const handleServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    console.log('=== Service Submit Debug ===')
    console.log('User ID:', userId)

    // Get business where user is owner (try multiple approaches)
    let businessId: string | null = null

    // Try 1: Through business_staff
    const { data: staffLink, error: staffError } = await supabase
      .from('business_staff')
      .select('business_id, role')
      .eq('user_id', userId)
      .maybeSingle()

    console.log('Staff link query result:', staffLink)
    console.log('Staff link error:', staffError)

    if (staffLink) {
      businessId = staffLink.business_id
      console.log('Found business via staff link:', businessId)
    } else {
      console.log('No staff link found, trying fallback...')
      
      // Try 2: Get all businesses (for debugging)
      const { data: allBusinesses } = await supabase
        .from('businesses')
        .select('id, name, created_at')
        .order('created_at', { ascending: false })
        .limit(5)

      console.log('Recent businesses:', allBusinesses)

      // Get the most recent business
      if (allBusinesses && allBusinesses.length > 0) {
        businessId = allBusinesses[0].id
        console.log('Using most recent business:', businessId)
        
        // Try to create the missing business_staff link
        const { data: newLink, error: linkError } = await supabase
          .from('business_staff')
          .insert({
            business_id: businessId,
            user_id: userId,
            role: 'owner',
          })
          .select()

        console.log('Created new staff link:', newLink)
        console.log('Link creation error:', linkError)
      }
    }

    if (!businessId) {
      console.error('Business staff error:', staffError)
      alert('Business not found. Please go back and complete step 1, or check that the business was created successfully.')
      setLoading(false)
      return
    }

    console.log('Creating service for business:', businessId)

    const { data: newService, error } = await supabase
      .from('services')
      .insert({
        business_id: businessId,
        name: serviceData.name,
        description: serviceData.description,
        service_type: 'class',
        duration_minutes: parseInt(serviceData.duration),
        price: parseFloat(serviceData.price),
        capacity: parseInt(serviceData.capacity),
        is_active: true,
      })
      .select()

    console.log('Service creation result:', newService)
    console.log('Service creation error:', error)

    if (error) {
      console.error('Error creating service:', error)
      alert(`Error creating service: ${error.message || 'Please try again.'}`)
    } else {
      console.log('✅ Service created successfully!')
      setStep(3)
    }
    setLoading(false)
  }

  const skipToStep = (nextStep: OnboardingStep) => {
    setStep(nextStep)
  }

  const completeOnboarding = async () => {
    setLoading(true)
    router.push('/dashboard')
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-center mb-2">Welcome to RAKlife!</h1>
          <p className="text-gray-600 text-center mb-6">
            Let's set up your business in just a few steps
          </p>
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between mt-2 text-sm text-gray-600">
            <span>Step {step} of 5</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
        </div>

        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
              <CardDescription>Tell us about your business</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleBusinessSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Business Name *</Label>
                  <Input
                    id="name"
                    value={businessData.name}
                    onChange={(e) => setBusinessData({ ...businessData, name: e.target.value })}
                    required
                    placeholder="e.g., Champions Football Academy"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={businessData.category}
                    onValueChange={(value) => setBusinessData({ ...businessData, category: value || '' })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Input
                    id="description"
                    value={businessData.description}
                    onChange={(e) => setBusinessData({ ...businessData, description: e.target.value })}
                    required
                    placeholder="Brief description of your business"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={businessData.phone}
                    onChange={(e) => setBusinessData({ ...businessData, phone: e.target.value })}
                    required
                    placeholder="+971 50 123 4567"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    value={businessData.location}
                    onChange={(e) => setBusinessData({ ...businessData, location: e.target.value })}
                    required
                    placeholder="e.g., Al Hamra Village, Ras Al Khaimah"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Contact Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={businessData.email}
                    onChange={(e) => setBusinessData({ ...businessData, email: e.target.value })}
                    required
                    placeholder="contact@yourbusiness.com"
                  />
                </div>
                <div className="flex justify-end space-x-4 pt-4">
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Saving...' : 'Continue'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Create Your First Service</CardTitle>
              <CardDescription>Add a service that customers can book</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleServiceSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="serviceName">Service Name *</Label>
                  <Input
                    id="serviceName"
                    value={serviceData.name}
                    onChange={(e) => setServiceData({ ...serviceData, name: e.target.value })}
                    required
                    placeholder="e.g., Football Training Session"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="serviceDescription">Description *</Label>
                  <Input
                    id="serviceDescription"
                    value={serviceData.description}
                    onChange={(e) => setServiceData({ ...serviceData, description: e.target.value })}
                    required
                    placeholder="Brief description of this service"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (minutes) *</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={serviceData.duration}
                      onChange={(e) => setServiceData({ ...serviceData, duration: e.target.value })}
                      required
                      min="15"
                      step="15"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (AED) *</Label>
                    <Input
                      id="price"
                      type="number"
                      value={serviceData.price}
                      onChange={(e) => setServiceData({ ...serviceData, price: e.target.value })}
                      required
                      min="0"
                      step="0.01"
                      placeholder="50.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="capacity">Capacity *</Label>
                    <Input
                      id="capacity"
                      type="number"
                      value={serviceData.capacity}
                      onChange={(e) => setServiceData({ ...serviceData, capacity: e.target.value })}
                      required
                      min="1"
                      placeholder="10"
                    />
                  </div>
                </div>
                <div className="flex justify-between pt-4">
                  <Button type="button" variant="outline" onClick={() => setStep(1)}>
                    Back
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Saving...' : 'Continue'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Add Schedule</CardTitle>
              <CardDescription>Set up your availability (coming soon)</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-6">
                Schedule builder will be available in the dashboard. For now, you can skip this step.
              </p>
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(2)}>
                  Back
                </Button>
                <Button onClick={() => skipToStep(4)}>
                  Skip for Now
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 4 && (
          <Card>
            <CardHeader>
              <CardTitle>Connect Stripe</CardTitle>
              <CardDescription>Set up payments (coming soon)</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-6">
                Stripe integration will be available in the dashboard. You can set this up later.
              </p>
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(3)}>
                  Back
                </Button>
                <Button onClick={() => skipToStep(5)}>
                  Skip for Now
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 5 && (
          <Card>
            <CardHeader>
              <CardTitle>You're All Set!</CardTitle>
              <CardDescription>Ready to start managing your business</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                <h3 className="font-semibold text-green-900 mb-2">✓ Business Created</h3>
                <p className="text-green-700 text-sm mb-4">
                  Your business profile is live! Customers can now discover and book your services.
                </p>
                <h3 className="font-semibold text-green-900 mb-2">Next Steps:</h3>
                <ul className="text-sm text-green-700 space-y-1 list-disc list-inside">
                  <li>Add more services</li>
                  <li>Set up your weekly schedule</li>
                  <li>Connect Stripe for payments</li>
                  <li>Upload business photos</li>
                </ul>
              </div>
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(4)}>
                  Back
                </Button>
                <Button onClick={completeOnboarding} disabled={loading}>
                  {loading ? 'Loading...' : 'Go to Dashboard'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
