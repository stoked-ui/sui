/**
 * Quick test to verify multiverse.sue can load video data
 */

import { SueParserService } from './packages/sui-video-renderer/src/render/services/sue-parser.service';
import * as path from 'path';

async function testMultiverse() {
  const sueParser = new SueParserService();

  const sueFilePath = path.join(process.env.HOME || '', 'multiverse.sue');
  const publicDir = path.join(__dirname, 'docs/public');

  console.log('Testing multiverse.sue file loading...\n');
  console.log(`SUE file: ${sueFilePath}`);
  console.log(`Public directory: ${publicDir}\n`);

  try {
    // Parse with publicDir to resolve /static/... paths
    const manifest = await sueParser.parseFile(sueFilePath, publicDir);

    console.log('✓ Successfully parsed SUE file!\n');
    console.log('Project Info:');
    console.log(`  - Tracks: ${manifest.items.length} timeline items`);
    console.log(`  - Duration: ${manifest.output.duration}s`);
    console.log(`  - Resolution: ${manifest.output.width}x${manifest.output.height}`);
    console.log(`  - Has video: ${manifest.hasVideo}`);
    console.log(`  - Has audio: ${manifest.hasAudio}\n`);

    console.log('Resolved Media Files:');
    let allExist = true;
    for (const [mediaPath, label] of manifest.mediaFiles) {
      const fs = await import('fs/promises');
      try {
        await fs.access(mediaPath);
        console.log(`  ✓ ${label} -> ${mediaPath}`);
      } catch (error) {
        console.log(`  ✗ ${label} -> ${mediaPath} (NOT FOUND)`);
        allExist = false;
      }
    }

    if (allExist) {
      console.log('\n✓ All video files found! The .sue file is correctly loading video data.');
    } else {
      console.log('\n✗ Some video files not found. Check the paths above.');
    }

  } catch (error) {
    console.error('✗ Error parsing SUE file:', error);
    process.exit(1);
  }
}

testMultiverse()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Test failed:', error);
    process.exit(1);
  });
