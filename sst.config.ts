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
    new sst.aws.StaticSite("stoked-ui-com", {
      domain: {
        name: domains.pop()!,
        aliases: domains, // Assumes the domain is in Route 53
        redirects: [

        ]
      },
      environment: {
        runtime: "nodejs20.x", // Match the Node.js runtime
      },
      build: {
        command: "pnpm docs-build",
        output: 'docs/export'
      }
    });
  },
});
