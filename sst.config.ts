/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "stoked-ui",
      home: "aws",
    };
  },
  async run() {
    const infra = await import('./docs/infra');
    return {
      url: infra.web.url,
    };
  },
  
});
