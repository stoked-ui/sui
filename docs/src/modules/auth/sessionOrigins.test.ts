import { expect } from 'chai';
import { getAllowedTransferOrigins, isAllowedTransferOrigin } from './transferOrigins';

const OWNED_PRODUCTION_ORIGINS = [
  'https://sui.stokd.cloud',
  'https://www.sui.stokd.cloud',
  'https://stoked-ui.com',
  'https://www.stoked-ui.com',
  'https://consulting.stokd.cloud',
  'https://www.consulting.stokd.cloud',
  'https://stokedconsulting.com',
  'https://www.stokedconsulting.com',
  'https://cdn.stokd.cloud',
  'https://cdn-sui.stokd.cloud',
  'https://cdn.consulting.stokd.cloud',
  'https://cdn.stokedconsulting.com',
  'https://cdn-sui.stokedconsulting.com',
];

describe('auth transfer production origins', () => {
  it('includes every owned public site and CDN origin by default', () => {
    const previousOrigins = process.env.AUTH_PUBLIC_ORIGINS;
    delete process.env.AUTH_PUBLIC_ORIGINS;

    try {
      const allowedOrigins = getAllowedTransferOrigins();
      const missingOrigins = OWNED_PRODUCTION_ORIGINS.filter(
        (origin) => !allowedOrigins.has(origin),
      );

      expect(missingOrigins).to.deep.equal([]);
      expect(OWNED_PRODUCTION_ORIGINS.every(isAllowedTransferOrigin)).to.equal(true);
      expect(isAllowedTransferOrigin('https://brianstoker.com')).to.equal(false);
      expect(isAllowedTransferOrigin('https://www.brianstoker.com')).to.equal(false);
    } finally {
      if (previousOrigins === undefined) {
        delete process.env.AUTH_PUBLIC_ORIGINS;
      } else {
        process.env.AUTH_PUBLIC_ORIGINS = previousOrigins;
      }
    }
  });

  it('rejects an unknown production origin', () => {
    expect(isAllowedTransferOrigin('https://unknown.example.com')).to.equal(false);
  });
});
