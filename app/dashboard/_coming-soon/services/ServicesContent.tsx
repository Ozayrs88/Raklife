'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import DashboardLayout from '@/components/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Plus, Edit, Trash2, ToggleLeft, ToggleRight } from 'lucide-react'

interface Service {
  id: string
  name: string
  description: string | null
  duration_minutes: number
  price: number
  capacity: number | null
  is_active: boolean
  service_type: string
}

interface Business {
  id: string
  name: string
}

interface Props {
  business: Business
  services: Service[]
}

export default function ServicesContent({ business, services: initialServices }: Props) {
  const [services, setServices] = useState(initialServices)
  const [showDialog, setShowDialog] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration_minutes: '60',
    price: '',
    capacity: '10',
  })
  
  const router = useRouter()
  const supabase = createClient()

  const handleOpenDialog = (service?: Service) => {
    if (service) {
      setEditingService(service)
      setFormData({
        name: service.name,
        description: service.description || '',
        duration_minutes: service.duration_minutes.toString(),
        price: service.price.toString(),
        capacity: service.capacity?.toString() || '10',
      })
    } else {
      setEditingService(null)
      setFormData({
        name: '',
        description: '',
        duration_minutes: '60',
        price: '',
        capacity: '10',
      })
    }
    setShowDialog(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const serviceData = {
      business_id: business.id,
      name: formData.name,
      description: formData.description,
      service_type: 'class',
      duration_minutes: parseInt(formData.duration_minutes),
      price: parseFloat(formData.price),
      capacity: parseInt(formData.capacity),
      is_active: true,
    }

    if (editingService) {
      const { error } = await supabase
        .from('services')
        .update(serviceData)
        .eq('id', editingService.id)

      if (!error) {
        setServices(services.map(s => s.id === editingService.id ? { ...s, ...serviceData } : s))
      } else {
        alert(`Error: ${error.message}`)
      }
    } else {
      const { data, error } = await supabase
        .from('services')
        .insert(serviceData)
        .select()
        .single()

      if (!error && data) {
        setServices([data, ...services])
      } else {
        alert(`Error: ${error?.message || 'Unknown error'}`)
      }
    }

    setLoading(false)
    setShowDialog(false)
    router.refresh()
  }

  const handleToggleActive = async (service: Service) => {
    const { error } = await supabase
      .from('services')
      .update({ is_active: !service.is_active })
      .eq('id', service.id)

    if (!error) {
      setServices(services.map(s => s.id === service.id ? { ...s, is_active: !s.is_active } : s))
      router.refresh()
    } else {
      alert(`Error: ${error.message}`)
    }
  }

  const handleDelete = async (service: Service) => {
    if (!confirm(`Delete "${service.name}"? This cannot be undone.`)) return

    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', service.id)

    if (!error) {
      setServices(services.filter(s => s.id !== service.id))
      router.refresh()
    } else {
      alert(`Error: ${error.message}`)
    }
  }

  return (
    <DashboardLayout businessName={business.name}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold">Services</h2>
            <p className="text-gray-600 mt-1">Manage your offerings</p>
          </div>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="w-4 h-4 mr-2" />
            Add Service
          </Button>
        </div>

        {services.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Plus className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No services yet</h3>
              <p className="text-gray-600 mb-4">Create your first service to start accepting bookings</p>
              <Button onClick={() => handleOpenDialog()}>
                Add Your First Service
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <Card key={service.id} className={!service.is_active ? 'opacity-60' : ''}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{service.name}</CardTitle>
                    <button
                      onClick={() => handleToggleActive(service)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      {service.is_active ? (
                        <ToggleRight className="w-6 h-6 text-green-600" />
                      ) : (
                        <ToggleLeft className="w-6 h-6" />
                      )}
                    </button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">{service.description || 'No description'}</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-medium">{service.duration_minutes} min</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Price:</span>
                      <span className="font-medium">AED {service.price}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Capacity:</span>
                      <span className="font-medium">{service.capacity || 'Unlimited'}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleOpenDialog(service)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(service)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingService ? 'Edit Service' : 'Add New Service'}</DialogTitle>
              <DialogDescription>
                {editingService ? 'Update service details' : 'Create a new service for customers to book'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Service Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="e.g., Personal Training Session"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (min) *</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.duration_minutes}
                    onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
                    required
                    min="15"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Price (AED) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                    min="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacity *</Label>
                  <Input
                    id="capacity"
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    required
                    min="1"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Saving...' : editingService ? 'Update' : 'Create'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
