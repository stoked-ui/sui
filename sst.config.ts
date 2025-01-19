/// <reference path="./.sst/platform/config.d.ts" />

const domains = ["stoked-ui.com", "www.stoked-ui.com", "stokedconsulting.com", "www.stokedconsulting.com"];

export default $config({
  app(input) {
    return {
      name: "stoked-ui",
      removal: input?.stage === "production" ? "retain" : "remove",
      protect: ["production"].includes(input?.stage),
      home: "aws",
    };
  },
  async run() {
    // eslint-disable-next-line no-new
    const site = new sst.aws.StaticSite("stoked-ui-com", {
      path: '.',
      domain: {
        name: domains.pop()!,
        aliases: domains, // Assumes the domain is in Route 53
      },
      environment: {
        runtime: "nodejs20.x", // Match the Node.js runtime
      },
      build: {
        command: "pnpm docs:build",
        output: 'docs/export'
      },
    });

    const subDomain = new sst.aws.Function("SubDomains", {
      handler: "docs/src/subdomains.handler",
      url: true
    })

    // Step 2: Create a Router to Handle Subdirectory Routing
    // eslint-disable-next-line no-new
    new sst.aws.Router("stoked-ui-router", {
      routes: {
        "/*": site,
        "/editor/*": subDomain.url.apply((url) => url),
        "/file-explorer/*": subDomain.url.apply((url) => url),
        "/timeline/*": subDomain.url.apply((url) => url),
      },
    });
  },
});
