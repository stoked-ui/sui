
export const STOKD_UI_PRODUCTION_ROOTS = [
  'sui.stokd.cloud',
  'stoked-ui.com',
] as const;

export const CONSULTING_PRODUCTION_ROOTS = [
  'consulting.stokd.cloud',
  'stokedconsulting.com',
] as const;

export const PRODUCTION_ROOT_DOMAINS = [
  ...STOKD_UI_PRODUCTION_ROOTS,
  ...CONSULTING_PRODUCTION_ROOTS,
] as const;

export const PRODUCTION_ROOT_DOMAIN = PRODUCTION_ROOT_DOMAINS.join(',');

export const AUTH_PRODUCTION_ORIGINS = [
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
] as const;

export const CORS_PRODUCTION_ORIGINS = [
  ...AUTH_PRODUCTION_ORIGINS,
  'https://brianstoker.com',
  'https://www.brianstoker.com',
] as const;

export const HOSTED_ZONE_IDS = {
  'stokd.cloud': 'Z0974146XEXJDMNXU573',
  'stoked-ui.com': 'Z09790842EOZDB68FABYC',
  'stokedconsulting.com': 'Z07577592PUM0SSTBY40Y',
} as const;

const ZONE_IDS: Record<string, string> = {
  ...HOSTED_ZONE_IDS,
  'sui.stokd.cloud': HOSTED_ZONE_IDS['stokd.cloud'],
  'consulting.stokd.cloud': HOSTED_ZONE_IDS['stokd.cloud'],
};

export const getDomains = (rootDomain: string, stage: string) => {
  if (stage === 'production') {
    return [rootDomain, `www.${rootDomain}`];
  }
  const parts = rootDomain.split('.');
  const staged = parts.length === 2
    ? `${stage}.${rootDomain}`
    : `${parts[0]}.${stage}.${parts.slice(1).join('.')}`;
  return [staged, `*.${staged}`];
}

export function resolveRootDomains(configured: string | undefined, stage: string) {
  if (stage === 'production') {
    return PRODUCTION_ROOT_DOMAIN;
  }

  return configured?.trim() || PRODUCTION_ROOT_DOMAIN;
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
  const consultingVanityRootDomain = rootDomainParts.find(
    (domain) => domain === 'stokedconsulting.com',
  ) ?? 'stokedconsulting.com';
  const stokedUiRootDomain = rootDomainParts.find((domain) => domain === 'sui.stokd.cloud')
    ?? rootDomainParts[0]
    ?? 'sui.stokd.cloud';
  const cdnRootDomain = rootDomainParts.find((domain) => domain === 'stokd.cloud') ?? 'stokd.cloud';
  const consultingDomain = getPrimaryDomain(consultingRootDomain, stage);
  const consultingVanityDomain = getPrimaryDomain(consultingVanityRootDomain, stage);
  const stokedUiDomain = getPrimaryDomain(stokedUiRootDomain, stage);
  const cdnBaseDomain = getPrimaryDomain(cdnRootDomain, stage);
  const domain = `cdn.${cdnBaseDomain}`;

  return {
    resourceName: `${domain.replace(/\./g, '')}StaticSite`,
    domain,
    aliases: [`cdn.${consultingVanityDomain}`],
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
  aliases: string[];
  primaryZoneId: string;
  consultingOrigin: string;
  stokedUiOrigin: string;
}

export interface InstallDomainInfo {
  resourceName: string;
  domain: string;
  primaryZoneId: string;
  consultingOrigin: string;
}

// install.stokd.cloud — serves product install scripts (install.stokd.cloud/<product>.sh)
// by proxying every request onto the consulting API's /api/install/* routes, which is
// also how the subdomain shares auth credentials with cdn/consulting/sui.
export const getInstallDomainInfo = (rootDomains: string, stage: string): InstallDomainInfo => {
  const rootDomainParts = getRootDomainParts(rootDomains);
  const consultingRootDomain = rootDomainParts.find((domain) => domain === 'consulting.stokd.cloud')
    ?? rootDomainParts[rootDomainParts.length - 1];
  const installRootDomain = rootDomainParts.find((domain) => domain === 'stokd.cloud') ?? 'stokd.cloud';
  const consultingDomain = getPrimaryDomain(consultingRootDomain, stage);
  const installBaseDomain = getPrimaryDomain(installRootDomain, stage);
  const domain = `install.${installBaseDomain}`;

  return {
    resourceName: `${domain.replace(/\./g, '')}Router`,
    domain,
    primaryZoneId: ZONE_IDS[installRootDomain] ?? '',
    consultingOrigin: `https://${consultingDomain}`,
  };
};

export const getCdnSuiDomainInfo = (rootDomains: string, stage: string): CdnDomainInfo => {
  const info = getCdnDomainInfo(rootDomains, stage);
  // cdn.stokd.cloud -> cdn-sui.stokd.cloud
  const domain = info.domain.replace(/^cdn\./, 'cdn-sui.');
  return {
    ...info,
    resourceName: `${domain.replace(/\./g, '')}StaticSite`,
    domain,
    aliases: info.aliases.map((alias) => alias.replace(/^cdn\./, 'cdn-sui.')),
  };
}
