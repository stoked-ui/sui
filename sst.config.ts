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
    verifyEnvVars(['ROOT_DOMAIN', 'MONGODB_URI'], true);

    const { createSite, createApi, getDomainInfo } = await import('./infra');
    const domainInfo = getDomainInfo(process.env.ROOT_DOMAIN!, $app.stage);
    const web = await createSite(domainInfo);
    const api = createApi(domainInfo);
    return {
      site: web.url,
      api: api.url,
    };
  }
});
