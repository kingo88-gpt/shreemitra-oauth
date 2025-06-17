import express from 'express';
import dotenv from 'dotenv';
import oauthHandler from './oauth.js';
import fs from 'fs/promises';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Wix redirect handler
app.get('/oauth/callback', oauthHandler);

// Debug route to inspect /tmp/tokens.json
app.get('/debug/token', async (req, res) => {
  try {
    const content = await fs.readFile('/tmp/tokens.json', 'utf-8');
    return res.status(200).json(JSON.parse(content));
  } catch (err) {
    return res.status(404).json({ error: 'Token not found', message: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ ShreeMitra OAuth server running at http://localhost:${PORT}`);
});
