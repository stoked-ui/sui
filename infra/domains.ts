
export const getDomains = (rootDomain: string, stage: string) => {
  if (stage === 'production') {
    return [rootDomain, `www.${rootDomain}`];
  }
  return [`${stage}.${rootDomain}`, `*.${stage}.${rootDomain}`];
}

export const getDomainInfo = (rootDomains: string, stage: string): DomainInfo => {
  const rootDomainParts = rootDomains.split(',');
  let domains:any = rootDomainParts.map((domain) => getDomains(domain, stage)).flat();
  domains = domains.flat(Infinity);
  const appName = `${domains[0].replace(/\./g, '-')}`;
  const parts = domains[0].split('.');
  parts.pop();
  parts.push(stage);
  const dbName = parts.join('-');
  const apiDomain = `api.${domains[0]}`;
  const resourceName = `${domains[0].replace(/\./g, '')}StaticSite`;

  const retVal = { resourceName, apiDomain, appName, domains: $dev ? [process.env.LOCAL_DOMAIN!]: domains, dbName };
  console.info('domainInfo', retVal);
  return retVal;
}

export interface DomainInfo {
  resourceName: string;
  appName: string;
  domains: string[];
  dbName: string;
  apiDomain: string;
}

