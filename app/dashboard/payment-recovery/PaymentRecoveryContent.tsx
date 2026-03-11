'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { 
  DollarSign, 
  TrendingUp, 
  Clock, 
  AlertCircle,
  Settings,
  Play,
  Pause,
  Save
} from 'lucide-react';

type Props = {
  businessId: string;
};

type ChaseScheduleItem = {
  days_overdue: number;
  action: 'email' | 'sms' | 'both';
};

type Metrics = {
  total_overdue: number;
  overdue_customers: number;
  links_sent: number;
  links_paid: number;
  recovery_rate: number;
};

export default function PaymentRecoveryContent({ businessId }: Props) {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [chaseSchedule, setChaseSchedule] = useState<ChaseScheduleItem[]>([
    { days_overdue: 7, action: 'email' },
    { days_overdue: 14, action: 'both' },
    { days_overdue: 21, action: 'both' },
    { days_overdue: 30, action: 'sms' },
  ]);
  const [autoChaseEnabled, setAutoChaseEnabled] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testPhone, setTestPhone] = useState('');
  const [testName, setTestName] = useState('');
  const [testAmount, setTestAmount] = useState('1050');
  const [sendingTest, setSendingTest] = useState(false);
  const [manualEmail, setManualEmail] = useState('');
  const [manualName, setManualName] = useState('');
  const [manualPhone, setManualPhone] = useState('');
  const [manualAmount, setManualAmount] = useState('');
  const [addingMember, setAddingMember] = useState(false);
  const [deletingTestUsers, setDeletingTestUsers] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    fetchMetrics();
    fetchChaseSchedule();
  }, [businessId]);

  async function fetchMetrics() {
    try {
      // Get overdue customers
      const { data: bookings } = await supabase
        .from('bookings')
        .select('customer_id')
        .eq('business_id', businessId);

      if (!bookings || bookings.length === 0) {
        setMetrics({
          total_overdue: 0,
          overdue_customers: 0,
          links_sent: 0,
          links_paid: 0,
          recovery_rate: 0,
        });
        setLoading(false);
        return;
      }

      const customerIds = [...new Set(bookings.map(b => b.customer_id))];

      // Get overdue amounts
      const { data: overdueCustomers } = await supabase
        .from('users')
        .select('id, overdue_amount')
        .in('id', customerIds)
        .gt('overdue_amount', 0);

      const totalOverdue = overdueCustomers?.reduce((sum, c) => sum + Number(c.overdue_amount), 0) || 0;
      const overdueCount = overdueCustomers?.length || 0;

      // Get payment links stats
      const { data: paymentLinks } = await supabase
        .from('payment_links')
        .select('id, status')
        .eq('business_id', businessId)
        .eq('purpose', 'overdue_payment');

      const linksSent = paymentLinks?.length || 0;
      const linksPaid = paymentLinks?.filter(l => l.status === 'paid').length || 0;
      const recoveryRate = linksSent > 0 ? (linksPaid / linksSent) * 100 : 0;

      setMetrics({
        total_overdue: totalOverdue,
        overdue_customers: overdueCount,
        links_sent: linksSent,
        links_paid: linksPaid,
        recovery_rate: recoveryRate,
      });
    } catch (error) {
      console.error('Error fetching metrics:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchChaseSchedule() {
    try {
      const response = await fetch(`/api/payment-recovery/schedule-chase?business_id=${businessId}`);
      const data = await response.json();
      
      if (data.chase_schedule && data.chase_schedule.length > 0) {
        setChaseSchedule(data.chase_schedule);
      }
      setAutoChaseEnabled(data.auto_chase_enabled || false);
    } catch (error) {
      console.error('Error fetching chase schedule:', error);
    }
  }

  async function saveChaseSchedule() {
    setSaving(true);
    try {
      const response = await fetch('/api/payment-recovery/schedule-chase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_id: businessId,
          chase_schedule: chaseSchedule,
          auto_chase_enabled: autoChaseEnabled,
        }),
      });

      if (response.ok) {
        alert('Chase schedule saved successfully!');
      } else {
        alert('Failed to save chase schedule');
      }
    } catch (error) {
      console.error('Error saving chase schedule:', error);
      alert('Error saving chase schedule');
    } finally {
      setSaving(false);
    }
  }

  function addScheduleItem() {
    setChaseSchedule([
      ...chaseSchedule,
      { days_overdue: 0, action: 'email' }
    ]);
  }

  function removeScheduleItem(index: number) {
    setChaseSchedule(chaseSchedule.filter((_, i) => i !== index));
  }

  function updateScheduleItem(index: number, field: keyof ChaseScheduleItem, value: any) {
    const updated = [...chaseSchedule];
    updated[index] = { ...updated[index], [field]: value };
    setChaseSchedule(updated);
  }

  async function sendTestWhatsApp() {
    if (!testPhone || !testName || !testAmount) {
      alert('Please fill in all test fields');
      return;
    }

    setSendingTest(true);
    try {
      const response = await fetch('/api/notifications/test-whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_id: businessId,
          to_phone: testPhone,
          customer_name: testName,
          overdue_amount: parseFloat(testAmount),
          days_overdue: 14,
          payment_link: 'https://pay.stripe.com/test_demo_link',
          business_name: 'Test Academy'
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        alert('✅ Test WhatsApp sent successfully! Check your phone.');
      } else {
        alert(`❌ Failed to send: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error sending test:', error);
      alert('❌ Failed to send test WhatsApp');
    } finally {
      setSendingTest(false);
    }
  }

  async function addManualMember() {
    if (!manualPhone || !manualName || !manualAmount) {
      alert('Please fill in phone number, name, and amount');
      return;
    }

    setAddingMember(true);
    try {
      // Check if CUSTOMER exists by PHONE NUMBER (not business owners!)
      const { data: existingUsers } = await supabase
        .from('users')
        .select('id, overdue_amount')
        .eq('phone', manualPhone)
        .eq('user_type', 'customer');  // IMPORTANT: Only look for customers!

      const existingUser = existingUsers && existingUsers.length > 0 ? existingUsers[0] : null;

      let userId: string;
      let newOverdue: number;

      if (existingUser) {
        // Update existing user - ADD to their overdue amount
        userId = existingUser.id;
        
        const currentOverdue = Number(existingUser.overdue_amount || 0);
        newOverdue = currentOverdue + parseFloat(manualAmount);
        
        const { error: updateError } = await supabase
          .from('users')
          .update({
            full_name: manualName,
            email: manualEmail,
            overdue_amount: newOverdue,
            payment_status: 'overdue',
          })
          .eq('id', userId);

        if (updateError) throw updateError;
      } else {
        // Generate a UUID for the new user
        const newUserId = crypto.randomUUID();
        
        // If email is empty, generate a unique one
        const finalEmail = manualEmail || `customer-${newUserId}@raklife.local`;
        
        // Create new user
        const { data: newUser, error: insertError } = await supabase
          .from('users')
          .insert({
            id: newUserId,
            email: finalEmail,
            full_name: manualName,
            phone: manualPhone,
            user_type: 'customer',
            overdue_amount: parseFloat(manualAmount),
            payment_status: 'overdue',
          })
          .select()
          .single();

        if (insertError) throw insertError;
        if (!newUser) throw new Error('Failed to create user');
        userId = newUser.id;
      }

      // Show success and navigate
      const message = existingUser 
        ? `✅ Updated existing customer!\n\nPhone: ${manualPhone}\nAdded: AED ${manualAmount}\nNew total overdue: AED ${newOverdue.toFixed(2)}\n\nGo to Members page to send payment link via WhatsApp?`
        : '✅ New member added successfully!\n\nGo to Members page to see them and send payment link?';
      
      if (confirm(message)) {
        window.location.href = '/dashboard/members';
      } else {
        // Clear form and refresh metrics
        setManualEmail('');
        setManualName('');
        setManualPhone('');
        setManualAmount('');
        fetchMetrics();
      }
    } catch (error: any) {
      console.error('Error adding member:', error);
      alert(`❌ Failed to add member: ${error.message || 'Unknown error'}\n\nCheck browser console for details.`);
    } finally {
      setAddingMember(false);
    }
  }

  async function deleteAllTestUsers() {
    if (!confirm('⚠️ Delete ALL customer users?\n\nThis will show you all customer accounts so you can choose which to delete.\n\nContinue?')) {
      return;
    }

    setDeletingTestUsers(true);
    try {
      // Get ALL customer users (simpler query)
      const { data: allUsers, error: fetchError } = await supabase
        .from('users')
        .select('id, full_name, phone, email, overdue_amount')
        .eq('user_type', 'customer')
        .order('created_at', { ascending: false })
        .limit(50);

      if (fetchError) {
        console.error('Fetch error:', fetchError);
        throw fetchError;
      }

      if (!allUsers || allUsers.length === 0) {
        alert('No customer users found');
        setDeletingTestUsers(false);
        return;
      }

      // Show all users with better formatting
      const userList = allUsers.map((u, i) => 
        `${i + 1}. ${u.full_name || 'No name'} | ${u.phone || 'No phone'} | ${u.email || 'No email'} | AED ${u.overdue_amount || 0}`
      ).join('\n');
      
      const selection = prompt(
        `Found ${allUsers.length} customer user(s):\n\n${userList}\n\n` +
        `Enter numbers to delete (comma-separated, e.g., "1,3,5") or type "all" to delete all:`
      );

      if (!selection) {
        setDeletingTestUsers(false);
        return;
      }

      let usersToDelete: string[] = [];

      if (selection.toLowerCase().trim() === 'all') {
        usersToDelete = allUsers.map(u => u.id);
      } else {
        const indices = selection.split(',').map(s => parseInt(s.trim()) - 1);
        usersToDelete = indices
          .filter(i => i >= 0 && i < allUsers.length)
          .map(i => allUsers[i].id);
      }

      if (usersToDelete.length === 0) {
        alert('No valid users selected');
        setDeletingTestUsers(false);
        return;
      }

      // Final confirmation
      if (!confirm(`Delete ${usersToDelete.length} user(s)? This cannot be undone!`)) {
        setDeletingTestUsers(false);
        return;
      }

      // Delete selected users
      const { error: deleteError } = await supabase
        .from('users')
        .delete()
        .in('id', usersToDelete);

      if (deleteError) {
        console.error('Delete error:', deleteError);
        throw deleteError;
      }

      alert(`✅ Successfully deleted ${usersToDelete.length} user(s)!`);
      
      // Redirect to Members page to see updated list
      window.location.href = '/dashboard/members';
    } catch (error: any) {
      console.error('Error deleting users:', error);
      alert(`❌ Failed to delete users: ${error.message}\n\nCheck browser console for details.\n\nNote: Users may have related records (bookings, children, etc.) preventing deletion.`);
    } finally {
      setDeletingTestUsers(false);
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-lg">Loading payment recovery dashboard...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Payment Recovery</h1>
          <p className="text-sm text-gray-600 mt-0.5">
            Automated WhatsApp payment reminders
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-white rounded border px-3 py-1.5">
            <span className="text-xs font-medium">Auto Chase:</span>
            <Button
              size="sm"
              variant={autoChaseEnabled ? 'default' : 'outline'}
              onClick={() => setAutoChaseEnabled(!autoChaseEnabled)}
              className="h-7 text-xs"
            >
              {autoChaseEnabled ? (
                <>
                  <Pause className="w-3 h-3 mr-1" />
                  On
                </>
              ) : (
                <>
                  <Play className="w-3 h-3 mr-1" />
                  Off
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        <Card className="p-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-red-100 rounded">
              <DollarSign className="w-4 h-4 text-red-600" />
            </div>
            <div>
              <div className="text-xs text-gray-600">Total Overdue</div>
              <div className="text-lg font-bold text-red-600">
                AED {metrics?.total_overdue.toLocaleString()}
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-orange-100 rounded">
              <AlertCircle className="w-4 h-4 text-orange-600" />
            </div>
            <div>
              <div className="text-xs text-gray-600">Overdue Customers</div>
              <div className="text-lg font-bold">{metrics?.overdue_customers}</div>
            </div>
          </div>
        </Card>

        <Card className="p-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 rounded">
              <Clock className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <div className="text-xs text-gray-600">Links Sent</div>
              <div className="text-lg font-bold">{metrics?.links_sent}</div>
            </div>
          </div>
        </Card>

        <Card className="p-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-green-100 rounded">
              <TrendingUp className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <div className="text-xs text-gray-600">Links Paid</div>
              <div className="text-lg font-bold text-green-600">{metrics?.links_paid}</div>
            </div>
          </div>
        </Card>

        <Card className="p-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-100 rounded">
              <TrendingUp className="w-4 h-4 text-purple-600" />
            </div>
            <div>
              <div className="text-xs text-gray-600">Recovery Rate</div>
              <div className="text-lg font-bold">{metrics?.recovery_rate.toFixed(1)}%</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Chase Schedule Configuration */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Auto Chase Schedule
            </h2>
            <p className="text-xs text-gray-600 mt-0.5">
              Automatic WhatsApp reminders based on days overdue
            </p>
          </div>
          <Button onClick={saveChaseSchedule} disabled={saving} size="sm">
            <Save className="w-3.5 h-3.5 mr-1.5" />
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>

        <div className="space-y-2">
          {chaseSchedule.map((item, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex-1 grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-700">Days Overdue</label>
                  <Input
                    type="number"
                    value={item.days_overdue}
                    onChange={(e) => updateScheduleItem(index, 'days_overdue', parseInt(e.target.value))}
                    className="mt-1 h-8 text-sm"
                    min="1"
                  />
                </div>
                <div className="flex items-end justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <span className="font-medium">📱 WhatsApp</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeScheduleItem(index)}
                    className="text-red-600 hover:text-red-700 h-8 px-2 text-xs"
                  >
                    Remove
                  </Button>
                </div>
              </div>
            </div>
          ))}

          <Button variant="outline" onClick={addScheduleItem} className="w-full h-8 text-xs">
            + Add Reminder
          </Button>
        </div>

        <div className="mt-3 p-2.5 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-900">
            <strong>How it works:</strong> When enabled, customers automatically receive WhatsApp reminders at the specified days overdue. Messages use your custom templates from Payment Templates page.
          </p>
        </div>
      </Card>

      {/* Quick Actions */}
      <Card className="p-4">
        <h2 className="text-lg font-bold mb-3">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <Button
            onClick={() => window.location.href = '/dashboard/members?filter=overdue'}
            className="h-auto py-3 flex-col items-start text-left"
            variant="outline"
          >
            <span className="font-semibold text-sm mb-0.5">View Overdue Members</span>
            <span className="text-xs text-gray-600">See outstanding payments</span>
          </Button>

          <Button
            onClick={() => window.location.href = '/dashboard/members'}
            className="h-auto py-3 flex-col items-start text-left"
            variant="outline"
          >
            <span className="font-semibold text-sm mb-0.5">Edit Members</span>
            <span className="text-xs text-gray-600">Update debt amounts</span>
          </Button>
          
          <Button
            onClick={() => window.location.href = '/dashboard/payment-templates'}
            className="h-auto py-3 flex-col items-start text-left"
            variant="outline"
          >
            <span className="font-semibold text-sm mb-0.5">Edit Templates</span>
            <span className="text-xs text-gray-600">Customize WhatsApp messages</span>
          </Button>
          
          <Button
            onClick={() => window.location.href = '/dashboard/settings?tab=whatsapp'}
            className="h-auto py-3 flex-col items-start text-left"
            variant="outline"
          >
            <span className="font-semibold text-sm mb-0.5">WhatsApp Settings</span>
            <span className="text-xs text-gray-600">Connect your account</span>
          </Button>
        </div>
      </Card>

      {/* Manual Member Entry */}
      <Card className="p-4 border-2 border-green-200 bg-green-50/50">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 bg-green-600 rounded">
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
          <h2 className="text-lg font-bold">Quick Add: Overdue Member</h2>
        </div>
        
        <div className="bg-white rounded-lg p-3 space-y-3">
          <p className="text-xs text-gray-600">
            Add customer with overdue amount. <strong className="text-green-700">Phone number identifies customer</strong> - same phone = amounts add up.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Phone Number * 📱</label>
              <Input
                placeholder="+971501234567"
                value={manualPhone}
                onChange={(e) => setManualPhone(e.target.value)}
                className="h-8 text-sm"
              />
              <p className="text-xs text-gray-500">This identifies the customer</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium">Full Name *</label>
              <Input
                placeholder="Ahmed Ali"
                value={manualName}
                onChange={(e) => setManualName(e.target.value)}
                className="h-8 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium">Email</label>
              <Input
                placeholder="member@example.com"
                type="email"
                value={manualEmail}
                onChange={(e) => setManualEmail(e.target.value)}
                className="h-8 text-sm"
              />
              <p className="text-xs text-gray-500">Optional</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium">Overdue Amount (AED) *</label>
              <Input
                type="number"
                placeholder="1050"
                value={manualAmount}
                onChange={(e) => setManualAmount(e.target.value)}
                className="h-8 text-sm"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={addManualMember}
              disabled={addingMember || !manualPhone || !manualName || !manualAmount}
              className="bg-green-600 hover:bg-green-700 h-9 text-sm"
            >
              {addingMember ? 'Adding...' : '✅ Add Member'}
            </Button>

            <Button
              variant="outline"
              onClick={() => window.location.href = '/dashboard/members'}
              className="h-9 text-sm"
            >
              View Members →
            </Button>

            <Button
              variant="destructive"
              onClick={deleteAllTestUsers}
              disabled={deletingTestUsers}
              className="h-9 text-sm bg-red-600 hover:bg-red-700"
            >
              {deletingTestUsers ? 'Deleting...' : '🗑️ Delete Test Users'}
            </Button>
          </div>

          <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
            <p className="font-semibold text-yellow-900">💡 Quick Test:</p>
            <p className="text-yellow-800">Use YOUR phone to test the full payment flow!</p>
          </div>
        </div>
      </Card>

      {/* Test WhatsApp */}
      <Card className="p-4 border-2 border-purple-200 bg-purple-50/50">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 bg-purple-600 rounded">
            <Settings className="w-4 h-4 text-white" />
          </div>
          <h2 className="text-lg font-bold">Test WhatsApp</h2>
        </div>
        
        <div className="bg-white rounded-lg p-3 space-y-3">
          <p className="text-xs text-gray-600">
            Send a test payment reminder to verify WhatsApp is working.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Your Phone</label>
              <Input
                placeholder="+971501234567"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                className="h-8 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium">Name</label>
              <Input
                placeholder="Your Name"
                value={testName}
                onChange={(e) => setTestName(e.target.value)}
                className="h-8 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium">Amount (AED)</label>
              <Input
                type="number"
                placeholder="1050"
                value={testAmount}
                onChange={(e) => setTestAmount(e.target.value)}
                className="h-8 text-sm"
              />
            </div>
          </div>

          <Button
            onClick={sendTestWhatsApp}
            disabled={sendingTest || !testPhone || !testName || !testAmount}
            className="w-full bg-purple-600 hover:bg-purple-700 h-9 text-sm"
          >
            {sendingTest ? 'Sending...' : '📱 Send Test WhatsApp'}
          </Button>

          <div className="p-2 bg-blue-50 border border-blue-200 rounded text-xs">
            <p className="text-blue-800">
              <strong>Note:</strong> Make sure WhatsApp is connected in Settings → WhatsApp before testing.
            </p>
          </div>
        </div>
      </Card>
      </div>
    </DashboardLayout>
  );
}
