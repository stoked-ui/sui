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

describe('production host manifest contract', () => {
  it('requires a deterministic durable PRODUCTION_HOST_MANIFEST driving AWS alias/certificate/DNS validation', () => {
    // Contract: must export PRODUCTION_HOST_MANIFEST from infra/domains.ts
    const manifest = domainConfig.PRODUCTION_HOST_MANIFEST;

    // The manifest must exist and be an object
    expect(manifest).to.be.an('object');

    // SUI/consulting distribution groups
    expect(manifest).to.have.property('suiConsultingDistribution');
    const suiConsulting = manifest.suiConsultingDistribution;

    expect(suiConsulting).to.have.property('canonicalRoots');
    expect(suiConsulting.canonicalRoots).to.deep.equal(['sui.stokd.cloud', 'consulting.stokd.cloud']);

    expect(suiConsulting).to.have.property('vanityRoots');
    expect(suiConsulting.vanityRoots).to.deep.equal(['stoked-ui.com', 'stokedconsulting.com']);

    expect(suiConsulting).to.have.property('requiredHosts');
    expect(suiConsulting.requiredHosts).to.deep.equal([
      // Canonical hosts
      'sui.stokd.cloud',
      'www.sui.stokd.cloud',
      'consulting.stokd.cloud',
      'www.consulting.stokd.cloud',
      // Vanity hosts
      'stoked-ui.com',
      'www.stoked-ui.com',
      'stokedconsulting.com',
      'www.stokedconsulting.com',
    ]);

    // Brian distribution groups
    expect(manifest).to.have.property('brianDistribution');
    const brianDist = manifest.brianDistribution;

    expect(brianDist).to.have.property('canonicalRoots');
    expect(brianDist.canonicalRoots).to.deep.equal(['brian.stokd.cloud']);

    expect(brianDist).to.have.property('vanityRoots');
    expect(brianDist.vanityRoots).to.deep.equal(['brianstoker.com']);

    expect(brianDist).to.have.property('requiredHosts');
    expect(brianDist.requiredHosts).to.deep.equal([
      // Canonical hosts
      'brian.stokd.cloud',
      'www.brian.stokd.cloud',
      // Vanity hosts
      'brianstoker.com',
      'www.brianstoker.com',
    ]);

    // CDN distribution groups
    expect(manifest).to.have.property('cdnDistribution');
    const cdnDist = manifest.cdnDistribution;

    expect(cdnDist).to.have.property('canonicalRoots');
    expect(cdnDist.canonicalRoots).to.deep.equal(['cdn.stokd.cloud']);

    expect(cdnDist).to.have.property('vanityRoots');
    expect(cdnDist.vanityRoots).to.deep.equal(['cdn.stokedconsulting.com']);

    expect(cdnDist).to.have.property('requiredHosts');
    expect(cdnDist.requiredHosts).to.deep.equal([
      // Canonical hosts
      'cdn.stokd.cloud',
      // Vanity hosts
      'cdn.stokedconsulting.com',
    ]);

    // Manifest must be deterministic and explicit for AWS infrastructure
    expect(manifest).to.have.property('zoneMap');
    expect(manifest.zoneMap).to.be.an('object');

    // Zone validation for each root domain - deep equal to the four exact zone IDs
    expect(manifest.zoneMap).to.deep.equal({
      'stokd.cloud': 'Z0974146XEXJDMNXU573',
      'stoked-ui.com': 'Z09790842EOZDB68FABYC',
      'stokedconsulting.com': 'Z07577592PUM0SSTBY40Y',
      'brianstoker.com': 'Z0756608HJN0R288QOFI',
    });
  });
});
