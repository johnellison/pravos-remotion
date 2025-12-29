import { publishVideo } from './publish-video.js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface AlbumInfo {
  slug: string;
  week: number;
  publishDate: string;
  title: string;
}

async function batchPublish(mode: 'all' | 'test' = 'all') {
  const metadataDir = path.join(__dirname, '..', 'youtube-metadata');
  const files = fs.readdirSync(metadataDir).filter(f => f.endsWith('.json'));
  
  const albums: AlbumInfo[] = files
    .map(file => {
      const data = JSON.parse(fs.readFileSync(path.join(metadataDir, file), 'utf-8'));
      return {
        slug: data.slug,
        week: data.week,
        publishDate: data.publishDate,
        title: data.title,
      };
    })
    .filter(album => album.slug !== 'cognitive-bloom')
    .sort((a, b) => a.week - b.week);

  if (mode === 'test') {
    console.log('🧪 TEST MODE: Publishing only first video\n');
    const album = albums[0];
    console.log(`Week ${album.week}: ${album.title}`);
    
    const result = await publishVideo(album.slug);
    console.log('\n✅ Test publish complete!');
    console.log('If everything looks good, run: npm run publish:all');
    return [result];
  }

  console.log(`📋 Found ${albums.length} albums to publish:\n`);
  albums.forEach(album => {
    console.log(`  Week ${album.week}: ${album.title}`);
  });

  console.log('\n⚠️  WARNING: This will publish ALL videos as PRIVATE');
  console.log('You can schedule them later from YouTube Studio\n');

  const results: Array<{
    videoId: string;
    url: string;
    title: string;
    week: number;
  }> = [];
  
  for (const album of albums) {
    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`Publishing ${album.week}/  ${albums.length}: ${album.slug}`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    
    try {
      const result = await publishVideo(album.slug);
      results.push({ ...result, week: album.week });
      
      console.log(`\n⏸️  Waiting 5 seconds before next upload...\n`);
      await new Promise(resolve => setTimeout(resolve, 5000));
    } catch (error) {
      console.error(`\n❌ Failed to publish ${album.slug}:`, error);
      console.log('\nContinuing with remaining albums...');
    }
  }

  console.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ BATCH PUBLISH COMPLETE');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('Published videos:\n');
  results.forEach(result => {
    console.log(`  Week ${result.week}: ${result.title}`);
    console.log(`    ${result.url}\n`);
  });

  console.log('\n📝 Next steps:');
  console.log('1. Go to YouTube Studio: https://studio.youtube.com');
  console.log('2. For each video, set the publish date in "Visibility" settings');
  console.log('3. Or keep them private and publish manually each week');

  const reportPath = path.join(__dirname, '..', 'published-videos.json');
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`\n📄 Full report saved to: ${reportPath}`);

  return results;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const mode = process.argv[2] === '--all' ? 'all' : 'test';
  
  batchPublish(mode)
    .then(() => {
      console.log('\n✅ Done!');
    })
    .catch((error) => {
      console.error('\n❌ Error:', error);
      process.exit(1);
    });
}

export { batchPublish };
