import express from 'express';
import dotenv from 'dotenv';
import oauthHandler from './oauth.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/oauth/callback', oauthHandler);

app.listen(PORT, () => {
  console.log(`✅ ShreeMitra OAuth server running at http://localhost:${PORT}`);
});