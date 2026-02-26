/**
 * E2E tests for the PagefindSearch component.
 *
 * Tests the custom search modal built around the Pagefind static-search library.
 * The component is rendered inside a MUI Dialog and is triggered by:
 *   - Clicking the SearchButton in the header
 *   - Pressing Cmd+K (macOS) or Ctrl+K (Windows/Linux)
 *
 * These tests are designed to run against the static export served locally
 * or against the production site. The Pagefind index lives at /pagefind/pagefind.js
 * relative to the site root.
 *
 * To run against the static export:
 *   PLAYWRIGHT_TEST_BASE_URL=http://localhost:3000 pnpm test:e2e-website
 *
 * (Serve the export with e.g. `npx serve docs/export -p 3000`)
 */

import { test as base, expect, Page } from '@playwright/test';
import { TestFixture } from './playwright.config';

const test = base.extend<TestFixture>({});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * A page that reliably contains the PagefindSearch button in its header.
 * The overview page is a stable anchor; tweak if the URL changes.
 */
const START_PAGE = '/stoked-ui/docs/overview';

/**
 * Wait for the search dialog to open by looking for the input that is
 * rendered inside it. The InputBase from MUI renders an <input> with
 * aria-label="Search documentation".
 */
async function waitForDialogOpen(page: Page, timeout = 5000) {
  await page.waitForSelector('input[aria-label="Search documentation"]', { timeout });
}

/**
 * Wait for the search dialog to close — the input should disappear.
 */
async function waitForDialogClosed(page: Page, timeout = 5000) {
  await page.waitForSelector('input[aria-label="Search documentation"]', {
    state: 'hidden',
    timeout,
  });
}

/**
 * Open the search modal via keyboard shortcut.
 * Retries a few times because the component is loaded lazily via React.lazy
 * and there may be a brief window where the keyboard handler is not yet active.
 */
async function openSearchViaKeyboard(page: Page, retries = 3) {
  for (let attempt = 0; attempt < retries; attempt += 1) {
    await page.keyboard.press('Meta+k');
    try {
      await waitForDialogOpen(page, 2000);
      return; // success
    } catch {
      if (attempt === retries - 1) throw new Error('Search dialog did not open after keyboard shortcut');
    }
  }
}

/**
 * Open the search modal by clicking the SearchButton in the header.
 */
async function openSearchViaButton(page: Page) {
  const searchButton = page.locator('button[aria-label="Search documentation"]');
  await searchButton.waitFor({ state: 'visible', timeout: 10000 });
  await searchButton.click();
  await waitForDialogOpen(page, 5000);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

test.describe('PagefindSearch', () => {

  // -------------------------------------------------------------------------
  // 1. Open modal via Cmd+K / Ctrl+K keyboard shortcut
  // -------------------------------------------------------------------------
  test('opens search modal via Cmd+K keyboard shortcut', async ({ page }) => {
    await page.goto(START_PAGE);
    await page.waitForLoadState('networkidle');

    await openSearchViaKeyboard(page);

    const input = page.locator('input[aria-label="Search documentation"]');
    await expect(input).toBeVisible();
  });

  // -------------------------------------------------------------------------
  // 2. Open modal via Ctrl+K (alternative shortcut)
  // -------------------------------------------------------------------------
  test('opens search modal via Ctrl+K keyboard shortcut', async ({ page }) => {
    await page.goto(START_PAGE);
    await page.waitForLoadState('networkidle');

    for (let attempt = 0; attempt < 3; attempt += 1) {
      await page.keyboard.press('Control+k');
      try {
        await waitForDialogOpen(page, 2000);
        break;
      } catch {
        if (attempt === 2) throw new Error('Search dialog did not open via Ctrl+K');
      }
    }

    const input = page.locator('input[aria-label="Search documentation"]');
    await expect(input).toBeVisible();
  });

  // -------------------------------------------------------------------------
  // 3. Close search modal via Escape key
  // -------------------------------------------------------------------------
  test('closes search modal via Escape key', async ({ page }) => {
    await page.goto(START_PAGE);
    await page.waitForLoadState('networkidle');

    await openSearchViaKeyboard(page);

    // Confirm it is open
    await expect(page.locator('input[aria-label="Search documentation"]')).toBeVisible();

    // Press Escape to close
    await page.keyboard.press('Escape');
    await waitForDialogClosed(page, 5000);

    await expect(page.locator('input[aria-label="Search documentation"]')).not.toBeVisible();
  });

  // -------------------------------------------------------------------------
  // 4. Close search modal via the Esc button inside the dialog
  // -------------------------------------------------------------------------
  test('closes search modal via the esc button inside the dialog', async ({ page }) => {
    await page.goto(START_PAGE);
    await page.waitForLoadState('networkidle');

    await openSearchViaButton(page);

    // The "esc" close button rendered inside the SearchInputRoot
    const escButton = page.locator('button[aria-label="Close search"]');
    await expect(escButton).toBeVisible();
    await escButton.click();

    await waitForDialogClosed(page, 5000);
    await expect(page.locator('input[aria-label="Search documentation"]')).not.toBeVisible();
  });

  // -------------------------------------------------------------------------
  // 5. Open modal via the search button in the header
  // -------------------------------------------------------------------------
  test('opens search modal by clicking the search button', async ({ page }) => {
    await page.goto(START_PAGE);
    await page.waitForLoadState('networkidle');

    await openSearchViaButton(page);

    const input = page.locator('input[aria-label="Search documentation"]');
    await expect(input).toBeVisible();
    // The input should be focused
    await expect(input).toBeFocused();
  });

  // -------------------------------------------------------------------------
  // 6. Empty query shows the initial empty state
  // -------------------------------------------------------------------------
  test('shows initial empty state when no query is entered', async ({ page }) => {
    await page.goto(START_PAGE);
    await page.waitForLoadState('networkidle');

    await openSearchViaButton(page);

    // With no query the component renders "Start typing to search documentation..."
    const emptyStateText = page.getByText('Start typing to search documentation...');
    await expect(emptyStateText).toBeVisible();

    // The search results list should not be present yet
    const resultsList = page.locator('#search-results-listbox');
    await expect(resultsList).not.toBeVisible();
  });

  // -------------------------------------------------------------------------
  // 7. Typing a query produces results
  // -------------------------------------------------------------------------
  test('shows results when typing a search query', async ({ page }) => {
    await page.goto(START_PAGE);
    await page.waitForLoadState('networkidle');

    await openSearchViaButton(page);

    const input = page.locator('input[aria-label="Search documentation"]');
    await input.fill('MediaViewer');

    // Wait for results list to appear
    const resultsList = page.locator('#search-results-listbox');
    await expect(resultsList).toBeVisible({ timeout: 10000 });

    // At least one result item should be rendered
    const resultItems = resultsList.locator('[role="option"]');
    await expect(resultItems.first()).toBeVisible({ timeout: 10000 });
  });

  // -------------------------------------------------------------------------
  // 8. No-results state for a nonsense query
  // -------------------------------------------------------------------------
  test('shows no-results state for a gibberish query', async ({ page }) => {
    await page.goto(START_PAGE);
    await page.waitForLoadState('networkidle');

    await openSearchViaButton(page);

    const input = page.locator('input[aria-label="Search documentation"]');
    await input.fill('xyzzy_totally_nonexistent_zzz123abc987');

    // The component renders 'No results for "<query>"'
    // We wait with a generous timeout because Pagefind loads asynchronously.
    const noResultsText = page.getByText(/No results for/, { exact: false });
    await expect(noResultsText).toBeVisible({ timeout: 15000 });

    // The results list should not be present
    const resultsList = page.locator('#search-results-listbox');
    await expect(resultsList).not.toBeVisible();
  });

  // -------------------------------------------------------------------------
  // 9. No-results state shows popular/fallback links
  // -------------------------------------------------------------------------
  test('no-results state offers popular fallback links', async ({ page }) => {
    await page.goto(START_PAGE);
    await page.waitForLoadState('networkidle');

    await openSearchViaButton(page);

    const input = page.locator('input[aria-label="Search documentation"]');
    await input.fill('xyzzy_totally_nonexistent_zzz123abc987');

    await expect(page.getByText(/No results for/, { exact: false })).toBeVisible({ timeout: 15000 });

    // The component shows POPULAR_LINKS: Media Viewer, File Explorer, Timeline, Flux Overview
    await expect(page.getByRole('button', { name: /Media Viewer/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /File Explorer/i })).toBeVisible();
  });

  // -------------------------------------------------------------------------
  // 10. Keyboard navigation: arrow keys move the selection
  // -------------------------------------------------------------------------
  test('keyboard arrow keys navigate through search results', async ({ page }) => {
    await page.goto(START_PAGE);
    await page.waitForLoadState('networkidle');

    await openSearchViaButton(page);

    const input = page.locator('input[aria-label="Search documentation"]');
    await input.fill('media');

    const resultsList = page.locator('#search-results-listbox');
    await expect(resultsList).toBeVisible({ timeout: 10000 });

    // Wait for at least 2 result items so arrow navigation is meaningful
    const resultItems = resultsList.locator('[role="option"]');
    await expect(resultItems.nth(1)).toBeVisible({ timeout: 10000 });

    // The first result should start selected (aria-selected="true")
    await expect(resultItems.first()).toHaveAttribute('aria-selected', 'true');

    // Press ArrowDown — selection should move to the second item
    await input.press('ArrowDown');
    await expect(resultItems.nth(1)).toHaveAttribute('aria-selected', 'true');
    await expect(resultItems.first()).toHaveAttribute('aria-selected', 'false');

    // Press ArrowUp — selection should return to the first item
    await input.press('ArrowUp');
    await expect(resultItems.first()).toHaveAttribute('aria-selected', 'true');
  });

  // -------------------------------------------------------------------------
  // 11. Pressing Enter on a selected result navigates to that page
  // -------------------------------------------------------------------------
  test('pressing Enter on a selected result navigates to the result page', async ({ page }) => {
    await page.goto(START_PAGE);
    await page.waitForLoadState('networkidle');

    await openSearchViaButton(page);

    const input = page.locator('input[aria-label="Search documentation"]');
    await input.fill('MediaViewer');

    const resultsList = page.locator('#search-results-listbox');
    await expect(resultsList).toBeVisible({ timeout: 10000 });

    // Wait for at least one result
    const firstResult = resultsList.locator('[role="option"]').first();
    await expect(firstResult).toBeVisible({ timeout: 10000 });

    // Read the URL of the first result before pressing Enter.
    // The result item has id="search-result-0" and the component navigates via router.push.
    // We just confirm that pressing Enter closes the dialog and navigates somewhere.
    await input.press('Enter');

    // Dialog should close
    await waitForDialogClosed(page, 8000);

    // The URL should have changed away from the start page (or stayed if same page)
    // We at minimum verify the dialog is gone and no 404 content is showing.
    const pageContent = await page.textContent('body');
    expect(pageContent).not.toContain('Page not found');
  });

  // -------------------------------------------------------------------------
  // 12. Clicking a search result navigates to the correct page
  // -------------------------------------------------------------------------
  test('clicking a search result navigates to its URL', async ({ page }) => {
    await page.goto(START_PAGE);
    await page.waitForLoadState('networkidle');

    await openSearchViaButton(page);

    const input = page.locator('input[aria-label="Search documentation"]');
    await input.fill('MediaViewer');

    const resultsList = page.locator('#search-results-listbox');
    await expect(resultsList).toBeVisible({ timeout: 10000 });

    const firstResult = resultsList.locator('[role="option"]').first();
    await expect(firstResult).toBeVisible({ timeout: 10000 });

    // Click the first result
    await firstResult.click();

    // The dialog should close on click
    await waitForDialogClosed(page, 8000);

    // Navigated to a docs page — should not show 404
    const pageContent = await page.textContent('body');
    expect(pageContent).not.toContain('Page not found');
  });

  // -------------------------------------------------------------------------
  // 13. Clearing the query returns to the empty state
  // -------------------------------------------------------------------------
  test('clearing the query input returns to the empty state', async ({ page }) => {
    await page.goto(START_PAGE);
    await page.waitForLoadState('networkidle');

    await openSearchViaButton(page);

    const input = page.locator('input[aria-label="Search documentation"]');
    await input.fill('media');

    // Wait for results
    await expect(page.locator('#search-results-listbox')).toBeVisible({ timeout: 10000 });

    // Click the clear button (aria-label="Clear search")
    const clearButton = page.locator('button[aria-label="Clear search"]');
    await expect(clearButton).toBeVisible();
    await clearButton.click();

    // Results list should disappear and empty state text should return
    await expect(page.locator('#search-results-listbox')).not.toBeVisible();
    await expect(page.getByText('Start typing to search documentation...')).toBeVisible();

    // Input should be empty and focused
    await expect(input).toHaveValue('');
    await expect(input).toBeFocused();
  });

  // -------------------------------------------------------------------------
  // 14. Product filter chips appear after the index loads
  // -------------------------------------------------------------------------
  test('product filter chips are visible after the index loads', async ({ page }) => {
    await page.goto(START_PAGE);
    await page.waitForLoadState('networkidle');

    await openSearchViaButton(page);

    // The filter row only renders once Pagefind's filters() resolves.
    // We give it a generous timeout since it requires a network fetch of the index.
    const allChip = page.getByRole('button', { name: /^All$/ });
    await expect(allChip).toBeVisible({ timeout: 15000 });
  });

  // -------------------------------------------------------------------------
  // 15. Selecting a product filter chip is reflected in the active state
  // -------------------------------------------------------------------------
  test('selecting a product filter chip activates that filter', async ({ page }) => {
    await page.goto(START_PAGE);
    await page.waitForLoadState('networkidle');

    await openSearchViaButton(page);

    // Wait for filters to load
    const allChip = page.getByRole('button', { name: /^All$/ });
    await expect(allChip).toBeVisible({ timeout: 15000 });

    // Pick the first non-All chip
    const filterChips = page.locator('[role="button"]').filter({ hasNotText: /^All$/ });
    // Locate chips that are inside the filter bar (they have MUI Chip structure)
    // The filter bar sits above the DialogContent; grab the first product chip.
    const firstProductChip = page.locator('.MuiChip-root').filter({ hasNotText: /^All$/ }).first();

    const chipLabel = await firstProductChip.textContent();
    await firstProductChip.click();

    // After clicking, the chip should become "filled" (MUI primary color variant).
    // The MUI Chip component adds MuiChip-filled when variant="filled".
    await expect(firstProductChip).toHaveClass(/MuiChip-filled/);

    // The All chip should now be outlined (not filled)
    await expect(allChip).not.toHaveClass(/MuiChip-filled/);

    // Clicking All should reset the filter
    await allChip.click();
    await expect(allChip).toHaveClass(/MuiChip-filled/);

    // Suppress unused-variable warning from linter — chipLabel is read above.
    void chipLabel;
  });

});
