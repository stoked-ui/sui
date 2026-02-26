/**
 * Maps product IDs and category IDs to human-readable product names.
 */

const productNameProductId: Record<string, string> = {
  media: 'Media',
  'file-explorer': 'File Explorer',
  timeline: 'Timeline',
  editor: 'Editor',
  flux: 'Flux',
  blog: 'Blog',
  consulting: 'Consulting',
  x: 'SUI X',
  system: 'SUI System',
  toolpad: 'Toolpad',
  'toolpad-studio': 'Toolpad Studio',
  'toolpad-core': 'Toolpad Core',
};

export interface ProductInfo {
  productId?: string;
  productCategoryId?: string;
}

export function convertProductIdToName(productInfo: ProductInfo): string | undefined {
  return (
    productNameProductId[productInfo.productId ?? ''] ||
    productNameProductId[productInfo.productCategoryId ?? '']
  );
}
