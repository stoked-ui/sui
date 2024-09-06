import * as React from 'react';
import type SuiPage from '../SuiPage';
import type { ProductId } from '../Products';
import Products from '../Products';

const PageContext = React.createContext<{
  activePage: SuiPage | null;
  pages: SuiPage[];
  productId: ProductId;
  productIdentifier: any;
  activePageParents: any;
  productCategoryId?: any;
  routes: Record<string, string>;
  products: Products;
  languages: string[];
  Logomark: React.JSX.ElementType;
  featureToggle: Record<string, boolean>;
}>(undefined!);

if (process.env.NODE_ENV !== 'production') {
  PageContext.displayName = 'PageContext';
}

export default PageContext;
