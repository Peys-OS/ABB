import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';

const client = createPublicClient({
  chain: base,
  transport: http(process.env.BASE_RPC_URL || 'https://mainnet.base.org'),
});

const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';

function extractWalletAddress(text: string): string | null {
  const match = text.match(/0x[a-fA-F0-9]{40}/);
  return match ? match[0] : null;
}

export async function onchainLookupTask(description: string): Promise<{ output: string }> {
  try {
    const address = extractWalletAddress(description);
    if (!address) {
      return { output: 'No valid wallet address found in description' };
    }

    const balance = await client.getBalance({ address: address as `0x${string}` });
    const balanceEth = (balance / BigInt(1e18)).toString();

    const output = `Wallet: ${address.slice(0, 6)}...${address.slice(-4)}\nETH Balance: ${balanceEth} ETH`;
    return { output };
  } catch (error) {
    console.error('[onchain-lookup] error:', error);
    return { output: '[onchain lookup failed]' };
  }
}
