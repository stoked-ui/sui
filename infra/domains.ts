
const ZONE_IDS: Record<string, string> = {
  'stoked-ui.com': 'Z007684515CR7EDIISGDG',
  'stokedconsulting.com': 'Z2CYVWQGVIX8W6',
};

export const getDomains = (rootDomain: string, stage: string) => {
  if (stage === 'production') {
    return [rootDomain, `www.${rootDomain}`];
  }
  return [`${stage}.${rootDomain}`, `*.${stage}.${rootDomain}`];
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
  const consultingRootDomain = rootDomainParts.find((domain) => domain === 'stokedconsulting.com')
    ?? rootDomainParts[rootDomainParts.length - 1];
  const stokedUiRootDomain = rootDomainParts[0] ?? 'stoked-ui.com';
  const consultingDomain = getPrimaryDomain(consultingRootDomain, stage);
  const stokedUiDomain = getPrimaryDomain(stokedUiRootDomain, stage);
  const domain = `cdn.${consultingDomain}`;

  return {
    resourceName: `${domain.replace(/\./g, '')}StaticSite`,
    domain,
    primaryZoneId: ZONE_IDS[consultingRootDomain] ?? '',
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
