import fetch from 'node-fetch';

const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY;

const AGENTS = ['bounty-poster', 'worker-alpha', 'worker-beta'];

async function createSigner(name: string) {
  const res = await fetch('https://api.neynar.com/v2/signer', {
    method: 'POST',
    headers: {
      'api_key': NEYNAR_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name }),
  });

  const data = await res.json();
  console.log(`\n=== ${name} ===`);
  console.log('Signer UUID:', data.signer_uuid);
  console.log('Public Key:', data.public_key);
  console.log('FID:', data.fid);
  console.log('Approval URL:', data.approval_url);
  
  return data;
}

async function main() {
  if (!NEYNAR_API_KEY) {
    console.error('Please set NEYNAR_API_KEY env var');
    process.exit(1);
  }

  console.log('Creating signers...\n');

  for (const agent of AGENTS) {
    await createSigner(agent);
  }

  console.log('\n\n✅ All signers created!');
  console.log('\nNext steps:');
  console.log('1. Open each approval_url in a browser');
  console.log('2. Approve with your Warpcast account');
  console.log('3. Use the signer_uuid and fid in your .env.local');
}

main().catch(console.error);
