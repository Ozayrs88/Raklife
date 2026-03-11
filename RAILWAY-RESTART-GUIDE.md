# Restart Railway Service

Since Railway dashboard doesn't show restart button, here are alternative ways:

## Option 1: Force Restart via Process Exit

Open this URL in your browser (triggers process exit, Railway auto-restarts):

```
https://raklife-production.up.railway.app/api/admin/restart
```

## Option 2: Railway CLI with Project ID

```bash
cd whatsapp-service
railway redeploy --service=<service-id>
```

## Option 3: Manual Process Kill

The service will auto-restart when the process dies. I'll add a restart endpoint.

## Option 4: Re-push to GitHub

If connected to GitHub, push changes to trigger redeploy.
