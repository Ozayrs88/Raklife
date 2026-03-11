'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Smartphone, Send, RefreshCw, CheckCircle, XCircle } from 'lucide-react';

type Props = {
  businessId: string;
};

export default function WhatsAppTestContent({ businessId }: Props) {
  const [status, setStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('+971501234567');
  const [message, setMessage] = useState('Hello! This is a test message from your payment recovery system.');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    // Only start polling after user manually connects
    // Don't auto-check on mount to avoid triggering connections
    const interval = setInterval(() => {
      // Only poll if we're in a connecting state
      if (status === 'connecting' || status === 'connected') {
        checkStatus();
      }
    }, 3000);
    
    return () => clearInterval(interval);
  }, [status]);

  async function checkStatus() {
    try {
      const response = await fetch(`/api/whatsapp/connect?business_id=${businessId}`);
      const data = await response.json();
      
      setStatus(data.status);
      if (data.qr_code) {
        setQrCode(data.qr_code);
      } else {
        setQrCode(null);
      }
    } catch (error) {
      console.error('Error checking status:', error);
    }
  }

  async function connectWhatsApp() {
    setLoading(true);
    setStatus('connecting'); // Set to connecting immediately
    try {
      const response = await fetch('/api/whatsapp/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ business_id: businessId }),
      });

      const data = await response.json();
      console.log('Connect response:', data);
      
      // Start polling immediately after connection request
      setTimeout(() => checkStatus(), 1000);
      
    } catch (error: any) {
      console.error('Error connecting:', error);
      alert('Failed to connect: ' + error.message);
      setStatus('disconnected');
    } finally {
      setLoading(false);
    }
  }

  async function disconnectWhatsApp() {
    if (!confirm('Are you sure you want to disconnect WhatsApp?')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/whatsapp/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          business_id: businessId,
          force: true
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        alert('✅ Disconnected successfully');
        setStatus('disconnected');
        setQrCode(null);
      } else {
        alert('❌ Failed to disconnect: ' + data.error);
      }
    } catch (error: any) {
      console.error('Error disconnecting:', error);
      alert('❌ Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  async function clearAndReset() {
    if (!confirm('⚠️ This will completely remove your WhatsApp connection and allow you to connect a different number. Continue?')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/whatsapp/clear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ business_id: businessId }),
      });

      const data = await response.json();
      
      if (response.ok) {
        alert('✅ WhatsApp cleared! Click "Connect WhatsApp" to scan a new QR code.');
        setStatus('disconnected');
        setQrCode(null);
      } else {
        alert('❌ Failed to clear: ' + data.error);
      }
    } catch (error: any) {
      console.error('Error clearing:', error);
      alert('❌ Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  async function sendTestMessage() {
    if (!phoneNumber || !message) {
      alert('Please enter phone number and message');
      return;
    }

    setSending(true);
    try {
      const response = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_id: businessId,
          phone_number: phoneNumber,
          message: message,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('✅ Message sent successfully!');
      } else {
        alert('❌ Failed to send: ' + data.error);
      }
    } catch (error: any) {
      console.error('Error sending message:', error);
      alert('❌ Error: ' + error.message);
    } finally {
      setSending(false);
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">WhatsApp Test Center</h1>
          <p className="text-gray-600 mt-1">
            Connect your WhatsApp and test message sending
          </p>
        </div>

        {/* Connection Status */}
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Connection Status</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={checkStatus}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>

          <div className="flex items-center gap-4 mb-6">
            {status === 'connected' ? (
              <>
                <CheckCircle className="w-6 h-6 text-green-600" />
                <div>
                  <div className="font-semibold text-green-600">Connected</div>
                  <div className="text-sm text-gray-600">WhatsApp is ready to send messages</div>
                </div>
              </>
            ) : status === 'connecting' ? (
              <>
                <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <div>
                  <div className="font-semibold text-blue-600">Connecting...</div>
                  <div className="text-sm text-gray-600">Waiting for QR code scan</div>
                </div>
              </>
            ) : (
              <>
                <XCircle className="w-6 h-6 text-gray-400" />
                <div>
                  <div className="font-semibold text-gray-600">Disconnected</div>
                  <div className="text-sm text-gray-600">Click connect to start</div>
                </div>
              </>
            )}
          </div>

          {status !== 'connected' && (
            <Button
              onClick={connectWhatsApp}
              disabled={loading}
            >
              <Smartphone className="w-4 h-4 mr-2" />
              {loading ? 'Connecting...' : 'Connect WhatsApp'}
            </Button>
          )}

          {status === 'connected' && (
            <div className="flex gap-2">
              <Button
                onClick={disconnectWhatsApp}
                disabled={loading}
                variant="outline"
              >
                {loading ? 'Disconnecting...' : 'Disconnect'}
              </Button>
              <Button
                onClick={clearAndReset}
                disabled={loading}
                variant="destructive"
              >
                {loading ? 'Clearing...' : 'Clear & Reset'}
              </Button>
            </div>
          )}
        </div>

        {/* QR Code Display */}
        {qrCode && status === 'connecting' && (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 text-center">Scan QR Code</h3>
            <div className="flex flex-col items-center space-y-4">
              <img
                src={qrCode}
                alt="WhatsApp QR Code"
                className="w-64 h-64 bg-white p-4 rounded-lg"
              />
              <div className="text-center text-sm text-gray-600 max-w-md">
                <p className="font-medium mb-2">Instructions:</p>
                <ol className="text-left space-y-1">
                  <li>1. Open WhatsApp on your phone</li>
                  <li>2. Go to Settings → Linked Devices</li>
                  <li>3. Tap "Link a Device"</li>
                  <li>4. Scan this QR code</li>
                </ol>
              </div>
            </div>
          </div>
        )}

        {/* Send Test Message */}
        {status === 'connected' && (
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">Send Test Message</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Phone Number (with country code)
                </label>
                <Input
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+971501234567"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Format: +[country code][number] (e.g., +971501234567 for UAE)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Message
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              <Button
                onClick={sendTestMessage}
                disabled={sending}
                className="w-full"
              >
                <Send className="w-4 h-4 mr-2" />
                {sending ? 'Sending...' : 'Send Test Message'}
              </Button>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <h3 className="font-semibold text-amber-900 mb-2">Important Notes:</h3>
          <ul className="text-sm text-amber-800 space-y-1">
            <li>• This uses your personal WhatsApp number</li>
            <li>• Messages will appear as coming from your phone</li>
            <li>• Keep this page open to maintain connection</li>
            <li>• In production, each business will connect their own WhatsApp</li>
            <li>• QR code expires after ~1 minute, click "Connect" again if needed</li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
}
