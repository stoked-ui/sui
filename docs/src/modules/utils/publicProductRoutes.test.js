import fs from 'fs';
import path from 'path';
import { expect } from 'chai';
import { CONSULTING_ROUTE_MANIFEST } from './siteRouteManifest';

function readRepoFile(relativePath) {
  return fs.readFileSync(path.resolve(process.cwd(), relativePath), 'utf8');
}

function manifestRoute(publicPath) {
  return CONSULTING_ROUTE_MANIFEST.find((route) => route.publicPath === publicPath);
}

describe('public product routes', () => {
  it('marks consulting /products routes public', () => {
    expect(manifestRoute('/products')).to.include({ access: 'public' });
    expect(manifestRoute('/products/[product-slug]')).to.include({ access: 'public' });
  });

  it('keeps admin product URLs on the admin gate', () => {
    expect(manifestRoute('/admin/products')).to.include({
      access: 'admin',
      internalPath: '/consulting/admin/products',
    });
    expect(manifestRoute('/admin/products/[product-slug]')).to.include({
      access: 'admin',
      internalPath: '/consulting/admin/products/[product-slug]',
    });

    const adminDetail = readRepoFile('docs/pages/admin/products/[product-slug].tsx');
    expect(adminDetail).to.include("user.role !== 'admin'");
    expect(adminDetail).to.include('/consulting/login');
  });

  it('serves flux and focus-capture from dedicated public pages', () => {
    const flux = readRepoFile('docs/pages/consulting/products/flux.tsx');
    const focusCapture = readRepoFile('docs/pages/consulting/products/focus-capture.tsx');

    expect(flux).to.include("docs/pages/products/flux/main");
    expect(focusCapture).to.include("docs/pages/products/focus-capture/main");
    expect(flux).to.not.match(/admin\/products|router\.replace/);
    expect(focusCapture).to.not.match(/admin\/products|router\.replace/);
  });

  it('does not send anonymous public product routes to admin', () => {
    const index = readRepoFile('docs/pages/consulting/products/index.tsx');
    const catchAll = readRepoFile('docs/pages/consulting/products/[product-slug].tsx');

    expect(index).to.include('ProductsOverview');
    expect(index).to.not.match(/admin\/products|router\.replace/);
    expect(catchAll).to.include('PublicProductDetailPage');
    expect(catchAll).to.not.match(/admin\/products|router\.replace/);
  });
});
