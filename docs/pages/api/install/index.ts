import type { NextApiRequest, NextApiResponse } from 'next';
import { getDb } from 'docs/src/modules/db/mongodb';
import {
  getInstallBaseUrl,
  normalizeInstallSourceUrl,
  normalizeSupportedOperatingSystems,
  SUPPORTED_OS_LABELS,
  type SupportedOs,
} from 'docs/src/modules/products/install';

/**
 * GET /api/install/
 *
 * Backs the install.stokd.cloud landing page: every live product with an
 * install script, in admin-defined order. Browsers get a self-contained HTML
 * page (the install subdomain serves no Next.js assets, so styles and the
 * copy-to-clipboard script are inlined); curl/wget get a plain-text index;
 * ?f=json returns JSON.
 */

interface InstallableProduct {
  productId: string;
  name: string;
  description: string;
  supportedOperatingSystems: SupportedOs[];
  installUrl: string;
  installCommand: string;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderHtml(products: InstallableProduct[]): string {
  const cards = products
    .map((product) => {
      const osBadges = product.supportedOperatingSystems.length > 0
        ? product.supportedOperatingSystems
            .map((os) => `<span class="os">${escapeHtml(SUPPORTED_OS_LABELS[os] ?? os)}</span>`)
            .join('')
        : '<span class="os os-any">All platforms</span>';

      return `
      <section class="card">
        <div class="card-head">
          <h2>${escapeHtml(product.name)}</h2>
          <div class="badges">${osBadges}</div>
        </div>
        ${product.description ? `<p class="desc">${escapeHtml(product.description)}</p>` : ''}
        <div class="cmd">
          <code>${escapeHtml(product.installCommand)}</code>
          <button type="button" data-cmd="${escapeHtml(product.installCommand)}" aria-label="Copy install command for ${escapeHtml(product.name)}">Copy</button>
        </div>
      </section>`;
    })
    .join('\n');

  const empty = '<p class="empty">No install scripts are published yet. Check back soon.</p>';

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>install.stokd.cloud — product install scripts</title>
<meta name="description" content="One-line install commands for stokd.cloud products.">
<style>
  :root { color-scheme: dark; }
  * { box-sizing: border-box; }
  body {
    margin: 0; padding: 48px 24px 96px;
    background: #0b0e14; color: #e6e8ee;
    font: 16px/1.6 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  }
  main { max-width: 760px; margin: 0 auto; }
  header { margin-bottom: 40px; }
  h1 { font-size: 28px; margin: 0 0 8px; letter-spacing: -0.02em; }
  h1 .dim { color: #6b7280; font-weight: 400; }
  .sub { color: #9aa3b2; margin: 0; }
  .card {
    border: 1px solid #1f2633; border-radius: 12px;
    padding: 20px 22px; margin-bottom: 20px; background: #0f1420;
  }
  .card-head { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 8px; }
  h2 { font-size: 19px; margin: 0; letter-spacing: -0.01em; }
  .badges { display: flex; gap: 6px; flex-wrap: wrap; }
  .os {
    font-size: 12px; padding: 3px 10px; border-radius: 999px;
    border: 1px solid #2b3447; color: #b7c0d0; white-space: nowrap;
  }
  .os-any { color: #8b96a8; border-style: dashed; }
  .desc { color: #9aa3b2; margin: 10px 0 0; font-size: 14px; }
  .cmd {
    display: flex; align-items: center; gap: 10px; margin-top: 14px;
    border: 1px solid #1f2633; border-radius: 8px; background: #0b0f18;
    padding: 10px 12px;
  }
  .cmd code {
    flex: 1; overflow-x: auto; white-space: nowrap;
    font: 13px/1.5 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    color: #c9d4e3;
  }
  .cmd button {
    flex: none; cursor: pointer; font-size: 12px; font-weight: 600;
    color: #e6e8ee; background: #1c2534; border: 1px solid #2b3447;
    border-radius: 6px; padding: 6px 12px; transition: background .15s;
  }
  .cmd button:hover { background: #263349; }
  .cmd button.copied { color: #7ee2a8; border-color: #2f4d3c; }
  .empty { color: #9aa3b2; }
  footer { margin-top: 48px; color: #6b7280; font-size: 13px; }
  footer a { color: #8fa3c8; text-decoration: none; }
</style>
</head>
<body>
<main>
  <header>
    <h1>install<span class="dim">.stokd.cloud</span></h1>
    <p class="sub">One-line install commands for stokd.cloud products.</p>
  </header>
  ${products.length > 0 ? cards : empty}
  <footer>
    Scripts are served from <code>install.stokd.cloud/&lt;product&gt;.sh</code> —
    more at <a href="https://consulting.stokd.cloud/products/">consulting.stokd.cloud</a>.
  </footer>
</main>
<script>
  document.querySelectorAll('.cmd button').forEach(function (button) {
    button.addEventListener('click', function () {
      navigator.clipboard.writeText(button.dataset.cmd).then(function () {
        button.textContent = 'Copied';
        button.classList.add('copied');
        setTimeout(function () {
          button.textContent = 'Copy';
          button.classList.remove('copied');
        }, 2000);
      });
    });
  });
</script>
</body>
</html>`;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const db = await getDb();
  const rows = await db
    .collection('products')
    .find(
      { live: true, installSourceUrl: { $nin: [null, ''] } },
      { projection: { productId: 1, name: 1, description: 1, installSourceUrl: 1, supportedOperatingSystems: 1, sortOrder: 1 } },
    )
    .sort({ sortOrder: 1, name: 1 })
    .toArray();

  const baseUrl = getInstallBaseUrl();
  const products: InstallableProduct[] = rows
    .filter((product) => normalizeInstallSourceUrl(product.installSourceUrl))
    .map((product) => ({
      productId: product.productId,
      name: product.name,
      description: typeof product.description === 'string' ? product.description : '',
      supportedOperatingSystems: normalizeSupportedOperatingSystems(product.supportedOperatingSystems),
      installUrl: `${baseUrl}/${product.productId}.sh`,
      installCommand: `curl -fsSL ${baseUrl}/${product.productId}.sh | sh`,
    }));

  const userAgent = String(req.headers['user-agent'] || '').toLowerCase();
  const wantsText = req.query.f === 'text' || userAgent.startsWith('curl') || userAgent.startsWith('wget');
  const wantsJson = req.query.f === 'json';

  res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=300');

  if (wantsJson) {
    return res.status(200).json({ products });
  }

  if (wantsText) {
    const lines = [
      '# stokd.cloud install scripts',
      '#',
      ...products.map(
        (product) =>
          `#   ${product.name} (${product.supportedOperatingSystems.map((os) => SUPPORTED_OS_LABELS[os]).join(', ') || 'all platforms'}):\n#     ${product.installCommand}`,
      ),
    ];
    res.status(200).setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.send(`${lines.join('\n')}\n`);
  }

  res.status(200).setHeader('Content-Type', 'text/html; charset=utf-8');
  return res.send(renderHtml(products));
}
