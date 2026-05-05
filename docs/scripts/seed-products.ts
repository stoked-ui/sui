/**
 * Seed Products Script
 *
 * Seeds all managed products and their documentation pages into MongoDB.
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

interface ProductPage {
  slug: string;
  title: string;
  content: string;
  order: number;
}

interface ProductConfig {
  productId: string;
  name: string;
  fullName: string;
  description: string;
  icon: string;
  url: string;
  live: boolean;
  managed: boolean;
  hideProductFeatures: boolean;
  prerelease?: 'alpha' | 'beta' | 'none';
  keyPrefix?: string;
  price?: number;
  currency?: string;
  subscriptions?: Array<{ price: number; currency: string; interval: 'month' | 'year' }>;
  maxActivations?: number;
  privacyPolicy?: {
    enabled: boolean;
    content: string;
    localizedContent?: Record<string, string>;
  };
  features: Array<{ name: string; description: string; id: string }>;
  slugOrder: string[];
}

const products: ProductConfig[] = [
  {
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
    slugOrder: ['overview', 'websites', 'scripting', 'download', 'roadmap'],
  },
  {
    productId: 'focus-capture',
    name: 'Focus Capture',
    fullName: 'Focus Capture',
    description: 'OBS capture source for macOS that follows the active window automatically',
    icon: 'product-advanced',
    url: '/focus-capture',
    live: true,
    managed: true,
    hideProductFeatures: true,
    prerelease: 'beta',
    features: [
      { name: 'Overview', description: 'What Focus Capture does and where it fits in an OBS workflow', id: 'overview' },
      { name: 'Download', description: 'Installer package and manual plugin bundle downloads', id: 'download' },
      { name: 'Installation', description: 'OBS install steps and required macOS permissions', id: 'installation' },
      { name: 'Source Settings', description: 'Frame rate, cursor capture, resize, and exclusion controls', id: 'source-settings' },
      { name: 'Roadmap', description: 'Current release scope and planned improvements', id: 'roadmap' },
    ],
    slugOrder: ['overview', 'download', 'installation', 'source-settings', 'roadmap'],
  },
  {
    productId: 'mac-mixer',
    name: 'Mac Mixer',
    fullName: 'Mac Mixer',
    description: 'Per-application audio routing for macOS with app-level and device-level volume control',
    icon: 'product-advanced',
    url: '/mac-mixer',
    live: true,
    managed: true,
    hideProductFeatures: true,
    prerelease: 'alpha',
    keyPrefix: 'MACMIXER',
    price: 10,
    currency: 'USD',
    subscriptions: [{ price: 10, currency: 'USD', interval: 'year' }],
    maxActivations: 3,
    privacyPolicy: {
      enabled: true,
      content: `# Mac Mixer Privacy Policy

**Last updated: May 4, 2026**

Mac Mixer is a macOS menu-bar utility from Stoked Consulting. This policy explains what information is processed when you use Mac Mixer, buy a direct license, or activate the app.

## Audio and routing data

Mac Mixer processes audio locally on your Mac. Audio content is not uploaded, recorded, analyzed, or transmitted to Stoked Consulting.

Route assignments, device names, enabled devices, and volume settings are stored locally at \`~/Library/Application Support/MacMixer/config.yaml\`. This configuration is not sent to Stoked Consulting by the app.

## License and account data

If you use the direct-license build, Stoked Consulting may process:

- Email address used for checkout and license delivery.
- License key, product ID, license status, expiration date, and activation count.
- Hardware identifier used to bind a license activation to a Mac.
- Machine name when provided by the license activation response.

Payment card details are processed by Stripe. Stoked Consulting does not store full payment card numbers.

If you use the Mac App Store build, purchase and subscription management are handled by Apple through StoreKit.

## Local storage

Mac Mixer stores trial state, license keys, entitlement cache data, and related validation data in Keychain and UserDefaults. Debug logs may be written to \`~/Library/Logs/MacMixer.log\`.

## Network use

Mac Mixer network calls are limited to checkout, license activation, license validation, license deactivation, and optional product-promo content. The app does not include audio analytics.

## Data sharing

Stoked Consulting does not sell personal information. Direct-license billing data is shared with Stripe as needed to process payment. App Store subscription data is handled by Apple under Apple's policies.

## Contact

For privacy requests or questions, contact Stoked Consulting through stokedconsulting.com.`,
    },
    features: [
      { name: 'Overview', description: 'What Mac Mixer does, requirements, and current alpha scope', id: 'overview' },
      { name: 'Routing and Volumes', description: 'Move apps between output devices and control route levels', id: 'app-volumes' },
      { name: 'Installation', description: 'HAL plug-in install, first launch, and release-channel notes', id: 'installation' },
      { name: 'Configuration', description: 'YAML persistence and the runtime driver sync contract', id: 'configuration' },
      { name: 'Licensing', description: 'Trial, direct license, and Mac App Store subscription behavior', id: 'licensing' },
      { name: 'Roadmap', description: 'Alpha scope, release packaging, and planned improvements', id: 'roadmap' },
    ],
    slugOrder: ['overview', 'app-volumes', 'installation', 'configuration', 'licensing', 'roadmap'],
  },
  {
    productId: 'always-listening',
    name: 'Always Listening',
    fullName: 'Always Listening',
    description: 'Cross-platform voice pipeline tray app with Voice-to-Claude, Dictation, and Combined modes',
    icon: 'product-templates',
    url: '/always-listening',
    live: true,
    managed: true,
    hideProductFeatures: true,
    prerelease: 'alpha',
    features: [
      { name: 'Overview', description: 'Voice pipeline overview and tech stack', id: 'overview' },
      { name: 'Voice Modes', description: 'Voice-to-Claude, Dictation, and Combined mode details', id: 'voice-modes' },
      { name: 'Preferences', description: 'Configuration, hotkeys, and TTS settings', id: 'preferences' },
      { name: 'Roadmap', description: 'Development status and planned features', id: 'roadmap' },
    ],
    slugOrder: ['overview', 'voice-modes', 'preferences', 'roadmap'],
  },
  {
    productId: 'stokd-cloud',
    name: 'Stokd Cloud',
    fullName: 'Stokd Cloud',
    description: 'AI-powered project orchestration with VSCode extension, NestJS API, and MCP server',
    icon: 'product-toolpad',
    url: '/stokd-cloud',
    live: true,
    managed: true,
    hideProductFeatures: true,
    prerelease: 'alpha',
    features: [
      { name: 'Overview', description: 'Platform overview and architecture', id: 'overview' },
      { name: 'VSCode Extension', description: 'Project management and Claude AI integration', id: 'vscode-extension' },
      { name: 'State API', description: 'NestJS session and task tracking API', id: 'state-api' },
      { name: 'Roadmap', description: 'Development status and plans', id: 'roadmap' },
    ],
    slugOrder: ['overview', 'vscode-extension', 'state-api', 'review-commands', 'roadmap'],
  },
];

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

function readProductPages(productId: string, slugOrder: string[]): ProductPage[] {
  const docsDir = path.resolve(__dirname, `../data/${productId}/docs`);
  const pages: ProductPage[] = [];

  if (!fs.existsSync(docsDir)) {
    console.warn(`  Warning: docs directory not found at ${docsDir}`);
    return pages;
  }

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

    const now = new Date();
    let totalPages = 0;

    for (const config of products) {
      const { productId, slugOrder, ...productData } = config;

      // Upsert product
      const productResult = await db.collection('products').updateOne(
        { productId },
        { $set: { productId, ...productData, updatedAt: now }, $setOnInsert: { createdAt: now } },
        { upsert: true },
      );

      const productDoc = await db.collection('products').findOne({ productId });
      const productMongoId = productDoc!._id.toString();

      console.log(
        productResult.upsertedCount > 0
          ? `Created ${config.name} product (${productMongoId})`
          : `Updated ${config.name} product (${productMongoId})`,
      );

      // Upsert doc pages
      const pages = readProductPages(productId, slugOrder);
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

      if (pages.length > 0) {
        const activeSlugs = pages.map((page) => page.slug);
        const staleResult = await db.collection('product_pages').updateMany(
          { productId: productMongoId, slug: { $nin: activeSlugs }, published: true },
          { $set: { published: false, updatedAt: now } },
        );

        if (staleResult.modifiedCount > 0) {
          console.log(`  Unpublished ${staleResult.modifiedCount} stale page(s).`);
        }
      }

      totalPages += pages.length;
      console.log(`  Seeded ${pages.length} pages for ${config.name}.\n`);
    }

    console.log(`Done! Seeded ${products.length} products with ${totalPages} total pages.`);
  } finally {
    await client.close();
  }
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
