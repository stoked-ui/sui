export const STOKED_UI_PRODUCT_IDS = [
  'stoked-ui',
  'file-explorer',
  'media',
  'common',
  'media-api',
  'media-selector',
  'timeline',
  'editor',
];

export const CONSULTING_PUBLIC_PRODUCT_IDS = [
  'flux',
  'focus-capture',
  'mac-mixer',
  'always-listening',
  'stokd-cloud',
];

export const CONSULTING_ROUTE_MANIFEST = [
  { id: 'consulting-home', publicPath: '/', internalPath: '/consulting/', access: 'public' },
  { id: 'consulting-admin', publicPath: '/admin', internalPath: '/consulting/admin', access: 'admin' },
  { id: 'consulting-admin-products', publicPath: '/admin/products', internalPath: '/consulting/admin/products', access: 'admin' },
  { id: 'consulting-admin-product', publicPath: '/admin/products/[product-slug]', internalPath: '/consulting/admin/products/[product-slug]', access: 'admin' },
  { id: 'consulting-ai', publicPath: '/ai', internalPath: '/consulting/ai', access: 'public' },
  { id: 'consulting-api-docs', publicPath: '/api-docs', internalPath: '/consulting/api-docs', access: 'admin' },
  { id: 'consulting-back-end', publicPath: '/back-end', internalPath: '/consulting/back-end', access: 'public' },
  { id: 'consulting-billing', publicPath: '/billing', internalPath: '/consulting/billing', access: 'authenticated' },
  { id: 'consulting-checkout', publicPath: '/checkout', internalPath: '/consulting/checkout', access: 'authenticated' },
  { id: 'consulting-clients', publicPath: '/clients', internalPath: '/consulting/clients', access: 'admin' },
  { id: 'consulting-client', publicPath: '/clients/[client-slug]', internalPath: '/consulting/clients/[client-slug]', access: 'authenticated' },
  { id: 'consulting-customer', publicPath: '/customer', internalPath: '/consulting/customer', access: 'authenticated' },
  { id: 'consulting-deliverable', publicPath: '/deliverables/[id]', internalPath: '/consulting/deliverables/[id]', access: 'authenticated' },
  { id: 'consulting-devops', publicPath: '/devops', internalPath: '/consulting/devops', access: 'public' },
  { id: 'consulting-front-end', publicPath: '/front-end', internalPath: '/consulting/front-end', access: 'public' },
  { id: 'consulting-groupies', publicPath: '/groupies', internalPath: '/consulting/groupies', access: 'authenticated' },
  { id: 'consulting-home-explicit', publicPath: '/home', internalPath: '/consulting/home', access: 'public' },
  { id: 'consulting-invoices', publicPath: '/invoices', internalPath: '/consulting/invoices', access: 'authenticated' },
  { id: 'consulting-invoice', publicPath: '/invoices/[id]', internalPath: '/consulting/invoices/[id]', access: 'authenticated' },
  { id: 'consulting-licenses', publicPath: '/licenses', internalPath: '/consulting/licenses', access: 'authenticated' },
  { id: 'consulting-login', publicPath: '/login', internalPath: '/consulting/login', access: 'public' },
  { id: 'consulting-partner', publicPath: '/partners/[partnerName]', internalPath: '/consulting/partners/[partnerName]', access: 'authenticated' },
  { id: 'consulting-product-redirect', publicPath: '/products/[product-slug]', internalPath: '/consulting/products/[product-slug]', access: 'admin' },
  { id: 'consulting-products-redirect', publicPath: '/products', internalPath: '/consulting/products', access: 'admin' },
  { id: 'consulting-settings', publicPath: '/settings', internalPath: '/consulting/settings', access: 'authenticated' },
  { id: 'consulting-users', publicPath: '/users', internalPath: '/consulting/users', access: 'authenticated' },
];

function getFirstPathSegment(pathname) {
  return pathname.replace(/^\/+/, '').split('/')[0] || '';
}

export const CONSULTING_APP_SEGMENTS = Array.from(
  new Set(CONSULTING_ROUTE_MANIFEST.map((route) => getFirstPathSegment(route.publicPath))),
);

export function isStokedUiProductId(productId) {
  return STOKED_UI_PRODUCT_IDS.includes(productId);
}

export function isConsultingPublicProductId(productId) {
  return CONSULTING_PUBLIC_PRODUCT_IDS.includes(productId);
}

export function buildCanonicalProductPath(productId) {
  return `/products/${productId}`;
}

export function buildCanonicalProductDocsPath(productId, slug = 'overview') {
  return `${buildCanonicalProductPath(productId)}/docs/${slug}`;
}

export function buildConsultingAdminProductsPath(productId) {
  const basePath = '/consulting/admin/products';
  return productId ? `${basePath}/${productId}` : basePath;
}

const legacyProductMatcher = STOKED_UI_PRODUCT_IDS.join('|').replace(/,/g, '|');

export const NEXT_ROUTE_REDIRECTS = [
  {
    source: '/stoked-ui/docs/getting-started/installation',
    destination: buildCanonicalProductDocsPath('stoked-ui', 'installation'),
  },
  {
    source: '/stoked-ui/docs/getting-started/usage',
    destination: buildCanonicalProductDocsPath('stoked-ui', 'usage'),
  },
  {
    source: '/stoked-ui/docs/getting-started/example-projects',
    destination: buildCanonicalProductDocsPath('stoked-ui', 'example-projects'),
  },
  {
    source: '/stoked-ui/docs/getting-started/file-explorer-customization',
    destination: buildCanonicalProductDocsPath('file-explorer', 'file-customization'),
  },
  {
    source: '/stoked-ui/docs/media-selector/file-with-path',
    destination: buildCanonicalProductDocsPath('media-selector', 'file-with-path'),
  },
  {
    source: '/media-selector/docs/id-generator',
    destination: buildCanonicalProductDocsPath('media-selector', 'usage'),
  },
  {
    source: '/file-explorer/docs/file-customizaton',
    destination: buildCanonicalProductDocsPath('file-explorer', 'file-customization'),
  },
  {
    source: '/file-explorer/docs/file-explorer/dropzone',
    destination: buildCanonicalProductDocsPath('file-explorer', 'file-explorer/dragzone'),
  },
  {
    source: '/file-explorer/api/timeline',
    destination: '/products/timeline/api/timeline',
  },
  {
    source: '/file-explorer/api/timeline-action',
    destination: '/products/timeline/api/timeline',
  },
  {
    source: '/file-explorer/api/timeline-effect',
    destination: '/products/timeline/api/timeline',
  },
  {
    source: '/file-explorer/api/timeline-engine',
    destination: '/products/timeline/api/timeline',
  },
  {
    source: '/file-explorer/api/timeline-row',
    destination: '/products/timeline/api/timeline',
  },
  {
    source: '/editor/api/editor',
    destination: '/products/editor/components/editor',
  },
  {
    source: '/core/api/editor',
    destination: '/products/editor/components/editor',
  },
  {
    source: '/core/api/file-explorer',
    destination: '/products/file-explorer/api/file-explorer',
  },
  {
    source: '/core/api/timeline',
    destination: '/products/timeline/api/timeline',
  },
  {
    source: `/:product(${legacyProductMatcher})`,
    destination: '/products/:product',
  },
  {
    source: `/:product(${legacyProductMatcher})/:rest*`,
    destination: '/products/:product/:rest*',
  },
];
