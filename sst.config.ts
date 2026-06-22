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
    const { verifyEnvVars } = await import("./infra/envVars");
    verifyEnvVars(['ROOT_DOMAIN'], true);

    const {
      createSite,
      createApi,
      createCdnSite,
      createCdnSuiSite,
      getDomainInfo,
      getCdnDomainInfo,
      getCdnSuiDomainInfo,
    } = await import('./infra');
    const domainInfo = getDomainInfo(process.env.ROOT_DOMAIN!, $app.stage);
    const cdnDomainInfo = getCdnDomainInfo(process.env.ROOT_DOMAIN!, $app.stage);
    const cdnSuiDomainInfo = getCdnSuiDomainInfo(process.env.ROOT_DOMAIN!, $app.stage);
    // Create the CDN site first so its CloudFront distribution id can be passed
    // to the docs site, which invalidates CDN paths when uploads overwrite files.
    const cdn = await createCdnSite(cdnDomainInfo);
    const cdnSui = await createCdnSuiSite(cdnSuiDomainInfo);
    const cdnDistributionId = cdn.nodes.cdn.nodes.distribution.id;
    const web = await createSite(domainInfo, { cdnDistributionId });
    const api = createApi(domainInfo);
    return {
      site: web.url,
      cdn: cdn.url,
      cdnSui: cdnSui.url,
      api: api.url,
    };
  }
});
