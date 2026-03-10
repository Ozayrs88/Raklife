'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import DashboardLayout from '@/components/DashboardLayout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar, Search, Filter, Users, CheckCircle } from 'lucide-react'

interface Enrollment {
  id: string
  created_at: string
  start_date: string
  end_date: string
  status: string
  sessions_used: number
  schedule_days: number[]
  services: { name: string } | null
  users: { full_name: string; email: string; phone: string } | null
  pricing_plans: { 
    name: string
    type: string
    duration_weeks: number
    sibling_discount_percent: number | null 
  } | null
  pricing_options: { sessions_per_week: number; price: number } | null
}

interface Booking {
  id: string
  scheduled_date: string
  start_time: string
  end_time: string
  status: string
  attended: boolean | null
  services: { name: string } | null
  users: { full_name: string; email: string } | null
  subscriptions: { id: string } | null
}

interface Business {
  id: string
  name: string
}

interface Props {
  business: Business
  enrollments: Enrollment[]
  bookings: Booking[]
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function BookingsContent({ 
  business, 
  enrollments: initialEnrollments,
  bookings: initialBookings 
}: Props) {
  const [activeTab, setActiveTab] = useState<'enrollments' | 'sessions'>('enrollments')
  const [enrollments, setEnrollments] = useState(initialEnrollments)
  const [bookings, setBookings] = useState(initialBookings)
  const [filter, setFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const filteredEnrollments = enrollments.filter((enrollment) => {
    const matchesSearch = 
      searchTerm === '' ||
      enrollment.users?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enrollment.services?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const filteredBookings = bookings.filter((booking) => {
    const matchesFilter = filter === 'all' || booking.status === filter
    const matchesSearch = 
      searchTerm === '' ||
      booking.users?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.services?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const handleUpdateEnrollment = async (enrollmentId: string, newStatus: string) => {
    const { error } = await supabase
      .from('subscriptions')
      .update({ status: newStatus })
      .eq('id', enrollmentId)

    if (!error) {
      setEnrollments(enrollments.map(e => e.id === enrollmentId ? { ...e, status: newStatus } : e))
      router.refresh()
    } else {
      alert(`Error: ${error.message}`)
    }
  }

  const handleMarkAttendance = async (bookingId: string, attended: boolean) => {
    const { error } = await supabase
      .from('bookings')
      .update({ attended, status: 'completed' })
      .eq('id', bookingId)

    if (!error) {
      setBookings(bookings.map(b => b.id === bookingId ? { ...b, attended, status: 'completed' } : b))
      router.refresh()
    } else {
      alert(`Error: ${error.message}`)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700'
      case 'confirmed': return 'bg-green-100 text-green-700'
      case 'pending': return 'bg-yellow-100 text-yellow-700'
      case 'paused': return 'bg-orange-100 text-orange-700'
      case 'cancelled': return 'bg-red-100 text-red-700'
      case 'completed': return 'bg-blue-100 text-blue-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <DashboardLayout businessName={business.name}>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold">Bookings & Enrollments</h2>
          <p className="text-gray-600 mt-1">Manage memberships and class sessions</p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex gap-8">
            <button
              onClick={() => setActiveTab('enrollments')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'enrollments'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Active Enrollments
                <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full text-xs">
                  {enrollments.length}
                </span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('sessions')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'sessions'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Upcoming Sessions
                <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                  {bookings.length}
                </span>
              </div>
            </button>
          </nav>
        </div>

        {/* Search & Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search by customer or service..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              {activeTab === 'sessions' && (
                <Select value={filter} onValueChange={(value) => setFilter(value || 'all')}>
                  <SelectTrigger className="w-full sm:w-48">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sessions</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Enrollments Tab */}
        {activeTab === 'enrollments' && (
          <>
            {filteredEnrollments.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No active enrollments</h3>
                  <p className="text-gray-600">
                    When customers enroll in packages, they'll appear here
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredEnrollments.map((enrollment) => {
                  const totalSessions = (enrollment.pricing_options?.sessions_per_week || 0) * 
                                       (enrollment.pricing_plans?.duration_weeks || 0);
                  const progress = totalSessions > 0 
                    ? Math.round((enrollment.sessions_used / totalSessions) * 100) 
                    : 0;

                  return (
                    <Card key={enrollment.id}>
                      <CardContent className="pt-6">
                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                          <div className="flex-1 space-y-3">
                            <div className="flex items-center gap-3">
                              <h3 className="font-semibold text-lg">
                                {enrollment.users?.full_name || 'Unknown Customer'}
                              </h3>
                              <span className={`text-xs px-2 py-1 rounded ${getStatusColor(enrollment.status)}`}>
                                {enrollment.status}
                              </span>
                            </div>
                            
                            <div className="text-sm text-gray-600 space-y-2">
                              <p>{enrollment.users?.email}</p>
                              <p className="font-medium text-gray-900 text-base">
                                {enrollment.services?.name}
                              </p>
                              
                              {/* Package Details */}
                              <div className="bg-blue-50 rounded-lg p-3 space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="font-medium text-blue-900">
                                    {enrollment.pricing_plans?.name}
                                  </span>
                                  {enrollment.pricing_plans?.sibling_discount_percent && (
                                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                                      {enrollment.pricing_plans.sibling_discount_percent}% discount
                                    </span>
                                  )}
                                </div>
                                
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                  <div>
                                    <span className="text-blue-700">Days:</span>
                                    <span className="ml-1 font-medium">
                                      {enrollment.schedule_days?.map(d => DAY_NAMES[d]).join(', ') || 'Not set'}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-blue-700">Frequency:</span>
                                    <span className="ml-1 font-medium">
                                      {enrollment.pricing_options?.sessions_per_week || 0}x/week
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-blue-700">Duration:</span>
                                    <span className="ml-1 font-medium">
                                      {enrollment.pricing_plans?.duration_weeks || 0} weeks
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-blue-700">Price:</span>
                                    <span className="ml-1 font-medium">
                                      AED {enrollment.pricing_options?.price || 0}
                                    </span>
                                  </div>
                                </div>
                                
                                {/* Progress */}
                                <div className="space-y-1">
                                  <div className="flex justify-between text-xs text-blue-700">
                                    <span>Sessions completed</span>
                                    <span className="font-medium">
                                      {enrollment.sessions_used} / {totalSessions}
                                    </span>
                                  </div>
                                  <div className="w-full bg-blue-200 rounded-full h-2">
                                    <div 
                                      className="bg-blue-600 h-2 rounded-full transition-all"
                                      style={{ width: `${progress}%` }}
                                    />
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-4 text-xs">
                                <span>
                                  <span className="text-gray-500">Start:</span>{' '}
                                  {new Date(enrollment.start_date).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric'
                                  })}
                                </span>
                                <span>
                                  <span className="text-gray-500">End:</span>{' '}
                                  {new Date(enrollment.end_date).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric'
                                  })}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            {enrollment.status === 'active' && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleUpdateEnrollment(enrollment.id, 'paused')}
                                >
                                  Pause
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleUpdateEnrollment(enrollment.id, 'cancelled')}
                                >
                                  Cancel
                                </Button>
                              </>
                            )}
                            {enrollment.status === 'paused' && (
                              <Button
                                size="sm"
                                onClick={() => handleUpdateEnrollment(enrollment.id, 'active')}
                              >
                                Resume
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* Sessions Tab */}
        {activeTab === 'sessions' && (
          <>
            {filteredBookings.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Calendar className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No upcoming sessions</h3>
                  <p className="text-gray-600">
                    Sessions from active enrollments will appear here
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredBookings.map((booking) => (
                  <Card key={booking.id}>
                    <CardContent className="pt-6">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-3">
                            <h3 className="font-semibold text-lg">
                              {booking.users?.full_name || 'Unknown Customer'}
                            </h3>
                            <span className={`text-xs px-2 py-1 rounded ${getStatusColor(booking.status)}`}>
                              {booking.status}
                            </span>
                            {booking.attended !== null && (
                              <span className={`text-xs px-2 py-1 rounded ${
                                booking.attended 
                                  ? 'bg-green-100 text-green-700' 
                                  : 'bg-red-100 text-red-700'
                              }`}>
                                {booking.attended ? '✓ Attended' : '✗ No Show'}
                              </span>
                            )}
                          </div>
                          
                          <div className="text-sm text-gray-600 space-y-1">
                            <p className="font-medium text-gray-900">{booking.services?.name}</p>
                            <div className="flex items-center gap-4">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {new Date(booking.scheduled_date).toLocaleDateString('en-US', {
                                  weekday: 'short',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </span>
                              <span>{booking.start_time?.substring(0, 5)}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          {booking.status === 'confirmed' && booking.attended === null && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleMarkAttendance(booking.id, true)}
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Attended
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleMarkAttendance(booking.id, false)}
                              >
                                No Show
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
