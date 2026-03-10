import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ReportsContent from './ReportsContent'

export default async function ReportsPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: staffLinks } = await supabase
    .from('business_staff')
    .select('business_id, businesses(*)')
    .eq('user_id', user.id)
    .eq('role', 'owner')
    .limit(1)

  if (!staffLinks || staffLinks.length === 0) {
    redirect('/dashboard')
  }

  const business = staffLinks[0].businesses as any
  const now = new Date()

  // Get services
  const { data: services } = await supabase
    .from('services')
    .select('id, name')
    .eq('business_id', business.id)

  // Revenue data - last 6 months
  const monthlyRevenue = []
  for (let i = 5; i >= 0; i--) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1)
    const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0)

    const { data: subscriptions } = await supabase
      .from('subscriptions')
      .select('pricing_options(price)')
      .eq('business_id', business.id)
      .eq('status', 'active')
      .gte('created_at', monthStart.toISOString())
      .lte('created_at', monthEnd.toISOString())

    const revenue = subscriptions?.reduce((sum: number, sub: any) => {
      return sum + (sub.pricing_options?.price || 0)
    }, 0) || 0

    monthlyRevenue.push({
      month: monthDate.toLocaleDateString('en-US', { month: 'short' }),
      revenue,
    })
  }

  // Attendance data - last 30 days
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { data: completedSessions } = await supabase
    .from('bookings')
    .select('attended, scheduled_date')
    .eq('business_id', business.id)
    .eq('status', 'completed')
    .gte('scheduled_date', thirtyDaysAgo.toISOString().split('T')[0])

  const attendanceRate = completedSessions && completedSessions.length > 0
    ? Math.round((completedSessions.filter(s => s.attended === true).length / completedSessions.length) * 100)
    : 0

  // Service popularity
  const { data: serviceBookings } = await supabase
    .from('bookings')
    .select('service_id, services(name)')
    .eq('business_id', business.id)
    .gte('created_at', thirtyDaysAgo.toISOString())

  const servicePopularity = (services || []).map(service => {
    const bookingCount = serviceBookings?.filter((b: any) => b.service_id === service.id).length || 0
    return {
      name: service.name,
      bookings: bookingCount,
    }
  }).sort((a, b) => b.bookings - a.bookings)

  // Customer growth - last 6 months
  const customerGrowth = []
  for (let i = 5; i >= 0; i--) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1)
    const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0)

    const { data: newCustomers } = await supabase
      .from('subscriptions')
      .select('customer_id')
      .eq('business_id', business.id)
      .gte('created_at', monthStart.toISOString())
      .lte('created_at', monthEnd.toISOString())

    const uniqueCustomers = new Set(newCustomers?.map((s: any) => s.customer_id)).size

    customerGrowth.push({
      month: monthDate.toLocaleDateString('en-US', { month: 'short' }),
      customers: uniqueCustomers,
    })
  }

  // Summary stats
  const { count: totalCustomers } = await supabase
    .from('subscriptions')
    .select('customer_id', { count: 'exact', head: true })
    .eq('business_id', business.id)

  const { count: activeEnrollments } = await supabase
    .from('subscriptions')
    .select('*', { count: 'exact', head: true })
    .eq('business_id', business.id)
    .eq('status', 'active')

  const { data: allSubscriptions } = await supabase
    .from('subscriptions')
    .select('pricing_options(price)')
    .eq('business_id', business.id)
    .eq('status', 'active')

  const totalRevenue = allSubscriptions?.reduce((sum: number, sub: any) => {
    return sum + (sub.pricing_options?.price || 0)
  }, 0) || 0

  return <ReportsContent 
    business={business}
    monthlyRevenue={monthlyRevenue}
    attendanceRate={attendanceRate}
    servicePopularity={servicePopularity}
    customerGrowth={customerGrowth}
    stats={{
      totalCustomers: totalCustomers || 0,
      activeEnrollments: activeEnrollments || 0,
      totalRevenue,
    }}
  />
}
