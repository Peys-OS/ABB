import { parseBountyCast, parseBidCast, parseResultCast, parseAssignedCast, inferTaskType } from '../../../../packages/shared/src/schema';
import { getBounty, saveBounty, updateBountyStatus, getBidsForBounty, saveBid } from './state';
import { postCast } from './neynar-client';
import { nanoid } from 'nanoid';
import type { Bounty, Bid, TaskType } from '../../../../packages/shared/src/types';

const SIGNER_UUID = process.env.BOUNTY_POSTER_SIGNER_UUID!;
const POSTER_FID = Number(process.env.BOUNTY_POSTER_FID!);

export async function handleCastEvent(event: any) {
  try {
    const cast = event.data;
    if (!cast) return;
    
    const text: string = cast.text ?? '';
    const authorFid = cast.author?.fid;

    if (text.startsWith('BID |')) {
      await handleBid(cast);
    } else if (text.startsWith('RESULT |')) {
      await handleResult(cast);
    } else if (text.startsWith('BOUNTY |')) {
      // New bounty cast from bounty-poster
    } else if (text.includes('@bountyboard') && !text.startsWith('BOUNTY |')) {
      await handleBountyRequest(cast);
    }

    // Forward BOUNDY and ASSIGNED to workers
    if (text.startsWith('BOUNTY |')) {
      // Workers would evaluate this
    }
    if (text.startsWith('ASSIGNED |')) {
      // Assigned worker would execute
    }
  } catch (error) {
    console.error('[cast-handler] handleCastEvent failed:', error);
  }
}

export async function createBounty(params: {
  taskDescription: string;
  taskType: TaskType;
  rewardUsdc: number;
  deadlineHours: number;
}): Promise<Bounty> {
  const id = `bnt_${nanoid(8)}`;
  const deadlineTs = Math.floor(Date.now() / 1000) + params.deadlineHours * 3600;
  
  const castText = [
    `BOUNTY | id: ${id}`,
    `task: ${params.taskDescription}`,
    `type: ${params.taskType}`,
    `reward: ${params.rewardUsdc} USDC`,
    `deadline: ${params.deadlineHours}h`,
    `bid @bountyboard`,
  ].join(' | ');

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
  await sleep(500);

  const result = await postCast(SIGNER_UUID, castText);
  const cast = result.cast;

  const bounty: Bounty = {
    id,
    castHash: cast?.hash || '',
    posterFid: POSTER_FID,
    taskType: params.taskType,
    taskDescription: params.taskDescription,
    rewardUsdc: params.rewardUsdc,
    deadlineTs,
    status: 'open',
    createdAt: Math.floor(Date.now() / 1000),
  };

  await saveBounty(bounty);
  return bounty;
}

export async function handleBid(cast: any): Promise<void> {
  try {
    const parsed = parseBidCast(cast.text);
    if (!parsed) return;

    const bounty = await getBounty(parsed.bountyId);
    if (!bounty || bounty.status !== 'open') return;

    const existingBids = await getBidsForBounty(parsed.bountyId);
    if (existingBids.length > 0) return;

    const bid: Bid = {
      id: `bid_${nanoid(8)}`,
      bountyId: parsed.bountyId,
      bidderFid: cast.author.fid,
      bidderUsername: cast.author.username,
      castHash: cast.hash,
      etaHours: parsed.etaHours,
      approach: parsed.approach,
      submittedAt: Math.floor(Date.now() / 1000),
    };

    await saveBid(bid);

    const assignedText = [
      `ASSIGNED | bounty: ${parsed.bountyId}`,
      `winner: @${cast.author.username}`,
      `execute task and reply to this cast with RESULT | bounty: ${parsed.bountyId}`,
    ].join(' | ');

    await postCast(SIGNER_UUID, assignedText, bounty.castHash);
    await updateBountyStatus(parsed.bountyId, 'assigned', { winnerFid: cast.author.fid });
  } catch (error) {
    console.error('[bounty-poster] handleBid failed:', error, { castHash: cast.hash });
  }
}

export async function handleResult(cast: any): Promise<void> {
  try {
    const parsed = parseResultCast(cast.text);
    if (!parsed) return;

    const bounty = await getBounty(parsed.bountyId);
    if (!bounty || bounty.status !== 'assigned') return;
    if (cast.author.fid !== bounty.winnerFid) return;

    await updateBountyStatus(bounty.id, 'completed', {
      winnerCastHash: cast.hash,
    });

    const settledText = [
      `SETTLED | bounty: ${bounty.id}`,
      `paid: ${bounty.rewardUsdc} USDC`,
      `agent: @${cast.author.username} completed`,
    ].join(' | ');

    await postCast(SIGNER_UUID, settledText, bounty.castHash);
  } catch (error) {
    console.error('[bounty-poster] handleResult failed:', error, { castHash: cast.hash });
  }
}

export async function handleBountyRequest(cast: any): Promise<void> {
  try {
    const text = cast.text;
    const amountMatch = text.match(/(\d+(?:\.\d+)?)\s*USDC/i);
    const rewardUsdc = amountMatch ? parseFloat(amountMatch[1]) : 1;
    
    const taskDescription = text
      .replace(/@bountyboard/gi, '')
      .replace(/(\d+(?:\.\d+)?)\s*USDC/gi, '')
      .trim();

    const taskType = inferTaskType(taskDescription);

    const bounty = await createBounty({
      taskDescription,
      taskType,
      rewardUsdc,
      deadlineHours: 24,
    });

    const replyText = `Bounty created! ${bounty.id} - ${rewardUsdc} USDC`;
    await postCast(SIGNER_UUID, replyText, cast.hash);
  } catch (error) {
    console.error('[bounty-poster] handleBountyRequest failed:', error, { castHash: cast.hash });
    const replyText = 'Sorry, I couldn\'t process your bounty request. Please try again.';
    await postCast(SIGNER_UUID, replyText, cast.hash);
  }
}
