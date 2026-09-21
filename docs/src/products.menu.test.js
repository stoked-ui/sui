const React = require('react');
const Module = require('module');
const { expect } = require('chai');

const originalLoad = Module._load;
Module._load = function load(request, parent, isMain) {
  if (typeof request === 'string' && /(?:^|\/)next\/link$/.test(request)) {
    const NextLink = React.forwardRef(function NextLink(props, ref) {
      const { href, children, legacyBehavior } = props;
      const hrefValue = typeof href === 'string' ? href : undefined;
      if (legacyBehavior && React.isValidElement(children)) {
        return React.cloneElement(children, { href: hrefValue });
      }
      return React.createElement('a', { href: hrefValue, ref }, children);
    });
    return { __esModule: true, default: NextLink };
  }
  if (typeof request === 'string' && /Showcase/.test(request)) {
    return { __esModule: true, default() { return null; } };
  }
  return originalLoad.apply(this, arguments);
};

const { ThemeProvider } = require('@mui/material/styles');
const { createRenderer } = require('@stoked-ui/internal-test-utils');
const { RouterContext } = require('next/dist/shared/lib/router-context.shared-runtime');
const { DocsProvider } = require('@stoked-ui/docs');
const { brandingLightTheme } = require('../../packages/sui-docs/src/branding/brandingTheme');
const docsConfig = require('../../docs/config');
const { ProductMenu, useAllProducts } = require('docs/src/products');
const HeaderNavDropdown = require('docs/src/components/header/HeaderNavDropdown').default;

const router = {
  pathname: '/',
  route: '/',
  asPath: '/',
  query: {},
  basePath: '',
  push() { return Promise.resolve(true); },
  replace() { return Promise.resolve(true); },
  reload() {},
  back() {},
  forward() {},
  prefetch() { return Promise.resolve(); },
  beforePopState() {},
  events: { on() {}, off() {}, emit() {} },
  isFallback: false,
  isLocaleDomain: false,
  isReady: true,
  isPreview: false,
};

const OSS_IDS = ['sgit', 'gdock', 'status'];

function declarationsFor(element) {
  const classes = [...element.classList];
  const bodies = [];
  const collect = (rules) => {
    [...rules].forEach((rule) => {
      if (rule.cssRules) {
        collect(rule.cssRules);
      }
      const text = rule.cssText || '';
      if (classes.some((className) => text.includes(`.${className}`))) {
        bodies.push(text);
      }
    });
  };
  [...document.styleSheets].forEach((sheet) => {
    try {
      collect(sheet.cssRules);
    } catch (error) {
      bodies.push('');
    }
  });
  return bodies.join('\n');
}

function OpenProductsMenu() {
  const products = useAllProducts();
  const [anchor, setAnchor] = React.useState(null);
  const menuRef = React.useMemo(() => ({ current: anchor }), [anchor]);
  return React.createElement(
    React.Fragment,
    null,
    React.createElement('button', { ref: setAnchor, type: 'button' }, 'Products'),
    anchor
      ? React.createElement(ProductMenu, {
        type: 'products',
        subMenuOpen: 'products',
        products: products.live,
        menuRef,
      })
      : null,
  );
}

describe('ProductMenu', () => {
  const { render } = createRenderer({ strict: false });

  beforeEach(() => {
    global.fetch = () => new Promise(() => {});
  });

  function mount(node) {
    return render(React.createElement(
      RouterContext.Provider,
      { value: router },
      React.createElement(
        DocsProvider,
        { config: docsConfig, defaultUserLanguage: 'en' },
        React.createElement(ThemeProvider, { theme: brandingLightTheme }, node),
      ),
    ));
  }

  it('lays live public products into two equal columns, including sgit, gdock, and status', function testMenu() {
    this.timeout(20000);
    const view = mount(React.createElement(OpenProductsMenu));
    const list = document.querySelector('#products-popper ul[data-product-menu="products"]');
    expect(list).to.not.equal(null);
    expect(list.getAttribute('data-columns')).to.equal('2');

    const paper = list.parentElement;
    const paperCss = declarationsFor(paper);
    expect(paperCss).to.match(/grid-template-columns:\s*minmax\(0,\s*1fr\)\s+minmax\(0,\s*1fr\)/);
    expect(paperCss).to.match(/min-width:\s*900px/);
    expect(paperCss).to.match(/max-width:\s*760px/);
    expect(paperCss).to.not.match(/max-width:\s*360px/);

    OSS_IDS.forEach((productId) => {
      const link = view.getByRole('link', { name: new RegExp(productId) });
      expect(link.getAttribute('href') || '').to.match(new RegExp(`/products/${productId}/?$`));
      expect(link.getAttribute('href') || '').to.not.match(/admin/);
      expect(link.textContent || '').to.match(/Open source/);
      expect(list.contains(link)).to.equal(true);
    });
  });

  it('keeps HeaderNavDropdown products in one column with the same public links', function testMobile() {
    this.timeout(20000);
    const view = mount(React.createElement(HeaderNavDropdown, {}));
    const list = document.querySelector('ul[data-product-menu="products"][data-columns="1"]');
    expect(list).to.not.equal(null);
    const css = declarationsFor(list);
    expect(css).to.not.match(/grid-template-columns:\s*minmax\(0,\s*1fr\)\s+minmax\(0,\s*1fr\)/);

    OSS_IDS.forEach((productId) => {
      const link = list.querySelector(`a[href="/products/${productId}/"]`);
      expect(link, productId).to.not.equal(null);
      expect(link.getAttribute('href') || '').to.not.match(/admin/);
      expect(link.textContent || '').to.match(/Open source/);
      expect(link.textContent || '').to.match(new RegExp(productId));
    });
  });
});
