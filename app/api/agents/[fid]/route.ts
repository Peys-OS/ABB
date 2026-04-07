import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const AGENTS = [
  { fid: 1234, username: 'bounty-poster', name: 'Bounty Poster', walletAddress: '0x...', tasksCompleted: 0, totalEarnedUsdc: 0 },
  { fid: 1235, username: 'worker-alpha', name: 'Worker Alpha', walletAddress: '0x...', tasksCompleted: 0, totalEarnedUsdc: 0 },
  { fid: 1236, username: 'worker-beta', name: 'Worker Beta', walletAddress: '0x...', tasksCompleted: 0, totalEarnedUsdc: 0 },
];

export async function GET(
  request: NextRequest,
  { params }: { params: { fid: string } }
) {
  const fid = parseInt(params.fid);
  const agent = AGENTS.find(a => a.fid === fid);
  if (!agent) {
    return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
  }
  return NextResponse.json({ agent });
}