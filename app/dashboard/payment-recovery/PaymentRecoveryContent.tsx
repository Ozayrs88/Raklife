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
    if (!manualEmail || !manualName || !manualPhone || !manualAmount) {
      alert('Please fill in all fields');
      return;
    }

    setAddingMember(true);
    try {
      // Check if user exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', manualEmail)
        .single();

      let userId: string;

      if (existingUser) {
        // Update existing user
        userId = existingUser.id;
        const { error: updateError } = await supabase
          .from('users')
          .update({
            full_name: manualName,
            phone: manualPhone,
            overdue_amount: parseFloat(manualAmount),
            payment_status: 'overdue',
          })
          .eq('id', userId);

        if (updateError) throw updateError;
      } else {
        // Generate a UUID for the new user
        const newUserId = crypto.randomUUID();
        
        // Create new user
        const { data: newUser, error: insertError } = await supabase
          .from('users')
          .insert({
            id: newUserId,
            email: manualEmail,
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
      if (confirm('✅ Member added successfully!\n\nGo to Members page to see them and send payment link?')) {
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
      <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Payment Recovery</h1>
          <p className="text-gray-600 mt-1">
            Automated system to chase overdue payments
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white rounded-lg border px-4 py-2">
            <span className="text-sm font-medium">Auto Chase:</span>
            <Button
              size="sm"
              variant={autoChaseEnabled ? 'default' : 'outline'}
              onClick={() => setAutoChaseEnabled(!autoChaseEnabled)}
            >
              {autoChaseEnabled ? (
                <>
                  <Pause className="w-4 h-4 mr-1" />
                  Enabled
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-1" />
                  Disabled
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Total Overdue</div>
              <div className="text-2xl font-bold text-red-600">
                AED {metrics?.total_overdue.toLocaleString()}
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-100 rounded-lg">
              <AlertCircle className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Overdue Customers</div>
              <div className="text-2xl font-bold">{metrics?.overdue_customers}</div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Links Sent</div>
              <div className="text-2xl font-bold">{metrics?.links_sent}</div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Links Paid</div>
              <div className="text-2xl font-bold text-green-600">{metrics?.links_paid}</div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Recovery Rate</div>
              <div className="text-2xl font-bold">{metrics?.recovery_rate.toFixed(1)}%</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Chase Schedule Configuration */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Automated Chase Schedule
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Configure when to automatically send payment reminders based on days overdue
            </p>
          </div>
          <Button onClick={saveChaseSchedule} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Schedule'}
          </Button>
        </div>

        <div className="space-y-4">
          {chaseSchedule.map((item, index) => (
            <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex-1 grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Days Overdue</label>
                  <Input
                    type="number"
                    value={item.days_overdue}
                    onChange={(e) => updateScheduleItem(index, 'days_overdue', parseInt(e.target.value))}
                    className="mt-1"
                    min="1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Action</label>
                  <select
                    value={item.action}
                    onChange={(e) => updateScheduleItem(index, 'action', e.target.value)}
                    className="mt-1 w-full h-10 px-3 rounded-md border border-gray-300"
                  >
                    <option value="email">Email Only</option>
                    <option value="sms">SMS Only</option>
                    <option value="both">Email + SMS</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeScheduleItem(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Remove
                  </Button>
                </div>
              </div>
            </div>
          ))}

          <Button variant="outline" onClick={addScheduleItem} className="w-full">
            + Add Chase Reminder
          </Button>
        </div>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">
            <strong>How it works:</strong> When auto chase is enabled, the system will automatically send payment 
            reminders to customers based on the schedule above. For example, if you set "7 days overdue → Email", 
            customers who haven't paid for 7 days will automatically receive an email with their payment link.
          </p>
        </div>
      </Card>

      {/* Quick Actions */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            onClick={() => window.location.href = '/dashboard/members?filter=overdue'}
            className="h-auto py-4 flex-col items-start"
            variant="outline"
          >
            <span className="font-semibold mb-1">View Overdue Members</span>
            <span className="text-sm text-gray-600">See all customers with outstanding payments</span>
          </Button>
          
          <Button
            onClick={() => window.location.href = '/dashboard/members/import'}
            className="h-auto py-4 flex-col items-start"
            variant="outline"
          >
            <span className="font-semibold mb-1">Import CSV</span>
            <span className="text-sm text-gray-600">Upload member data with overdue amounts</span>
          </Button>
          
          <Button
            onClick={() => window.location.href = '/dashboard/settings?tab=payments'}
            className="h-auto py-4 flex-col items-start"
            variant="outline"
          >
            <span className="font-semibold mb-1">Stripe Settings</span>
            <span className="text-sm text-gray-600">Connect your Stripe account</span>
          </Button>
        </div>
      </Card>

      {/* Manual Member Entry */}
      <Card className="p-6 border-2 border-green-200 bg-green-50/50">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-green-600 rounded-lg">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-bold">Quick Add: Overdue Member</h2>
        </div>
        
        <div className="bg-white rounded-lg p-4 space-y-4">
          <p className="text-sm text-gray-600 mb-4">
            Quickly add a test member with overdue amount. Perfect for testing the payment recovery flow.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email *</label>
              <Input
                placeholder="member@example.com"
                type="email"
                value={manualEmail}
                onChange={(e) => setManualEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Full Name *</label>
              <Input
                placeholder="Ahmed Ali"
                value={manualName}
                onChange={(e) => setManualName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Phone Number *</label>
              <Input
                placeholder="+971501234567"
                value={manualPhone}
                onChange={(e) => setManualPhone(e.target.value)}
              />
              <p className="text-xs text-gray-500">Include country code</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Overdue Amount (AED) *</label>
              <Input
                type="number"
                placeholder="1050"
                value={manualAmount}
                onChange={(e) => setManualAmount(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={addManualMember}
              disabled={addingMember || !manualEmail || !manualName || !manualPhone || !manualAmount}
              className="bg-green-600 hover:bg-green-700"
            >
              {addingMember ? 'Adding...' : '✅ Add Overdue Member'}
            </Button>

            <Button
              variant="outline"
              onClick={() => window.location.href = '/dashboard/members'}
            >
              View Members →
            </Button>
          </div>

          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
            <p className="font-semibold text-yellow-900 mb-1">💡 Quick Test:</p>
            <p className="text-yellow-800">Use YOUR phone number here, then go to Members page and send payment link to test the full flow!</p>
          </div>
        </div>
      </Card>

      {/* Test WhatsApp */}
      <Card className="p-6 border-2 border-purple-200 bg-purple-50/50">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-purple-600 rounded-lg">
            <Settings className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-bold">Test WhatsApp Notification</h2>
        </div>
        
        <div className="bg-white rounded-lg p-4 space-y-4">
          <p className="text-sm text-gray-600 mb-4">
            Send a test WhatsApp message to verify your Twilio integration is working.
            Make sure you've joined the Twilio sandbox first!
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Your Phone Number</label>
              <Input
                placeholder="+447553674597"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
              />
              <p className="text-xs text-gray-500">Include country code (+44, +971, etc.)</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Customer Name</label>
              <Input
                placeholder="Your Name"
                value={testName}
                onChange={(e) => setTestName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Overdue Amount (AED)</label>
              <Input
                type="number"
                placeholder="1050"
                value={testAmount}
                onChange={(e) => setTestAmount(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={sendTestWhatsApp}
              disabled={sendingTest || !testPhone || !testName || !testAmount}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {sendingTest ? 'Sending...' : '📱 Send Test WhatsApp'}
            </Button>
            
            <Button
              variant="outline"
              onClick={() => window.open('https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn', '_blank')}
            >
              Join Twilio Sandbox
            </Button>
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
            <p className="font-semibold text-blue-900 mb-1">⚠️ Before testing:</p>
            <ol className="list-decimal ml-4 space-y-1 text-blue-800">
              <li>Join Twilio WhatsApp sandbox (click button above)</li>
              <li>Send "join &lt;code&gt;" to +1 415 523 8886</li>
              <li>Wait for confirmation</li>
              <li>Then test here!</li>
            </ol>
          </div>
        </div>
      </Card>
      </div>
    </DashboardLayout>
  );
}
