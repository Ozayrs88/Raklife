'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import DashboardLayout from '@/components/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { UserCog, UserPlus, Trash2, Crown, Shield, User as UserIcon } from 'lucide-react'

interface User {
  id: string
  full_name: string
  email: string
  phone: string | null
}

interface StaffMember {
  id: string
  role: 'owner' | 'manager' | 'staff'
  created_at: string
  users: User[]
}

interface Business {
  id: string
  name: string
}

interface Props {
  business: Business
  staff: StaffMember[]
  currentUserId: string
}

const ROLES = [
  { value: 'manager', label: 'Manager', icon: Shield, description: 'Can manage services, bookings, and view reports' },
  { value: 'staff', label: 'Staff', icon: UserIcon, description: 'Can view and manage bookings' },
]

export default function StaffContent({ business, staff: initialStaff, currentUserId }: Props) {
  const [staff, setStaff] = useState(initialStaff)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    role: 'staff',
  })

  const router = useRouter()
  const supabase = createClient()

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // First, check if user exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', formData.email.toLowerCase())
      .single()

    if (!existingUser) {
      alert('No user found with this email. They need to sign up first.')
      setLoading(false)
      return
    }

    // Check if already staff
    const { data: existing } = await supabase
      .from('business_staff')
      .select('id')
      .eq('business_id', business.id)
      .eq('user_id', existingUser.id)
      .single()

    if (existing) {
      alert('This user is already a staff member')
      setLoading(false)
      return
    }

    // Add as staff
    const { error } = await supabase
      .from('business_staff')
      .insert({
        business_id: business.id,
        user_id: existingUser.id,
        role: formData.role,
      })

    if (error) {
      alert(`Error: ${error.message}`)
    } else {
      alert('Staff member added successfully!')
      setShowAddDialog(false)
      setFormData({ email: '', role: 'staff' })
      router.refresh()
    }

    setLoading(false)
  }

  const handleRemoveStaff = async (staffMember: StaffMember) => {
    if (staffMember.role === 'owner') {
      alert('Cannot remove the business owner')
      return
    }

    if (!confirm(`Remove ${staffMember.users[0]?.full_name} from staff?`)) {
      return
    }

    const { error } = await supabase
      .from('business_staff')
      .delete()
      .eq('id', staffMember.id)

    if (error) {
      alert(`Error: ${error.message}`)
    } else {
      setStaff(staff.filter(s => s.id !== staffMember.id))
      router.refresh()
    }
  }

  const getRoleIcon = (role: string) => {
    if (role === 'owner') return <Crown className="w-5 h-5 text-yellow-500" />
    if (role === 'manager') return <Shield className="w-5 h-5 text-blue-500" />
    return <UserIcon className="w-5 h-5 text-gray-500" />
  }

  return (
    <DashboardLayout businessName={business.name}>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-bold">Staff Management</h2>
            <p className="text-gray-600 mt-1">Manage team members and their permissions</p>
          </div>
          <Button onClick={() => setShowAddDialog(true)}>
            <UserPlus className="w-4 h-4 mr-2" />
            Add Staff Member
          </Button>
        </div>

        {/* Role Permissions Guide */}
        <Card>
          <CardHeader>
            <CardTitle>Role Permissions</CardTitle>
            <CardDescription>
              Different roles have different access levels to your business dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Crown className="w-5 h-5 text-yellow-500 mt-1" />
                <div>
                  <p className="font-medium">Owner</p>
                  <p className="text-sm text-gray-600">Full access to all features and settings</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-blue-500 mt-1" />
                <div>
                  <p className="font-medium">Manager</p>
                  <p className="text-sm text-gray-600">Can manage services, pricing, bookings, and view reports</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <UserIcon className="w-5 h-5 text-gray-500 mt-1" />
                <div>
                  <p className="font-medium">Staff</p>
                  <p className="text-sm text-gray-600">Can view and manage bookings and sessions</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Staff List */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Team Members ({staff.length})</h3>
          {staff.map((member) => (
            <Card key={member.id}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-4">
                    {getRoleIcon(member.role)}
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">{member.users[0]?.full_name}</h3>
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded capitalize">
                          {member.role}
                        </span>
                        {member.users[0]?.id === currentUserId && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                            You
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{member.users[0]?.email}</p>
                      {member.users[0]?.phone && (
                        <p className="text-sm text-gray-600">{member.users[0]?.phone}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        Joined {new Date(member.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {member.role !== 'owner' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveStaff(member)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Remove
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Add Staff Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Staff Member</DialogTitle>
            <DialogDescription>
              Add a new team member to your business. They must already have a RAKlife account.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddStaff} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="staff@example.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role *</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData({ ...formData, role: value || 'staff' })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      <div className="flex items-center gap-2">
                        <role.icon className="w-4 h-4" />
                        {role.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-600">
                {ROLES.find(r => r.value === formData.role)?.description}
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Adding...' : 'Add Staff Member'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
