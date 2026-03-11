const express = require('express');
const cors = require('cors');
const { Client, LocalAuth } = require('whatsapp-web.js');
const QRCode = require('qrcode');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

// Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Store active connections
const connections = new Map();
const qrCodes = new Map();
const connectionStatus = new Map();

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Cleanup endpoint (for stuck browsers)
app.post('/api/admin/cleanup', async (req, res) => {
  const { businessId } = req.body;
  
  try {
    // Destroy any existing client
    const client = connections.get(businessId);
    if (client) {
      try {
        await client.destroy();
        console.log('Destroyed client for', businessId);
      } catch (e) {
        console.log('Error destroying client:', e.message);
      }
    }
    
    // Clear from maps
    connections.delete(businessId);
    qrCodes.delete(businessId);
    connectionStatus.delete(businessId);
    
    res.json({ success: true, message: 'Cleanup complete' });
  } catch (error) {
    console.error('Cleanup error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Restart endpoint (forces process exit, Railway auto-restarts)
app.post('/api/admin/restart', (req, res) => {
  res.json({ success: true, message: 'Restarting service...' });
  setTimeout(() => process.exit(0), 1000);
});

// Initialize WhatsApp connection
app.post('/api/whatsapp/connect', async (req, res) => {
  const { businessId } = req.body;

  if (!businessId) {
    return res.status(400).json({ error: 'businessId required' });
  }

  // Check if already connected
  const existingClient = connections.get(businessId);
  if (existingClient) {
    const state = await existingClient.getState();
    if (state === 'CONNECTED') {
      return res.json({ status: 'already_connected' });
    } else {
      // Clean up stuck connection
      try {
        await existingClient.destroy();
      } catch (e) {
        console.log('Error destroying stuck client:', e.message);
      }
      connections.delete(businessId);
    }
  }

  try {
    const client = new Client({
      authStrategy: new LocalAuth({
        clientId: businessId,
        dataPath: './.wwebjs_auth'
      }),
      puppeteer: {
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
          '--disable-gpu'
        ]
      }
    });

    client.on('qr', async (qr) => {
      console.log('📱 QR Code generated for', businessId);
      const qrDataUrl = await QRCode.toDataURL(qr);
      qrCodes.set(businessId, qrDataUrl);
      connectionStatus.set(businessId, 'connecting');

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

    client.on('ready', async () => {
      console.log('✅ WhatsApp connected for', businessId);
      connections.set(businessId, client);
      connectionStatus.set(businessId, 'connected');
      qrCodes.delete(businessId);

      const phoneNumber = client.info?.wid?.user || null;

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

    client.on('authenticated', () => {
      console.log('🔐 Authenticated for', businessId);
    });

    client.on('auth_failure', async (msg) => {
      console.error('❌ Auth failed for', businessId, msg);
      connectionStatus.set(businessId, 'disconnected');
      
      await supabase
        .from('whatsapp_sessions')
        .update({
          status: 'disconnected',
          updated_at: new Date().toISOString(),
        })
        .eq('business_id', businessId);
    });

    client.on('disconnected', async (reason) => {
      console.log('❌ Disconnected:', businessId, reason);
      connections.delete(businessId);
      connectionStatus.set(businessId, 'disconnected');

      await supabase
        .from('whatsapp_sessions')
        .update({
          status: 'disconnected',
          updated_at: new Date().toISOString(),
        })
        .eq('business_id', businessId);
    });

    await client.initialize();

    res.json({ status: 'connecting', message: 'Scan QR code to connect' });
  } catch (error) {
    console.error('Error initializing WhatsApp:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get QR code
app.get('/api/whatsapp/qr/:businessId', (req, res) => {
  const { businessId } = req.params;
  const qr = qrCodes.get(businessId);

  if (qr) {
    res.json({ qr });
  } else {
    res.status(404).json({ error: 'No QR code available' });
  }
});

// Get connection status
app.get('/api/whatsapp/status/:businessId', (req, res) => {
  const { businessId } = req.params;
  const status = connectionStatus.get(businessId) || 'disconnected';
  res.json({ status });
});

// Send message
app.post('/api/whatsapp/send', async (req, res) => {
  const { businessId, phoneNumber, message } = req.body;

  if (!businessId || !phoneNumber || !message) {
    return res.status(400).json({ error: 'businessId, phoneNumber, and message required' });
  }

  const client = connections.get(businessId);

  if (!client) {
    return res.status(400).json({ error: 'WhatsApp not connected' });
  }

  try {
    const formattedNumber = phoneNumber.replace(/[^0-9]/g, '');
    const chatId = `${formattedNumber}@c.us`;
    
    await client.sendMessage(chatId, message);
    console.log('✅ Message sent to', phoneNumber);
    
    res.json({ success: true, message: 'Message sent' });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: error.message });
  }
});

// Disconnect
app.post('/api/whatsapp/disconnect', async (req, res) => {
  const { businessId } = req.body;

  if (!businessId) {
    return res.status(400).json({ error: 'businessId required' });
  }

  const client = connections.get(businessId);
  if (client) {
    await client.destroy();
    connections.delete(businessId);
    connectionStatus.delete(businessId);
    qrCodes.delete(businessId);

    await supabase
      .from('whatsapp_sessions')
      .update({
        status: 'disconnected',
        updated_at: new Date().toISOString(),
      })
      .eq('business_id', businessId);

    res.json({ success: true, message: 'Disconnected' });
  } else {
    res.status(404).json({ error: 'Not connected' });
  }
});

// Restore connections on startup
async function restoreConnections() {
  console.log('🔄 Restoring connections from database...');
  
  const { data: sessions } = await supabase
    .from('whatsapp_sessions')
    .select('business_id, status')
    .eq('status', 'connected');

  if (sessions && sessions.length > 0) {
    for (const session of sessions) {
      console.log('Restoring:', session.business_id);
      // Trigger reconnection via internal call
      try {
        await fetch(`http://localhost:${PORT}/api/whatsapp/connect`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ businessId: session.business_id })
        });
      } catch (error) {
        console.error('Failed to restore:', session.business_id, error.message);
      }
    }
  }
}

app.listen(PORT, () => {
  console.log(`🚀 WhatsApp Service running on port ${PORT}`);
  
  // Restore connections after startup
  setTimeout(restoreConnections, 5000);
});
// Updated Wed Mar 11 10:48:11 +04 2026
