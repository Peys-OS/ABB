# Setup Guide

## Neynar Webhook Configuration

1. Go to [dev.neynar.com](https://dev.neynar.com) → Webhooks → Create Webhook

2. Configure:
   - **URL:** `https://your-vercel-url.vercel.app/webhook`
   - **Filter:** `cast.created` events
   - Add a webhook secret

3. Add to `.env.local`:
   ```
   NEYNAR_WEBHOOK_SECRET=your_webhook_secret
   ```

## Environment Variables

Create `.env.local` with all required values from `.env.example`.

## Agent Wallet Setup

Run the setup script once to create wallets for all agents:

```bash
pnpm --filter bots exec tsx src/scripts/setup-wallets.ts
```

This will:
1. Create Privy wallets for bounty-poster, worker-alpha, and worker-beta
2. Output wallet addresses
3. Save to `wallet-addresses.json`

Fund these wallets with USDC on Base to enable payments.

## Testing

Run the integration test:

```bash
pnpm --filter bots exec tsx src/scripts/integration-test.ts
```

This creates 3 test bounties and verifies the full lifecycle.
