#!/usr/bin/env node

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const saravenEnvPath = path.join(__dirname, '..', '..', 'saraven-app', '.env.local');

if (fs.existsSync(saravenEnvPath)) {
  dotenv.config({ path: saravenEnvPath });
  console.log('📄 Loaded environment from saraven-app/.env.local');
} else {
  dotenv.config();
  console.log('⚠️  saraven-app/.env.local not found, using local .env');
}

const PRAVOS_DIR = '/Users/iamjohndass/Sites/pravos-remotion';
const OUT_DIR = path.join(PRAVOS_DIR, 'out');
const TRACKED_FILE = path.join(PRAVOS_DIR, '.instagram-stories-tracker.json');

const ALBUMS = [
  'cognitive-bloom',
  'deep-piano-focus',
  'healing-handpan',
  'meditative-ambient',
  'neural-drift',
  'relaxed-neo-classical',
  'scripted-light',
  'soulful-lounge',
  'sufi-lofi',
  'vibe-coding',
];

const CAPTION_TEMPLATE = `Focus music for vibe coding 🎹✨

Dive deep into your code with ambient textures designed to keep you in flow.

Keep listening at pravos.xyz 🎧`;

const LATE_API_URL = process.env.LATE_API_URL || 'https://getlate.dev/api/v1';

if (!process.env.LATE_API_KEY) {
  console.error('❌ LATE_API_KEY not found in environment');
  console.error('   Expected location: saraven-app/.env.local');
  process.exit(1);
}

const LATE_API_KEY = process.env.LATE_API_KEY;

class LateClient {
  private baseURL: string;
  private apiKey: string;

  constructor() {
    this.baseURL = LATE_API_URL;
    this.apiKey = LATE_API_KEY;
  }

  async getAccounts() {
    const response = await fetch(`${this.baseURL}/accounts`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get accounts: ${response.statusText}`);
    }

    const data = await response.json();
    return data.accounts || [];
  }

  async getInstagramAccount() {
    const accounts = await this.getAccounts();
    return accounts.find((acc) => acc.platform === 'instagram');
  }

  async getPresignedUrl(filename: string): Promise<{ uploadUrl: string; publicUrl: string }> {
    console.log('🔑 Getting presigned upload URL...');

    const response = await fetch(`${this.baseURL}/media/presign`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filename: filename,
        contentType: 'video/mp4',
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to get presigned URL: ${JSON.stringify(error)}`);
    }

    const data = await response.json() as { uploadUrl: string; publicUrl: string; key: string; expiresIn: number };
    console.log('✅ Presigned URL obtained');
    return data;
  }

  async uploadVideoFile(filePath: string, presignedUrl: string): Promise<void> {
    console.log(`📤 Uploading video: ${path.basename(filePath)}`);

    const fileBuffer = fs.readFileSync(filePath);

    const response = await fetch(presignedUrl, {
      method: 'PUT',
      body: fileBuffer,
      headers: {
        'Content-Type': 'video/mp4',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to upload file to presigned URL: ${response.statusText}`);
    }

    console.log('✅ Video uploaded successfully');
  }

  async uploadMedia(filePath: string): Promise<string> {
    const filename = path.basename(filePath);

    const { uploadUrl, publicUrl } = await this.getPresignedUrl(filename);
    await this.uploadVideoFile(filePath, uploadUrl);

    return publicUrl;
  }

  async createPost(accountId: string, mediaUrl: string, caption: string) {
    console.log('📝 Creating Instagram story post...');

    const requestBody = {
      content: caption,
      mediaItems: [{ url: mediaUrl, type: 'video' }],
      platforms: [{
        platform: 'instagram',
        accountId: accountId,
        platformSpecificData: {
          contentType: 'story',
        },
      }],
      publishNow: true,
    };

    const response = await fetch(`${this.baseURL}/posts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to create post: ${JSON.stringify(error)}`);
    }

    const data = await response.json() as { post: { _id: string; status: string } };
    console.log('✅ Post created successfully');
    return data.post;
  }
}

function loadTracker() {
  if (!fs.existsSync(TRACKED_FILE)) {
    return {
      lastPublishedIndex: -1,
      publishedStories: [],
    };
  }

  try {
    const data = fs.readFileSync(TRACKED_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.warn('⚠️  Failed to load tracker, starting fresh');
    return {
      lastPublishedIndex: -1,
      publishedStories: [],
    };
  }
}

function saveTracker(tracker) {
  fs.writeFileSync(TRACKED_FILE, JSON.stringify(tracker, null, 2));
}

function getNextAlbumIndex(currentIndex) {
  return (currentIndex + 1) % ALBUMS.length;
}

function getStoryFile(albumSlug) {
  return path.join(OUT_DIR, `${albumSlug}-story.mp4`);
}

function getStoryExists(albumSlug) {
  const filePath = getStoryFile(albumSlug);
  return fs.existsSync(filePath);
}

async function publishInstagramStory() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📱 Instagram Story Publisher for Pravos');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');

  try {
    const tracker = loadTracker();
    console.log(`📊 Last published index: ${tracker.lastPublishedIndex}`);

    const nextIndex = getNextAlbumIndex(tracker.lastPublishedIndex);
    const albumSlug = ALBUMS[nextIndex];
    console.log(`🎵 Selected album: ${albumSlug}`);

    if (!getStoryExists(albumSlug)) {
      console.error(`❌ Story file not found: ${albumSlug}-story.mp4`);
      console.error(`   Expected location: ${getStoryFile(albumSlug)}`);
      process.exit(1);
    }

    const storyFile = getStoryFile(albumSlug);
    console.log(`📂 Story file: ${storyFile}`);

    const lateClient = new LateClient();
    const instagramAccount = await lateClient.getInstagramAccount();

    if (!instagramAccount) {
      console.error('❌ No Instagram account connected via Late API');
      console.error('   Please connect your Instagram account at https://saraven.app/channels');
      process.exit(1);
    }

    console.log(`✅ Instagram account found: ${instagramAccount.username || instagramAccount.accountId}`);
    console.log(`   Account ID: ${instagramAccount._id || instagramAccount.accountId}`);

    console.log('');

    try {
      const uploadedMediaUrl = await lateClient.uploadMedia(storyFile);

      const post = await lateClient.createPost(
        instagramAccount._id || instagramAccount.accountId,
        uploadedMediaUrl,
        CAPTION_TEMPLATE
      );

      console.log('');
      console.log('✅ Instagram story published successfully!');
      console.log(`   Post ID: ${post._id}`);
      console.log(`   Album: ${albumSlug}`);
      console.log('');

      tracker.lastPublishedIndex = nextIndex;
      tracker.publishedStories.push({
        albumSlug,
        publishedAt: new Date().toISOString(),
        postId: post._id,
      });

      saveTracker(tracker);
      console.log('📝 Tracker updated');
      console.log('');

      const nextNextIndex = getNextAlbumIndex(nextIndex);
      const nextAlbum = ALBUMS[nextNextIndex];
      console.log(`📅 Next story to publish: ${nextAlbum}`);

    } catch (error) {
      console.error('');
      console.error('❌ Failed to publish story:', error.message);
      console.error('');
      console.error('Troubleshooting:');
      console.error('1. Ensure your Instagram account is connected at https://saraven.app/channels');
      console.error('2. Check that Late API credentials are valid in saraven-app/.env.local');
      console.error('3. Verify story files exist in pravos-remotion/out/');
      process.exit(1);
    }

  } catch (error) {
    console.error('');
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

publishInstagramStory().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
