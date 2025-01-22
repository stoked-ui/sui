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
    });

    // CloudFront Function for redirects
    const redirectFunction = new sst.aws.Function("RedirectFunction", {
      handler: "docs/stack/redirect.handler",
      runtime: "nodejs20.x",
      timeout: '1 seconds', // CloudFront Functions have a max timeout of 1 second
      memory: '128 MB', // CloudFront Functions have a max memory size of 128 MB
    });

    // eslint-disable-next-line no-new
    new sst.aws.StaticSite("stoked-ui-com", {
      path: '.',
      domain: {
        name: 'stoked-ui.com',
        redirects: domains, // Assumes the domain is in Route 53
        cert: certificateLambda.arn,
      },
      environment: {
        runtime: "nodejs20.x", // Match the Node.js runtime
      },
      build: {
        command: "pnpm docs:build",
        output: 'docs/export'
      },
      transform: {
        cdn(args) {
          args.transform = {
            distribution: {
              defaultCacheBehavior: {
                allowedMethods: ["GET", "HEAD", "OPTIONS"],
                cachedMethods: ["GET", "HEAD", "OPTIONS"],
                targetOriginId: 's3',
                viewerProtocolPolicy: "redirect-to-https",
                functionAssociations: [
                  {
                    eventType: "viewer-request",
                    functionArn: redirectFunction.arn,
                  },
                ],
              },
              customErrorResponses: [
                {
                  responseCode: 404,
                  errorCachingMinTtl: 0,
                  responsePagePath: "/404.html",
                  errorCode: 404,
                },
              ],

              defaultRootObject: "index.html",
            }
          };
        },
      },
    });


  },
});
