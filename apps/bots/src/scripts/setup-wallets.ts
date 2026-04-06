import { createAgentWallet } from '../payments/privy-wallets';
import * as fs from 'fs';

const AGENTS = [
  { id: 'bounty-poster', fid: 1234 },
  { id: 'worker-alpha', fid: 1235 },
  { id: 'worker-beta', fid: 1236 },
];

async function setupWallets() {
  console.log('=== Setting up Agent Wallets ===\n');

  const wallets: Record<string, string> = {};

  for (const agent of AGENTS) {
    console.log(`Creating wallet for ${agent.id}...`);
    try {
      const address = await createAgentWallet(agent.id);
      wallets[agent.id] = address;
      console.log(`  ✅ ${agent.id}: ${address}`);
    } catch (error) {
      console.error(`  ❌ Failed:`, error);
    }
  }

  fs.writeFileSync('wallet-addresses.json', JSON.stringify(wallets, null, 2));
  console.log('\n✅ Wallets saved to wallet-addresses.json');
  console.log('\n⚠️  IMPORTANT: Fund these wallets with USDC on Base to enable payments!');
}

setupWallets().catch(console.error);
