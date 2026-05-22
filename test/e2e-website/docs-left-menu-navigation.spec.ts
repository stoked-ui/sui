/**
 * E2E tests for documentation left menu navigation
 *
 * Tests all pages listed in the left navigation menu to ensure:
 * - Pages load without 404 errors
 * - Pages have substantial content
 * - Navigation structure is correct
 *
 * Run against production:
 *   pnpm test:e2e-website
 *
 * Note: Local dev server uses experimental HTTPS which may cause SSL errors.
 * See test/e2e-website/README.md for troubleshooting.
 */
import { test, expect } from '@playwright/test';
import docsPages from '../../docs/data/pages';

test.describe.configure({ timeout: 30 * 60 * 1000 });

type PageNode = {
  pathname: string;
  title?: string;
  children?: PageNode[];
};

function flattenLeafPages(nodes: PageNode[], leafPages: string[] = []) {
  nodes.forEach((node) => {
    if (Array.isArray(node.children) && node.children.length > 0) {
      flattenLeafPages(node.children, leafPages);
      return;
    }

    leafPages.push(node.pathname);
  });

  return leafPages;
}

const navigablePages = flattenLeafPages(docsPages as PageNode[])
  .filter((pathname) => !pathname.includes('*'));

const legacyRedirectPages = [
  '/stoked-ui/docs/overview',
  '/file-explorer/docs/overview',
  '/media-selector/docs/id-generator',
  '/file-explorer/docs/file-customizaton',
  '/file-explorer/docs/file-explorer/dropzone',
  '/file-explorer/api/timeline',
  '/editor/api/editor',
];

const testBaseUrl = process.env.PLAYWRIGHT_TEST_BASE_URL || 'https://sui.stokd.cloud';

function toCanonicalPathname(pathname: string) {
  if (pathname === '/' || pathname.endsWith('/')) {
    return pathname;
  }

  return `${pathname}/`;
}

function toTestUrl(pathname: string) {
  return new URL(toCanonicalPathname(pathname), testBaseUrl).toString();
}

function isTransientNavigationError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);

  return (
    message.includes('net::ERR_ABORTED')
    || message.includes('frame was detached')
    || message.includes('Target page, context or browser has been closed')
  );
}

async function gotoWithRetry(page: any, pathname: string) {
  const url = toTestUrl(pathname);
  let lastError: unknown;

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      await page.goto(url, {
        waitUntil: 'domcontentloaded',
        timeout: 180_000,
      });
      await page.waitForLoadState('networkidle', { timeout: 180_000 });
      return;
    } catch (error) {
      lastError = error;

      if (attempt === 3 || !isTransientNavigationError(error)) {
        throw error;
      }

      await page.waitForTimeout(1000 * attempt);
    }
  }

  throw lastError;
}

async function verifyPageLoads(page: any, pathname: string) {
  await gotoWithRetry(page, pathname);

  const pageContent = await page.textContent('body');
  expect(pageContent, `Page ${pathname} shows 404 content`).not.toContain('Page not found');
  expect(pageContent, `Page ${pathname} shows 404 content`).not.toContain("the page you were looking for wasn't found");

  const mainContent = page.locator('#main-content');
  await expect(mainContent, `Page ${pathname} missing main content`).toBeVisible({ timeout: 15_000 });

  const mainText = await mainContent.textContent();
  expect(mainText, `Page ${pathname} has no content`).toBeTruthy();
  expect(mainText?.length, `Page ${pathname} has insufficient content`).toBeGreaterThan(100);
}

test('all left menu navigation pages should load without 404 errors', async ({ page }) => {
  const failedPages: string[] = [];

  for (const pathname of navigablePages) {
    try {
      await verifyPageLoads(page, pathname);
    } catch (error) {
      failedPages.push(pathname);
      console.error(`Failed to load ${pathname}:`, error);
    }
  }

  expect(failedPages, `The following pages failed to load: ${failedPages.join(', ')}`).toHaveLength(0);
});

test('legacy route aliases should redirect without hitting 404s', async ({ page }) => {
  const failedPages: string[] = [];

  for (const pathname of legacyRedirectPages) {
    try {
      await verifyPageLoads(page, pathname);
      expect(new URL(page.url()).pathname).not.toBe(pathname);
    } catch (error) {
      failedPages.push(pathname);
      console.error(`Failed redirect ${pathname}:`, error);
    }
  }

  expect(failedPages, `The following legacy redirects failed: ${failedPages.join(', ')}`).toHaveLength(0);
});

test('should have all top-level menu sections', async ({ page }) => {
  await gotoWithRetry(page, '/products/stoked-ui/docs/overview');
  await page.waitForSelector('nav[aria-label="documentation"]', { timeout: 180_000 });

  const expectedSections = (docsPages as PageNode[])
    .map((node) => node.title)
    .filter((title): title is string => Boolean(title));

  for (const section of expectedSections) {
    const sectionElement = page.locator('nav[aria-label="documentation"]').getByText(section, { exact: false });
    await expect(sectionElement).toBeVisible();
  }
});

test('should expand and navigate to child pages', async ({ page }) => {
  await gotoWithRetry(page, '/products/stoked-ui/docs/overview');
  await page.waitForSelector('nav[aria-label="documentation"]', { timeout: 180_000 });

  const fileExplorerSection = page.locator('nav[aria-label="documentation"]').getByText('File Explorer', { exact: false });
  if (await fileExplorerSection.isVisible()) {
    await fileExplorerSection.click();
    await page.waitForTimeout(500);
  }

  const gettingStartedLink = page.locator('nav[aria-label="documentation"]').getByRole('link', { name: /getting started/i });
  const linkCount = await gettingStartedLink.count();
  if (linkCount > 0) {
    await gettingStartedLink.click();
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('/products/file-explorer/docs/getting-started');

    const pageContent = await page.textContent('body');
    expect(pageContent).not.toContain('Page not found');
  }
});
