# E2E Website Tests

End-to-end tests for the Stoked UI documentation website using Playwright.

## Running Tests

### Against Production
```bash
pnpm test:e2e-website
```

This runs all E2E tests against the production site at https://stoked-ui.com.

### Against Local Development Server

**Note:** The local dev server uses experimental HTTPS with self-signed certificates. Due to SSL certificate validation issues with Next.js experimental HTTPS feature, we recommend running tests against production or a properly configured HTTPS environment.

If you need to test locally:

```bash
# Start the docs dev server (in a separate terminal)
cd docs && pnpm dev

# Run tests (may fail due to SSL certificate issues)
PLAYWRIGHT_TEST_BASE_URL=https://localhost:5199 pnpm test:e2e-website:dev
```

**Known Limitations:**
- Next.js experimental HTTPS uses self-signed certificates that may not be properly trusted by Playwright
- Even with `ignoreHTTPSErrors: true` in playwright.config.ts, SSL protocol errors may occur
- For local testing, consider using a tool like `mkcert` to create trusted local certificates or run tests against production

## Test Files

### docs-left-menu-navigation.spec.ts
Tests all left menu navigation pages to ensure:
- Pages load without 404 errors
- Pages have substantial content (>100 characters)
- Main content element is visible
- No "Page not found" text is present
- All top-level menu sections are visible
- Navigation drawer expansion works correctly

Covers 48+ pages across all documentation sections:
- Introduction (9 pages)
- Media Selector (4 pages)
- File Explorer (19 pages)
- Timeline (1 page)
- Github (4 pages)
- Editor (16 pages)

## Configuration

The Playwright configuration is in `playwright.config.ts`:
- Base URL: `https://stoked-ui.com` (default) or set via `PLAYWRIGHT_TEST_BASE_URL`
- SSL errors ignored: `ignoreHTTPSErrors: true` for local development
- Slow test threshold: 60 seconds

## Troubleshooting

### SSL Certificate Errors
If you see `ERR_SSL_PROTOCOL_ERROR` or similar SSL errors:
1. Run tests against production instead of local dev server
2. Use production URL: `pnpm test:e2e-website`
3. Or set up proper SSL certificates for local development

### Playwright Version Mismatch
If you see "Playwright Test did not expect test() to be called here":
1. Ensure only one version of Playwright is installed
2. Check that `playwright` is NOT in dependencies (only `@playwright/test` should be in devDependencies)
3. Run `pnpm install` to fix dependencies

### Browser Not Installed
If you see "Executable doesn't exist":
```bash
pnpm exec playwright install chromium
```

## Adding New Tests

Follow the existing pattern in the test files:
1. Import test and expect from `@playwright/test`
2. Use descriptive test names
3. Include proper wait conditions (networkidle, element visibility)
4. Add meaningful assertions with custom error messages
5. Test both positive cases (page loads) and negative cases (no 404 content)
