'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import DashboardLayout from '@/components/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Calendar, Plus, Trash2, Clock, Copy, Edit, Zap, Sun, Sunset, Moon } from 'lucide-react'

interface Service {
  id: string
  name: string
  duration_minutes: number
  capacity: number | null
}

interface Schedule {
  id: string
  service_id: string
  day_of_week: number
  start_time: string
  end_time: string
  capacity_override: number | null
  is_active: boolean
  services: { name: string } | null
}

interface Business {
  id: string
  name: string
}

interface Props {
  business: Business
  services: Service[]
  schedules: Schedule[]
}

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday', short: 'Sun' },
  { value: 1, label: 'Monday', short: 'Mon' },
  { value: 2, label: 'Tuesday', short: 'Tue' },
  { value: 3, label: 'Wednesday', short: 'Wed' },
  { value: 4, label: 'Thursday', short: 'Thu' },
  { value: 5, label: 'Friday', short: 'Fri' },
  { value: 6, label: 'Saturday', short: 'Sat' },
]

const TIME_PRESETS = [
  { label: 'Early Morning', icon: Sun, times: ['06:00', '06:30', '07:00', '07:30'] },
  { label: 'Morning', icon: Sun, times: ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30'] },
  { label: 'Afternoon', icon: Sunset, times: ['12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30'] },
  { label: 'Evening', icon: Moon, times: ['16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30'] },
  { label: 'Night', icon: Moon, times: ['20:00', '20:30', '21:00', '21:30'] },
]

// Helper to calculate end time based on start time and duration
const calculateEndTime = (startTime: string, durationMinutes: number): string => {
  const [hours, minutes] = startTime.split(':').map(Number)
  const totalMinutes = hours * 60 + minutes + durationMinutes
  const endHours = Math.floor(totalMinutes / 60) % 24
  const endMinutes = totalMinutes % 60
  return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`
}

export default function ScheduleContent({ business, services: initialServices, schedules: initialSchedules }: Props) {
  const [services, setServices] = useState(initialServices)
  const [schedules, setSchedules] = useState(initialSchedules)
  const [showDialog, setShowDialog] = useState(false)
  const [showCopyDialog, setShowCopyDialog] = useState(false)
  const [showQuickAddDialog, setShowQuickAddDialog] = useState(false)
  const [showNewServiceDialog, setShowNewServiceDialog] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null)
  const [copyingSchedule, setCopyingSchedule] = useState<Schedule | null>(null)
  const [selectedDays, setSelectedDays] = useState<number[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [newServiceData, setNewServiceData] = useState({
    name: '',
    description: '',
    duration_minutes: '60',
    price: '',
    capacity: '10',
  })
  const [formData, setFormData] = useState({
    service_id: '',
    day_of_week: '1',
    start_time: '09:00',
    capacity_override: '',
  })

  const router = useRouter()
  const supabase = createClient()

  // Update end time when service or start time changes
  const selectedServiceData = services.find(s => s.id === formData.service_id)
  const endTime = selectedServiceData 
    ? calculateEndTime(formData.start_time, selectedServiceData.duration_minutes)
    : formData.start_time

  const handleOpenQuickAdd = (dayOfWeek: number) => {
    if (services.length === 0) {
      setShowNewServiceDialog(true)
      return
    }
    setFormData({
      service_id: services[0]?.id || '',
      day_of_week: dayOfWeek.toString(),
      start_time: '09:00',
      capacity_override: '',
    })
    setShowQuickAddDialog(true)
  }

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const serviceData = {
      business_id: business.id,
      name: newServiceData.name,
      description: newServiceData.description,
      service_type: 'class',
      duration_minutes: parseInt(newServiceData.duration_minutes),
      price: parseFloat(newServiceData.price),
      capacity: parseInt(newServiceData.capacity),
      is_active: true,
    }

    const { data, error } = await supabase
      .from('services')
      .insert(serviceData)
      .select()
      .single()

    if (!error && data) {
      setServices([...services, data])
      setFormData({ ...formData, service_id: data.id })
      setShowNewServiceDialog(false)
      setNewServiceData({
        name: '',
        description: '',
        duration_minutes: '60',
        price: '',
        capacity: '10',
      })
      // Optionally open quick add dialog with new service selected
      setShowQuickAddDialog(true)
      router.refresh()
    } else {
      alert(`Error: ${error?.message}`)
    }

    setLoading(false)
  }

  const handleOpenDialog = (schedule?: Schedule) => {
    if (schedule) {
      setEditingSchedule(schedule)
      setFormData({
        service_id: schedule.service_id,
        day_of_week: schedule.day_of_week.toString(),
        start_time: schedule.start_time,
        capacity_override: schedule.capacity_override?.toString() || '',
      })
    } else {
      setEditingSchedule(null)
      setFormData({
        service_id: services[0]?.id || '',
        day_of_week: '1',
        start_time: '09:00',
        capacity_override: '',
      })
    }
    setShowDialog(true)
  }

  const handleOpenCopyDialog = (schedule: Schedule) => {
    setCopyingSchedule(schedule)
    setSelectedDays([])
    setShowCopyDialog(true)
  }

  const toggleDay = (day: number) => {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    )
  }

  const handleQuickAdd = async (timeSlot: string) => {
    setLoading(true)

    const service = services.find(s => s.id === formData.service_id)
    if (!service) return

    const endTime = calculateEndTime(timeSlot, service.duration_minutes)

    const scheduleData = {
      service_id: formData.service_id,
      day_of_week: parseInt(formData.day_of_week),
      start_time: timeSlot,
      end_time: endTime,
      capacity_override: formData.capacity_override ? parseInt(formData.capacity_override) : null,
      is_active: true,
    }

    const { data, error } = await supabase
      .from('schedules')
      .insert(scheduleData)
      .select('*, services(name)')
      .single()

    if (!error && data) {
      setSchedules([...schedules, data])
      setShowQuickAddDialog(false)
      router.refresh()
    } else {
      alert(`Error: ${error?.message}`)
    }

    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const service = services.find(s => s.id === formData.service_id)
    if (!service) return

    const calculatedEndTime = calculateEndTime(formData.start_time, service.duration_minutes)

    const scheduleData = {
      service_id: formData.service_id,
      day_of_week: parseInt(formData.day_of_week),
      start_time: formData.start_time,
      end_time: calculatedEndTime,
      capacity_override: formData.capacity_override ? parseInt(formData.capacity_override) : null,
      is_active: true,
    }

    if (editingSchedule) {
      const { error } = await supabase
        .from('schedules')
        .update(scheduleData)
        .eq('id', editingSchedule.id)

      if (!error) {
        setSchedules(schedules.map(s => 
          s.id === editingSchedule.id 
            ? { ...s, ...scheduleData, services: s.services } 
            : s
        ))
        setShowDialog(false)
        router.refresh()
      } else {
        alert(`Error: ${error.message}`)
      }
    } else {
      const { data, error } = await supabase
        .from('schedules')
        .insert(scheduleData)
        .select('*, services(name)')
        .single()

      if (!error && data) {
        setSchedules([...schedules, data])
        setShowDialog(false)
        router.refresh()
      } else {
        alert(`Error: ${error?.message}`)
      }
    }

    setLoading(false)
  }

  const handleCopyToMultipleDays = async () => {
    if (!copyingSchedule || selectedDays.length === 0) return

    setLoading(true)

    const newSchedules = selectedDays
      .filter(day => day !== copyingSchedule.day_of_week)
      .map(day => ({
        service_id: copyingSchedule.service_id,
        day_of_week: day,
        start_time: copyingSchedule.start_time,
        end_time: copyingSchedule.end_time,
        capacity_override: copyingSchedule.capacity_override,
        is_active: true,
      }))

    const { data, error } = await supabase
      .from('schedules')
      .insert(newSchedules)
      .select('*, services(name)')

    if (!error && data) {
      setSchedules([...schedules, ...data])
      setShowCopyDialog(false)
      setCopyingSchedule(null)
      setSelectedDays([])
      router.refresh()
    } else {
      alert(`Error: ${error?.message}`)
    }

    setLoading(false)
  }

  const handleDelete = async (scheduleId: string) => {
    if (!confirm('Delete this schedule? This cannot be undone.')) return

    const { error } = await supabase
      .from('schedules')
      .delete()
      .eq('id', scheduleId)

    if (!error) {
      setSchedules(schedules.filter(s => s.id !== scheduleId))
      router.refresh()
    } else {
      alert(`Error: ${error.message}`)
    }
  }

  // Group schedules by day
  const schedulesByDay = DAYS_OF_WEEK.map(day => ({
    ...day,
    schedules: schedules
      .filter(s => s.day_of_week === day.value)
      .sort((a, b) => a.start_time.localeCompare(b.start_time)),
  }))

  // Get color for each service
  const getServiceColor = (serviceId: string) => {
    const index = services.findIndex(s => s.id === serviceId)
    const colors = [
      'bg-blue-100 text-blue-700 border-blue-300',
      'bg-green-100 text-green-700 border-green-300',
      'bg-purple-100 text-purple-700 border-purple-300',
      'bg-orange-100 text-orange-700 border-orange-300',
      'bg-pink-100 text-pink-700 border-pink-300',
      'bg-yellow-100 text-yellow-700 border-yellow-300',
    ]
    return colors[index % colors.length]
  }

  return (
    <DashboardLayout businessName={business.name}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold">Schedule</h2>
            <p className="text-gray-600 mt-1">Set up your weekly availability</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowNewServiceDialog(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              New Service
            </Button>
            <Button onClick={() => handleOpenDialog()} disabled={services.length === 0}>
              <Plus className="w-4 h-4 mr-2" />
              Add to Schedule
            </Button>
          </div>
        </div>

        {services.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Calendar className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No services yet</h3>
              <p className="text-gray-600 mb-4">Create your first service to start scheduling classes</p>
              <Button onClick={() => setShowNewServiceDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create First Service
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Calendar Grid View */}
            <Card>
              <CardHeader>
                <CardTitle>Weekly Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
                  {schedulesByDay.map((day) => (
                    <div key={day.value} className="border rounded-lg overflow-hidden">
                      {/* Day Header */}
                      <div className="bg-gray-100 p-2 text-center border-b-2">
                        <p className="font-semibold text-sm">{day.label}</p>
                        <p className="text-xs text-gray-600">{day.short}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full mt-1 h-7 text-xs hover:bg-blue-50"
                          onClick={() => handleOpenQuickAdd(day.value)}
                        >
                          <Zap className="w-3 h-3 mr-1" />
                          Quick Add
                        </Button>
                      </div>

                      {/* Time Slots */}
                      <div className="p-2 space-y-2 min-h-[200px]">
                        {day.schedules.length === 0 ? (
                          <p className="text-xs text-gray-400 text-center mt-4">
                            No slots
                          </p>
                        ) : (
                          day.schedules.map((schedule) => (
                            <div
                              key={schedule.id}
                              className={`p-2 rounded border ${getServiceColor(schedule.service_id)} cursor-pointer hover:shadow-md transition-shadow`}
                            >
                              <div className="flex items-start justify-between gap-1">
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-semibold truncate">
                                    {schedule.services?.name}
                                  </p>
                                  <p className="text-xs">
                                    {schedule.start_time.substring(0, 5)} - {schedule.end_time.substring(0, 5)}
                                  </p>
                                  {schedule.capacity_override && (
                                    <p className="text-xs opacity-75">
                                      Max: {schedule.capacity_override}
                                    </p>
                                  )}
                                </div>
                                <div className="flex flex-col gap-1">
                                  <button
                                    onClick={() => handleOpenDialog(schedule)}
                                    className="p-1 hover:bg-white/50 rounded"
                                    title="Edit"
                                  >
                                    <Edit className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => handleOpenCopyDialog(schedule)}
                                    className="p-1 hover:bg-white/50 rounded"
                                    title="Copy to other days"
                                  >
                                    <Copy className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(schedule.id)}
                                    className="p-1 hover:bg-red-100 rounded text-red-600"
                                    title="Delete"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Legend */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Service Colors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {services.map((service) => (
                    <div key={service.id} className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded ${getServiceColor(service.id)}`} />
                      <span className="text-sm">{service.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* New Service Dialog */}
        <Dialog open={showNewServiceDialog} onOpenChange={setShowNewServiceDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Service</DialogTitle>
              <DialogDescription>
                Add a new service that you can schedule for your customers
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateService} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="serviceName">Service Name *</Label>
                <Input
                  id="serviceName"
                  value={newServiceData.name}
                  onChange={(e) => setNewServiceData({ ...newServiceData, name: e.target.value })}
                  required
                  placeholder="e.g., Yoga Class, Personal Training"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="serviceDescription">Description</Label>
                <Input
                  id="serviceDescription"
                  value={newServiceData.description}
                  onChange={(e) => setNewServiceData({ ...newServiceData, description: e.target.value })}
                  placeholder="Brief description"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (min) *</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={newServiceData.duration_minutes}
                    onChange={(e) => setNewServiceData({ ...newServiceData, duration_minutes: e.target.value })}
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
                    step="0.01"
                    value={newServiceData.price}
                    onChange={(e) => setNewServiceData({ ...newServiceData, price: e.target.value })}
                    required
                    min="0"
                    placeholder="50.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacity *</Label>
                  <Input
                    id="capacity"
                    type="number"
                    value={newServiceData.capacity}
                    onChange={(e) => setNewServiceData({ ...newServiceData, capacity: e.target.value })}
                    required
                    min="1"
                    placeholder="10"
                  />
                </div>
              </div>

              <div className="bg-blue-50 p-3 rounded-lg text-sm">
                <p className="text-blue-900">
                  💡 After creating this service, you'll be able to add it to your schedule
                </p>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowNewServiceDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Service'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Quick Add Dialog - Time Preset Picker */}
        <Dialog open={showQuickAddDialog} onOpenChange={setShowQuickAddDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Quick Add Class</DialogTitle>
              <DialogDescription>
                Pick a time slot for {DAYS_OF_WEEK.find(d => d.value.toString() === formData.day_of_week)?.label}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Service Selection */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Service *</Label>
                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                    onClick={() => {
                      setShowQuickAddDialog(false)
                      setShowNewServiceDialog(true)
                    }}
                    className="h-auto p-0"
                  >
                    + Add New Service
                  </Button>
                </div>
                <Select
                  value={formData.service_id}
                  onValueChange={(value) => setFormData({ ...formData, service_id: value || '' })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map((service) => (
                      <SelectItem key={service.id} value={service.id}>
                        {service.name} ({service.duration_minutes} min)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Time Presets */}
              <div className="space-y-3">
                <Label>Select a Time</Label>
                {TIME_PRESETS.map((preset) => {
                  const Icon = preset.icon
                  return (
                    <div key={preset.label} className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <Icon className="w-4 h-4" />
                        {preset.label}
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        {preset.times.map((time) => (
                          <Button
                            key={time}
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuickAdd(time)}
                            disabled={loading}
                            className="hover:bg-blue-50 hover:border-blue-300"
                          >
                            {time}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Custom Time */}
              <div className="border-t pt-4">
                <Label>Or pick custom time:</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    className="flex-1"
                  />
                  <Button
                    onClick={() => handleQuickAdd(formData.start_time)}
                    disabled={loading}
                  >
                    {loading ? 'Adding...' : 'Add'}
                  </Button>
                </div>
              </div>

              {/* Duration Preview */}
              {selectedServiceData && (
                <div className="bg-blue-50 p-3 rounded-lg text-sm">
                  <p className="font-medium text-blue-900">
                    Duration: {selectedServiceData.duration_minutes} minutes
                  </p>
                  <p className="text-blue-700">
                    End time will be automatically calculated
                  </p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Advanced Add/Edit Dialog */}
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingSchedule ? 'Edit Class' : 'Add Class'}</DialogTitle>
              <DialogDescription>
                {editingSchedule ? 'Update class details' : 'Create a recurring weekly class'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="service">Service *</Label>
                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                    onClick={() => {
                      setShowDialog(false)
                      setShowNewServiceDialog(true)
                    }}
                    className="h-auto p-0"
                  >
                    + Add New Service
                  </Button>
                </div>
                <Select
                  value={formData.service_id}
                  onValueChange={(value) => setFormData({ ...formData, service_id: value || '' })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map((service) => (
                      <SelectItem key={service.id} value={service.id}>
                        {service.name} ({service.duration_minutes} min, {service.capacity ? `${service.capacity} spots` : 'unlimited'})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedServiceData && (
                  <p className="text-xs text-gray-600">
                    Duration: {selectedServiceData.duration_minutes} minutes • 
                    Default capacity: {selectedServiceData.capacity || 'Unlimited'}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="day">Day of Week *</Label>
                <Select
                  value={formData.day_of_week}
                  onValueChange={(value) => setFormData({ ...formData, day_of_week: value || '' })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DAYS_OF_WEEK.map((day) => (
                      <SelectItem key={day.value} value={day.value.toString()}>
                        {day.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="start_time">Start Time *</Label>
                <Input
                  id="start_time"
                  type="time"
                  value={formData.start_time}
                  onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                  required
                />
                {selectedServiceData && (
                  <p className="text-xs text-green-600">
                    → Ends at {endTime} (automatically calculated from {selectedServiceData.duration_minutes} min duration)
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity Override (optional)</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={formData.capacity_override}
                  onChange={(e) => setFormData({ ...formData, capacity_override: e.target.value })}
                  placeholder={`Default: ${selectedServiceData?.capacity || 'Unlimited'}`}
                  min="1"
                />
                <p className="text-xs text-gray-600">
                  Leave empty to use service default
                </p>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Saving...' : editingSchedule ? 'Update' : 'Add Class'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Copy Dialog */}
        <Dialog open={showCopyDialog} onOpenChange={setShowCopyDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Copy Time Slot</DialogTitle>
              <DialogDescription>
                Select which days you want to copy this time slot to
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {copyingSchedule && (
                <Card className="bg-gray-50">
                  <CardContent className="pt-4">
                    <p className="text-sm font-medium">{copyingSchedule.services?.name}</p>
                    <p className="text-sm text-gray-600">
                      {copyingSchedule.start_time} - {copyingSchedule.end_time}
                    </p>
                    <p className="text-xs text-gray-500">
                      From: {DAYS_OF_WEEK.find(d => d.value === copyingSchedule.day_of_week)?.label}
                    </p>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-2">
                <Label>Copy to these days:</Label>
                <div className="grid grid-cols-2 gap-2">
                  {DAYS_OF_WEEK.map((day) => (
                    <Button
                      key={day.value}
                      type="button"
                      variant={selectedDays.includes(day.value) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => toggleDay(day.value)}
                      disabled={day.value === copyingSchedule?.day_of_week}
                      className="justify-start"
                    >
                      {day.label}
                      {day.value === copyingSchedule?.day_of_week && ' (original)'}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowCopyDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleCopyToMultipleDays}
                disabled={loading || selectedDays.length === 0}
              >
                {loading ? 'Copying...' : `Copy to ${selectedDays.length} day${selectedDays.length !== 1 ? 's' : ''}`}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
