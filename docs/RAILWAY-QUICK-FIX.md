# Quick Fix for "Browser Already Running" Error

## Problem
WhatsApp Web.js browser got stuck and needs cleanup.

## Solution

### Option 1: Restart from Railway Dashboard (Easiest)
1. Go to https://railway.app/dashboard
2. Find your "RAKLIFE" project
3. Click on the WhatsApp service
4. Click "Restart" button in top right
5. Wait ~30 seconds for redeploy

### Option 2: Call Cleanup Endpoint
```bash
curl -X POST https://raklife-production.up.railway.app/api/admin/cleanup \
  -H "Content-Type: application/json" \
  -d '{"businessId":"d578f8d7-9950-420d-b58b-439342adda57"}'
```

Then try connecting again from your dashboard.

### What I Fixed
- Added cleanup endpoint
- Added better browser state detection  
- Added `--single-process` flag to prevent browser conflicts
- Server now checks and destroys stuck connections before creating new ones

## After Restart
Your "Connect WhatsApp" button should work properly!
