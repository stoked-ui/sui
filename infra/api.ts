import { mongoDbUri } from 'infra/secrets'
import { DomainInfo } from 'infra/domains'

export const createApi = (domainInfo: DomainInfo) => {

  const api = new sst.aws.ApiGatewayV2("Api", {
    domain: {
      name: domainInfo.apiDomain,
      dns: sst.aws.dns({ zone: domainInfo.primaryZoneId }),
    }
  });

  // ---------------------------------------------------------------------------
  // Media API Lambda (NestJS / lambda.bootstrap.ts)
  // Handles media/auth/invoice routes under /v1/*
  // ---------------------------------------------------------------------------
  const jwtSecret = new sst.Secret("JWT_SECRET");
  const blogApiToken = new sst.Secret("BLOG_API_TOKEN");
  const invoiceApiKey = new sst.Secret("INVOICE_API_KEY");

  const mediaApiFunction = new sst.aws.Function("MediaApi", {
    handler: "packages/sui-media-api/dist/lambda.bootstrap.handler",
    runtime: "nodejs20.x",
    timeout: "29 seconds",
    memory: "1024 MB",
    link: [mongoDbUri, jwtSecret, blogApiToken, invoiceApiKey],
    permissions: [{
      actions: ["ses:SendEmail"],
      resources: ["arn:aws:ses:us-east-1:883859713095:identity/*"],
    }],
    environment: {
      // Core
      NODE_ENV: "production",
      API_PATH_PREFIX: "/v1",

      // Auth
      AUTH_AUTO_DOMAINS: process.env.AUTH_AUTO_DOMAINS ?? "stokedconsulting.com,stoked-ui.com,brianstoker.com",

      // Nostr integration
      NOSTR_RELAYS: process.env.NOSTR_RELAYS ?? "",
      NOSTR_NPUBS: process.env.NOSTR_NPUBS ?? "",
      NOSTR_POLL_INTERVAL: process.env.NOSTR_POLL_INTERVAL ?? "15",

      // CORS
      ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS ?? `https://${domainInfo.domains[0]},https://www.${domainInfo.domains[0]}`,

    },
  });

  // Route all /v1/* requests to the Media API Lambda
  api.route("$default", mediaApiFunction.arn);

  const emailMsg = JSON.stringify(`{
        Subject: { Data: \`Subscribed to ${domainInfo.domains[0]}\` },
        Body: {
          Text: { Data: \`Click the link to verify your email: \${verificationLink}\` },
          Html: { Data: \`<p>Click <a href='\${verificationLink}'>here</a> to verify your email.</p>\` },
        },
      }`);

  // Add the subscribe function with SES permissions
  const subscribeFunction = new sst.aws.Function("Subscribe", {
    handler: "api/subscribe.subscribe", permissions: [{
      actions: ["ses:SendEmail"], resources: ["arn:aws:ses:us-east-1:883859713095:identity/*"]
    }], link: [mongoDbUri], environment: {
      ROOT_DOMAIN: domainInfo.domains[0],
      DB_NAME: domainInfo.dbName,
      EMAIL_MESSAGE: emailMsg
    }
  });

  // Add the verify function with SES permissions
  const verifyFunction = new sst.aws.Function("Verify", {
    handler: "api/subscribe.verify", permissions: [{
      actions: ["ses:SendEmail"],
      resources: ["arn:aws:ses:us-east-1:883859713095:identity/!*"]
    }], link: [mongoDbUri],
    environment: {
      ROOT_DOMAIN: domainInfo.domains[0],
      DB_NAME: domainInfo.dbName,
      EMAIL_MESSAGE: emailMsg
    }
  });

  // Add the verify function with SES permissions
  const sendSms = new sst.aws.Function("SendSms", {
    handler: "api/sms.handler",
    permissions: [
      {
        actions: ["sns:Publish"],
        resources: ["*"], // ✅ Allows sending SMS to any SNS topic
      },
    ],
    link: [mongoDbUri],
    environment: {
      ROOT_DOMAIN: domainInfo.domains[0],
    },
  });


  api.route("POST /subscribe", subscribeFunction.arn);
  api.route("GET /verify", verifyFunction.arn);
  api.route("POST /smss", sendSms.arn);

  return api;
}
