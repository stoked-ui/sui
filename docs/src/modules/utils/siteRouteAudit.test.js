import fs from 'fs';
import path from 'path';
import { expect } from 'chai';
import pages from '../../../data/pages';
import { CONSULTING_ROUTE_MANIFEST, NEXT_ROUTE_REDIRECTS } from './siteRouteManifest';

const docsPagesRoot = path.resolve(process.cwd(), 'docs/pages');
const ownedPrefixes = [
  '/',
  '/products',
  '/consulting',
  '/admin',
  '/clients',
  '/customer',
  '/deliverables',
  '/invoices',
  '/licenses',
  '/login',
  '/settings',
  '/users',
  '/front-end',
  '/back-end',
  '/devops',
  '/ai',
  '/api-docs',
  '/checkout',
  '/groupies',
  '/partners',
  '/stoked-ui',
  '/file-explorer',
  '/media',
  '/common',
  '/media-api',
  '/media-selector',
  '/timeline',
  '/editor',
  '/core',
  '/github',
];

function normalizePathname(pathname) {
  if (!pathname) {
    return '/';
  }

  const withoutOrigin = pathname.replace(/^https?:\/\/[^/]+/i, '');
  const withoutHash = withoutOrigin.split('#')[0];
  const withoutQuery = withoutHash.split('?')[0];
  const normalized = withoutQuery || '/';

  if (normalized !== '/' && normalized.endsWith('/')) {
    return normalized.slice(0, -1);
  }

  return normalized;
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function pageRouteToRegex(route) {
  if (route === '/') {
    return /^\/$/;
  }

  const segments = route.split('/').filter(Boolean);
  const pattern = segments.map((segment) => {
    if (segment.startsWith('[...') && segment.endsWith(']')) {
      return '.+';
    }
    if (segment.startsWith('[') && segment.endsWith(']')) {
      return '[^/]+';
    }
    return escapeRegex(segment);
  }).join('/');

  return new RegExp(`^/${pattern}/?$`);
}

function nextRoutePatternToRegex(route) {
  if (route === '/') {
    return /^\/$/;
  }

  const segments = route.split('/').filter(Boolean);
  const pattern = segments.map((segment) => {
    if (segment.startsWith(':') && segment.endsWith('*')) {
      return '.+';
    }

    const regexMatch = segment.match(/^:([^()]+)\((.+)\)$/);
    if (regexMatch) {
      return regexMatch[2];
    }

    if (segment.startsWith(':')) {
      return '[^/]+';
    }

    return escapeRegex(segment);
  }).join('/');

  return new RegExp(`^/${pattern}/?$`);
}

function collectActualPageRoutes(directory, routes = []) {
  fs.readdirSync(directory).forEach((item) => {
    if (item.startsWith('.')) {
      return;
    }

    const itemPath = path.join(directory, item);
    const stat = fs.statSync(itemPath);

    if (stat.isDirectory()) {
      collectActualPageRoutes(itemPath, routes);
      return;
    }

    if (!/\.(js|tsx)$/.test(item)) {
      return;
    }

    const route = itemPath
      .replace(docsPagesRoot, '')
      .replace(/\\/g, '/')
      .replace(/\.(js|tsx)$/, '')
      .replace(/^\/index$/, '/')
      .replace(/\/index$/, '');

    if (route === '/_app' || route === '/_document' || route.startsWith('/api/')) {
      return;
    }

    routes.push(route || '/');
  });

  return routes;
}

function flattenLeafPages(items, leaves = []) {
  items.forEach((page) => {
    if (Array.isArray(page.children) && page.children.length > 0) {
      flattenLeafPages(page.children, leaves);
      return;
    }

    leaves.push(page.pathname);
  });

  return leaves;
}

function isOwnedPath(pathname) {
  return ownedPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

function collectSitemapPaths() {
  const sitemap = fs.readFileSync(path.resolve(process.cwd(), 'docs/public/sitemap.xml'), 'utf8');
  return [...sitemap.matchAll(/<loc>https?:\/\/[^/]+([^<]+)<\/loc>/g)]
    .map((match) => normalizePathname(match[1]))
    .filter((pathname) => isOwnedPath(pathname));
}

function collectManifestPaths() {
  const manifestFiles = [
    'docs/public/static/web-app/manifest.json',
    'docs/public/static/web-app/manifest.editor.pwa.json',
    'docs/public/static/web-app/manifest.editor.pwa.example.json',
    'docs/public/static/chrome-app/manifest.json',
    'docs/public/static/chrome-app/manifest.editor.pwa.json',
    'docs/public/static/chrome-app/manifest.editor.pwa.example.json',
  ];

  return manifestFiles.flatMap((file) => {
    const manifest = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), file), 'utf8'));
    const paths = [];

    if (manifest.start_url) {
      paths.push(manifest.start_url);
    }

    if (manifest.file_handlers) {
      Object.values(manifest.file_handlers).forEach((handler) => {
        if (handler && typeof handler.action === 'string') {
          paths.push(handler.action);
        }
      });
    }

    if (manifest.share_target?.action) {
      paths.push(manifest.share_target.action);
    }

    return paths.map((pathname) => normalizePathname(pathname));
  });
}

function collectApiDemoPaths() {
  const productPagesRoot = path.resolve(process.cwd(), 'docs/pages/products');
  const files = [];

  function walk(directory) {
    fs.readdirSync(directory).forEach((item) => {
      const itemPath = path.join(directory, item);
      const stat = fs.statSync(itemPath);

      if (stat.isDirectory()) {
        walk(itemPath);
        return;
      }

      if (itemPath.endsWith('.json')) {
        files.push(itemPath);
      }
    });
  }

  walk(productPagesRoot);

  return files.flatMap((file) => {
    const json = JSON.parse(fs.readFileSync(file, 'utf8'));
    const demos = typeof json.demos === 'string' ? json.demos : '';
    return [...demos.matchAll(/href="([^"]+)"/g)].map((match) => normalizePathname(match[1]));
  });
}

describe('site route audit', () => {
  const actualPageRoutes = collectActualPageRoutes(docsPagesRoot);
  const directRouteMatchers = actualPageRoutes.map(pageRouteToRegex);
  const redirectMatchers = NEXT_ROUTE_REDIRECTS.map((redirect) => nextRoutePatternToRegex(redirect.source));

  const resolvesDirectly = (pathname) => directRouteMatchers.some((matcher) => matcher.test(pathname));
  const resolvesViaRedirect = (pathname) => redirectMatchers.some((matcher) => matcher.test(pathname));

  it('keeps consulting route manifest backed by page files', () => {
    const brokenInternalRoutes = CONSULTING_ROUTE_MANIFEST
      .map((route) => normalizePathname(route.internalPath))
      .filter((pathname) => !resolvesDirectly(pathname));

    expect(brokenInternalRoutes).to.deep.equal([]);
  });

  it('keeps docs navigation leaf pages backed by direct routes', () => {
    const leafPages = flattenLeafPages(pages)
      .map((pathname) => normalizePathname(pathname))
      .filter((pathname) => !pathname.includes('*'));

    const brokenLeafPages = leafPages.filter((pathname) => !resolvesDirectly(pathname));

    expect(brokenLeafPages).to.deep.equal([]);
  });

  it('keeps manifest entry points backed by direct routes', () => {
    const manifestPaths = collectManifestPaths();
    const brokenManifestPaths = manifestPaths.filter((pathname) => !resolvesDirectly(pathname));

    expect(brokenManifestPaths).to.deep.equal([]);
  });

  it('keeps owned sitemap and generated demo URLs backed by routes or declared redirects', () => {
    const ownedArtifactPaths = [
      ...collectSitemapPaths(),
      ...collectApiDemoPaths(),
    ];

    const brokenArtifactPaths = Array.from(new Set(
      ownedArtifactPaths.filter((pathname) => !resolvesDirectly(pathname) && !resolvesViaRedirect(pathname)),
    ));

    expect(brokenArtifactPaths).to.deep.equal([]);
  });
});
