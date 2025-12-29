import { google } from 'googleapis';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { authorize } from './youtube-auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface VideoToReschedule {
  videoId: string;
  slug: string;
  type: 'video' | 'short';
}

const VIDEOS_TO_RESCHEDULE: VideoToReschedule[] = [
  { videoId: 'D4rCed3XpmE', slug: 'scripted-light', type: 'video' },
  { videoId: 'ey6UphR2t2Q', slug: 'neural-drift', type: 'video' },
  { videoId: '1AOBYCyPyh8', slug: 'deep-piano-focus', type: 'short' },
  { videoId: '7WobJjgq-8A', slug: 'meditative-ambient', type: 'short' },
  { videoId: 'JdZbUSv0dfA', slug: 'neural-drift', type: 'short' },
];

async function rescheduleVideo(
  youtube: any,
  videoId: string,
  publishDate: string,
  title: string
) {
  const publishDateTime = new Date(publishDate);
  const now = new Date();

  if (publishDateTime <= now) {
    console.log(`⚠️  Warning: ${title} - publish date is in the past, setting to public`);
    await youtube.videos.update({
      part: ['status'],
      requestBody: {
        id: videoId,
        status: {
          privacyStatus: 'public',
          selfDeclaredMadeForKids: false,
        },
      },
    });
    return { videoId, status: 'public', publishAt: null };
  }

  console.log(`⏰ Scheduling: ${title}`);
  console.log(`   Publish date: ${publishDate}`);

  await youtube.videos.update({
    part: ['status'],
    requestBody: {
      id: videoId,
      status: {
        privacyStatus: 'private',
        publishAt: publishDate,
        selfDeclaredMadeForKids: false,
      },
    },
  });

  return { videoId, status: 'scheduled', publishAt: publishDate };
}

async function rescheduleAll() {
  console.log('🔄 Rescheduling YouTube Videos\n');
  console.log(`Found ${VIDEOS_TO_RESCHEDULE.length} videos to reschedule:\n`);

  const auth = await authorize();
  const youtube = google.youtube({ version: 'v3', auth });

  const results: Array<{
    videoId: string;
    title: string;
    slug: string;
    type: string;
    status: string;
    publishAt: string | null;
  }> = [];

  for (const video of VIDEOS_TO_RESCHEDULE) {
    const metadataDir = video.type === 'short' ? 'shorts' : '';
    const metadataPath = path.join(
      __dirname,
      '..',
      'youtube-metadata',
      metadataDir,
      `${video.slug}.json`
    );

    if (!fs.existsSync(metadataPath)) {
      console.error(`❌ Metadata not found for ${video.slug}: ${metadataPath}`);
      continue;
    }

    const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));

    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`Processing: ${metadata.title}`);
    console.log(`Video ID: ${video.videoId}`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

    try {
      const result = await rescheduleVideo(
        youtube,
        video.videoId,
        metadata.publishDate,
        metadata.title
      );

      results.push({
        videoId: video.videoId,
        title: metadata.title,
        slug: video.slug,
        type: video.type,
        status: result.status,
        publishAt: result.publishAt,
      });

      console.log(`✅ Updated successfully`);
      console.log(`   Status: ${result.status}`);
      if (result.publishAt) {
        console.log(`   Scheduled for: ${result.publishAt}`);
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error: any) {
      console.error(`❌ Failed to reschedule ${video.slug}:`, error.message);
    }
  }

  console.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ RESCHEDULING COMPLETE');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('Rescheduled videos:\n');
  results.forEach(result => {
    console.log(`  ${result.title} (${result.type})`);
    console.log(`    Video ID: ${result.videoId}`);
    console.log(`    Status: ${result.status}`);
    if (result.publishAt) {
      console.log(`    Scheduled: ${result.publishAt}`);
    }
    console.log(`    Studio: https://studio.youtube.com/video/${result.videoId}/edit\n`);
  });

  const reportPath = path.join(__dirname, '..', 'rescheduled-videos.json');
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`📄 Full report saved to: ${reportPath}`);

  return results;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  rescheduleAll()
    .then(() => {
      console.log('\n✅ Done!');
    })
    .catch((error) => {
      console.error('\n❌ Error:', error);
      process.exit(1);
    });
}

export { rescheduleAll };
