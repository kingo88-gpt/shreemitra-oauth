import { writeFile } from 'fs/promises';
import path from 'path';
import axios from 'axios';

export default async function handler(req, res) {
  const { code, instanceId } = req.query;

  if (!code || !instanceId) {
    return res.status(400).json({ error: "Missing code or instanceId" });
  }

  const clientId = process.env.WIX_CLIENT_ID;
  const clientSecret = process.env.WIX_CLIENT_SECRET;

  const formData = `grant_type=authorization_code&client_id=${encodeURIComponent(clientId)}&client_secret=${encodeURIComponent(clientSecret)}&code=${encodeURIComponent(code)}`;

  try {
    const response = await axios.post("https://www.wix.com/oauth/access", formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': '*/*'
      },
      transformRequest: [(data) => data], // prevents axios from auto-formatting
      validateStatus: () => true
    });

    if (!response.data.access_token) {
      return res.status(500).json({ error: "Token exchange failed", details: response.data });
    }

    const token = response.data;
    token.instanceId = instanceId;
    token.fetchedAt = Date.now();

    await writeFile("/tmp/tokens.json", JSON.stringify(token, null, 2));
    return res.status(200).send(`
      <html><head><title>App Installed</title></head>
      <body style="font-family: sans-serif; text-align: center; padding: 40px;">
        <h1>✅ ShreeMitra App Installed Successfully</h1>
        <p>You may now close this tab.</p>
      </body></html>
    `);
  } catch (error) {
    console.error("🔥 Axios Token Exchange Error:", error.message);
    return res.status(500).json({ error: "OAuth failed", details: error.message });
  }
}
