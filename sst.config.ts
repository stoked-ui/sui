/// <reference path="./.sst/platform/config.d.ts" />

const domains = ["www.stoked-ui.com", "stokedconsulting.com", "www.stokedconsulting.com"];

export default $config({
  app(input) {
    return {
      name: "stoked-ui",
      home: "aws",
    };
  },
  async run() {

    // Define the domains for the certificate
    const domainNames = ["www.stoked-ui.com", "www.stokedconsulting.com", "stokedconsulting.com"];

    // Lambda function to check and create the certificate
    const certificateLambda = new sst.aws.Function("CertificateLambda", {
      handler: "docs/stack/certificate.handler",
      environment: {
        DOMAIN_NAMES: domainNames.join(","),
      },
      permissions: [
        {
          actions: [
            "acm:ListCertificates",
            "acm:RequestCertificate",
            "acm:DescribeCertificate",
            "acm:DeleteCertificate",
            "route53:ListHostedZones",
            "route53:GetChange",
            "route53:ChangeResourceRecordSets"
          ],
          resources: ["*"]
        }
      ]
    });

    // CloudFront Function for redirects
    // const redirectFunction = new sst.aws.Function("RedirectFunction", {
    //   handler: "docs/stack/redirect.handler",
    //   runtime: "nodejs20.x",
    //   timeout: '1 seconds', // CloudFront Functions have a max timeout of 1 second
    //   memory: '128 MB', // CloudFront Functions have a max memory size of 128 MB
    // });

    // eslint-disable-next-line no-new
    const site = new sst.aws.StaticSite("stoked-ui-com", {
      path: '.',
      domain: {
        name: domains[0],
        aliases: domains.slice(1),
        cert: certificateLambda.arn,
      },
      environment: {
        runtime: "nodejs20.x", // Match the Node.js runtime
      },
      build: {
        command: "pnpm docs:build",
        output: 'docs/export'
      },
    });

    // eslint-disable-next-line no-new
    new sst.aws.Router("Router", {
      routes: {
        "/editor/*": {
          url: "https://editor.stoked-ui.com/:path"
        },
        "/file-explorer/*": {
          url: "https://file-explorer.stoked-ui.com/:path"
        },
        "/timeline/*": {
          url: "https://timeline.stoked-ui.com/:path"
        },
        "/*": site.url,
      },
      domain: {
        name: domains[0],
        aliases: domains.slice(1),
        cert: certificateLambda.arn,
      }
    });

  },
});
