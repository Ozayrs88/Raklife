'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import DashboardLayout from '@/components/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { TrendingUp, Users, DollarSign, Package, Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react'

interface Business {
  id: string
  name: string
  business_type: string
  description: string
  address: string
  phone: string
  email: string
}

interface Service {
  id: string
  name: string
  description: string
  duration_minutes: number
  price: number
  capacity: number
  is_active: boolean
}

interface Booking {
  id: string
  created_at: string
  status: string
  services: { name: string } | null
}

interface Props {
  business: Business | null
  services: Service[]
  bookings: Booking[]
  metrics: {
    activeEnrollments: number
    thisWeekSessions: number
    attendanceRate: number
    monthlyRevenue: number
    capacityFilled: number
    overdueMembers?: number
    totalOutstanding?: number
    collectedRevenue?: number
    failedPayments?: number
  }
  userId: string
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

export default function DashboardContent({ business, services, bookings, metrics, userId }: Props) {
  const [showSetup, setShowSetup] = useState(!business)
  const [loading, setLoading] = useState(false)
  const [businessName, setBusinessName] = useState('')
  const [category, setCategory] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleQuickSetup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const slug = businessName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      + '-' + Math.random().toString(36).substring(2, 8)

    const businessTypeMap: { [key: string]: string } = {
      'Kids Sports Academy': 'sports',
      'Fitness Studio': 'fitness',
      'Salon & Beauty': 'beauty',
      'Tutoring & Education': 'education',
      'Wellness Clinic': 'wellness',
      'Workshop & Camp': 'education',
      'Other': 'other',
    }

    const { data: newBusiness, error: businessError } = await supabase
      .from('businesses')
      .insert({
        slug,
        name: businessName,
        business_type: businessTypeMap[category] || 'other',
        description: `Welcome to ${businessName}`,
        phone: '',
        address: '',
        email: '',
      })
      .select()
      .single()

    if (businessError) {
      alert(`Error: ${businessError.message}`)
      setLoading(false)
      return
    }

    await supabase
      .from('business_staff')
      .insert({
        business_id: newBusiness.id,
        user_id: userId,
        role: 'owner',
      })

    setLoading(false)
    setShowSetup(false)
    router.refresh()
  }

  if (showSetup) {
    return (
      <DashboardLayout>
        <Dialog open={showSetup} onOpenChange={() => {}}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create Your Business</DialogTitle>
              <DialogDescription>
                Let's get you set up in under a minute
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleQuickSetup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="businessName">Business Name *</Label>
                <Input
                  id="businessName"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  required
                  placeholder="e.g., Champions Football Academy"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={category} onValueChange={(value) => setCategory(value || '')} required>
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
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Creating...' : 'Create Business'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </DashboardLayout>
    )
  }

  if (!business) {
    return null
  }

  const activeServices = services.filter((s) => s.is_active)
  const confirmedBookings = bookings.filter((b) => b.status === 'confirmed')
  const totalRevenue = confirmedBookings.reduce((sum, b) => {
    const service = services.find((s) => s.name === b.services?.name)
    return sum + (service?.price || 0)
  }, 0)

  return (
    <DashboardLayout businessName={business.name}>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Overview</h2>
            <p className="text-muted-foreground mt-1">Welcome back! Here's what's happening today.</p>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Enrollments
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.activeEnrollments}</div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <ArrowUpRight className="h-3 w-3 text-green-600" />
                <span className="text-green-600 font-medium">+12%</span> from last month
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                This Week
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.thisWeekSessions}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Scheduled sessions
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Attendance
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.attendanceRate}%</div>
              <p className="text-xs text-muted-foreground mt-1">
                Last 30 days
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">AED {metrics.monthlyRevenue.toFixed(0)}</div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <ArrowUpRight className="h-3 w-3 text-green-600" />
                <span className="text-green-600 font-medium">+8%</span> from last month
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Capacity
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.capacityFilled}%</div>
              <p className="text-xs text-muted-foreground mt-1">
                Classes filled
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Payment Recovery Section */}
        {((metrics.overdueMembers || 0) > 0 || (metrics.totalOutstanding || 0) > 0) && (
          <div className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-red-900">Payment Recovery</h3>
                <p className="text-sm text-red-700 mt-1">Outstanding payments to collect</p>
              </div>
              <Button
                onClick={() => router.push('/dashboard/members?filter=overdue')}
                variant="default"
                className="bg-red-600 hover:bg-red-700"
              >
                View Overdue Members
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-4">
                <div className="text-sm text-gray-600">Overdue Members</div>
                <div className="text-3xl font-bold text-red-600 mt-1">{metrics.overdueMembers || 0}</div>
              </div>
              <div className="bg-white rounded-lg p-4">
                <div className="text-sm text-gray-600">Total Outstanding</div>
                <div className="text-3xl font-bold text-red-600 mt-1">
                  AED {(metrics.totalOutstanding || 0).toLocaleString()}
                </div>
              </div>
              <div className="bg-white rounded-lg p-4">
                <div className="text-sm text-gray-600">Collected This Month</div>
                <div className="text-3xl font-bold text-green-600 mt-1">
                  AED {(metrics.collectedRevenue || 0).toLocaleString()}
                </div>
              </div>
              <div className="bg-white rounded-lg p-4">
                <div className="text-sm text-gray-600">Failed Payments</div>
                <div className="text-3xl font-bold text-orange-600 mt-1">{metrics.failedPayments || 0}</div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button onClick={() => router.push('/dashboard/services')} size="lg">
              Add Service
            </Button>
            <Button onClick={() => router.push('/dashboard/schedule')} variant="outline" size="lg">
              Set Schedule
            </Button>
            <Button onClick={() => router.push('/dashboard/pricing')} variant="outline" size="lg">
              Manage Pricing
            </Button>
            <Button onClick={() => router.push('/dashboard/settings')} variant="outline" size="lg">
              Edit Business Info
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              {bookings.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground">No bookings yet</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Bookings will appear here once customers start enrolling
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {bookings.slice(0, 5).map((booking) => (
                    <div key={booking.id} className="flex justify-between items-center">
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {booking.services?.name || 'Service'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(booking.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                      <Badge
                        variant={
                          booking.status === 'confirmed'
                            ? 'default'
                            : booking.status === 'pending'
                            ? 'secondary'
                            : 'destructive'
                        }
                      >
                        {booking.status}
                      </Badge>
                    </div>
                  ))}
                  <Separator className="my-4" />
                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={() => router.push('/dashboard/bookings')}
                  >
                    View all bookings →
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Services</CardTitle>
            </CardHeader>
            <CardContent>
              {services.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground mb-4">No services yet</p>
                  <Button onClick={() => router.push('/dashboard/services')}>
                    Add Your First Service
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {services.slice(0, 5).map((service) => (
                    <div key={service.id} className="flex justify-between items-start">
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">{service.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {service.duration_minutes} min • AED {service.price}
                        </p>
                      </div>
                      <Badge variant={service.is_active ? 'default' : 'secondary'}>
                        {service.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  ))}
                  <Separator className="my-4" />
                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={() => router.push('/dashboard/services')}
                  >
                    View all services →
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
