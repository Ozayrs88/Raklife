import makeWASocket, { 
  DisconnectReason, 
  WASocket,
  proto,
  AuthenticationState,
  SignalDataTypeMap,
  initAuthCreds,
  BufferJSON
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import QRCode from 'qrcode';
import { createClient } from '@supabase/supabase-js';

// Store active connections per business (in-memory, rebuilt on restart)
const connections = new Map<string, WASocket>();
const qrCodes = new Map<string, string>();
const connectionStatus = new Map<string, 'connecting' | 'connected' | 'disconnected'>();
const connectionAttempts = new Map<string, boolean>(); // Track if already connecting
const retryCount = new Map<string, number>(); // Track retry attempts
const MAX_RETRIES = 3; // Maximum automatic retry attempts

// Supabase client with service role for auth state access
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Custom auth state handler that stores in Supabase
 */
async function useSupabaseAuthState(businessId: string): Promise<{
  state: AuthenticationState;
  saveCreds: () => Promise<void>;
}> {
  // Fetch existing auth state from database
  const { data: session } = await supabase
    .from('whatsapp_sessions')
    .select('auth_state')
    .eq('business_id', businessId)
    .single();

  let creds = session?.auth_state?.creds || initAuthCreds();
  let keys = session?.auth_state?.keys || {};

  const saveCreds = async () => {
    const authState = {
      creds,
      keys
    };

    // Upsert to database
    await supabase
      .from('whatsapp_sessions')
      .upsert({
        business_id: businessId,
        auth_state: authState,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'business_id'
      });

    console.log('💾 Saved WhatsApp auth state to database for', businessId);
  };

  return {
    state: {
      creds,
      keys: {
        get: async (type: keyof SignalDataTypeMap, ids: string[]) => {
          const data: any = {};
          for (const id of ids) {
            const key = `${type}.${id}`;
            if (keys[key]) {
              data[id] = keys[key];
            }
          }
          return data;
        },
        set: async (data: any) => {
          for (const category in data) {
            for (const id in data[category]) {
              const key = `${category}.${id}`;
              const value = data[category][id];
              if (value) {
                keys[key] = value;
              } else {
                delete keys[key];
              }
            }
          }
          await saveCreds();
        }
      }
    },
    saveCreds
  };
}

export async function initWhatsAppConnection(businessId: string): Promise<void> {
  // Prevent multiple simultaneous connection attempts (skip in development mode)
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  if (connectionAttempts.get(businessId) && !isDevelopment) {
    console.log('⚠️ Connection already in progress for', businessId);
    return;
  }

  // Check if already connected
  if (connections.has(businessId)) {
    console.log('✅ Already connected for', businessId);
    return;
  }

  connectionAttempts.set(businessId, true);
  console.log('🔌 Initializing WhatsApp connection for business:', businessId);

  try {
    const { state, saveCreds } = await useSupabaseAuthState(businessId);

    const sock = makeWASocket({
      auth: state,
      browser: ['Mac OS', 'Chrome', '120.0.0'], // Standard browser identifier
      printQRInTerminal: false,
      getMessage: async (key) => {
        return { conversation: '' } as proto.IMessage;
      },
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        console.log('📱 QR Code generated for', businessId);
        console.log('SCAN THIS QR:', qr); // Log raw QR for debugging
        const qrDataUrl = await QRCode.toDataURL(qr);
        qrCodes.set(businessId, qrDataUrl);
        connectionStatus.set(businessId, 'connecting');

        // Save QR code to database (temporary)
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
      }

      if (connection === 'close') {
        const errorCode = (lastDisconnect?.error as Boom)?.output?.statusCode;
        const shouldReconnect = errorCode !== DisconnectReason.loggedOut;
        const currentRetries = retryCount.get(businessId) || 0;
        
        console.log('❌ Connection closed for', businessId);
        console.log('   Error code:', errorCode);
        console.log('   Should reconnect:', shouldReconnect);
        console.log('   Retries:', currentRetries, '/', MAX_RETRIES);
        
        connectionStatus.set(businessId, 'disconnected');
        connections.delete(businessId);
        connectionAttempts.delete(businessId); // Clear attempt flag

        // Update database
        await supabase
          .from('whatsapp_sessions')
          .update({
            status: 'disconnected',
            updated_at: new Date().toISOString(),
          })
          .eq('business_id', businessId);
        
        // Don't retry on specific error codes
        if (errorCode === 405) {
          console.log('🚫 WhatsApp rate limited. Stopping connection attempts.');
          connectionAttempts.set(businessId, true); // block new attempts
          retryCount.delete(businessId);
          return;
        }

        // Only auto-reconnect if:
        // 1. It's a temporary network issue (shouldReconnect)
        // 2. We haven't exceeded max retries
        // 3. Not a rate limit error
        if (shouldReconnect && currentRetries < MAX_RETRIES) {
          retryCount.set(businessId, currentRetries + 1);
          const delay = Math.min(5000 * (currentRetries + 1), 15000); // Exponential backoff, max 15s
          console.log(`⏳ Will retry connection in ${delay/1000} seconds... (attempt ${currentRetries + 1}/${MAX_RETRIES})`);
          setTimeout(() => initWhatsAppConnection(businessId), delay);
        } else if (currentRetries >= MAX_RETRIES) {
          console.log('🛑 Max retries reached. Please disconnect and try again manually.');
          retryCount.delete(businessId); // Reset for next manual attempt
        }
      } else if (connection === 'open') {
        console.log('✅ WhatsApp connected for', businessId);
        connections.set(businessId, sock);
        connectionStatus.set(businessId, 'connected');
        connectionAttempts.delete(businessId); // Clear attempt flag
        retryCount.delete(businessId); // Clear retry count on successful connection
        qrCodes.delete(businessId);

        // Get phone number if available
        const phoneNumber = sock.user?.id?.split(':')[0] || null;
        console.log('📞 Connected phone number:', phoneNumber);

        // Update database
        await supabase
          .from('whatsapp_sessions')
          .update({
            status: 'connected',
            phone_number: phoneNumber,
            last_connected_at: new Date().toISOString(),
            qr_code: null, // Clear QR code once connected
            updated_at: new Date().toISOString(),
          })
          .eq('business_id', businessId);
      }
    });
  } catch (error) {
    console.error('❌ Error initializing WhatsApp connection:', error);
    connectionAttempts.delete(businessId); // Clear attempt flag on error
    connectionStatus.set(businessId, 'disconnected');
    throw error;
  }
}

export async function getQRCode(businessId: string): Promise<string | null> {
  // Try in-memory first
  const memoryQR = qrCodes.get(businessId);
  if (memoryQR) return memoryQR;

  // Fallback to database
  const { data } = await supabase
    .from('whatsapp_sessions')
    .select('qr_code')
    .eq('business_id', businessId)
    .single();

  return data?.qr_code || null;
}

export async function getConnectionStatus(businessId: string): Promise<'connecting' | 'connected' | 'disconnected'> {
  // Try in-memory first
  const memoryStatus = connectionStatus.get(businessId);
  if (memoryStatus) return memoryStatus;

  // Fallback to database
  const { data } = await supabase
    .from('whatsapp_sessions')
    .select('status')
    .eq('business_id', businessId)
    .single();

  const status = (data?.status as 'connecting' | 'connected' | 'disconnected') || 'disconnected';
  connectionStatus.set(businessId, status);
  return status;
}

export function getConnection(businessId: string): WASocket | null {
  return connections.get(businessId) || null;
}

export async function sendWhatsAppMessage(
  businessId: string,
  phoneNumber: string,
  message: string
): Promise<boolean> {
  let sock = connections.get(businessId);
  
  // If not in memory, try to reconnect from database
  if (!sock) {
    console.log('🔄 WhatsApp not in memory, attempting reconnect for', businessId);
    const { data: session } = await supabase
      .from('whatsapp_sessions')
      .select('status, auth_state')
      .eq('business_id', businessId)
      .single();

    if (session?.auth_state && Object.keys(session.auth_state).length > 0) {
      // Attempt to reconnect
      await initWhatsAppConnection(businessId);
      sock = connections.get(businessId);
    }
  }

  if (!sock) {
    throw new Error('WhatsApp not connected for this business. Please scan QR code first.');
  }

  try {
    // Format phone number (remove + and spaces, add @s.whatsapp.net)
    const formattedNumber = phoneNumber.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
    
    await sock.sendMessage(formattedNumber, { text: message });
    console.log('✅ Message sent via WhatsApp to', phoneNumber);
    return true;
  } catch (error) {
    console.error('❌ Failed to send WhatsApp message:', error);
    throw error;
  }
}

export async function disconnectWhatsApp(businessId: string) {
  const sock = connections.get(businessId);
  if (sock) {
    sock.end(undefined);
    connections.delete(businessId);
    connectionStatus.set(businessId, 'disconnected');
    connectionAttempts.delete(businessId); // Clear attempt flag

    // Update database
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

/**
 * Force stop all connection attempts and clear state
 */
export function forceStopConnection(businessId: string) {
  const sock = connections.get(businessId);
  if (sock) {
    sock.end(undefined);
  }
  
  connections.delete(businessId);
  connectionStatus.delete(businessId);
  connectionAttempts.delete(businessId);
  retryCount.delete(businessId); // Clear retry count
  qrCodes.delete(businessId);
  
  console.log('🛑 Force stopped connection for', businessId);
}

/**
 * Clear rate limit block for a business (test/dev only)
 */
export function clearRateLimit(businessId: string) {
  connectionAttempts.delete(businessId);
  retryCount.delete(businessId);
  console.log('✅ Cleared rate limit block for', businessId);
}

/**
 * Clear auth state for a business (useful when rate-limited)
 */
export async function clearAuthState(businessId: string) {
  // Clear in-memory state
  forceStopConnection(businessId);
  
  // Clear database auth state
  await supabase
    .from('whatsapp_sessions')
    .delete()
    .eq('business_id', businessId);
  
  console.log('🗑️ Cleared auth state for', businessId);
}

/**
 * Restore connections on server startup
 */
export async function restoreConnections() {
  console.log('🔄 Restoring WhatsApp connections from database...');
  
  const { data: sessions } = await supabase
    .from('whatsapp_sessions')
    .select('business_id, status, auth_state')
    .eq('status', 'connected');

  if (!sessions || sessions.length === 0) {
    console.log('No active sessions to restore');
    return;
  }

  for (const session of sessions) {
    if (session.auth_state && Object.keys(session.auth_state).length > 0) {
      console.log('Restoring connection for business:', session.business_id);
      try {
        await initWhatsAppConnection(session.business_id);
      } catch (error) {
        console.error('Failed to restore connection for', session.business_id, error);
      }
    }
  }
}
