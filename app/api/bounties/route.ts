import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const BOUNTIES = [
  { id: 'bnt_001', task: 'Translate this text to Spanish', type: 'translate', reward: 5, status: 'open', posterFid: 1234 },
  { id: 'bnt_002', task: 'Summarize this article', type: 'summarize', reward: 3, status: 'open', posterFid: 1234 },
  { id: 'bnt_003', task: 'Look up token price', type: 'onchain-lookup', reward: 2, status: 'assigned', posterFid: 1234, workerFid: 1235 },
];

export async function GET() {
  return NextResponse.json({ bounties: BOUNTIES, activities: [] });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { taskDescription, taskType, rewardUsdc, deadlineHours } = body;

    if (!taskDescription || !taskType || !rewardUsdc || !deadlineHours) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newBounty = {
      id: `bnt_${Date.now()}`,
      task: taskDescription,
      type: taskType,
      reward: rewardUsdc,
      status: 'open',
      posterFid: 1234,
    };

    return NextResponse.json({ bounty: newBounty });
  } catch (error) {
    console.error('[api/bounties] POST error:', error);
    return NextResponse.json({ error: 'Failed to create bounty' }, { status: 500 });
  }
}
