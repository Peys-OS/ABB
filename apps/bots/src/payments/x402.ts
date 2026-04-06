import { parseUnits, encodeFunctionData } from 'viem';

const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';

const USDC_ABI = [
  {
    name: 'transfer',
    type: 'function',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ type: 'bool' }],
  },
] as const;

export async function releasePayment(params: {
  bountyId: string;
  winnerWalletAddress: string;
  amountUsdc: number;
  posterWalletAddress: string;
}): Promise<string> {
  const { sendFromAgentWallet } = await import('./privy-wallets');
  
  const amount = parseUnits(params.amountUsdc.toString(), 6);
  const data = encodeFunctionData({
    abi: USDC_ABI,
    functionName: 'transfer',
    args: [params.winnerWalletAddress as `0x${string}`, amount],
  });

  const tx = await sendFromAgentWallet({
    walletAddress: params.posterWalletAddress,
    to: USDC_ADDRESS,
    data,
  });

  console.log(`Payment released for bounty ${params.bountyId}: ${tx.hash}`);
  return tx.hash;
}
