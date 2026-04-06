export const BOUNTY_PREFIX = 'BOUNTY |';
export const BID_PREFIX = 'BID |';
export const ASSIGNED_PREFIX = 'ASSIGNED |';
export const RESULT_PREFIX = 'RESULT |';
export const SETTLED_PREFIX = 'SETTLED |';

export interface ParsedBounty {
  id: string;
  task: string;
  type: string;
  reward: string;
  deadline: string;
}

export interface ParsedBid {
  bountyId: string;
  agent: string;
  etaHours: number;
  approach: string;
}

export interface ParsedResult {
  bountyId: string;
  output: string;
}

export function parseBountyCast(text: string): ParsedBounty | null {
  if (!text.startsWith(BOUNTY_PREFIX)) return null;
  
  const result: Record<string, string> = {};
  const parts = text.slice(BOUNTY_PREFIX.length).split('|');
  
  for (const part of parts) {
    const [key, ...valueParts] = part.split(':');
    if (key && valueParts.length > 0) {
      result[key.trim()] = valueParts.join(':').trim();
    }
  }
  
  if (!result['id'] || !result['task'] || !result['type']) return null;
  
  return {
    id: result['id'],
    task: result['task'],
    type: result['type'],
    reward: result['reward'] || '0',
    deadline: result['deadline'] || '24h',
  };
}

export function parseBidCast(text: string): ParsedBid | null {
  if (!text.startsWith(BID_PREFIX)) return null;
  
  const result: Record<string, string> = {};
  const parts = text.slice(BID_PREFIX.length).split('|');
  
  for (const part of parts) {
    const [key, ...valueParts] = part.split(':');
    if (key && valueParts.length > 0) {
      result[key.trim()] = valueParts.join(':').trim();
    }
  }
  
  if (!result['bounty'] || !result['agent']) return null;
  
  const etaMatch = result['eta']?.match(/(\d+)/);
  const etaHours = etaMatch ? parseInt(etaMatch[1], 10) : 2;
  
  return {
    bountyId: result['bounty'],
    agent: result['agent'].replace('@', ''),
    etaHours,
    approach: result['approach'] || 'standard approach',
  };
}

export function parseResultCast(text: string): ParsedResult | null {
  if (!text.startsWith(RESULT_PREFIX)) return null;
  
  const result: Record<string, string> = {};
  const parts = text.slice(RESULT_PREFIX.length).split('|');
  
  for (const part of parts) {
    const [key, ...valueParts] = part.split(':');
    if (key && valueParts.length > 0) {
      result[key.trim()] = valueParts.join(':').trim();
    }
  }
  
  if (!result['bounty']) return null;
  
  return {
    bountyId: result['bounty'],
    output: result['output'] || result[''] || '',
  };
}

export function parseAssignedCast(text: string): { bountyId: string; winner: string } | null {
  if (!text.startsWith(ASSIGNED_PREFIX)) return null;
  
  const result: Record<string, string> = {};
  const parts = text.slice(ASSIGNED_PREFIX.length).split('|');
  
  for (const part of parts) {
    const [key, ...valueParts] = part.split(':');
    if (key && valueParts.length > 0) {
      result[key.trim()] = valueParts.join(':').trim();
    }
  }
  
  if (!result['bounty'] || !result['winner']) return null;
  
  return {
    bountyId: result['bounty'],
    winner: result['winner'].replace('@', ''),
  };
}

export function parseSettledCast(text: string): { bountyId: string; paid: string; tx: string; agent: string } | null {
  if (!text.startsWith(SETTLED_PREFIX)) return null;
  
  const result: Record<string, string> = {};
  const parts = text.slice(SETTLED_PREFIX.length).split('|');
  
  for (const part of parts) {
    const [key, ...valueParts] = part.split(':');
    if (key && valueParts.length > 0) {
      result[key.trim()] = valueParts.join(':').trim();
    }
  }
  
  if (!result['bounty'] || !result['paid']) return null;
  
  return {
    bountyId: result['bounty'],
    paid: result['paid'],
    tx: result['tx'] || '',
    agent: result['agent'] || '',
  };
}

export function inferTaskType(description: string): TaskType {
  const lower = description.toLowerCase();
  if (lower.includes('translate')) return 'translate';
  if (lower.includes('summarize') || lower.includes('tldr') || lower.includes('summary')) return 'summarize';
  if (lower.includes('wallet') || lower.includes('holdings') || lower.includes('onchain')) return 'onchain_lookup';
  return 'unknown';
}

import { TaskType } from './types';
