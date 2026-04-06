import express from 'express';
import crypto from 'crypto';
import { handleCastEvent } from './cast-handler';

const app = express();
app.use(express.json());

function verifySignature(payload: string, sig: string, secret: string): boolean {
  const hmac = crypto.createHmac('sha512', secret);
  const digest = hmac.update(payload).digest('hex');
  return digest === sig;
}

app.post('/webhook', (req, res) => {
  const sig = req.headers['x-neynar-signature'] as string;
  const raw = JSON.stringify(req.body);
  
  if (!verifySignature(raw, sig, process.env.NEYNAR_WEBHOOK_SECRET!)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  const event = req.body;
  handleCastEvent(event).catch(console.error);
  res.json({ ok: true });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Webhook server running on port ${PORT}`));
