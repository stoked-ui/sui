import { expect } from 'chai';
import {
  isAllowedDeliverableOrigin,
} from './allowedOrigins';

function withEnv(overrides: Record<string, string | undefined>, fn: () => void) {
  const saved: Record<string, string | undefined> = {};
  for (const key of Object.keys(overrides)) {
    saved[key] = process.env[key];
    if (overrides[key] === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = overrides[key];
    }
  }
  try {
    fn();
  } finally {
    for (const key of Object.keys(saved)) {
      if (saved[key] === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = saved[key];
      }
    }
  }
}

describe('deliverables allowedOrigins', () => {
  it('allows the configured DELIVERABLES_CDN_BASE_URL origin', () => {
    withEnv(
      {
        DELIVERABLES_CDN_BASE_URL: 'https://cdn.stokd.cloud',
        NODE_ENV: 'production',
        DELIVERABLES_ALLOWED_ORIGINS: undefined,
      },
      () => {
        expect(isAllowedDeliverableOrigin('https://cdn.stokd.cloud')).to.equal(true);
      },
    );
  });

  it('allows the legacy cdn.consulting.stokd.cloud origin', () => {
    withEnv(
      {
        DELIVERABLES_CDN_BASE_URL: 'https://cdn.stokd.cloud',
        NODE_ENV: 'production',
        DELIVERABLES_ALLOWED_ORIGINS: undefined,
      },
      () => {
        expect(isAllowedDeliverableOrigin('https://cdn.consulting.stokd.cloud')).to.equal(true);
      },
    );
  });

  it('rejects unknown origins in production', () => {
    withEnv(
      {
        DELIVERABLES_CDN_BASE_URL: 'https://cdn.stokd.cloud',
        NODE_ENV: 'production',
        DELIVERABLES_ALLOWED_ORIGINS: undefined,
      },
      () => {
        expect(isAllowedDeliverableOrigin('https://evil.example.com')).to.equal(false);
      },
    );
  });

  it('rejects localhost origins in production', () => {
    withEnv(
      {
        DELIVERABLES_CDN_BASE_URL: 'https://cdn.stokd.cloud',
        NODE_ENV: 'production',
        DELIVERABLES_ALLOWED_ORIGINS: undefined,
      },
      () => {
        expect(isAllowedDeliverableOrigin('http://localhost:5199')).to.equal(false);
      },
    );
  });

  it('allows localhost origins outside production', () => {
    withEnv(
      {
        DELIVERABLES_CDN_BASE_URL: 'https://cdn.stokd.cloud',
        NODE_ENV: 'development',
        DELIVERABLES_ALLOWED_ORIGINS: undefined,
      },
      () => {
        expect(isAllowedDeliverableOrigin('http://localhost:5199')).to.equal(true);
        expect(isAllowedDeliverableOrigin('http://127.0.0.1:3000')).to.equal(true);
      },
    );
  });

  it('honors DELIVERABLES_ALLOWED_ORIGINS as a comma-separated allowlist', () => {
    withEnv(
      {
        DELIVERABLES_CDN_BASE_URL: 'https://cdn.stokd.cloud',
        NODE_ENV: 'production',
        DELIVERABLES_ALLOWED_ORIGINS:
          'https://extra.example.com, https://another.example.com/with/path , not-a-url',
      },
      () => {
        expect(isAllowedDeliverableOrigin('https://extra.example.com')).to.equal(true);
        expect(isAllowedDeliverableOrigin('https://another.example.com')).to.equal(true);
        expect(isAllowedDeliverableOrigin('https://unlisted.example.com')).to.equal(false);
      },
    );
  });
});
