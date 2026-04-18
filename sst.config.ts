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
            : 'stoked'
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
    const web = await createSite(domainInfo);
    const cdn = await createCdnSite(cdnDomainInfo);
    const cdnSui = await createCdnSuiSite(cdnSuiDomainInfo);
    const api = createApi(domainInfo);
    return {
      site: web.url,
      cdn: cdn.url,
      cdnSui: cdnSui.url,
      api: api.url,
    };
  }
});
