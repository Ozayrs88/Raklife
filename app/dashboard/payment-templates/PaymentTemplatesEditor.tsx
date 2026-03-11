'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  Send, 
  Eye,
  Save,
  AlertCircle,
  CheckCircle2,
  RotateCcw
} from 'lucide-react';

type Props = {
  businessId: string;
  businessName: string;
  businessPhone: string;
};

export default function PaymentTemplatesEditor({ businessId, businessName, businessPhone }: Props) {
  const [testPhone, setTestPhone] = useState('');
  const [testCustomerName, setTestCustomerName] = useState('Ahmed');
  const [testAmount, setTestAmount] = useState('1050');
  const [testDaysOverdue, setTestDaysOverdue] = useState('7');
  const [sending, setSending] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Template states
  const [earlyTemplate, setEarlyTemplate] = useState(`Hi {name},

Friendly reminder from ${businessName}:

Your account has an outstanding balance of *AED {amount}*.

👉 Pay securely here:
{payment_link}

Questions? Reply to this message or call ${businessPhone}.

Thank you! 🙏`);

  const [mediumTemplate, setMediumTemplate] = useState(`Hi {name},

Your account balance is now *{days} days overdue*.

⚠️ Amount Due: *AED {amount}*

👉 Please pay today:
{payment_link}

Need help? Contact us: ${businessPhone}

${businessName}`);

  const [urgentTemplate, setUrgentTemplate] = useState(`🚨 URGENT - {name}

Your account is *{days} days overdue*.

Amount: *AED {amount}*

👉 PAY NOW to avoid service interruption:
{payment_link}

Need payment plan? Call ${businessPhone} IMMEDIATELY.

${businessName} Billing`);

  function resetToDefaults() {
    if (confirm('Reset all templates to default? Your custom templates will be lost.')) {
      setEarlyTemplate(`Hi {name},

Friendly reminder from ${businessName}:

Your account has an outstanding balance of *AED {amount}*.

👉 Pay securely here:
{payment_link}

Questions? Reply to this message or call ${businessPhone}.

Thank you! 🙏`);

      setMediumTemplate(`Hi {name},

Your account balance is now *{days} days overdue*.

⚠️ Amount Due: *AED {amount}*

👉 Please pay today:
{payment_link}

Need help? Contact us: ${businessPhone}

${businessName}`);

      setUrgentTemplate(`🚨 URGENT - {name}

Your account is *{days} days overdue*.

Amount: *AED {amount}*

👉 PAY NOW to avoid service interruption:
{payment_link}

Need payment plan? Call ${businessPhone} IMMEDIATELY.

${businessName} Billing`);
    }
  }

  async function saveTemplates() {
    setSaving(true);
    try {
      const response = await fetch('/api/payment-templates/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_id: businessId,
          templates: {
            early: earlyTemplate,
            medium: mediumTemplate,
            urgent: urgentTemplate,
          },
        }),
      });

      if (response.ok) {
        setLastSaved(new Date());
        alert('✅ Templates saved successfully!');
      } else {
        const error = await response.json();
        alert(`❌ Failed to save: ${error.error}`);
      }
    } catch (error) {
      console.error('Error saving templates:', error);
      alert('❌ Failed to save templates');
    } finally {
      setSaving(false);
    }
  }

  function getPreviewMessage() {
    const days = parseInt(testDaysOverdue);
    let template = earlyTemplate;
    
    if (days > 14) {
      template = urgentTemplate;
    } else if (days > 7) {
      template = mediumTemplate;
    }

    return template
      .replace(/\{name\}/g, testCustomerName)
      .replace(/\{amount\}/g, testAmount)
      .replace(/\{days\}/g, testDaysOverdue)
      .replace(/\{payment_link\}/g, 'https://pay.stripe.com/test_demo_link');
  }

  async function sendTestMessage() {
    if (!testPhone) {
      alert('Please enter a test phone number');
      return;
    }

    if (!testCustomerName || !testAmount || !testDaysOverdue) {
      alert('Please fill in all test fields');
      return;
    }

    setSending(true);
    try {
      const response = await fetch('/api/payment-templates/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_id: businessId,
          to_phone: testPhone,
          customer_name: testCustomerName,
          overdue_amount: parseFloat(testAmount),
          days_overdue: parseInt(testDaysOverdue),
          template_early: earlyTemplate,
          template_medium: mediumTemplate,
          template_urgent: urgentTemplate,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        alert(`✅ Test message sent successfully to ${testPhone}!\n\nCheck your WhatsApp.`);
      } else {
        alert(`❌ Failed to send: ${result.error}`);
      }
    } catch (error: any) {
      console.error('Error sending test:', error);
      alert(`❌ Failed to send test message: ${error.message}`);
    } finally {
      setSending(false);
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Payment Templates</h1>
            <p className="text-sm text-gray-600">Customize your payment reminder messages</p>
          </div>
          
          <div className="flex gap-2">
            {lastSaved && (
              <div className="flex items-center gap-1.5 text-xs text-green-600 px-2 py-1 bg-green-50 rounded">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Saved {lastSaved.toLocaleTimeString()}
              </div>
            )}
            <Button onClick={resetToDefaults} variant="outline" size="sm">
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
              Reset
            </Button>
            <Button onClick={saveTemplates} disabled={saving} size="sm" className="bg-green-600 hover:bg-green-700">
              <Save className="w-3.5 h-3.5 mr-1.5" />
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Left: Templates */}
          <div className="space-y-3">
            {/* Template 1 */}
            <Card className="p-3">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-sm">Early Reminder</h3>
                  <p className="text-xs text-gray-500">1-7 days overdue</p>
                </div>
                <div className="text-xs text-gray-500">Variables: {'{name}'} {'{amount}'}</div>
              </div>
              <Textarea
                value={earlyTemplate}
                onChange={(e) => setEarlyTemplate(e.target.value)}
                rows={8}
                className="font-mono text-xs"
              />
            </Card>

            {/* Template 2 */}
            <Card className="p-3">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-sm">Medium Urgency</h3>
                  <p className="text-xs text-gray-500">8-14 days overdue</p>
                </div>
                <div className="text-xs text-gray-500">+ {'{days}'}</div>
              </div>
              <Textarea
                value={mediumTemplate}
                onChange={(e) => setMediumTemplate(e.target.value)}
                rows={8}
                className="font-mono text-xs"
              />
            </Card>

            {/* Template 3 */}
            <Card className="p-3">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-sm">Urgent</h3>
                  <p className="text-xs text-gray-500">15+ days overdue</p>
                </div>
                <div className="text-xs text-gray-500">+ {'{days}'}</div>
              </div>
              <Textarea
                value={urgentTemplate}
                onChange={(e) => setUrgentTemplate(e.target.value)}
                rows={8}
                className="font-mono text-xs"
              />
            </Card>
          </div>

          {/* Right: Test & Preview */}
          <div className="space-y-3">
            {/* Test Section */}
            <Card className="p-3 bg-purple-50/50 border-purple-200">
              <div className="flex items-center gap-2 mb-3">
                <Send className="w-4 h-4 text-purple-600" />
                <h3 className="font-semibold text-sm">Test Message</h3>
              </div>

              <div className="space-y-2.5">
                <div>
                  <label className="text-xs font-medium text-gray-700">Your Phone *</label>
                  <Input
                    placeholder="+971501234567"
                    value={testPhone}
                    onChange={(e) => setTestPhone(e.target.value)}
                    className="mt-1 h-8 text-sm"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-xs font-medium text-gray-700">Name</label>
                    <Input
                      placeholder="Ahmed"
                      value={testCustomerName}
                      onChange={(e) => setTestCustomerName(e.target.value)}
                      className="mt-1 h-8 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-700">Amount</label>
                    <Input
                      type="number"
                      placeholder="1050"
                      value={testAmount}
                      onChange={(e) => setTestAmount(e.target.value)}
                      className="mt-1 h-8 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-700">Days</label>
                    <Input
                      type="number"
                      placeholder="7"
                      value={testDaysOverdue}
                      onChange={(e) => setTestDaysOverdue(e.target.value)}
                      className="mt-1 h-8 text-sm"
                    />
                  </div>
                </div>

                <Button
                  onClick={sendTestMessage}
                  disabled={sending || !testPhone}
                  className="w-full bg-purple-600 hover:bg-purple-700 h-9 text-sm"
                >
                  <Send className="w-3.5 h-3.5 mr-1.5" />
                  {sending ? 'Sending...' : 'Send Test'}
                </Button>

                <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                  <div className="flex items-start gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <p className="text-yellow-800">Use your own number for testing</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Preview */}
            <Card className="p-3">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="w-4 h-4 text-gray-600" />
                <span className="font-semibold text-sm">Preview</span>
                <span className="text-xs text-gray-500 ml-auto">
                  {parseInt(testDaysOverdue) > 14 ? 'Urgent' : parseInt(testDaysOverdue) > 7 ? 'Medium' : 'Early'}
                </span>
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded p-3 min-h-[400px] max-h-[500px] overflow-y-auto">
                <div className="whitespace-pre-wrap text-xs font-mono leading-relaxed">
                  {getPreviewMessage()}
                </div>
              </div>

              <div className="mt-2 text-xs text-gray-500 space-y-0.5">
                <p>• *Bold text* = bold on WhatsApp</p>
                <p>• Links are clickable</p>
                <p>• Emojis display correctly</p>
              </div>
            </Card>
          </div>
        </div>

        {/* Tips */}
        <Card className="p-3 bg-blue-50 border-blue-200">
          <h3 className="font-semibold text-sm mb-1.5">💡 Quick Tips</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-1 text-xs text-gray-700">
            <p>• Use *bold* for emphasis</p>
            <p>• Keep under 500 characters</p>
            <p>• Include payment link</p>
            <p>• Test before using</p>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
