'use client'

import { useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react'

interface Schedule {
  id: string
  day_of_week: number
  start_time: string
  end_time: string
  capacity: number
}

interface Service {
  id: string
  name: string
  schedules: Schedule[]
}

interface Booking {
  id: string
  scheduled_date: string
  status: string
  attended: boolean | null
  services: { id: string; name: string }[]
  users: { full_name: string }[]
}

interface Business {
  id: string
  name: string
}

interface Props {
  business: Business
  services: Service[]
  bookings: Booking[]
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export default function CalendarContent({ business, services, bookings: initialBookings }: Props) {
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [bookings] = useState(initialBookings)

  const getWeekDates = (date: Date) => {
    const dayOfWeek = date.getDay()
    const startOfWeek = new Date(date)
    startOfWeek.setDate(date.getDate() - dayOfWeek)
    
    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(startOfWeek)
      day.setDate(startOfWeek.getDate() + i)
      return day
    })
  }

  const weekDates = getWeekDates(currentWeek)

  const goToPreviousWeek = () => {
    const newDate = new Date(currentWeek)
    newDate.setDate(currentWeek.getDate() - 7)
    setCurrentWeek(newDate)
  }

  const goToNextWeek = () => {
    const newDate = new Date(currentWeek)
    newDate.setDate(currentWeek.getDate() + 7)
    setCurrentWeek(newDate)
  }

  const goToToday = () => {
    setCurrentWeek(new Date())
  }

  const getBookingsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return bookings.filter(b => b.scheduled_date === dateStr)
  }

  const getSchedulesForDay = (dayOfWeek: number) => {
    const schedules: Array<{schedule: Schedule, service: Service}> = []
    services.forEach(service => {
      service.schedules
        .filter(s => s.day_of_week === dayOfWeek)
        .forEach(schedule => {
          schedules.push({ schedule, service })
        })
    })
    return schedules.sort((a, b) => a.schedule.start_time.localeCompare(b.schedule.start_time))
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  return (
    <DashboardLayout businessName={business.name}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold">Weekly Calendar</h2>
            <p className="text-gray-600 mt-1">View your weekly schedule and bookings</p>
          </div>
          <Button onClick={goToToday} variant="outline">
            <CalendarIcon className="w-4 h-4 mr-2" />
            Today
          </Button>
        </div>

        {/* Week Navigator */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <Button variant="outline" size="sm" onClick={goToPreviousWeek}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div className="text-center">
                <p className="text-lg font-semibold">
                  {weekDates[0].toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - {' '}
                  {weekDates[6].toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={goToNextWeek}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Calendar Grid */}
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
          {weekDates.map((date, index) => {
            const daySchedules = getSchedulesForDay(index)
            const dayBookings = getBookingsForDate(date)
            const today = isToday(date)

            return (
              <Card key={index} className={today ? 'border-blue-500 border-2' : ''}>
                <CardContent className="p-4">
                  <div className="mb-3">
                    <p className={`font-semibold ${today ? 'text-blue-600' : ''}`}>
                      {DAYS[index]}
                    </p>
                    <p className={`text-2xl font-bold ${today ? 'text-blue-600' : ''}`}>
                      {date.getDate()}
                    </p>
                  </div>

                  {/* Schedules */}
                  <div className="space-y-2">
                    {daySchedules.length === 0 ? (
                      <p className="text-sm text-gray-400 italic">No classes</p>
                    ) : (
                      daySchedules.map(({ schedule, service }) => {
                        const classBookings = dayBookings.filter(
                          b => b.services[0]?.id === service.id
                        )
                        
                        return (
                          <div 
                            key={schedule.id}
                            className="bg-blue-50 p-2 rounded text-sm border-l-4 border-blue-500"
                          >
                            <p className="font-medium text-blue-900">{service.name}</p>
                            <p className="text-xs text-blue-700">
                              {schedule.start_time.substring(0, 5)} - {schedule.end_time.substring(0, 5)}
                            </p>
                            <p className="text-xs text-blue-600 mt-1">
                              {classBookings.length}/{schedule.capacity} booked
                            </p>
                          </div>
                        )
                      })
                    )}
                  </div>

                  {/* Additional bookings not matching schedules */}
                  {dayBookings.length > 0 && daySchedules.length === 0 && (
                    <div className="mt-2 space-y-1">
                      {dayBookings.map(booking => (
                        <div key={booking.id} className="bg-gray-100 p-2 rounded text-xs">
                          <p className="font-medium">{booking.services[0]?.name}</p>
                          <p className="text-gray-600">{booking.users[0]?.full_name}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Legend */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-blue-500 rounded"></div>
                <span>Today</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-50 border-l-4 border-blue-500 rounded"></div>
                <span>Scheduled Class</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
