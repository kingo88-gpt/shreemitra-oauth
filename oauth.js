import { writeFile } from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';

export default async function handler(req, res) {
  try {
    const { code, instanceId } = req.query;

    if (!code || !instanceId) {
      return res.status(400).json({ error: "Missing code or instanceId" });
    }

    const clientId = encodeURIComponent(process.env.WIX_CLIENT_ID);
    const clientSecret = encodeURIComponent(process.env.WIX_CLIENT_SECRET);
    const encodedCode = encodeURIComponent(code);

    const curlCommand = `
      curl -s -X POST https://www.wix.com/oauth/access \
      -H "Content-Type: application/x-www-form-urlencoded" \
      -d "grant_type=authorization_code&client_id=${clientId}&client_secret=${clientSecret}&code=${encodedCode}"
    `.trim();

    const output = await new Promise((resolve, reject) => {
      exec(curlCommand, (error, stdout, stderr) => {
        if (error) return reject(stderr || error.message);
        resolve(stdout);
      });
    });

    const parsed = JSON.parse(output);

    if (!parsed.access_token) {
      return res.status(500).json({ error: "Token exchange failed", details: parsed });
    }

    parsed.instanceId = instanceId;
    parsed.fetchedAt = Date.now();

    const filepath = path.resolve("/tmp/tokens.json");
    await writeFile(filepath, JSON.stringify(parsed, null, 2));

    return res.status(200).send(`
      <html><head><title>App Installed</title></head>
      <body style="font-family: sans-serif; text-align: center; padding: 40px;">
        <h1>✅ ShreeMitra App Installed Successfully</h1>
        <p>You may now close this tab.</p>
      </body></html>
    `);
  } catch (err) {
    return res.status(500).json({ error: "OAuth failed", details: err.toString() });
  }
}