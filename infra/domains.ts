
const STOKD_CLOUD_ZONE_ID = 'Z0974146XEXJDMNXU573';

const ZONE_IDS: Record<string, string> = {
  'stokd.cloud': STOKD_CLOUD_ZONE_ID,
  'sui.stokd.cloud': STOKD_CLOUD_ZONE_ID,
  'consulting.stokd.cloud': STOKD_CLOUD_ZONE_ID,
};

export const getDomains = (rootDomain: string, stage: string) => {
  if (stage === 'production') {
    return [rootDomain, `www.${rootDomain}`];
  }
  const [service, ...baseParts] = rootDomain.split('.');
  const base = baseParts.join('.');
  const staged = base ? `${service}.${stage}.${base}` : `${stage}.${rootDomain}`;
  return [staged, `*.${staged}`];
}

export const getPrimaryDomain = (rootDomain: string, stage: string) => getDomains(rootDomain, stage)[0];

function getRootDomainParts(rootDomains: string) {
  return rootDomains
    .split(',')
    .map((domain) => domain.trim())
    .filter(Boolean);
}

export const getDomainInfo = (rootDomains: string, stage: string): DomainInfo => {
  const rootDomainParts = getRootDomainParts(rootDomains);
  let domains:any = rootDomainParts.map((domain) => getDomains(domain, stage)).flat();
  domains = domains.flat(Infinity);
  const appName = `${domains[0].replace(/\./g, '-')}`;
  const parts = domains[0].split('.');
  parts.pop();
  parts.push(stage);
  const dbName = parts.join('-');
  const apiDomain = `api.${domains[0]}`;
  const resourceName = `${domains[0].replace(/\./g, '')}StaticSite`;

  const primaryZoneId = ZONE_IDS[rootDomainParts[0]] ?? '';

  const retVal = { resourceName, apiDomain, appName, domains: $dev ? [process.env.LOCAL_DOMAIN!]: domains, dbName, primaryZoneId };
  // console.info('domainInfo', retVal);
  return retVal;
}

export const getCdnDomainInfo = (rootDomains: string, stage: string): CdnDomainInfo => {
  const rootDomainParts = getRootDomainParts(rootDomains);
  const consultingRootDomain = rootDomainParts.find((domain) => domain === 'consulting.stokd.cloud')
    ?? rootDomainParts[rootDomainParts.length - 1];
  const stokedUiRootDomain = rootDomainParts[0] ?? 'sui.stokd.cloud';
  const cdnRootDomain = rootDomainParts.find((domain) => domain === 'stokd.cloud') ?? 'stokd.cloud';
  const consultingDomain = getPrimaryDomain(consultingRootDomain, stage);
  const stokedUiDomain = getPrimaryDomain(stokedUiRootDomain, stage);
  const cdnBaseDomain = getPrimaryDomain(cdnRootDomain, stage);
  const domain = `cdn.${cdnBaseDomain}`;

  return {
    resourceName: `${domain.replace(/\./g, '')}StaticSite`,
    domain,
    primaryZoneId: ZONE_IDS[cdnRootDomain] ?? '',
    consultingOrigin: `https://${consultingDomain}`,
    stokedUiOrigin: `https://${stokedUiDomain}`,
  };
}

export interface DomainInfo {
  resourceName: string;
  appName: string;
  domains: string[];
  dbName: string;
  apiDomain: string;
  primaryZoneId: string;
}

export interface CdnDomainInfo {
  resourceName: string;
  domain: string;
  primaryZoneId: string;
  consultingOrigin: string;
  stokedUiOrigin: string;
}

export const getCdnSuiDomainInfo = (rootDomains: string, stage: string): CdnDomainInfo => {
  const info = getCdnDomainInfo(rootDomains, stage);
  // cdn.stokd.cloud -> cdn-sui.stokd.cloud
  const domain = info.domain.replace(/^cdn\./, 'cdn-sui.');
  return {
    ...info,
    resourceName: `${domain.replace(/\./g, '')}StaticSite`,
    domain,
  };
}
