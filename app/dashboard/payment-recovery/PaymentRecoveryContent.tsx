'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg">Loading payment recovery dashboard...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
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
    </div>
  );
}
