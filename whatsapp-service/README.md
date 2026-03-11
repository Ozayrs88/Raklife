# WhatsApp Service

Standalone WhatsApp Web.js microservice for ZEA RAKlife business dashboard.

## Features

- ✅ Connect multiple business WhatsApp accounts
- ✅ QR code generation
- ✅ Send messages via API
- ✅ Persistent connections
- ✅ Auto-reconnection on restart

## Deploy to Railway

1. **Create New Project** in your Railway dashboard
2. **Connect this folder** as a new service
3. **Add Environment Variables:**
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. **Deploy!**

Railway will auto-detect Node.js and use the `start` script.

## Environment Variables

```
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
PORT=3001
```

## API Endpoints

### Health Check
```
GET /health
```

### Connect WhatsApp
```
POST /api/whatsapp/connect
Body: { "businessId": "uuid" }
```

### Get QR Code
```
GET /api/whatsapp/qr/:businessId
```

### Get Status
```
GET /api/whatsapp/status/:businessId
```

### Send Message
```
POST /api/whatsapp/send
Body: {
  "businessId": "uuid",
  "phoneNumber": "+1234567890",
  "message": "Hello!"
}
```

### Disconnect
```
POST /api/whatsapp/disconnect
Body: { "businessId": "uuid" }
```

## Local Testing

```bash
npm install
# Copy .env.example to .env and fill in values
npm start
```

## Architecture

- Main dashboard stays on Vercel
- This service runs on Railway
- Communicates via REST API
- Shares Supabase database
