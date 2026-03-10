'use client'

import DashboardLayout from '@/components/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3, TrendingUp, Users, DollarSign, Calendar, CheckCircle } from 'lucide-react'

interface Business {
  id: string
  name: string
}

interface MonthlyRevenue {
  month: string
  revenue: number
}

interface ServicePopularity {
  name: string
  bookings: number
}

interface CustomerGrowth {
  month: string
  customers: number
}

interface Stats {
  totalCustomers: number
  activeEnrollments: number
  totalRevenue: number
}

interface Props {
  business: Business
  monthlyRevenue: MonthlyRevenue[]
  attendanceRate: number
  servicePopularity: ServicePopularity[]
  customerGrowth: CustomerGrowth[]
  stats: Stats
}

export default function ReportsContent({
  business,
  monthlyRevenue,
  attendanceRate,
  servicePopularity,
  customerGrowth,
  stats,
}: Props) {
  const maxRevenue = Math.max(...monthlyRevenue.map(m => m.revenue), 1)
  const maxCustomers = Math.max(...customerGrowth.map(c => c.customers), 1)
  const maxBookings = Math.max(...servicePopularity.map(s => s.bookings), 1)

  return (
    <DashboardLayout businessName={business.name}>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold">Reports & Analytics</h2>
          <p className="text-gray-600 mt-1">Track your business performance and growth</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <DollarSign className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Monthly Revenue</p>
                  <p className="text-2xl font-bold">AED {stats.totalRevenue.toFixed(0)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Customers</p>
                  <p className="text-2xl font-bold">{stats.totalCustomers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Calendar className="w-8 h-8 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Active Enrollments</p>
                  <p className="text-2xl font-bold">{stats.activeEnrollments}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-orange-600" />
                <div>
                  <p className="text-sm text-gray-600">Attendance Rate</p>
                  <p className="text-2xl font-bold">{attendanceRate}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Revenue Trend (Last 6 Months)
            </CardTitle>
            <CardDescription>
              Monthly revenue from active subscriptions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {monthlyRevenue.map((data) => (
                <div key={data.month} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{data.month}</span>
                    <span className="text-gray-600">AED {data.revenue.toFixed(0)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all"
                      style={{ width: `${(data.revenue / maxRevenue) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Service Popularity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Popular Services (Last 30 Days)
              </CardTitle>
              <CardDescription>
                Booking count by service
              </CardDescription>
            </CardHeader>
            <CardContent>
              {servicePopularity.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No bookings yet</p>
              ) : (
                <div className="space-y-4">
                  {servicePopularity.map((service, index) => (
                    <div key={service.name} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium flex items-center gap-2">
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                            #{index + 1}
                          </span>
                          {service.name}
                        </span>
                        <span className="text-gray-600">{service.bookings} bookings</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${(service.bookings / maxBookings) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Customer Growth */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Customer Growth (Last 6 Months)
              </CardTitle>
              <CardDescription>
                New customers enrolled each month
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {customerGrowth.map((data) => (
                  <div key={data.month} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{data.month}</span>
                      <span className="text-gray-600">{data.customers} customers</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full transition-all"
                        style={{ width: `${(data.customers / maxCustomers) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Insights Card */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">Business Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-blue-800">
              {attendanceRate >= 90 && (
                <p>✅ Excellent attendance rate! Your customers are highly engaged.</p>
              )}
              {attendanceRate < 70 && attendanceRate > 0 && (
                <p>⚠️ Attendance rate could be improved. Consider reminder notifications.</p>
              )}
              {servicePopularity.length > 0 && (
                <p>
                  📊 Your most popular service is "{servicePopularity[0].name}" with{' '}
                  {servicePopularity[0].bookings} bookings this month.
                </p>
              )}
              {stats.activeEnrollments > 0 && (
                <p>
                  💰 You have {stats.activeEnrollments} active enrollments generating{' '}
                  AED {stats.totalRevenue.toFixed(0)} monthly.
                </p>
              )}
              {stats.activeEnrollments === 0 && (
                <p>
                  🎯 No active enrollments yet. Make sure your services are visible and pricing is set up!
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
