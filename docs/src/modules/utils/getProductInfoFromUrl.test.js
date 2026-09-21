import { expect } from 'chai';
import getProductInfoFromUrl from './getProductInfoFromUrl';

describe('getProductInfoFromUrl', () => {
  it('handles canonical stoked-ui product routes', () => {
    expect(getProductInfoFromUrl('/products/stoked-ui/docs/overview/')).to.deep.equal({
      productCategoryId: 'core',
      productId: 'stoked-ui',
    });
    expect(getProductInfoFromUrl('/products/file-explorer/docs/overview/')).to.deep.equal({
      productCategoryId: 'core',
      productId: 'file-explorer',
    });
    expect(getProductInfoFromUrl('/products/editor/components/editor/')).to.deep.equal({
      productCategoryId: 'core',
      productId: 'editor',
    });
  });

  it('handles consulting product routes', () => {
    expect(getProductInfoFromUrl('/products/flux/docs/overview/')).to.deep.equal({
      productCategoryId: 'core',
      productId: 'flux',
    });
    expect(getProductInfoFromUrl('/consulting/products/focus-capture/docs/overview/')).to.deep.equal({
      productCategoryId: 'core',
      productId: 'focus-capture',
    });
    expect(getProductInfoFromUrl('/products/selfactor/')).to.deep.equal({
      productCategoryId: 'core',
      productId: 'selfactor',
    });
    expect(getProductInfoFromUrl('/products/stokd-cloud/')).to.deep.equal({
      productCategoryId: 'core',
      productId: 'stokd-cloud',
    });
    expect(getProductInfoFromUrl('/products/stokd-mixer/')).to.deep.equal({
      productCategoryId: 'core',
      productId: 'stokd-mixer',
    });
    expect(getProductInfoFromUrl('/consulting/products/mac-mixer/')).to.deep.equal({
      productCategoryId: 'core',
      productId: 'mac-mixer',
    });
    expect(getProductInfoFromUrl('/products/sgit/')).to.deep.equal({
      productCategoryId: 'core',
      productId: 'sgit',
    });
    expect(getProductInfoFromUrl('/products/gdock/')).to.deep.equal({
      productCategoryId: 'core',
      productId: 'gdock',
    });
    expect(getProductInfoFromUrl('/consulting/products/status/')).to.deep.equal({
      productCategoryId: 'core',
      productId: 'status',
    });
  });

  it('keeps legacy short product routes identifiable', () => {
    expect(getProductInfoFromUrl('/file-explorer/docs/overview/')).to.deep.equal({
      productCategoryId: 'core',
      productId: 'file-explorer',
    });
    expect(getProductInfoFromUrl('/github/docs/overview/')).to.deep.equal({
      productCategoryId: 'core',
      productId: 'github',
    });
  });

  it('removes language prefixes and hashes', () => {
    expect(getProductInfoFromUrl('/zh/products/timeline/docs/overview/#api')).to.deep.equal({
      productCategoryId: 'core',
      productId: 'timeline',
    });
  });

  it('returns uncategorized for non-product routes', () => {
    expect(getProductInfoFromUrl('/')).to.deep.equal({
      productCategoryId: 'null',
      productId: 'null',
    });
    expect(getProductInfoFromUrl('/products/feedback/')).to.deep.equal({
      productCategoryId: 'null',
      productId: 'null',
    });
  });
});
