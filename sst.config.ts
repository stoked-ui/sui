/// <reference path="./.sst/platform/config.d.ts" />

import { verifyEnvVars }  from "./infra/envVars";

verifyEnvVars(['ROOT_DOMAIN', 'MONGODB_URI'], true);

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
            : 'default'
        }
      }
    };
  },
  async run() {
    const { createSite, createApi, getDomainInfo } = await import('./infra');
    const domainInfo = getDomainInfo(process.env.ROOT_DOMAIN!, $app.stage);
    const web = createSite(domainInfo);
    const api = createApi(domainInfo);
    return {
      ...web,
      ...api,
    };
  }
});

