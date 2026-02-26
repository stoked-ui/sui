/**
 * validateSearchIndex.mjs
 *
 * Validates the quality of the Pagefind search index generated at docs/export/pagefind/.
 *
 * Checks performed:
 *   1. pagefind-entry.json is present and contains valid metadata
 *   2. Fragment count matches the declared page_count
 *   3. Every fragment contains a non-empty title, a non-empty URL, and a product filter
 *   4. No duplicate page URLs in the fragment corpus
 *   5. Known component names produce at least one matching page
 *   6. Known documentation topics produce at least one matching page
 *   7. At least one filter index file exists
 *   8. The filter corpus contains all expected product names
 *   9. Total uncompressed index size is below 5 MB
 *
 * Usage (from the repo root or from docs/):
 *   node docs/scripts/validateSearchIndex.mjs [path/to/pagefind]
 *
 * Defaults to docs/export/pagefind/ relative to the current working directory.
 */

import { readFileSync, readdirSync, existsSync, statSync } from 'fs';
import { gunzipSync } from 'zlib';
import { join, resolve } from 'path';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

/** Known component / product names – each must return ≥1 result */
const COMPONENT_QUERIES = ['MediaViewer', 'Timeline', 'FileExplorer', 'Editor', 'Flux'];

/** Known documentation topic strings – each must return ≥1 result */
const TOPIC_QUERIES = ['getting started', 'overview', 'roadmap'];

/** Product names that must appear in the filter index */
const EXPECTED_PRODUCTS = ['File Explorer', 'Timeline', 'Editor', 'Media', 'Flux', 'Stoked UI'];

/** Maximum allowed uncompressed index size (bytes) */
const MAX_UNCOMPRESSED_BYTES = 5 * 1024 * 1024; // 5 MB

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Decompress a gzip-compressed pagefind file and return the buffer. */
function decompressFile(filePath) {
  const buf = readFileSync(filePath);
  return gunzipSync(buf);
}

/**
 * Pagefind fragment files are gzip-compressed and begin with a short binary
 * header (e.g. "pagefind_dcd") before the JSON payload. This function strips
 * the header and parses the embedded JSON object.
 */
function parseFragmentFile(filePath) {
  const data = decompressFile(filePath);
  const str = data.toString('utf8');
  const jsonStart = str.indexOf('{');
  if (jsonStart === -1) {
    throw new Error(`No JSON object found in fragment: ${filePath}`);
  }
  return JSON.parse(str.slice(jsonStart));
}

/**
 * Extract readable ASCII strings (≥4 chars) from a binary buffer.
 * Used to inspect the filter index file which uses a custom binary format.
 */
function extractStrings(buf, minLen = 4) {
  const strings = [];
  let current = '';
  for (let i = 0; i < buf.length; i++) {
    const c = buf[i];
    if (c >= 32 && c < 127) {
      current += String.fromCharCode(c);
    } else {
      if (current.length >= minLen) strings.push(current);
      current = '';
    }
  }
  if (current.length >= minLen) strings.push(current);
  return strings;
}

// ---------------------------------------------------------------------------
// Validation runner
// ---------------------------------------------------------------------------

const PASS = '  PASS';
const FAIL = '  FAIL';

function result(passed, label, detail = '') {
  const icon = passed ? PASS : FAIL;
  const line = detail ? `${icon}  ${label} — ${detail}` : `${icon}  ${label}`;
  console.log(line);
  return passed;
}

async function main() {
  // Resolve the pagefind directory from CLI arg or default
  const arg = process.argv[2];
  const pagefindDir = arg
    ? resolve(arg)
    : resolve(process.cwd(), 'docs/export/pagefind');

  console.log(`\nValidating Pagefind index at: ${pagefindDir}\n`);

  if (!existsSync(pagefindDir)) {
    console.error(`ERROR: Directory does not exist: ${pagefindDir}`);
    process.exit(1);
  }

  const fragmentDir = join(pagefindDir, 'fragment');
  const indexDir = join(pagefindDir, 'index');
  const filterDir = join(pagefindDir, 'filter');

  let passed = 0;
  let failed = 0;

  function check(ok, label, detail) {
    if (result(ok, label, detail)) {
      passed++;
    } else {
      failed++;
    }
    return ok;
  }

  // -------------------------------------------------------------------------
  // 1. pagefind-entry.json
  // -------------------------------------------------------------------------
  console.log('=== Entry Metadata ===');

  const entryPath = join(pagefindDir, 'pagefind-entry.json');
  let entryData = null;
  if (check(existsSync(entryPath), 'pagefind-entry.json exists')) {
    entryData = JSON.parse(readFileSync(entryPath, 'utf8'));
    check(
      typeof entryData.version === 'string' && entryData.version.length > 0,
      'pagefind-entry.json has a version field',
      `version = ${entryData.version}`,
    );
    check(
      entryData.languages && typeof entryData.languages.en === 'object',
      'pagefind-entry.json has an "en" language entry',
    );
    const pageCount = entryData.languages?.en?.page_count;
    check(
      typeof pageCount === 'number' && pageCount > 0,
      'page_count is a positive integer',
      `page_count = ${pageCount}`,
    );
  }

  // -------------------------------------------------------------------------
  // 2. Fragment files
  // -------------------------------------------------------------------------
  console.log('\n=== Fragment Files ===');

  const fragmentFiles = existsSync(fragmentDir) ? readdirSync(fragmentDir) : [];
  const declaredCount = entryData?.languages?.en?.page_count ?? 0;

  check(
    fragmentFiles.length > 0,
    'Fragment directory contains files',
    `${fragmentFiles.length} fragment files found`,
  );

  check(
    fragmentFiles.length === declaredCount,
    'Fragment file count matches declared page_count',
    `files = ${fragmentFiles.length}, declared = ${declaredCount}`,
  );

  // Parse all fragments
  const allPages = [];
  const parseErrors = [];
  for (const f of fragmentFiles) {
    try {
      const page = parseFragmentFile(join(fragmentDir, f));
      allPages.push(page);
    } catch (err) {
      parseErrors.push({ file: f, error: err.message });
    }
  }

  check(
    parseErrors.length === 0,
    'All fragment files parse without errors',
    parseErrors.length > 0 ? `${parseErrors.length} errors (first: ${parseErrors[0].error})` : '',
  );

  // -------------------------------------------------------------------------
  // 3. Content quality – title, URL, product filter
  // -------------------------------------------------------------------------
  console.log('\n=== Page Content Quality ===');

  const noTitle = allPages.filter((p) => !p.meta?.title || p.meta.title.trim() === '');
  check(
    noTitle.length === 0,
    'Every page has a non-empty title',
    noTitle.length > 0
      ? `${noTitle.length} pages missing title (e.g. ${noTitle[0].url})`
      : `all ${allPages.length} pages have titles`,
  );

  const noUrl = allPages.filter((p) => !p.url || p.url.trim() === '');
  check(
    noUrl.length === 0,
    'Every page has a non-empty URL',
    noUrl.length > 0
      ? `${noUrl.length} pages missing URL`
      : `all ${allPages.length} pages have URLs`,
  );

  const noProduct = allPages.filter(
    (p) => !p.filters?.product || p.filters.product.length === 0,
  );
  check(
    noProduct.length === 0,
    'Every page has a product metadata filter value',
    noProduct.length > 0
      ? `${noProduct.length} pages without product filter (e.g. ${noProduct[0].url})`
      : `all ${allPages.length} pages have product metadata`,
  );

  // -------------------------------------------------------------------------
  // 4. Duplicate URL detection
  // -------------------------------------------------------------------------
  console.log('\n=== Duplicate Detection ===');

  const urlCounts = {};
  for (const page of allPages) {
    urlCounts[page.url] = (urlCounts[page.url] || 0) + 1;
  }
  const duplicateUrls = Object.entries(urlCounts)
    .filter(([, count]) => count > 1)
    .map(([url, count]) => `${url} (x${count})`);

  check(
    duplicateUrls.length === 0,
    'No duplicate page URLs',
    duplicateUrls.length > 0
      ? `${duplicateUrls.length} duplicate(s): ${duplicateUrls.slice(0, 3).join(', ')}`
      : `${allPages.length} unique URLs`,
  );

  // -------------------------------------------------------------------------
  // 5. Component name queries
  // -------------------------------------------------------------------------
  console.log('\n=== Component Name Queries ===');

  for (const term of COMPONENT_QUERIES) {
    const matches = allPages.filter(
      (p) =>
        (p.content && p.content.toLowerCase().includes(term.toLowerCase())) ||
        (p.meta?.title && p.meta.title.toLowerCase().includes(term.toLowerCase())) ||
        (p.url && p.url.toLowerCase().includes(term.toLowerCase())),
    );
    check(
      matches.length > 0,
      `"${term}" returns results`,
      `${matches.length} page(s) match — e.g. ${matches[0]?.url ?? 'none'}`,
    );
  }

  // -------------------------------------------------------------------------
  // 6. Documentation topic queries
  // -------------------------------------------------------------------------
  console.log('\n=== Documentation Topic Queries ===');

  for (const term of TOPIC_QUERIES) {
    const matches = allPages.filter(
      (p) =>
        (p.content && p.content.toLowerCase().includes(term.toLowerCase())) ||
        (p.meta?.title && p.meta.title.toLowerCase().includes(term.toLowerCase())) ||
        (p.url && p.url.toLowerCase().includes(term.toLowerCase())),
    );
    check(
      matches.length > 0,
      `"${term}" returns results`,
      `${matches.length} page(s) match — e.g. ${matches[0]?.url ?? 'none'}`,
    );
  }

  // -------------------------------------------------------------------------
  // 7. Filter index files
  // -------------------------------------------------------------------------
  console.log('\n=== Filter Index ===');

  const filterFiles = existsSync(filterDir) ? readdirSync(filterDir) : [];
  check(
    filterFiles.length > 0,
    'Filter directory contains at least one filter file',
    `${filterFiles.length} filter file(s) found`,
  );

  // Parse filter file binary to extract product names
  if (filterFiles.length > 0) {
    const filterBuf = decompressFile(join(filterDir, filterFiles[0]));
    const strings = extractStrings(filterBuf, 3);
    const productNamesInFilter = strings.filter(
      (s) => s !== 'pagefind_dcd' && !s.startsWith('pagefind'),
    );
    // Strip the single-char msgpack length prefix if present (e.g. "iStoked UI" -> "Stoked UI")
    const cleanedProducts = productNamesInFilter.map((s) =>
      s.length > 1 && s.charCodeAt(0) < 127 && /^[a-z]/.test(s) && /[A-Z ]/.test(s.slice(1))
        ? s.slice(1)
        : s,
    );

    for (const expected of EXPECTED_PRODUCTS) {
      const found =
        productNamesInFilter.some((s) => s.includes(expected)) ||
        cleanedProducts.some((s) => s.includes(expected));
      check(found, `Product "${expected}" is present in filter index`);
    }
  }

  // -------------------------------------------------------------------------
  // 8. Total uncompressed size
  // -------------------------------------------------------------------------
  console.log('\n=== Index Size ===');

  let totalUncompressed = 0;
  let totalCompressed = 0;

  function accumulateDir(dir) {
    if (!existsSync(dir)) return;
    for (const f of readdirSync(dir)) {
      const fp = join(dir, f);
      totalCompressed += statSync(fp).size;
      try {
        totalUncompressed += decompressFile(fp).length;
      } catch {
        // Some files may not be gzip-compressed (e.g. .js, .css)
        totalUncompressed += statSync(fp).size;
      }
    }
  }

  // Walk all files in the pagefind directory (top-level + subdirs)
  for (const entry of readdirSync(pagefindDir)) {
    const fp = join(pagefindDir, entry);
    if (statSync(fp).isDirectory()) {
      accumulateDir(fp);
    } else {
      totalCompressed += statSync(fp).size;
      try {
        totalUncompressed += decompressFile(fp).length;
      } catch {
        totalUncompressed += statSync(fp).size;
      }
    }
  }

  const compressedMB = (totalCompressed / 1024 / 1024).toFixed(2);
  const uncompressedMB = (totalUncompressed / 1024 / 1024).toFixed(2);

  console.log(`  INFO  Compressed total: ${compressedMB} MB`);
  console.log(`  INFO  Uncompressed total: ${uncompressedMB} MB`);

  check(
    totalUncompressed <= MAX_UNCOMPRESSED_BYTES,
    `Total uncompressed size is under ${MAX_UNCOMPRESSED_BYTES / 1024 / 1024} MB`,
    `${uncompressedMB} MB uncompressed`,
  );

  // -------------------------------------------------------------------------
  // 9. Summary statistics
  // -------------------------------------------------------------------------
  console.log('\n=== Summary Statistics ===');

  const productCounts = {};
  for (const page of allPages) {
    for (const prod of page.filters?.product ?? []) {
      productCounts[prod] = (productCounts[prod] || 0) + 1;
    }
  }

  console.log(`  Pages indexed : ${allPages.length}`);
  console.log(`  Products      : ${Object.keys(productCounts).join(', ')}`);
  console.log(`  Pages by product:`);
  for (const [prod, count] of Object.entries(productCounts).sort((a, b) => b[1] - a[1])) {
    console.log(`    ${prod.padEnd(20)} ${count}`);
  }

  // -------------------------------------------------------------------------
  // Final result
  // -------------------------------------------------------------------------
  const total = passed + failed;
  console.log(`\n${'='.repeat(50)}`);
  console.log(`Validation complete: ${passed}/${total} checks passed, ${failed} failed`);

  if (failed > 0) {
    console.error(`\nERROR: ${failed} validation check(s) failed.`);
    process.exit(1);
  } else {
    console.log('\nAll validation checks passed.');
  }
}

main().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
