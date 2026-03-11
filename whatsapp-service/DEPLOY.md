# Deploy WhatsApp Service to Railway

## Step 1: Initialize Git (if not already)

```bash
cd whatsapp-service
git init
git add .
git commit -m "Initial WhatsApp service"
```

## Step 2: Deploy to Railway

### Option A: Railway CLI (Recommended)
```bash
# Install Railway CLI if needed
npm install -g @railway/cli

# Login to Railway
railway login

# Link to new project
railway init

# Add environment variables
railway variables set SUPABASE_URL=your_supabase_url_here
railway variables set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Deploy
railway up
```

### Option B: Railway Dashboard
1. Go to https://railway.app/dashboard
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Connect your GitHub and select this repo
5. Railway will auto-detect Node.js
6. Add environment variables in Settings:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
7. Deploy!

## Step 3: Get Your Railway URL

After deployment, Railway will give you a URL like:
```
https://whatsapp-service-production-xxxx.up.railway.app
```

## Step 4: Update Your Business Dashboard

In your business-dashboard, update the WhatsApp API calls to point to your Railway service:

```typescript
// Instead of local lib/whatsapp/baileys.ts functions
// Call Railway endpoints:

const WHATSAPP_SERVICE_URL = 'https://your-railway-url.railway.app';

// Connect
await fetch(`${WHATSAPP_SERVICE_URL}/api/whatsapp/connect`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ businessId })
});

// Get QR
const qr = await fetch(`${WHATSAPP_SERVICE_URL}/api/whatsapp/qr/${businessId}`);

// Send message
await fetch(`${WHATSAPP_SERVICE_URL}/api/whatsapp/send`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ businessId, phoneNumber, message })
});
```

## Cost

Railway Starter Plan: **$5/month**
- Includes $5 credit
- Pay only for what you use
- This service should stay within free tier initially

## Monitoring

Check logs in Railway dashboard to see:
- Connection status
- QR code generations
- Message sending
- Errors

## Troubleshooting

If connection fails:
1. Check Railway logs
2. Verify environment variables
3. Ensure Supabase credentials are correct
4. Check if Chrome/Puppeteer installed correctly (Railway handles this automatically)
