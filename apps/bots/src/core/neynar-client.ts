import { NeynarAPIClient } from '@neynar/nodejs-sdk';

export const neynar = new NeynarAPIClient({ apiKey: process.env.NEYNAR_API_KEY! });

export async function postCast(signerUuid: string, text: string, replyTo?: string) {
  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
  await sleep(500);

  return neynar.publishCast({
    signerUuid,
    text,
    ...(replyTo ? { parent: replyTo } : {}),
  });
}

export async function getCast(hash: string) {
  return neynar.fetchBulkCasts({ casts: [hash] });
}

export async function getChannelCasts(channelId: string, limit = 25) {
  return neynar.fetchFeedByChannelIds({ channelIds: [channelId], limit });
}
