import PageContext from 'docs/src/modules/components/PageContext';
import { ALL_PRODUCTS } from 'docs/src/products';

export default function MuiProductSelector() {
  return ALL_PRODUCTS.productSelector(PageContext);
}
