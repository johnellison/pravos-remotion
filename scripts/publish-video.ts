import { google } from 'googleapis';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { authorize } from './youtube-auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface VideoMetadata {
  slug: string;
  week: number;
  publishDate: string;
  title: string;
  description: string;
  tags: string[];
  categoryId: string;
  privacyStatus: 'public' | 'private' | 'unlisted';
}

async function publishVideo(albumSlug: string) {
  const metadataPath = path.join(__dirname, '..', 'youtube-metadata', `${albumSlug}.json`);
  const videoPath = path.join(__dirname, '..', 'out', `${albumSlug}-video.mp4`);
  const thumbnailPath = path.join(__dirname, '..', 'out', `${albumSlug}-thumbnail.png`);

  if (!fs.existsSync(metadataPath)) {
    throw new Error(`Metadata not found: ${metadataPath}`);
  }

  if (!fs.existsSync(videoPath)) {
    throw new Error(`Video not found: ${videoPath}`);
  }

  const metadata: VideoMetadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));

  const publishDate = new Date(metadata.publishDate);
  const now = new Date();
  const isPastDate = publishDate <= now;

  console.log(`\n🎬 Publishing: ${metadata.title}`);
  console.log(`📂 Video: ${videoPath}`);
  console.log(`📅 Scheduled for: ${metadata.publishDate}`);
  
  if (isPastDate) {
    console.log(`\n⚠️  WARNING: Publish date is in the past!`);
    console.log(`   Video will be published immediately as ${metadata.privacyStatus}`);
    console.log(`   If this is not intended, update the year in: ${metadataPath}`);
  }

  const auth = await authorize();
  const youtube = google.youtube({ version: 'v3', auth });

  const shouldSchedule = publishDate > now;

  console.log('\n📤 Uploading video...');
  if (shouldSchedule) {
    console.log(`⏰ Scheduling for: ${metadata.publishDate}`);
  } else {
    console.log(`📢 Publishing immediately (date is in the past)`);
  }

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
        privacyStatus: shouldSchedule ? 'private' : metadata.privacyStatus,
        publishAt: shouldSchedule ? metadata.publishDate : undefined,
        selfDeclaredMadeForKids: false,
      },
    },
    media: {
      body: fs.createReadStream(videoPath),
    },
  });

  const videoId = videoInsertResponse.data.id!;
  console.log(`✅ Video uploaded! ID: ${videoId}`);
  console.log(`   URL: https://www.youtube.com/watch?v=${videoId}`);

  if (fs.existsSync(thumbnailPath)) {
    console.log('\n🖼️  Uploading custom thumbnail...');
    await youtube.thumbnails.set({
      videoId,
      media: {
        body: fs.createReadStream(thumbnailPath),
      },
    });
    console.log('✅ Thumbnail uploaded!');
  }

  console.log('\n✅ Publishing complete!');
  console.log(`   Video ID: ${videoId}`);
  console.log(`   Status: ${metadata.privacyStatus}`);
  console.log(`   URL: https://studio.youtube.com/video/${videoId}/edit`);

  return {
    videoId,
    url: `https://www.youtube.com/watch?v=${videoId}`,
    title: metadata.title,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const albumSlug = process.argv[2];
  
  if (!albumSlug) {
    console.error('Usage: tsx scripts/publish-video.ts <album-slug>');
    console.error('Example: tsx scripts/publish-video.ts cognitive-bloom');
    process.exit(1);
  }

  publishVideo(albumSlug)
    .then((result) => {
      console.log('\n✅ Done!');
      console.log(JSON.stringify(result, null, 2));
    })
    .catch((error) => {
      console.error('\n❌ Error:', error.message);
      process.exit(1);
    });
}

export { publishVideo };
