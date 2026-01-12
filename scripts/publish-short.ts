import { google } from 'googleapis';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { authorize } from './youtube-auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface ShortMetadata {
  slug: string;
  week: number;
  publishDate: string;
  title: string;
  description: string;
  tags: string[];
  categoryId: string;
  privacyStatus: 'public' | 'private' | 'unlisted';
}

async function publishShort(albumSlug: string) {
  const metadataPath = path.join(__dirname, '..', 'youtube-metadata', 'shorts', `${albumSlug}.json`);
  const videoPath = path.join(__dirname, '..', 'out', `${albumSlug}-short.mp4`);

  if (!fs.existsSync(metadataPath)) {
    throw new Error(`Metadata not found: ${metadataPath}`);
  }

  if (!fs.existsSync(videoPath)) {
    throw new Error(`Video not found: ${videoPath}`);
  }

  const metadata: ShortMetadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));

  console.log(`\n🩳 Publishing SHORT: ${metadata.title}`);
  console.log(`📂 Video: ${videoPath}`);
  console.log(`📅 Scheduled for: ${metadata.publishDate}`);
  console.log(`📢 Publishing as: ${metadata.privacyStatus}`);

  const auth = await authorize();
  const youtube = google.youtube({ version: 'v3', auth });

  console.log('\n📤 Uploading short...');
  console.log(`✨ Publishing immediately as ${metadata.privacyStatus}`);

  const videoInsertResponse = await youtube.videos.insert({
    part: ['snippet', 'status'],
    requestBody: {
      snippet: {
        title: metadata.title,
        description: metadata.description,
        tags: metadata.tags,
        categoryId: metadata.categoryId,
      },
      status: {
        privacyStatus: metadata.privacyStatus,
        selfDeclaredMadeForKids: false,
      },
    },
    media: {
      body: fs.createReadStream(videoPath),
    },
  });

  const videoId = videoInsertResponse.data.id!;
  console.log(`✅ Short uploaded! ID: ${videoId}`);
  console.log(`   URL: https://www.youtube.com/shorts/${videoId}`);

  console.log('\n✅ Publishing complete!');
  console.log(`   Video ID: ${videoId}`);
  console.log(`   Status: ${metadata.privacyStatus}`);
  console.log(`   URL: https://studio.youtube.com/video/${videoId}/edit`);

  return {
    videoId,
    url: `https://www.youtube.com/shorts/${videoId}`,
    title: metadata.title,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const albumSlug = process.argv[2];
  
  if (!albumSlug) {
    console.error('Usage: tsx scripts/publish-short.ts <album-slug>');
    console.error('Example: tsx scripts/publish-short.ts cognitive-bloom');
    process.exit(1);
  }

  publishShort(albumSlug)
    .then((result) => {
      console.log('\n✅ Done!');
      console.log(JSON.stringify(result, null, 2));
    })
    .catch((error) => {
      console.error('\n❌ Error:', error.message);
      process.exit(1);
    });
}

export { publishShort };
