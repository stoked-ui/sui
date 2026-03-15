import { expect } from 'chai';
import { buildDeliverableCdnKey, buildDeliverableCdnUrl } from './cdnStorage';

describe('deliverables cdnStorage', () => {
  it('builds the CDN object key under the client deliverables prefix', () => {
    const key = buildDeliverableCdnKey({
      clientSlug: 'xferall',
      bundleName: 'xferall-platform-engineering-2026-q1',
      filePath: 'index_files/app.js',
    });

    expect(key).to.equal(
      'clients/xferall/deliverables/xferall-platform-engineering-2026-q1/index_files/app.js',
    );
  });

  it('normalizes values before building the CDN URL', () => {
    const url = buildDeliverableCdnUrl({
      clientSlug: 'Xferall Consulting',
      bundleName: 'xferall platform engineering 2026 q1',
      filePath: 'index.html',
    });

    expect(url).to.equal(
      'https://cdn.stokedconsulting.com/clients/xferall-consulting/deliverables/xferall-platform-engineering-2026-q1/index.html',
    );
  });
});
