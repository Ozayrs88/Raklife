'use client'

import { useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Users, Search, Mail, Phone, Calendar, DollarSign } from 'lucide-react'

interface Customer {
  id: string
  full_name: string
  email: string
  phone: string | null
  bookings: number
  totalSpent: number
  lastBooking: string
}

interface Business {
  id: string
  name: string
}

interface Props {
  business: Business
  customers: Customer[]
}

export default function CustomersContent({ business, customers }: Props) {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredCustomers = customers.filter((customer) =>
    customer.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <DashboardLayout businessName={business.name}>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold">Customers</h2>
          <p className="text-gray-600 mt-1">View and manage your customer base</p>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search customers by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Customers</p>
                  <p className="text-2xl font-bold">{customers.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <DollarSign className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold">
                    AED {customers.reduce((sum, c) => sum + c.totalSpent, 0).toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Calendar className="w-8 h-8 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Bookings</p>
                  <p className="text-2xl font-bold">
                    {customers.reduce((sum, c) => sum + c.bookings, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Customers List */}
        {filteredCustomers.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No customers yet</h3>
              <p className="text-gray-600">
                {customers.length === 0
                  ? 'Customers will appear here once they book your services'
                  : 'No customers match your search'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredCustomers.map((customer) => (
              <Card key={customer.id}>
                <CardContent className="pt-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">{customer.full_name}</h3>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          {customer.email}
                        </div>
                        {customer.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            {customer.phone}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-6 text-sm">
                      <div>
                        <p className="text-gray-600">Bookings</p>
                        <p className="text-xl font-bold">{customer.bookings}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Total Spent</p>
                        <p className="text-xl font-bold">AED {customer.totalSpent.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Last Booking</p>
                        <p className="text-sm font-medium">
                          {new Date(customer.lastBooking).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
