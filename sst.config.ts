/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app() {
    return {
      name: "stoked-ui",
      home: "aws",
    };
  },
  async run() {
    console.info('app name',$app.name);
    const infra = await import('./docs/infra');
    infra.githubAwsConnector('stoked-ui', 'sui');
    return {
      url: infra.web.url,
    };
  },
  
});
