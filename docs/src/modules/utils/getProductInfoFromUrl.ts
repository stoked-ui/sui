import { pathnameToLanguage } from 'docs/src/modules/utils/helpers';

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
  | 'toolpad-core';

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

  // When serialized undefined/null are the same, so we encode null as 'null' to be
  // able to differentiate when the value isn't set vs. set to the right null value.
  let productCategoryId = 'null';
  let productId = 'null';

  if (['stoked-ui', 'file-explorer', 'media-selector'].indexOf(firstFolder) !== -1) {
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

  return {
    productCategoryId,
    productId,
  } as MuiProductInfo;
}
