'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Save, Send, Trash2, Edit2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

type Props = {
  businessId: string;
  memberId: string;
};

type Member = {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  overdue_amount: number;
  payment_status: string;
  last_payment_date: string;
  stripe_customer_id: string;
};

export default function MemberDetailContent({ businessId, memberId }: Props) {
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Edit form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [overdueAmount, setOverdueAmount] = useState('');
  
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    fetchMember();
  }, [memberId]);

  async function fetchMember() {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', memberId)
        .single();

      if (error) throw error;

      setMember(data);
      setFullName(data.full_name || '');
      setEmail(data.email || '');
      setPhone(data.phone || '');
      setOverdueAmount(String(data.overdue_amount || 0));
    } catch (error) {
      console.error('Error fetching member:', error);
      alert('Failed to load member details');
      router.push('/dashboard/members');
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({
          full_name: fullName,
          email: email,
          phone: phone,
          overdue_amount: parseFloat(overdueAmount),
          payment_status: parseFloat(overdueAmount) > 0 ? 'overdue' : 'current',
        })
        .eq('id', memberId);

      if (error) throw error;

      alert('✅ Member updated successfully!');
      setEditing(false);
      fetchMember();
    } catch (error: any) {
      console.error('Error updating member:', error);
      alert(`❌ Failed to update member: ${error.message}`);
    } finally {
      setSaving(false);
    }
  }

  async function handleSendPaymentLink() {
    if (!member || member.overdue_amount <= 0) {
      alert('No overdue amount to collect');
      return;
    }

    try {
      const response = await fetch('/api/payment-links/bulk-create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_id: businessId,
          customer_ids: [memberId],
        }),
      });

      const result = await response.json();

      if (response.ok) {
        alert('✅ Payment link sent via WhatsApp!');
      } else {
        alert(`❌ Failed to send payment link:\n${result.error || 'Unknown error'}`);
      }
    } catch (error: any) {
      console.error('Error sending payment link:', error);
      alert(`❌ Error: ${error.message}`);
    }
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this member? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      alert('✅ Member deleted successfully');
      router.push('/dashboard/members');
    } catch (error: any) {
      console.error('Error deleting member:', error);
      alert(`❌ Failed to delete member: ${error.message}`);
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-lg">Loading member details...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (!member) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-lg">Member not found</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/dashboard/members')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Members
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{member.full_name || 'Unnamed Member'}</h1>
              <p className="text-gray-600 mt-1">Member Details</p>
            </div>
          </div>
          <div className="flex gap-2">
            {!editing ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => setEditing(true)}
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                {member.overdue_amount > 0 && (
                  <Button onClick={handleSendPaymentLink}>
                    <Send className="w-4 h-4 mr-2" />
                    Send Payment Link
                  </Button>
                )}
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditing(false);
                    setFullName(member.full_name || '');
                    setEmail(member.email || '');
                    setPhone(member.phone || '');
                    setOverdueAmount(String(member.overdue_amount || 0));
                  }}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Member Info Card */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Member Information</h2>
          
          {editing ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ahmed Ali"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+971501234567"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="member@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="overdueAmount">Overdue Amount (AED)</Label>
                  <Input
                    id="overdueAmount"
                    type="number"
                    value={overdueAmount}
                    onChange={(e) => setOverdueAmount(e.target.value)}
                    placeholder="0"
                    step="0.01"
                  />
                  <p className="text-xs text-gray-500">
                    Set to 0 to mark as paid / current
                  </p>
                </div>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-900">
                  <strong>Note:</strong> Phone number identifies the customer in WhatsApp. Changing it may affect payment reminders.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Full Name</div>
                  <div className="text-lg font-medium">{member.full_name || 'N/A'}</div>
                </div>

                <div>
                  <div className="text-sm text-gray-600 mb-1">Phone Number</div>
                  <div className="text-lg font-medium">{member.phone || 'N/A'}</div>
                </div>

                <div>
                  <div className="text-sm text-gray-600 mb-1">Email</div>
                  <div className="text-lg font-medium">{member.email || 'N/A'}</div>
                </div>

                <div>
                  <div className="text-sm text-gray-600 mb-1">Overdue Amount</div>
                  {member.overdue_amount > 0 ? (
                    <div className="text-lg font-bold text-red-600">
                      AED {member.overdue_amount.toLocaleString()}
                    </div>
                  ) : (
                    <div className="text-lg font-medium text-green-600">
                      No outstanding debt
                    </div>
                  )}
                </div>

                <div>
                  <div className="text-sm text-gray-600 mb-1">Payment Status</div>
                  {member.overdue_amount > 0 ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                      Overdue
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      Current
                    </span>
                  )}
                </div>

                <div>
                  <div className="text-sm text-gray-600 mb-1">Member ID</div>
                  <div className="text-sm font-mono text-gray-500">{member.id}</div>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Payment History Card */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Payment History</h2>
          <div className="text-sm text-gray-600">
            {member.last_payment_date ? (
              <p>Last payment: {new Date(member.last_payment_date).toLocaleDateString()}</p>
            ) : (
              <p>No payment history available</p>
            )}
          </div>
          {member.stripe_customer_id && (
            <div className="mt-4 text-xs text-gray-500">
              Stripe Customer ID: {member.stripe_customer_id}
            </div>
          )}
        </Card>

        {/* Danger Zone */}
        <Card className="p-6 border-red-200 bg-red-50">
          <h2 className="text-xl font-bold mb-2 text-red-900">Danger Zone</h2>
          <p className="text-sm text-red-700 mb-4">
            Deleting this member is permanent and cannot be undone.
          </p>
          <Button
            variant="outline"
            onClick={handleDelete}
            className="border-red-300 text-red-700 hover:bg-red-100"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Member
          </Button>
        </Card>
      </div>
    </DashboardLayout>
  );
}
