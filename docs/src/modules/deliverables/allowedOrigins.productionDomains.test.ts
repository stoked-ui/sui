import { expect } from 'chai';
import { isAllowedDeliverableOrigin } from './allowedOrigins';

function withProductionOverrides(fn: () => void) {
  const overrides = {
    NODE_ENV: 'production',
    DELIVERABLES_CDN_BASE_URL: 'https://assets.example.com/deliverables',
    CDN_PUBLIC_BASE_URL: 'https://other-assets.example.com',
    BLOG_IMAGE_CDN_URL: 'https://blog-assets.example.com',
    DELIVERABLES_ALLOWED_ORIGINS: 'https://extra.example.com',
  };
  const previous = Object.fromEntries(Object.keys(overrides).map((key) => [key, process.env[key]]));

  Object.assign(process.env, overrides);

  try {
    fn();
  } finally {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  }
}

describe('deliverable production domains', () => {
  it('always allows both owned deliverable CDN origins despite environment overrides', () => {
    withProductionOverrides(() => {
      const ownedOrigins = [
        'https://cdn.stokd.cloud',
        'https://cdn.stokedconsulting.com',
        'https://cdn-sui.stokedconsulting.com',
      ];

      expect(ownedOrigins.filter((origin) => !isAllowedDeliverableOrigin(origin))).to.deep.equal(
        [],
      );
    });
  });

  it('still rejects an unknown origin when overrides are present', () => {
    withProductionOverrides(() => {
      expect(isAllowedDeliverableOrigin('https://unknown.example.com')).to.equal(false);
    });
  });
});
