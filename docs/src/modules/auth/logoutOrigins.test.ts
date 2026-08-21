/// <reference types="mocha" />

import { expect } from 'chai';
import fs from 'fs';
import path from 'path';
import * as logoutOrigins from './logoutOrigins';

type LogoutOriginsModule = {
  MANAGED_LOGOUT_ORIGINS: readonly string[];
  MAX_LOGOUT_URL_LENGTH: number;
  getLogoutOriginChain: (currentOrigin: string) => string[];
  parseLogoutOriginChain: (
    currentOrigin: string,
    rawValue: string | string[] | undefined,
  ) => string[];
  buildLogoutCascadeUrl: (
    targetOrigin: string,
    returnTo: string,
    remainingOrigins: readonly string[],
  ) => string;
};

const helperPath = path.resolve(process.cwd(), 'docs/src/modules/auth/logoutOrigins.ts');

describe('managed logout origin cascade', () => {
  const helper = logoutOrigins as LogoutOriginsModule;

  before(() => {
    expect(
      fs.existsSync(helperPath),
      'logoutOrigins.ts must define the pure cascade policy',
    ).to.equal(true);
  });

  it('uses only auth-capable apex and CDN UI origins', () => {
    expect(helper.MANAGED_LOGOUT_ORIGINS).to.deep.equal([
      'https://sui.stokd.cloud',
      'https://stoked-ui.com',
      'https://consulting.stokd.cloud',
      'https://stokedconsulting.com',
      'https://cdn.stokd.cloud',
      'https://cdn-sui.stokd.cloud',
      'https://cdn.stokedconsulting.com',
      'https://cdn-sui.stokedconsulting.com',
    ]);
    expect(helper.MANAGED_LOGOUT_ORIGINS.some((origin) => origin.includes('://www.'))).to.equal(
      false,
    );
  });

  it('visits every other managed origin exactly once', () => {
    const currentOrigin = 'https://stokedconsulting.com';
    const chain = helper.getLogoutOriginChain(currentOrigin);

    expect(chain).not.to.include(currentOrigin);
    expect(new Set(chain).size).to.equal(chain.length);
    expect(chain).to.have.members(
      helper.MANAGED_LOGOUT_ORIGINS.filter((origin) => origin !== currentOrigin),
    );
  });

  it('rejects unknown, duplicate, and current-origin hops', () => {
    expect(() =>
      helper.parseLogoutOriginChain('https://sui.stokd.cloud', 'https://unknown.example.com'),
    ).to.throw('managed');
    expect(() =>
      helper.parseLogoutOriginChain(
        'https://sui.stokd.cloud',
        'https://stoked-ui.com,https://stoked-ui.com',
      ),
    ).to.throw('duplicate');
    expect(() =>
      helper.parseLogoutOriginChain('https://sui.stokd.cloud', 'https://sui.stokd.cloud'),
    ).to.throw('current');
  });

  it('preserves the final returnTo while keeping every hop URL bounded', () => {
    const firstOrigin = 'https://stoked-ui.com';
    const returnTo = 'https://stoked-ui.com/products/editor?tab=license';
    let currentOrigin = firstOrigin;
    let remaining = helper.getLogoutOriginChain(firstOrigin);

    for (;;) {
      const url = new URL(helper.buildLogoutCascadeUrl(currentOrigin, returnTo, remaining));
      expect(url.origin).to.equal(currentOrigin);
      expect(url.searchParams.get('returnTo')).to.equal(returnTo);
      expect(url.toString().length).to.be.lessThanOrEqual(helper.MAX_LOGOUT_URL_LENGTH);

      const parsed = helper.parseLogoutOriginChain(
        currentOrigin,
        url.searchParams.get('nextOrigins') ?? undefined,
      );
      if (parsed.length === 0) {
        break;
      }
      currentOrigin = parsed[0];
      remaining = parsed.slice(1);
    }
  });

  it('wires the cascade helper into the header and logout API', () => {
    const headerSource = fs.readFileSync(
      path.resolve(process.cwd(), 'docs/src/layouts/AppHeader.tsx'),
      'utf8',
    );
    const handlerSource = fs.readFileSync(
      path.resolve(process.cwd(), 'docs/pages/api/auth/logout.ts'),
      'utf8',
    );

    expect(headerSource).to.contain('getLogoutOriginChain');
    expect(headerSource).to.contain('buildLogoutCascadeUrl');
    expect(handlerSource).to.contain('parseLogoutOriginChain');
    expect(handlerSource).to.contain('buildLogoutCascadeUrl');
  });
});
