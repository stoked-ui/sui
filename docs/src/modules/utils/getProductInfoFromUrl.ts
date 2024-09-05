import fs from 'fs';
import { pathnameToLanguage } from 'docs/src/modules/utils/helpers';
import { TProduct } from "@stoked-ui/docs";

const SuiProductIds = [
  'null',
  'media-selector',
  'file-selector',
  'timeline',
  'editor',
  'docs',
];

export const pkgProducts = SuiProductIds.filter(id => id !== 'null').reduce((acc, productId) => {
  const pkg = JSON.parse(fs.readFileSync(`packages/sui-${productId}/package.json`, 'utf8'));
  acc[productId] = pkg?.product ?? {};
  return acc;
}, {} as Record<string, TProduct>);

export type SuiProductId = typeof SuiProductIds[number];

type SuiProductCategoryId = 'null' | 'core' | 'utility';

interface SuiProductInfo {
  productId: SuiProductId;
  productCategoryId: SuiProductCategoryId;
  product?: TProduct
}

// This is a fallback logic to define the productId and productCategoryId of the page.
// Markdown pages can override this value when the URL patterns they follow are a bit strange,
// which should stay the rare exception.
export default function getProductInfoFromUrl(asPath: string): SuiProductInfo {
  const asPathWithoutLang = pathnameToLanguage(asPath).canonicalAsServer;
  const firstFolder = asPathWithoutLang.replace(/^\/+([^/]+)\/.*/, '$1');

  // eslint-disable-next-line global-require
  const product = pkgProducts[firstFolder];
  product.metadata = 'Stoked UI';

  // When serialized undefined/null are the same, so we encode null as 'null' to be
  // able to differentiate when the value isn't set vs. set to the right null value.
  let productCategoryId = 'null';
  let productId = 'null';

  if (['stoked-ui', 'file-explorer', 'media-selector', 'timeline', 'editor', ].indexOf(firstFolder) !== -1) {
    productCategoryId = 'core';
    productId = firstFolder;
  }

  if (['versions', 'production-error', 'docs', '/experiments/docs/' ].indexOf(firstFolder) !== -1) {
    productCategoryId = 'utility';
    productId = firstFolder;
    product.metadata = 'Docs';
  }

  if (asPathWithoutLang.startsWith('/experiments/docs/')) {
    productCategoryId = 'utility';
    productId = 'docs';
    product.metadata = 'Docs';
  }

  return {
    productCategoryId,
    productId,
    product,
  } as SuiProductInfo;
}
