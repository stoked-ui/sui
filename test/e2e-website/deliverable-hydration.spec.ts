import { test as base, expect } from '@playwright/test';
import { once } from 'events';
import type { AddressInfo } from 'net';
import http from 'http';
import jwt from 'jsonwebtoken';
import { TestFixture } from './playwright.config';

const test = base.extend<TestFixture>({});

const DELIVERABLE_ID = '69b3e5e9d3d66367057b72ca';

function createAuthToken() {
  return jwt.sign(
    {
      sub: 'client-user-1',
      email: 'client@example.com',
      role: 'client',
      name: 'Client User',
      clientId: 'client-1',
    },
    'dev-secret-change-me',
    { expiresIn: '1h' },
  );
}

async function startSnapshotFixtureServer() {
  const server = http.createServer((req, res) => {
    if (req.url === '/snapshot/index_files/app.css') {
      res.writeHead(200, { 'Content-Type': 'text/css; charset=utf-8' });
      res.end('main { color: rgb(12, 34, 56); font-weight: 700; }');
      return;
    }

    if (req.url === '/snapshot/index.html') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`<!DOCTYPE html>
<!-- saved from url=(0069)http://localhost:5199/consulting/clients/xferall/ -->
<html>
  <head>
    <title>Xferall Snapshot</title>
    <link rel="stylesheet" href="./index_files/app.css" />
  </head>
  <body>
    <div id="__next">
      <div>
        <header>Snapshot Header</header>
        <main>Xferall snapshot body</main>
      </div>
    </div>
    <script id="__NEXT_DATA__" type="application/json">{"buildId":"development"}</script>
    <script>
      document.body.dataset.hydrationError = '1';
      console.error('Hydration failed because the initial UI does not match what was rendered on the server.');
    </script>
  </body>
</html>`);
      return;
    }

    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not found');
  });

  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const address = server.address() as AddressInfo;

  return {
    close: async () => {
      await new Promise<void>((resolve, reject) => {
        server.close((error) => {
          if (error) {
            reject(error);
            return;
          }
          resolve();
        });
      });
    },
    origin: `http://127.0.0.1:${address.port}`,
  };
}

test('deliverable viewer strips saved snapshot hydration scripts on the client deliverable route', async ({ page }) => {
  test.setTimeout(120_000);
  const fixture = await startSnapshotFixtureServer();
  const consoleErrors: string[] = [];

  page.on('console', (message) => {
    if (message.type() === 'error') {
      consoleErrors.push(message.text());
    }
  });

  const authToken = createAuthToken();
  const baseUrl = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://127.0.0.1:5199';
  const deliverableHtmlUrl = `${fixture.origin}/snapshot/index.html`;

  await page.addInitScript((token) => {
    window.localStorage.setItem('auth', JSON.stringify({
      access_token: token,
      user: {
        id: 'client-user-1',
        email: 'client@example.com',
        name: 'Client User',
        role: 'client',
        clientId: 'client-1',
      },
    }));
  }, authToken);

  await page.route(`**/api/deliverables/${DELIVERABLE_ID}/**`, async (route) => {
    await route.fulfill({
      contentType: 'application/json; charset=utf-8',
      body: JSON.stringify({
        _id: DELIVERABLE_ID,
        title: 'Xferall Snapshot',
        type: 'html',
        url: deliverableHtmlUrl,
      }),
    });
  });

  try {
    await fetch(`${baseUrl}/consulting/deliverables/${DELIVERABLE_ID}/`);
    await fetch(
      `${baseUrl}/api/deliverables/render/?url=${encodeURIComponent(deliverableHtmlUrl)}&token=${encodeURIComponent(authToken)}`,
    );

    await page.goto(`/consulting/deliverables/${DELIVERABLE_ID}/`, {
      waitUntil: 'domcontentloaded',
    }).catch((error: Error) => {
      if (!error.message.includes('ERR_ABORTED')) {
        throw error;
      }
    });
    await page.waitForURL(new RegExp(`/consulting/deliverables/${DELIVERABLE_ID}/?$`));

    await expect(page.locator('iframe[title="Xferall Snapshot"]')).toHaveAttribute(
      'src',
      new RegExp(`/api/deliverables/render/\\?url=${encodeURIComponent(deliverableHtmlUrl)}`),
    );

    const frame = page.frameLocator('iframe[title="Xferall Snapshot"]');
    const main = frame.locator('main');
    await expect(main).toHaveText('Xferall snapshot body', { timeout: 15_000 });

    const hydrationMarker = await frame.locator('body').evaluate((element) => element.dataset.hydrationError ?? '');
    expect(hydrationMarker).toBe('');

    const textColor = await main.evaluate((element) => window.getComputedStyle(element).color);
    expect(textColor).toBe('rgb(12, 34, 56)');

    expect(consoleErrors).not.toContain(
      'Hydration failed because the initial UI does not match what was rendered on the server.',
    );
  } finally {
    await fixture.close();
  }
});
