/**
 * Extract embedded media from a .sue binary file
 *
 * .sue binary format:
 * [4 bytes: metadata length]
 * [N bytes: JSON metadata]
 * [remaining: embedded media files]
 */

import * as fs from 'fs/promises';
import * as path from 'path';

interface SueMetadata {
  id: string;
  name: string;
  filesMeta: Array<{
    name: string;
    size: number;
    type: string;
  }>;
  tracks: Array<{
    url: string;
    fileId: string;
    [key: string]: any;
  }>;
}

async function extractSueMedia(sueFilePath: string, outputDir: string) {
  console.log(`Reading .sue file: ${sueFilePath}`);

  // Read the entire file
  const buffer = await fs.readFile(sueFilePath);
  const dataView = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);

  // Read metadata length (first 4 bytes, little-endian)
  const metadataLength = dataView.getUint32(0, true);
  console.log(`Metadata length: ${metadataLength} bytes`);

  // Extract JSON metadata
  const metadataStart = 4;
  const metadataEnd = metadataStart + metadataLength;
  const metadataBuffer = buffer.slice(metadataStart, metadataEnd);
  const metadataText = new TextDecoder().decode(metadataBuffer);
  const metadata: SueMetadata = JSON.parse(metadataText);

  console.log(`\nProject: ${metadata.name}`);
  console.log(`Files in project: ${metadata.filesMeta.length}`);

  // Create output directory
  await fs.mkdir(outputDir, { recursive: true });

  // Extract embedded media files
  let currentOffset = metadataEnd;

  for (const fileMeta of metadata.filesMeta) {
    const fileSize = fileMeta.size;
    const fileName = fileMeta.name;
    const fileData = buffer.slice(currentOffset, currentOffset + fileSize);

    const outputPath = path.join(outputDir, fileName);
    await fs.writeFile(outputPath, fileData);

    console.log(`  ✓ Extracted: ${fileName} (${(fileSize / 1024 / 1024).toFixed(2)} MB)`);

    currentOffset += fileSize;
  }

  // Update metadata to reference extracted files
  const updatedMetadata = {
    ...metadata,
    tracks: metadata.tracks.map(track => ({
      ...track,
      url: path.join(outputDir, metadata.filesMeta.find(f =>
        track.url.includes(f.name.replace(/\.[^/.]+$/, ''))
      )?.name || '')
    }))
  };

  // Write updated JSON
  const jsonOutputPath = path.join(outputDir, 'project.sue.json');
  await fs.writeFile(
    jsonOutputPath,
    JSON.stringify(updatedMetadata, null, 2),
    'utf-8'
  );

  console.log(`\n✓ Wrote updated project JSON: ${jsonOutputPath}`);
  console.log(`\nAll media extracted to: ${outputDir}`);

  return {
    metadata: updatedMetadata,
    mediaFiles: metadata.filesMeta.map(f => path.join(outputDir, f.name))
  };
}

// CLI usage
const sueFile = process.argv[2] || path.join(process.env.HOME || '', 'multiverse.sue');
const outputDir = process.argv[3] || path.join(process.env.HOME || '', 'multiverse-extracted');

extractSueMedia(sueFile, outputDir)
  .then(result => {
    console.log('\n✓ Extraction complete!');
    console.log(`Use the JSON file for rendering: ${path.join(outputDir, 'project.sue.json')}`);
  })
  .catch(error => {
    console.error('✗ Extraction failed:', error);
    process.exit(1);
  });
