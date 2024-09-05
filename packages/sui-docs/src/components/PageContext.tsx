import * as React from 'react';
import type SuiPage from '@stoked-ui/docs/SuiPage';
import type { SuiProductId } from '../utils/getProductInfoFromUrl';

const PageContext = React.createContext<{
  activePage: SuiPage | null;
  pages: SuiPage[];
  productId: SuiProductId;
}>(undefined!);

if (process.env.NODE_ENV !== 'production') {
  PageContext.displayName = 'PageContext';
}

export default PageContext;
