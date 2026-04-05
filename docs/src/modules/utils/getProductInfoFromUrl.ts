import { pathnameToLanguage } from 'docs/src/modules/utils/helpers';
import {
  CONSULTING_PUBLIC_PRODUCT_IDS,
  STOKED_UI_PRODUCT_IDS,
} from './siteRouteManifest';

export type MuiProductId =
  | 'null'
  | 'base-ui'
  | 'material-ui'
  | 'joy-ui'
  | 'system'
  | 'docs-infra'
  | 'docs'
  | 'x-data-grid'
  | 'x-date-pickers'
  | 'x-charts'
  | 'x-tree-view'
  | 'toolpad-studio'
  | 'toolpad-core'
  | 'stoked-ui'
  | 'file-explorer'
  | 'media'
  | 'common'
  | 'media-api'
  | 'media-selector'
  | 'timeline'
  | 'editor'
  | 'github'
  | 'video-renderer'
  | 'flux'
  | 'focus-capture'
  | 'mac-mixer'
  | 'always-listening'
  | 'stokd-cloud'
  | 'versions';

type MuiProductCategoryId = 'toolpad' | 'null' | 'core' | 'x';

interface MuiProductInfo {
  productId: MuiProductId;
  productCategoryId: MuiProductCategoryId;
}

// This is a fallback logic to define the productId and productCategoryId of the page.
// Markdown pages can override this value when the URL patterns they follow are a bit strange,
// which should stay the rare exception.
export default function getProductInfoFromUrl(asPath: string): MuiProductInfo {
  const asPathWithoutLang = pathnameToLanguage(asPath).canonicalAsServer;
  const firstFolder = asPathWithoutLang.replace(/^\/+([^/]+)\/.*/, '$1');
  const productMatch = asPathWithoutLang.match(/^\/(?:consulting\/)?products\/([^/?#]+)/);
  const productIdFromProductsRoute = productMatch?.[1];
  const stokedUiProductIds = new Set(STOKED_UI_PRODUCT_IDS);
  const consultingProductIds = new Set(CONSULTING_PUBLIC_PRODUCT_IDS);
  // When serialized undefined/null are the same, so we encode null as 'null' to be
  // able to differentiate when the value isn't set vs. set to the right null value.
  let productCategoryId = 'null';
  let productId = 'null';

  if (
    productIdFromProductsRoute
    && (stokedUiProductIds.has(productIdFromProductsRoute) || consultingProductIds.has(productIdFromProductsRoute))
  ) {
    productCategoryId = 'core';
    productId = productIdFromProductsRoute;
  }

  if (['stoked-ui', 'file-explorer', 'media', 'media-api', 'timeline', 'editor', 'core', 'github', 'common', 'video-renderer', 'video-validator', 'flux', 'versions'].indexOf(firstFolder) !== -1) {
    productCategoryId = 'core';
    productId = firstFolder;
  }

  if (firstFolder === 'docs') {
    productId = firstFolder;
  }

  // TODO remove, legacy
  if (firstFolder === 'versions' || firstFolder === 'production-error') {
    productId = 'docs';
  }

  if (asPathWithoutLang.startsWith('/experiments/docs/')) {
    productId = 'docs-infra';
  }

  if (productIdFromProductsRoute && consultingProductIds.has(productIdFromProductsRoute)) {
    productCategoryId = 'core';
    productId = productIdFromProductsRoute;
  }

  return {
    productCategoryId,
    productId,
  } as MuiProductInfo;
}
