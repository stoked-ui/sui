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

interface MuiProductInfo {
  productId: MuiProductId;
  productCategoryId: 'toolpad' | 'null' | 'core' | 'x';
}

export default function getProductInfoFromUrl(languages: string[], asPath: string): MuiProductInfo; 

