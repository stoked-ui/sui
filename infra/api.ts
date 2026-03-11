import { mongoDbUri, jwtSecret } from 'infra/secrets'
import { DomainInfo } from 'infra/domains'

export const createApi = (domainInfo: DomainInfo) => {

  const api = new sst.aws.ApiGatewayV2("Api", {
    cors: {
      allowOrigins: ["*"],
      allowMethods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      allowHeaders: ["Content-Type", "Authorization"],
    },
    domain: {
      name: domainInfo.apiDomain,
      dns: sst.aws.dns({ zone: domainInfo.primaryZoneId }),
    }
  });

  // Google Auth Lambda
  const googleAuthFunction = new sst.aws.Function("GoogleAuth", {
    handler: "api/auth/google.handler",
    link: [mongoDbUri, jwtSecret],
    environment: {
      MONGODB_URI: mongoDbUri.value,
      JWT_SECRET: jwtSecret.value,
      NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "",
      AUTH_AUTO_DOMAINS: process.env.AUTH_AUTO_DOMAINS ?? "stokedconsulting.com,stoked-ui.com,brianstoker.com",
    },
    nodejs: {
      install: ["mongodb"],
      esbuild: {
        external: ["@nestjs/websockets/socket-module", "@nestjs/microservices/microservices-module", "@nestjs/microservices", "class-transformer/storage"],
      }
    }
  });

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
  api.route("ANY /api/auth/google", googleAuthFunction.arn);

  return api;
}
