import { google } from 'googleapis';
import * as readline from 'readline';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const SCOPES = [
  'https://www.googleapis.com/auth/youtube.upload',
  'https://www.googleapis.com/auth/youtube',
  'https://www.googleapis.com/auth/youtube.force-ssl',
];

const TOKEN_PATH = path.join(__dirname, '..', '.youtube-tokens.json');

async function authorize() {
  const clientId = process.env.YOUTUBE_CLIENT_ID;
  const clientSecret = process.env.YOUTUBE_CLIENT_SECRET;
  const redirectUri = process.env.YOUTUBE_REDIRECT_URI || 'http://localhost:3000';

  if (!clientId || !clientSecret) {
    throw new Error('YouTube OAuth credentials not found in environment');
  }

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);

  if (fs.existsSync(TOKEN_PATH)) {
    const tokens = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf-8'));
    oauth2Client.setCredentials(tokens);
    
    if (tokens.expiry_date && tokens.expiry_date < Date.now()) {
      console.log('Token expired, refreshing...');
      const { credentials } = await oauth2Client.refreshAccessToken();
      fs.writeFileSync(TOKEN_PATH, JSON.stringify(credentials, null, 2));
      return oauth2Client;
    }
    
    console.log('✅ Using existing YouTube credentials');
    return oauth2Client;
  }

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent',
  });

  console.log('\n🔐 YouTube Authorization Required\n');
  console.log('Visit this URL to authorize the application:');
  console.log(authUrl);
  console.log('\nAfter authorizing, you will be redirected to a URL.');
  console.log('Copy the ENTIRE URL from your browser and paste it here.\n');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const code = await new Promise<string>((resolve) => {
    rl.question('Enter the full redirect URL: ', (url) => {
      rl.close();
      const urlObj = new URL(url);
      const code = urlObj.searchParams.get('code');
      if (!code) {
        throw new Error('No authorization code found in URL');
      }
      resolve(code);
    });
  });

  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);
  
  fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));
  console.log('✅ Tokens saved to', TOKEN_PATH);
  
  return oauth2Client;
}

async function testConnection() {
  const auth = await authorize();
  const youtube = google.youtube({ version: 'v3', auth });
  
  const response = await youtube.channels.list({
    part: ['snippet', 'contentDetails', 'statistics'],
    mine: true,
  });

  const channel = response.data.items?.[0];
  if (!channel) {
    throw new Error('No channel found');
  }

  console.log('\n✅ Successfully connected to YouTube!');
  console.log('\nChannel Info:');
  console.log('  Name:', channel.snippet?.title);
  console.log('  ID:', channel.id);
  console.log('  Subscribers:', channel.statistics?.subscriberCount);
  console.log('  Videos:', channel.statistics?.videoCount);
  console.log('');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  testConnection().catch(console.error);
}

export { authorize };
