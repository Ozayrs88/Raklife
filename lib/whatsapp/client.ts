/**
 * WhatsApp Service Client
 * Calls Railway-hosted WhatsApp Web.js microservice
 */

const WHATSAPP_SERVICE_URL = process.env.WHATSAPP_SERVICE_URL || 'http://localhost:3001';

export async function initWhatsAppConnection(businessId: string): Promise<void> {
  const response = await fetch(`${WHATSAPP_SERVICE_URL}/api/whatsapp/connect`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ businessId }),
  });

  if (!response.ok) {
    throw new Error(`Failed to connect: ${response.statusText}`);
  }

  return response.json();
}

export async function getQRCode(businessId: string): Promise<string | null> {
  try {
    const response = await fetch(`${WHATSAPP_SERVICE_URL}/api/whatsapp/qr/${businessId}`);
    
    if (response.ok) {
      const data = await response.json();
      return data.qr;
    }
    return null;
  } catch (error) {
    console.error('Error fetching QR code:', error);
    return null;
  }
}

export async function getConnectionStatus(businessId: string): Promise<'connecting' | 'connected' | 'disconnected'> {
  try {
    const response = await fetch(`${WHATSAPP_SERVICE_URL}/api/whatsapp/status/${businessId}`);
    
    if (response.ok) {
      const data = await response.json();
      return data.status;
    }
    return 'disconnected';
  } catch (error) {
    console.error('Error fetching status:', error);
    return 'disconnected';
  }
}

export async function sendWhatsAppMessage(
  businessId: string,
  phoneNumber: string,
  message: string
): Promise<boolean> {
  try {
    const response = await fetch(`${WHATSAPP_SERVICE_URL}/api/whatsapp/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ businessId, phoneNumber, message }),
    });

    if (!response.ok) {
      throw new Error(`Failed to send message: ${response.statusText}`);
    }

    return true;
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    throw error;
  }
}

export async function disconnectWhatsApp(businessId: string): Promise<void> {
  const response = await fetch(`${WHATSAPP_SERVICE_URL}/api/whatsapp/disconnect`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ businessId }),
  });

  if (!response.ok) {
    throw new Error(`Failed to disconnect: ${response.statusText}`);
  }
}

// Keep these for backwards compatibility (no-ops)
export function getConnection(businessId: string) {
  return null;
}

export function forceStopConnection(businessId: string) {
  return disconnectWhatsApp(businessId);
}

export function clearRateLimit(businessId: string) {
  console.log('clearRateLimit called (no-op for microservice)');
}

export async function clearAuthState(businessId: string) {
  return disconnectWhatsApp(businessId);
}

export async function restoreConnections() {
  console.log('restoreConnections handled by microservice on startup');
}
