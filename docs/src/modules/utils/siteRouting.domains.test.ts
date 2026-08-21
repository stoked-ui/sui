import { expect } from 'chai';
import { toAbsoluteSitePath } from './siteRouting';

function withRuntimeOrigin(origin: string, fn: () => void) {
  const windowDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'window');

  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: { location: new URL(origin) },
  });

  try {
    fn();
  } finally {
    if (windowDescriptor) {
      Object.defineProperty(globalThis, 'window', windowDescriptor);
    } else {
      delete (globalThis as { window?: unknown }).window;
    }
  }
}

describe('public site hostname routing', () => {
  it('cross-links within the canonical cloud family', () => {
    withRuntimeOrigin('https://sui.stokd.cloud', () => {
      expect(toAbsoluteSitePath('consulting', '/consulting/clients/xferall')).to.equal(
        'https://consulting.stokd.cloud/clients/xferall',
      );
    });

    withRuntimeOrigin('https://consulting.stokd.cloud', () => {
      expect(toAbsoluteSitePath('stoked-ui', '/products/editor')).to.equal(
        'https://sui.stokd.cloud/products/editor',
      );
    });
  });

  for (const hostname of ['stokedconsulting.com', 'www.stokedconsulting.com']) {
    it(`keeps consulting routes public and same-origin on ${hostname}`, () => {
      withRuntimeOrigin(`https://${hostname}`, () => {
        expect(toAbsoluteSitePath('consulting', '/consulting/clients/xferall')).to.equal(
          '/clients/xferall',
        );
        expect(toAbsoluteSitePath('stoked-ui', '/products/editor')).to.equal(
          'https://stoked-ui.com/products/editor',
        );
      });
    });
  }

  for (const hostname of ['stoked-ui.com', 'www.stoked-ui.com']) {
    it(`keeps Stoked UI routes same-origin and consulting routes public on ${hostname}`, () => {
      withRuntimeOrigin(`https://${hostname}`, () => {
        expect(toAbsoluteSitePath('stoked-ui', '/products/editor')).to.equal('/products/editor');
        expect(toAbsoluteSitePath('consulting', '/consulting/clients/xferall')).to.equal(
          'https://stokedconsulting.com/clients/xferall',
        );
      });
    });
  }
});
