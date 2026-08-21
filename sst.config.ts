/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app() {
    return {
      name: "stoked-ui",
      home: "aws",
      providers: {
        aws: {
          region: 'us-east-1',
          profile: process.env.GITHUB_ACTIONS
            ? undefined
            : 'stokd-cloud'
        }
      }
    };
  },
  async run() {
    const {
      createSite,
      createApi,
      createCdnSite,
      createCdnSuiSite,
      createInstallSite,
      getDomainInfo,
      getCdnDomainInfo,
      getCdnSuiDomainInfo,
      getInstallDomainInfo,
      resolveRootDomains,
    } = await import('./infra');
    const rootDomains = resolveRootDomains(process.env.ROOT_DOMAIN, $app.stage);
    process.env.ROOT_DOMAIN = rootDomains;
    const domainInfo = getDomainInfo(rootDomains, $app.stage);
    const cdnDomainInfo = getCdnDomainInfo(rootDomains, $app.stage);
    const cdnSuiDomainInfo = getCdnSuiDomainInfo(rootDomains, $app.stage);
    const installDomainInfo = getInstallDomainInfo(rootDomains, $app.stage);
    // Create the CDN site first so its CloudFront distribution id can be passed
    // to the docs site, which invalidates CDN paths when uploads overwrite files.
    const cdn = await createCdnSite(cdnDomainInfo);
    const cdnSui = await createCdnSuiSite(cdnSuiDomainInfo);
    const cdnDistributionId = cdn.nodes.cdn.nodes.distribution.id;
    const web = await createSite(domainInfo, { cdnDistributionId });
    const api = createApi(domainInfo);
    const install = await createInstallSite(installDomainInfo);
    return {
      site: web.url,
      cdn: cdn.url,
      cdnSui: cdnSui.url,
      api: api.url,
      install: install.url,
    };
  }
});
