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

/**
 * Pages to test - manually defined to avoid import issues with docs code
 */
const navigablePages = [
  // Introduction
  '/stoked-ui/docs/overview',
  '/stoked-ui/docs/installation',
  '/stoked-ui/docs/usage',
  '/stoked-ui/docs/example-projects',
  '/stoked-ui/docs/faq',
  '/stoked-ui/docs/support',
  '/stoked-ui/docs/consulting',
  '/stoked-ui/docs/vision',
  '/stoked-ui/docs/roadmap',

  // Media Selector
  '/media-selector/docs/overview',
  '/media-selector/docs/file-with-path',
  '/media-selector/docs/id-generator',
  '/media-selector/docs/roadmap',

  // File Explorer
  '/file-explorer/docs/overview',
  '/file-explorer/docs/getting-started',
  '/file-explorer/docs/file-explorer-basic/items',
  '/file-explorer/docs/file-explorer-basic/selection',
  '/file-explorer/docs/file-explorer-basic/expansion',
  '/file-explorer/docs/file-explorer-basic/customization',
  '/file-explorer/docs/file-explorer-basic/focus',
  '/file-explorer/docs/file-explorer/items',
  '/file-explorer/docs/file-explorer/selection',
  '/file-explorer/docs/file-explorer/expansion',
  '/file-explorer/docs/file-explorer/customization',
  '/file-explorer/docs/file-explorer/focus',
  '/file-explorer/docs/file-explorer/dragzone',
  '/file-explorer/docs/file-explorer/drag-and-drop',
  '/file-explorer/docs/accessibility',
  '/file-explorer/docs/file-customization',
  '/file-explorer/docs/roadmap',

  // Timeline
  '/timeline/docs/overview',

  // Github
  '/github/docs/overview',
  '/github/docs/github-calendar',
  '/github/docs/github-events',
  '/github/docs/roadmap',

  // Editor
  '/editor/docs/overview',
  '/editor/docs/getting-started',
  '/editor/components/editor',
  '/editor/docs/labels',
  '/editor/docs/scale',
  '/editor/docs/actions',
  '/editor/docs/customize',
  '/editor/docs/grid',
  '/editor/docs/events-callbacks',
  '/editor/docs/controls',
  '/editor/docs/drop-add',
  '/editor/docs/backend-processing',
  '/editor/docs/roadmap',
];

// Helper function to verify a page loads correctly
async function verifyPageLoads(page: any, pathname: string) {
  // Navigate to the page
  await page.goto(pathname);

  // Wait for the page to load
  await page.waitForLoadState('networkidle');

  // Verify the page doesn't show 404 content
  const pageContent = await page.textContent('body');
  expect(pageContent, `Page ${pathname} shows 404 content`).not.toContain('Page not found');
  expect(pageContent, `Page ${pathname} shows 404 content`).not.toContain("the page you were looking for wasn't found");

  // Verify the page has main content (not just a skeleton/error)
  const mainContent = await page.locator('#main-content');
  await expect(mainContent, `Page ${pathname} missing main content`).toBeVisible();

  // Verify no generic error messages in the main content
  const mainText = await mainContent.textContent();
  expect(mainText, `Page ${pathname} has no content`).toBeTruthy();
  expect(mainText?.length, `Page ${pathname} has insufficient content`).toBeGreaterThan(100);
}

// Single test that checks all pages
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

  // Report all failures at the end
  expect(failedPages, `The following pages failed to load: ${failedPages.join(', ')}`).toHaveLength(0);
});

// Test main menu sections are visible
test('should have all top-level menu sections', async ({ page }) => {
  await page.goto('/stoked-ui/docs/overview');

  // Wait for navigation to load
  await page.waitForSelector('nav[aria-label="documentation"]', { timeout: 10000 });

  // Check for the main sections from our pages.ts
  const expectedSections = [
    'Introduction',
    'Media Selector',
    'File Explorer',
    'Timeline',
    'Github',
    'Editor',
  ];

  for (const section of expectedSections) {
    const sectionElement = page.locator(`nav[aria-label="documentation"]`).getByText(section, { exact: false });
    await expect(sectionElement).toBeVisible();
  }
});

// Test navigation interaction
test('should expand and navigate to child pages', async ({ page }) => {
  await page.goto('/stoked-ui/docs/overview');

  // Wait for navigation to load
  await page.waitForSelector('nav[aria-label="documentation"]', { timeout: 10000 });

  // Find and click on File Explorer section (which has children)
  const fileExplorerSection = page.locator('nav[aria-label="documentation"]').getByText('File Explorer', { exact: false });

  // Click to expand if collapsed
  const isVisible = await fileExplorerSection.isVisible();
  if (isVisible) {
    await fileExplorerSection.click();
    await page.waitForTimeout(500); // Wait for expansion animation
  }

  // Click on a child page (e.g., "Getting Started")
  const gettingStartedLink = page.locator('nav[aria-label="documentation"]').getByRole('link', { name: /getting started/i });

  // Check if the link exists and is visible
  const linkCount = await gettingStartedLink.count();
  if (linkCount > 0) {
    await gettingStartedLink.click();

    // Verify we navigated to the correct page
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('/file-explorer/docs/getting-started');

    // Verify no 404 content
    const pageContent = await page.textContent('body');
    expect(pageContent).not.toContain('Page not found');
  }
});
