import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardContent from './DashboardContent'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get business through business_staff relationship (handle multiple businesses)
  const { data: staffLinks } = await supabase
    .from('business_staff')
    .select('business_id')
    .eq('user_id', user.id)
    .eq('role', 'owner')
    .order('created_at', { ascending: false })
    .limit(1)

  const businessId = staffLinks && staffLinks.length > 0 ? staffLinks[0].business_id : null

  let business = null
  let services = []
  let bookings = []
  let metrics = {
    activeEnrollments: 0,
    thisWeekSessions: 0,
    attendanceRate: 0,
    monthlyRevenue: 0,
    capacityFilled: 0,
    overdueMembers: 0,
    totalOutstanding: 0,
    collectedRevenue: 0,
    failedPayments: 0
  }

  if (businessId) {
    // Get business details
    const { data: businessData } = await supabase
      .from('businesses')
      .select('*')
      .eq('id', businessId)
      .single()

    business = businessData

    if (business) {
      const { data: servicesData } = await supabase
        .from('services')
        .select('*')
        .eq('business_id', business.id)

      const { data: bookingsData } = await supabase
        .from('bookings')
        .select('*, services(name)')
        .eq('business_id', business.id)
        .order('created_at', { ascending: false })
        .limit(10)

      services = servicesData || []
      bookings = bookingsData || []

      // Calculate metrics
      // 1. Active Enrollments
      const { count: enrollmentCount } = await supabase
        .from('subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('business_id', business.id)
        .eq('status', 'active')
      
      metrics.activeEnrollments = enrollmentCount || 0

      // 2. This Week's Sessions (Monday to Sunday)
      const now = new Date()
      const dayOfWeek = now.getDay()
      const startOfWeek = new Date(now)
      startOfWeek.setDate(now.getDate() - dayOfWeek)
      startOfWeek.setHours(0, 0, 0, 0)
      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(startOfWeek.getDate() + 7)

      const { count: weekSessionCount } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('business_id', business.id)
        .gte('scheduled_date', startOfWeek.toISOString().split('T')[0])
        .lt('scheduled_date', endOfWeek.toISOString().split('T')[0])
      
      metrics.thisWeekSessions = weekSessionCount || 0

      // 3. Attendance Rate (last 30 days completed sessions)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const { data: completedSessions } = await supabase
        .from('bookings')
        .select('attended')
        .eq('business_id', business.id)
        .eq('status', 'completed')
        .gte('scheduled_date', thirtyDaysAgo.toISOString().split('T')[0])
      
      if (completedSessions && completedSessions.length > 0) {
        const attended = completedSessions.filter(s => s.attended === true).length
        metrics.attendanceRate = Math.round((attended / completedSessions.length) * 100)
      }

      // 4. Monthly Revenue (active subscriptions)
      const { data: activeSubscriptions } = await supabase
        .from('subscriptions')
        .select(`
          pricing_options(price)
        `)
        .eq('business_id', business.id)
        .eq('status', 'active')
      
      if (activeSubscriptions) {
        metrics.monthlyRevenue = activeSubscriptions.reduce((sum, sub: any) => {
          return sum + (sub.pricing_options?.price || 0)
        }, 0)
      }

      // 5. Capacity (simple calculation based on schedules vs bookings)
      const { data: schedules } = await supabase
        .from('schedules')
        .select('capacity, service_id')
        .in('service_id', services.map(s => s.id))
      
      if (schedules && schedules.length > 0) {
        const totalCapacity = schedules.reduce((sum, s) => sum + (s.capacity || 0), 0) * 4 // 4 weeks
        if (totalCapacity > 0) {
          const { count: thisMonthBookings } = await supabase
            .from('bookings')
            .select('*', { count: 'exact', head: true })
            .eq('business_id', business.id)
            .gte('scheduled_date', new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0])
          
          metrics.capacityFilled = Math.min(Math.round(((thisMonthBookings || 0) / totalCapacity) * 100), 100)
        }
      }

      // 6. Payment Recovery Metrics
      // Get all customers for this business
      const { data: businessBookings } = await supabase
        .from('bookings')
        .select('customer_id')
        .eq('business_id', business.id)
      
      if (businessBookings && businessBookings.length > 0) {
        const customerIds = [...new Set(businessBookings.map(b => b.customer_id))]
        
        // Count overdue members and total outstanding
        const { data: customers } = await supabase
          .from('users')
          .select('overdue_amount')
          .in('id', customerIds)
        
        if (customers) {
          metrics.overdueMembers = customers.filter(c => (c.overdue_amount || 0) > 0).length
          metrics.totalOutstanding = customers.reduce((sum, c) => sum + (c.overdue_amount || 0), 0)
        }
      }

      // Get collected revenue this month from payment transactions
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const { data: payments } = await supabase
        .from('payment_transactions')
        .select('amount')
        .eq('business_id', business.id)
        .eq('status', 'succeeded')
        .gte('created_at', startOfMonth.toISOString())
      
      if (payments) {
        metrics.collectedRevenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0)
      }

      // Count failed payments this month
      const { count: failedCount } = await supabase
        .from('payment_transactions')
        .select('*', { count: 'exact', head: true })
        .eq('business_id', business.id)
        .eq('status', 'failed')
        .gte('created_at', startOfMonth.toISOString())
      
      metrics.failedPayments = failedCount || 0
    }
  }

  return <DashboardContent 
    business={business} 
    services={services} 
    bookings={bookings} 
    metrics={metrics}
    userId={user.id} 
  />
}
