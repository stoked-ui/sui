/// <reference types="mocha" />

import { expect } from 'chai';
import fs from 'fs';
import path from 'path';
import * as domainConfig from './domains';

const { getDomains } = domainConfig;

const packageJson = JSON.parse(
  fs.readFileSync(path.resolve(process.cwd(), 'package.json'), 'utf8'),
) as { scripts: Record<string, string> };
const deployWorkflow = fs.readFileSync(
  path.resolve(process.cwd(), '.github/workflows/deploy-site.yml'),
  'utf8',
);
const cdnSiteSource = fs.readFileSync(path.resolve(process.cwd(), 'infra/cdn-site.ts'), 'utf8');

const PUBLIC_SITE_ROOTS = {
  stokedUi: ['sui.stokd.cloud', 'stoked-ui.com'],
  consulting: ['consulting.stokd.cloud', 'stokedconsulting.com'],
} as const;

function configuredRootDomains(script: string) {
  const match = script.match(/(?:^|\s)ROOT_DOMAIN=([^\s]+)/);
  return new Set((match?.[1] || '').split(',').filter(Boolean));
}

function workflowRootDomains(workflow: string) {
  return [...workflow.matchAll(/^\s+ROOT_DOMAIN:\s*([^\s#]+)\s*$/gm)].map(
    (match) => new Set(match[1].split(',').filter(Boolean)),
  );
}

describe('production public domain configuration', () => {
  it('resolves production to the complete manifest despite a stale partial override', () => {
    const resolveRootDomains = (
      domainConfig as typeof domainConfig & {
        resolveRootDomains?: (configured: string | undefined, stage: string) => string;
      }
    ).resolveRootDomains;

    expect(resolveRootDomains).to.be.a('function');
    expect(resolveRootDomains?.('sui.stokd.cloud,consulting.stokd.cloud', 'production')).to.equal(
      'sui.stokd.cloud,stoked-ui.com,consulting.stokd.cloud,stokedconsulting.com',
    );
    expect(resolveRootDomains?.('custom.example.com', 'preview')).to.equal('custom.example.com');
  });

  it('deploys both canonical and vanity domains for each public site in one production deploy', () => {
    const roots = configuredRootDomains(packageJson.scripts['deploy:prod']);
    const requiredRoots = [...PUBLIC_SITE_ROOTS.stokedUi, ...PUBLIC_SITE_ROOTS.consulting];

    expect(requiredRoots.filter((domain) => !roots.has(domain))).to.deep.equal([]);
    expect(roots.size).to.equal(4);
  });

  it('uses the same four production roots in every deploy workflow assignment', () => {
    const requiredRoots = [...PUBLIC_SITE_ROOTS.stokedUi, ...PUBLIC_SITE_ROOTS.consulting];
    const assignments = workflowRootDomains(deployWorkflow);

    expect(assignments.length).to.be.greaterThan(0);
    for (const roots of assignments) {
      expect(requiredRoots.filter((domain) => !roots.has(domain))).to.deep.equal([]);
      expect(roots.size).to.equal(4);
    }
  });

  it('gives every production root its apex and www hostname', () => {
    const roots = [...PUBLIC_SITE_ROOTS.stokedUi, ...PUBLIC_SITE_ROOTS.consulting];

    expect(roots.flatMap((root) => getDomains(root, 'production'))).to.deep.equal([
      'sui.stokd.cloud',
      'www.sui.stokd.cloud',
      'stoked-ui.com',
      'www.stoked-ui.com',
      'consulting.stokd.cloud',
      'www.consulting.stokd.cloud',
      'stokedconsulting.com',
      'www.stokedconsulting.com',
    ]);
  });

  it('keeps staged vanity domains beneath their registrable apex', () => {
    expect(getDomains('stoked-ui.com', 'stage')).to.deep.equal([
      'stage.stoked-ui.com',
      '*.stage.stoked-ui.com',
    ]);
    expect(getDomains('stokedconsulting.com', 'stage')).to.deep.equal([
      'stage.stokedconsulting.com',
      '*.stage.stokedconsulting.com',
    ]);
  });
});

describe('unified CDN domain configuration', () => {
  it('attaches each active vanity CDN hostname to its canonical site resource', () => {
    const roots = domainConfig.PRODUCTION_ROOT_DOMAIN;
    const cdn = domainConfig.getCdnDomainInfo(roots, 'production') as domainConfig.CdnDomainInfo & {
      aliases?: string[];
    };
    const cdnSui = domainConfig.getCdnSuiDomainInfo(
      roots,
      'production',
    ) as domainConfig.CdnDomainInfo & {
      aliases?: string[];
    };

    expect(cdn.domain).to.equal('cdn.stokd.cloud');
    expect(cdn.aliases).to.deep.equal(['cdn.stokedconsulting.com']);
    expect(cdnSui.domain).to.equal('cdn-sui.stokd.cloud');
    expect(cdnSui.aliases).to.deep.equal(['cdn-sui.stokedconsulting.com']);
  });

  it('keeps staged CDN vanity aliases beneath the registrable apex', () => {
    const roots = domainConfig.PRODUCTION_ROOT_DOMAIN;
    const cdn = domainConfig.getCdnDomainInfo(roots, 'stage') as domainConfig.CdnDomainInfo & {
      aliases?: string[];
    };
    const cdnSui = domainConfig.getCdnSuiDomainInfo(
      roots,
      'stage',
    ) as domainConfig.CdnDomainInfo & {
      aliases?: string[];
    };

    expect(cdn.aliases).to.deep.equal(['cdn.stage.stokedconsulting.com']);
    expect(cdnSui.aliases).to.deep.equal(['cdn-sui.stage.stokedconsulting.com']);
  });

  it('covers aliases in certificates and lets SST resolve each Route53 zone', () => {
    expect(cdnSiteSource.match(/aliases:\s*domainInfo\.aliases/g)?.length).to.be.greaterThan(1);
    expect(
      cdnSiteSource.match(/findExistingCert\(\[domainInfo\.domain, \.\.\.domainInfo\.aliases\]/g)
        ?.length,
    ).to.be.greaterThan(1);
    expect(
      cdnSiteSource.match(/dns:\s*sst\.aws\.dns\(\{ override: true \}\)/g)?.length,
    ).to.be.greaterThan(1);
  });
});
