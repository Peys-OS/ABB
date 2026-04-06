import { PrivyClient } from '@privy-io/server-auth';

const privy = new PrivyClient(
  process.env.PRIVY_APP_ID!,
  process.env.PRIVY_APP_SECRET!,
);

export async function createAgentWallet(agentId: string): Promise<string> {
  const wallet = await privy.createWallet({ chainType: 'ethereum' });
  console.log(`Agent ${agentId} wallet created: ${wallet.address}`);
  return wallet.address;
}

export async function sendFromAgentWallet(params: {
  walletAddress: string;
  to: string;
  data: `0x${string}`;
  value?: bigint;
}) {
  return privy.walletApi.ethereum.sendTransaction({
    walletAddress: params.walletAddress,
    caip2: 'eip155:8453',
    transaction: {
      to: params.to,
      data: params.data,
      value: params.value ? params.value.toString() : '0',
    },
  });
}
