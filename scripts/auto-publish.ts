#!/usr/bin/env tsx

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { getItemsDueToday, PUBLISHING_SCHEDULE } from './publishing-schedule.js';
import { sendNotification } from './send-notification.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface PublishedTracking {
  videos: Array<{
    slug: string;
    title: string;
    publishedDate: string;
    publishedManually: boolean;
    type: 'video';
    status: string;
    videoId?: string;
  }>;
  shorts: Array<{
    slug: string;
    title: string;
    publishedDate: string;
    publishedManually: boolean;
    type: 'short';
    status: string;
    videoId?: string;
    views?: number;
  }>;
  lastCheck: string;
}

async function loadTracking(): Promise<PublishedTracking> {
  const trackingPath = path.join(__dirname, '..', 'published-tracking.json');

  if (!fs.existsSync(trackingPath)) {
    return {
      videos: [],
      shorts: [],
      lastCheck: new Date().toISOString()
    };
  }

  return JSON.parse(fs.readFileSync(trackingPath, 'utf-8'));
}

async function saveTracking(tracking: PublishedTracking): Promise<void> {
  const trackingPath = path.join(__dirname, '..', 'published-tracking.json');
  tracking.lastCheck = new Date().toISOString();
  fs.writeFileSync(trackingPath, JSON.stringify(tracking, null, 2));
}

async function publishVideo(slug: string): Promise<{ videoId: string; url: string; title: string }> {
  // Dynamically import to avoid circular dependency
  const { publishVideo: doPublish } = await import('./publish-video.js');
  return doPublish(slug);
}

async function publishShort(slug: string): Promise<{ videoId: string; url: string; title: string }> {
  const { publishShort: doPublish } = await import('./publish-short.js');
  return doPublish(slug);
}

async function autoPublish() {
  console.log('🤖 Pravos Auto-Publisher\n');
  console.log(`📅 Checking for scheduled content: ${new Date().toLocaleDateString()}\n`);

  const tracking = await loadTracking();
  const dueItems = getItemsDueToday();

  if (dueItems.length === 0) {
    console.log('✨ No content scheduled for today');
    console.log('📊 Publishing on track!');
    return;
  }

  console.log(`📋 Found ${dueItems.length} item(s) due today:\n`);

  const results: Array<{ type: string; slug: string; success: boolean; error?: string; videoId?: string; url?: string }> = [];

  for (const item of dueItems) {
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`📤 Publishing ${item.type}: ${item.slug}`);
    console.log(`⏰ Scheduled for: ${new Date(item.date).toLocaleString()}`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

    try {
      let result;

      if (item.type === 'video') {
        result = await publishVideo(item.slug);
        tracking.videos.push({
          slug: item.slug,
          title: result.title,
          publishedDate: new Date().toISOString().split('T')[0],
          publishedManually: false,
          type: 'video',
          status: 'published',
          videoId: result.videoId
        });
      } else {
        result = await publishShort(item.slug);
        tracking.shorts.push({
          slug: item.slug,
          title: result.title,
          publishedDate: new Date().toISOString().split('T')[0],
          publishedManually: false,
          type: 'short',
          status: 'published',
          videoId: result.videoId
        });
      }

      console.log(`\n✅ Successfully published ${item.type}: ${item.slug}`);
      console.log(`   Video ID: ${result.videoId}`);
      console.log(`   URL: ${result.url}\n`);

      results.push({
        type: item.type,
        slug: item.slug,
        success: true,
        videoId: result.videoId,
        url: result.url
      });

      // Send success notification
      await sendNotification({
        type: 'success',
        subject: `Published: ${result.title}`,
        message: `Successfully published ${item.type} to YouTube`,
        metadata: {
          'Type': item.type,
          'Slug': item.slug,
          'Video ID': result.videoId,
          'URL': result.url,
          'Published': new Date().toLocaleString()
        }
      });

      // Mark as published in schedule
      const scheduleItem = PUBLISHING_SCHEDULE.find(week =>
        (week.videoSlug === item.slug && item.type === 'video') ||
        (week.shortSlug === item.slug && item.type === 'short')
      );
      if (scheduleItem) {
        if (item.type === 'video') {
          scheduleItem.published.video = true;
        } else {
          scheduleItem.published.short = true;
        }
      }

      // Wait between publishes
      if (dueItems.indexOf(item) < dueItems.length - 1) {
        console.log('⏸️  Waiting 5 seconds before next publish...\n');
        await new Promise(resolve => setTimeout(resolve, 5000));
      }

    } catch (error: any) {
      console.error(`\n❌ Failed to publish ${item.type}: ${item.slug}`);
      console.error(`   Error: ${error.message}\n`);

      results.push({
        type: item.type,
        slug: item.slug,
        success: false,
        error: error.message
      });

      // Send error notification
      await sendNotification({
        type: 'error',
        subject: `Failed to publish ${item.type}: ${item.slug}`,
        message: `Error publishing to YouTube: ${error.message}`,
        metadata: {
          'Type': item.type,
          'Slug': item.slug,
          'Error': error.message,
          'Time': new Date().toLocaleString()
        }
      });
    }
  }

  // Save updated tracking
  await saveTracking(tracking);

  // Summary
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 PUBLISHING SUMMARY');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);

  if (successful.length > 0) {
    console.log(`✅ Successfully published ${successful.length} item(s):`);
    successful.forEach(r => {
      console.log(`   ${r.type}: ${r.slug}`);
      console.log(`   ${r.url}\n`);
    });
  }

  if (failed.length > 0) {
    console.log(`❌ Failed to publish ${failed.length} item(s):`);
    failed.forEach(r => {
      console.log(`   ${r.type}: ${r.slug}`);
      console.log(`   Error: ${r.error}\n`);
    });
  }

  console.log(`📄 Tracking updated: published-tracking.json`);
  console.log(`📧 Notifications sent to: ${process.env.NOTIFICATION_EMAIL || 'john@pravos.xyz'}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  autoPublish()
    .then(() => {
      console.log('\n✅ Auto-publish complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Auto-publish failed:', error);
      process.exit(1);
    });
}

export { autoPublish };
