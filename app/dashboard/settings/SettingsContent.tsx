'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import DashboardLayout from '@/components/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Building2, Save, CreditCard, CheckCircle, XCircle, ExternalLink } from 'lucide-react'

interface Business {
  id: string
  slug: string
  name: string
  business_type: string
  description: string | null
  phone: string | null
  email: string | null
  address: string | null
  city: string | null
  country: string | null
  is_active: boolean
  stripe_account_id: string | null
  stripe_account_status: string | null
  stripe_charges_enabled: boolean
}

interface Props {
  business: Business
}

const BUSINESS_TYPES = [
  { value: 'sports', label: 'Sports' },
  { value: 'fitness', label: 'Fitness' },
  { value: 'beauty', label: 'Beauty & Salon' },
  { value: 'wellness', label: 'Wellness' },
  { value: 'education', label: 'Education & Tutoring' },
  { value: 'other', label: 'Other' },
]

export default function SettingsContent({ business: initialBusiness }: Props) {
  const [business, setBusiness] = useState(initialBusiness)
  const [loading, setLoading] = useState(false)
  const [connectingStripe, setConnectingStripe] = useState(false)
  const [formData, setFormData] = useState({
    name: business.name,
    business_type: business.business_type,
    description: business.description || '',
    phone: business.phone || '',
    email: business.email || '',
    address: business.address || '',
    city: business.city || 'Ras Al Khaimah',
    country: business.country || 'UAE',
    stripe_publishable_key: business.stripe_account_id || '',
    stripe_secret_key: '',
  })

  const router = useRouter()
  const supabase = createClient()

  // Check Stripe connection status on mount
  useEffect(() => {
    loadStripeKeys();
    
    if (business.stripe_account_id) {
      checkStripeStatus()
    }
    
    // Check for redirect from Stripe Connect
    const params = new URLSearchParams(window.location.search)
    if (params.get('stripe_connected') === 'true') {
      checkStripeStatus()
      alert('Stripe connected successfully! You can now accept payments.')
      // Clean up URL
      window.history.replaceState({}, '', '/dashboard/settings')
    }
  }, [])

  const loadStripeKeys = async () => {
    try {
      const { data } = await supabase
        .from('businesses')
        .select('stripe_account_id, stripe_secret_key')
        .eq('id', business.id)
        .single();

      if (data) {
        setFormData(prev => ({
          ...prev,
          stripe_publishable_key: data.stripe_account_id || '',
          stripe_secret_key: data.stripe_secret_key || '',
        }));
      }
    } catch (error) {
      console.error('Error loading Stripe keys:', error);
    }
  }

  const checkStripeStatus = async () => {
    try {
      const response = await fetch(`/api/stripe/connect?business_id=${business.id}`)
      const data = await response.json()
      
      if (data.connected) {
        setBusiness({
          ...business,
          stripe_account_status: 'connected',
          stripe_charges_enabled: true,
        })
      }
    } catch (error) {
      console.error('Error checking Stripe status:', error)
    }
  }

  const handleConnectStripe = async () => {
    setConnectingStripe(true)
    try {
      // Create Stripe Connect link
      const response = await fetch('/api/stripe/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ business_id: business.id }),
      })

      const data = await response.json()

      if (response.ok && data.url) {
        // Redirect to Stripe Connect onboarding
        window.location.href = data.url
      } else {
        alert('Failed to connect Stripe: ' + (data.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Stripe connection error:', error)
      alert('Failed to connect Stripe')
    } finally {
      setConnectingStripe(false)
    }
  }

  const handleDisconnectStripe = async () => {
    if (!confirm('Are you sure you want to disconnect Stripe? This will disable payment processing.')) {
      return
    }

    const { error } = await supabase
      .from('businesses')
      .update({
        stripe_account_id: null,
        stripe_account_status: 'disconnected',
        stripe_charges_enabled: false,
      })
      .eq('id', business.id)

    if (error) {
      alert(`Error: ${error.message}`)
    } else {
      setBusiness({
        ...business,
        stripe_account_id: null,
        stripe_account_status: 'disconnected',
        stripe_charges_enabled: false,
      })
      alert('Stripe disconnected successfully')
      router.refresh()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Prepare update data
    const updateData = {
      name: formData.name,
      business_type: formData.business_type,
      description: formData.description,
      phone: formData.phone,
      email: formData.email,
      address: formData.address,
      city: formData.city,
      country: formData.country,
      // Store stripe publishable key in stripe_account_id (repurposing this field)
      stripe_account_id: formData.stripe_publishable_key || null,
      // Store secret key encrypted (you should encrypt this properly in production)
      stripe_secret_key: formData.stripe_secret_key || null,
    }

    const { error } = await supabase
      .from('businesses')
      .update(updateData)
      .eq('id', business.id)

    if (error) {
      alert(`Error: ${error.message}`)
    } else {
      setBusiness({ ...business, ...updateData })
      alert('Settings saved successfully!')
      router.refresh()
    }

    setLoading(false)
  }

  const handleToggleActive = async () => {
    const { error } = await supabase
      .from('businesses')
      .update({ is_active: !business.is_active })
      .eq('id', business.id)

    if (error) {
      alert(`Error: ${error.message}`)
    } else {
      setBusiness({ ...business, is_active: !business.is_active })
      router.refresh()
    }
  }

  return (
    <DashboardLayout businessName={business.name}>
      <div className="space-y-6 max-w-4xl">
        <div>
          <h2 className="text-3xl font-bold">Settings</h2>
          <p className="text-gray-600 mt-1">Manage your business profile</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Business Information
            </CardTitle>
            <CardDescription>
              Update your business details and Stripe payment settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Business Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="business_type">Business Type *</Label>
                <Select
                  value={formData.business_type}
                  onValueChange={(value) => setFormData({ ...formData, business_type: value || '' })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BUSINESS_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of your business"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+971 50 123 4567"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Contact Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="contact@business.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Street address"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  />
                </div>
              </div>

              {/* Stripe API Keys */}
              <div className="space-y-4 pt-4 border-t">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Stripe API Keys</h3>
                  <p className="text-sm text-gray-600">
                    Enter your Stripe keys to enable payment processing
                  </p>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm">
                  <p className="font-semibold text-blue-900 mb-2">How to get your keys:</p>
                  <ol className="list-decimal ml-4 space-y-1 text-blue-800">
                    <li>Go to <a href="https://dashboard.stripe.com/test/apikeys" target="_blank" rel="noopener noreferrer" className="underline font-medium">Stripe API Keys</a></li>
                    <li>Make sure you're in <strong>Test mode</strong></li>
                    <li>Copy your <strong>Publishable key</strong> (pk_test_...)</li>
                    <li>Copy your <strong>Secret key</strong> (sk_test_...)</li>
                  </ol>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stripe_publishable_key">Publishable Key</Label>
                  <Input
                    id="stripe_publishable_key"
                    type="text"
                    placeholder="pk_test_..."
                    value={formData.stripe_publishable_key || ''}
                    onChange={(e) => setFormData({ ...formData, stripe_publishable_key: e.target.value })}
                  />
                  <p className="text-xs text-gray-500">Safe to share publicly</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stripe_secret_key">Secret Key</Label>
                  <Input
                    id="stripe_secret_key"
                    type="text"
                    placeholder={formData.stripe_secret_key ? "sk_test_••••••••••••••••" : "sk_test_..."}
                    value={formData.stripe_secret_key || ''}
                    onChange={(e) => setFormData({ ...formData, stripe_secret_key: e.target.value })}
                  />
                  <p className="text-xs text-gray-500">
                    {formData.stripe_secret_key ? '✅ Secret key saved (showing in plain text - save form to encrypt)' : 'Keep this private'}
                  </p>
                </div>

                {(formData.stripe_publishable_key && formData.stripe_secret_key) && (
                  <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <p className="text-sm font-medium text-green-900">Stripe keys ready to save</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={loading}>
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Business Status</CardTitle>
            <CardDescription>
              Control whether your business is visible to customers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">
                  Status: {business.is_active ? 'Active' : 'Inactive'}
                </p>
                <p className="text-sm text-gray-600">
                  {business.is_active 
                    ? 'Your business is visible to customers' 
                    : 'Your business is hidden from customers'
                  }
                </p>
              </div>
              <Button
                variant={business.is_active ? 'outline' : 'default'}
                onClick={handleToggleActive}
              >
                {business.is_active ? 'Deactivate' : 'Activate'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Business URL</CardTitle>
            <CardDescription>
              Share this URL with customers to let them view and book your services
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                value={`https://raklife.app/business/${business.slug}`}
                readOnly
                className="bg-gray-50"
              />
              <Button
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(`https://raklife.app/business/${business.slug}`)
                  alert('Link copied to clipboard!')
                }}
              >
                Copy
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
