/**
 * Seed Products Script
 *
 * Seeds the Flux product and its documentation pages into MongoDB.
 *
 * Usage:
 *   npx ts-node --project docs/tsconfig.json docs/scripts/seed-products.ts
 *
 * Or with tsx:
 *   npx tsx docs/scripts/seed-products.ts
 */

import { MongoClient } from 'mongodb';
import * as fs from 'fs';
import * as path from 'path';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/stoked-consulting';

interface FluxPage {
  slug: string;
  title: string;
  content: string;
  order: number;
}

function parseFrontMatter(raw: string): { title: string; content: string } {
  const fmMatch = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!fmMatch) {
    return { title: '', content: raw };
  }
  const fm = fmMatch[1];
  const content = fmMatch[2].trim();
  const titleMatch = fm.match(/title:\s*(.+)/);
  return {
    title: titleMatch ? titleMatch[1].trim() : '',
    content,
  };
}

function readFluxPages(): FluxPage[] {
  const docsDir = path.resolve(__dirname, '../data/flux/docs');
  const slugOrder = ['overview', 'websites', 'scripting', 'download', 'roadmap'];
  const pages: FluxPage[] = [];

  for (const dir of fs.readdirSync(docsDir)) {
    const dirPath = path.join(docsDir, dir);
    if (!fs.statSync(dirPath).isDirectory()) continue;

    const mdFile = path.join(dirPath, `${dir}.md`);
    if (!fs.existsSync(mdFile)) continue;

    const raw = fs.readFileSync(mdFile, 'utf-8');
    const { title, content } = parseFrontMatter(raw);

    const order = slugOrder.indexOf(dir);
    pages.push({
      slug: dir,
      title: title || dir.charAt(0).toUpperCase() + dir.slice(1),
      content,
      order: order >= 0 ? order : pages.length + 100,
    });
  }

  return pages.sort((a, b) => a.order - b.order);
}

async function seed() {
  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    const db = client.db();

    // Create unique indexes
    await db.collection('products').createIndex({ productId: 1 }, { unique: true });
    await db.collection('product_pages').createIndex(
      { productId: 1, slug: 1 },
      { unique: true },
    );

    // Upsert Flux product
    const now = new Date();
    const fluxProduct = {
      productId: 'flux',
      name: 'Flux',
      fullName: 'Flux',
      description: 'Make any website your Mac desktop wallpaper',
      icon: 'product-toolpad',
      url: '/flux',
      live: true,
      managed: true,
      hideProductFeatures: true,
      features: [
        { name: 'Overview', description: 'Features and getting started', id: 'overview' },
        { name: 'Websites', description: 'Managing websites, multi-monitor, browsing mode, and customization', id: 'websites' },
        { name: 'Scripting', description: 'URL schemes, Shortcuts, and JavaScript API', id: 'scripting' },
        { name: 'Roadmap', description: "What's next", id: 'roadmap' },
      ],
      updatedAt: now,
    };

    const productResult = await db.collection('products').updateOne(
      { productId: 'flux' },
      { $set: fluxProduct, $setOnInsert: { createdAt: now } },
      { upsert: true },
    );

    const productDoc = await db.collection('products').findOne({ productId: 'flux' });
    const productMongoId = productDoc!._id.toString();

    console.log(
      productResult.upsertedCount > 0
        ? `Created Flux product (${productMongoId})`
        : `Updated Flux product (${productMongoId})`,
    );

    // Upsert doc pages
    const pages = readFluxPages();
    for (const page of pages) {
      const pageResult = await db.collection('product_pages').updateOne(
        { productId: productMongoId, slug: page.slug },
        {
          $set: {
            title: page.title,
            content: page.content,
            order: page.order,
            published: true,
            updatedAt: now,
          },
          $setOnInsert: { createdAt: now },
        },
        { upsert: true },
      );
      const action = pageResult.upsertedCount > 0 ? 'Created' : 'Updated';
      console.log(`  ${action} page: ${page.title} (/${page.slug})`);
    }

    console.log(`\nDone! Seeded ${pages.length} pages for Flux.`);
  } finally {
    await client.close();
  }
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
