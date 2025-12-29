import { publishShort } from './publish-short.js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface ShortInfo {
  slug: string;
  week: number;
  publishDate: string;
  title: string;
}

async function batchPublishShorts(mode: 'all' | 'test' = 'all') {
  const metadataDir = path.join(__dirname, '..', 'youtube-metadata', 'shorts');
  const files = fs.readdirSync(metadataDir).filter(f => f.endsWith('.json'));
  
  const shorts: ShortInfo[] = files
    .map(file => {
      const data = JSON.parse(fs.readFileSync(path.join(metadataDir, file), 'utf-8'));
      return {
        slug: data.slug,
        week: data.week,
        publishDate: data.publishDate,
        title: data.title,
      };
    })
    .sort((a, b) => a.week - b.week);

  if (mode === 'test') {
    console.log('🧪 TEST MODE: Publishing only first short\n');
    const short = shorts[0];
    console.log(`Week ${short.week}: ${short.title}`);
    
    const result = await publishShort(short.slug);
    console.log('\n✅ Test publish complete!');
    console.log('If everything looks good, run: npm run youtube:publish:shorts:all');
    return [result];
  }

  console.log(`📋 Found ${shorts.length} shorts to publish:\n`);
  shorts.forEach(short => {
    console.log(`  Week ${short.week}: ${short.title}`);
  });

  console.log('\n🩳 Publishing all YouTube Shorts as PUBLIC');
  console.log('YouTube will automatically classify these as Shorts (9:16 vertical, <60s)\n');

  const results: Array<{
    videoId: string;
    url: string;
    title: string;
    week: number;
  }> = [];
  
  for (const short of shorts) {
    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`Publishing ${short.week}/${shorts.length}: ${short.slug}`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    
    try {
      const result = await publishShort(short.slug);
      results.push({ ...result, week: short.week });
      
      console.log(`\n⏸️  Waiting 5 seconds before next upload...\n`);
      await new Promise(resolve => setTimeout(resolve, 5000));
    } catch (error) {
      console.error(`\n❌ Failed to publish ${short.slug}:`, error);
      console.log('\nContinuing with remaining shorts...');
    }
  }

  console.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ BATCH PUBLISH SHORTS COMPLETE');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('Published shorts:\n');
  results.forEach(result => {
    console.log(`  Week ${result.week}: ${result.title}`);
    console.log(`    ${result.url}\n`);
  });

  console.log('\n📝 Next steps:');
  console.log('1. Go to YouTube Studio: https://studio.youtube.com');
  console.log('2. Verify shorts are classified correctly (check Shorts tab)');
  console.log('3. Set publish dates if needed in "Visibility" settings');

  const reportPath = path.join(__dirname, '..', 'published-shorts.json');
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`\n📄 Full report saved to: ${reportPath}`);

  return results;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const mode = process.argv[2] === '--all' ? 'all' : 'test';
  
  batchPublishShorts(mode)
    .then(() => {
      console.log('\n✅ Done!');
    })
    .catch((error) => {
      console.error('\n❌ Error:', error);
      process.exit(1);
    });
}

export { batchPublishShorts };
