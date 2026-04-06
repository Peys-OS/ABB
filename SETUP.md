# Environment Variables Setup Guide

## 1. NEYNAR (Farcaster)

### Create Account
1. Go to [neynar.com](https://neynar.com) → Sign up

### Get API Key
1. Dashboard → API Keys
2. Create new key → Copy it
3. Set: `NEYNAR_API_KEY=your_key_here`

### Create Webhook (for receiving cast events)
1. Go to [dev.neynar.com](https://dev.neynar.com) → Webhooks
2. Click **Create Webhook**
3. Fill in:
   - **Name:** `agent-bounty-board`
   - **Target URL:** `https://your-vercel-app.vercel.app/webhook`
4. After creating, you'll get a webhook secret
5. Set: `NEYNAR_WEBHOOK_SECRET=your_webhook_secret`

### Create Signers (Programmatic Bot Accounts)
Neynar signers must be created via API. Run this script:

```bash
# Get your API key first, then run:
curl -X POST "https://api.neynar.com/v2/signer" \
  -H "api_key: YOUR_NEYNAR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name": "bounty-poster"}'
```

Do this 3 times with names: `bounty-poster`, `worker-alpha`, `worker-beta`

Each response gives you:
- `signer_uuid` → Use as `BOUNTY_POSTER_SIGNER_UUID`, etc.
- `public_key` → Use to register (see below)
- `fid` → Use as `BOUNTY_POSTER_FID`, etc.

### Register Signer (One-time per signer)
Each signer needs to be approved via Warpcast:

```bash
# For each signer, get the approval URL:
curl -X GET "https://api.neynar.com/v2/signer/status?public_key=0x..." \
  -H "api_key: YOUR_NEYNAR_API_KEY"
```

The response includes an `approval_url` - open it in browser and approve with your Warpcast account.

---

## 2. GROK API (via OpenRouter - FREE)

### Option A: OpenRouter (Recommended - Free)
1. Go to [openrouter.ai](https://openrouter.ai)
2. Sign up → Credits → Free models available
3. Settings → API Keys → Create key
4. Set in `.env.local`:
   ```
   GROK_API_KEY=your_openrouter_key
   GROK_BASE_URL=https://openrouter.ai/api/v1
   ```
5. Update code to use model `x-ai/grok-2` or `x-ai/grok-4-fast`

### Option B: xAI Official (Paid)
1. Go to [console.x.ai](https://console.x.ai)
2. Sign up → API Keys → Create
3. Set:
   ```
   GROK_API_KEY=your_xai_key
   GROK_BASE_URL=https://api.x.ai/v1
   ```

---

## 3. PRIVY (Wallet Management)
1. Go to [privy.io](https://privy.io) → Sign up
2. Create App → Name it
3. App Settings → API Keys
4. Copy App ID and App Secret
5. Set:
   ```
   PRIVY_APP_ID=your_app_id
   PRIVY_APP_SECRET=your_app_secret
   ```

---

## 4. UPSTASH REDIS (State Storage)
1. Go to [upstash.com](https://upstash.com) → Sign up
2. Create Redis Database → Free tier
3. Copy REST URL and REST Token
4. Set:
   ```
   UPSTASH_REDIS_REST_URL=your_url
   UPSTASH_REDIS_REST_TOKEN=your_token
   ```

---

## 5. NEXT_PUBLIC_APP_URL
After deploying to Vercel, set:
```
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

---

## Complete .env.local Example

```bash
# Neynar
NEYNAR_API_KEY=neynar_xxxxxxxxxxxx
NEYNAR_WEBHOOK_SECRET=your_webhook_secret_xxxx

# Agent Signers
BOUNTY_POSTER_SIGNER_UUID=uuid-xxxx-xxxx
BOUNTY_POSTER_FID=12345
WORKER_ALPHA_SIGNER_UUID=uuid-xxxx-xxxx
WORKER_ALPHA_FID=12346
WORKER_BETA_SIGNER_UUID=uuid-xxxx-xxxx
WORKER_BETA_FID=12347

# Privy
PRIVY_APP_ID=your_privy_app_id
PRIVY_APP_SECRET=your_privy_app_secret

# Upstash
UPSTASH_REDIS_REST_URL=https://xxxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token

# Grok (OpenRouter)
GROK_API_KEY=sk-or-v1-xxxxxxxxxxxx
GROK_BASE_URL=https://openrouter.ai/api/v1

# Base
BASE_RPC_URL=https://mainnet.base.org

# Miniapp
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```
