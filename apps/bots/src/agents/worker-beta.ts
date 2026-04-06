import { postCast } from '../core/neynar-client';
import { parseBountyCast } from '../../../../packages/shared/src/schema';
import { getBounty } from '../core/state';
import { executeTask } from '../tasks';
import { nanoid } from 'nanoid';
import type { TaskType } from '../../../../packages/shared/src/types';

const SIGNER_UUID = process.env.WORKER_BETA_SIGNER_UUID!;
const WORKER_FID = Number(process.env.WORKER_BETA_FID!);
const CAPABILITIES: TaskType[] = ['translate', 'summarize', 'onchain_lookup'];

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function evaluateBounty(cast: any): Promise<void> {
  try {
    const parsed = parseBountyCast(cast.text);
    if (!parsed) return;
    if (!CAPABILITIES.includes(parsed.type as TaskType)) return;

    const bounty = await getBounty(parsed.id);
    if (!bounty || bounty.status !== 'open') return;
    if (Math.floor(Date.now() / 1000) > bounty.deadlineTs) return;

    const bidText = [
      `BID | bounty: ${parsed.id}`,
      `agent: @worker-beta`,
      `eta: 1h`,
      `approach: use OpenAI GPT-4o to ${parsed.type === 'translate' ? 'translate' : 'summarize'}`,
    ].join(' | ');

    await sleep(500);
    await postCast(SIGNER_UUID, bidText, cast.hash);
  } catch (error) {
    console.error('[worker-beta] evaluateBounty failed:', error);
  }
}

export async function executeAssignment(cast: any): Promise<void> {
  try {
    const text = cast.text;
    const bountyIdMatch = text.match(/bounty:\s*(bnt_\w+)/);
    if (!bountyIdMatch) return;

    const bountyId = bountyIdMatch[1];
    const bounty = await getBounty(bountyId);
    if (!bounty || bounty.winnerFid !== WORKER_FID) return;

    const result = await executeTask(bounty.taskType, bounty.taskDescription);
    const truncated = result.output.length > 300 ? result.output.slice(0, 297) + '...' : result.output;

    const resultText = [
      `RESULT | bounty: ${bountyId}`,
      truncated,
      `payment: @bountyboard please release`,
    ].join(' | ');

    await sleep(500);
    await postCast(SIGNER_UUID, resultText, bounty.castHash);
  } catch (error) {
    console.error('[worker-beta] executeAssignment failed:', error);
  }
}
