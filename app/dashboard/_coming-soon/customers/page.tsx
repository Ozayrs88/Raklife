import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import CustomersContent from './CustomersContent'

export default async function CustomersPage() {
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

  // Get unique customers from bookings
  const { data: bookings } = await supabase
    .from('bookings')
    .select(`
      user_id,
      created_at,
      services(price),
      users(id, full_name, email, phone)
    `)
    .eq('business_id', business.id)

  // Group by customer
  const customerMap = new Map()
  
  bookings?.forEach((booking: any) => {
    if (booking.user_id && booking.users) {
      if (!customerMap.has(booking.user_id)) {
        customerMap.set(booking.user_id, {
          ...booking.users,
          bookings: 0,
          totalSpent: 0,
          lastBooking: booking.created_at,
        })
      }
      const customer = customerMap.get(booking.user_id)
      customer.bookings += 1
      customer.totalSpent += booking.services?.price || 0
      if (new Date(booking.created_at) > new Date(customer.lastBooking)) {
        customer.lastBooking = booking.created_at
      }
    }
  })

  const customers = Array.from(customerMap.values())

  return <CustomersContent business={business} customers={customers} />
}
