import { Client, LocalAuth, Message } from 'whatsapp-web.js';
import QRCode from 'qrcode';
import { createClient } from '@supabase/supabase-js';

// Store active connections per business
const connections = new Map<string, Client>();
const qrCodes = new Map<string, string>();
const connectionStatus = new Map<string, 'connecting' | 'connected' | 'disconnected'>();
const connectionAttempts = new Map<string, boolean>();

// Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function initWhatsAppConnection(businessId: string): Promise<void> {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  if (connectionAttempts.get(businessId) && !isDevelopment) {
    console.log('⚠️ Connection already in progress for', businessId);
    return;
  }

  if (connections.has(businessId)) {
    console.log('✅ Already connected for', businessId);
    return;
  }

  connectionAttempts.set(businessId, true);
  console.log('🔌 Initializing WhatsApp Web for business:', businessId);

  try {
    // Create client with local authentication
    const client = new Client({
      authStrategy: new LocalAuth({
        clientId: businessId,
        dataPath: './.wwebjs_auth'
      }),
      puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      }
    });

    // QR Code event
    client.on('qr', async (qr) => {
      console.log('📱 QR Code generated for', businessId);
      const qrDataUrl = await QRCode.toDataURL(qr);
      qrCodes.set(businessId, qrDataUrl);
      connectionStatus.set(businessId, 'connecting');

      // Save QR to database
      await supabase
        .from('whatsapp_sessions')
        .upsert({
          business_id: businessId,
          qr_code: qrDataUrl,
          status: 'connecting',
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'business_id'
        });
    });

    // Ready event
    client.on('ready', async () => {
      console.log('✅ WhatsApp Web connected for', businessId);
      connections.set(businessId, client);
      connectionStatus.set(businessId, 'connected');
      connectionAttempts.delete(businessId);
      qrCodes.delete(businessId);

      // Get phone number
      const info = client.info;
      const phoneNumber = info?.wid?.user || null;
      console.log('📞 Connected phone number:', phoneNumber);

      // Update database
      await supabase
        .from('whatsapp_sessions')
        .update({
          status: 'connected',
          phone_number: phoneNumber,
          last_connected_at: new Date().toISOString(),
          qr_code: null,
          updated_at: new Date().toISOString(),
        })
        .eq('business_id', businessId);
    });

    // Authenticated event
    client.on('authenticated', () => {
      console.log('🔐 WhatsApp authenticated for', businessId);
    });

    // Auth failure event
    client.on('auth_failure', async (msg) => {
      console.error('❌ Authentication failed for', businessId, msg);
      connectionStatus.set(businessId, 'disconnected');
      connectionAttempts.delete(businessId);
      
      await supabase
        .from('whatsapp_sessions')
        .update({
          status: 'disconnected',
          updated_at: new Date().toISOString(),
        })
        .eq('business_id', businessId);
    });

    // Disconnected event
    client.on('disconnected', async (reason) => {
      console.log('❌ WhatsApp disconnected for', businessId, 'Reason:', reason);
      connections.delete(businessId);
      connectionStatus.set(businessId, 'disconnected');
      connectionAttempts.delete(businessId);

      await supabase
        .from('whatsapp_sessions')
        .update({
          status: 'disconnected',
          updated_at: new Date().toISOString(),
        })
        .eq('business_id', businessId);
    });

    // Initialize the client
    await client.initialize();

  } catch (error) {
    console.error('❌ Error initializing WhatsApp Web:', error);
    connectionAttempts.delete(businessId);
    connectionStatus.set(businessId, 'disconnected');
    throw error;
  }
}

export async function getQRCode(businessId: string): Promise<string | null> {
  const memoryQR = qrCodes.get(businessId);
  if (memoryQR) return memoryQR;

  const { data } = await supabase
    .from('whatsapp_sessions')
    .select('qr_code')
    .eq('business_id', businessId)
    .single();

  return data?.qr_code || null;
}

export async function getConnectionStatus(businessId: string): Promise<'connecting' | 'connected' | 'disconnected'> {
  const memoryStatus = connectionStatus.get(businessId);
  if (memoryStatus) return memoryStatus;

  const { data } = await supabase
    .from('whatsapp_sessions')
    .select('status')
    .eq('business_id', businessId)
    .single();

  const status = (data?.status as 'connecting' | 'connected' | 'disconnected') || 'disconnected';
  connectionStatus.set(businessId, status);
  return status;
}

export function getConnection(businessId: string): Client | null {
  return connections.get(businessId) || null;
}

export async function sendWhatsAppMessage(
  businessId: string,
  phoneNumber: string,
  message: string
): Promise<boolean> {
  const client = connections.get(businessId);

  if (!client) {
    throw new Error('WhatsApp not connected for this business. Please scan QR code first.');
  }

  try {
    // Format phone number (remove non-digits, add country code if needed)
    let formattedNumber = phoneNumber.replace(/[^0-9]/g, '');
    
    // Add @c.us suffix for WhatsApp
    const chatId = `${formattedNumber}@c.us`;
    
    await client.sendMessage(chatId, message);
    console.log('✅ Message sent via WhatsApp to', phoneNumber);
    return true;
  } catch (error) {
    console.error('❌ Failed to send WhatsApp message:', error);
    throw error;
  }
}

export async function disconnectWhatsApp(businessId: string) {
  const client = connections.get(businessId);
  if (client) {
    await client.destroy();
    connections.delete(businessId);
    connectionStatus.set(businessId, 'disconnected');
    connectionAttempts.delete(businessId);

    await supabase
      .from('whatsapp_sessions')
      .update({
        status: 'disconnected',
        updated_at: new Date().toISOString(),
      })
      .eq('business_id', businessId);
    
    console.log('🛑 Disconnected WhatsApp for', businessId);
  }
}

export function forceStopConnection(businessId: string) {
  const client = connections.get(businessId);
  if (client) {
    client.destroy();
  }
  
  connections.delete(businessId);
  connectionStatus.delete(businessId);
  connectionAttempts.delete(businessId);
  qrCodes.delete(businessId);
  
  console.log('🛑 Force stopped connection for', businessId);
}

export function clearRateLimit(businessId: string) {
  connectionAttempts.delete(businessId);
  console.log('✅ Cleared rate limit block for', businessId);
}

export async function clearAuthState(businessId: string) {
  forceStopConnection(businessId);
  
  await supabase
    .from('whatsapp_sessions')
    .delete()
    .eq('business_id', businessId);
  
  console.log('🗑️ Cleared auth state for', businessId);
}

export async function restoreConnections() {
  console.log('🔄 Restoring WhatsApp Web connections from database...');
  
  const { data: sessions } = await supabase
    .from('whatsapp_sessions')
    .select('business_id, status')
    .eq('status', 'connected');

  if (!sessions || sessions.length === 0) {
    console.log('No active sessions to restore');
    return;
  }

  for (const session of sessions) {
    console.log('Restoring connection for business:', session.business_id);
    try {
      await initWhatsAppConnection(session.business_id);
    } catch (error) {
      console.error('Failed to restore connection for', session.business_id, error);
    }
  }
}
