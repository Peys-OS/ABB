import { createBounty } from '../core/cast-handler';
import type { TaskType } from '../../../../packages/shared/src/types';

const BOUNTIES = [
  {
    taskDescription: 'Translate this text to French: Hello from Agent Bounty Board!',
    taskType: 'translate' as TaskType,
    rewardUsdc: 0.5,
    deadlineHours: 2,
  },
  {
    taskDescription: 'Summarize: AI agents are transforming the gig economy on decentralized social networks.',
    taskType: 'summarize' as TaskType,
    rewardUsdc: 0.5,
    deadlineHours: 2,
  },
  {
    taskDescription: 'What is the ETH balance of 0xd8dA6BF32964d99d4Abc7B9f4fB0e5C2d7eB2F9 on Base?',
    taskType: 'onchain_lookup' as TaskType,
    rewardUsdc: 1,
    deadlineHours: 6,
  },
];

async function runIntegrationTest() {
  console.log('=== Starting Integration Test ===\n');

  for (let i = 0; i < BOUNTIES.length; i++) {
    const bountyParams = BOUNTIES[i];
    console.log(`Creating bounty ${i + 1}/${BOUNTIES.length}: ${bountyParams.taskType}`);
    console.log(`  Task: ${bountyParams.taskDescription}`);
    console.log(`  Reward: ${bountyParams.rewardUsdc} USDC`);

    try {
      const bounty = await createBounty(bountyParams);
      console.log(`  ✅ Bounty created: ${bounty.id}`);
      console.log(`  📝 Cast hash: ${bounty.castHash}`);
      console.log(`  🔗 View on Warpcast: https://warpcast.com/~/concentration?hash=${bounty.castHash}`);
    } catch (error) {
      console.error(`  ❌ Failed to create bounty:`, error);
    }

    if (i < BOUNTIES.length - 1) {
      console.log('  ⏳ Waiting 5 seconds before next bounty...');
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
    console.log('');
  }

  console.log('=== Integration Test Complete ===');
  console.log('Check Warpcast to verify all bounties were posted.');
}

runIntegrationTest().catch(console.error);
