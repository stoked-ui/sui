import { mongoDbUri } from 'infra/secrets'
import { domains } from 'infra/domains'

export const api = new sst.aws.ApiGatewayV2("Api", { 
  domain: `api.${domains[0]}`
});

// Add the subscribe function with SES permissions
const subscribeFunction = new sst.aws.Function("SubscribeFunction", {
  handler: "api/subscribe.subscribe",
  permissions: [
    {
      actions: ["ses:SendEmail"],
      resources: ["arn:aws:ses:us-east-1:883859713095:identity/*"]
    }
  ],
  link: [mongoDbUri]
});

// Add the verify function with SES permissions
const verifyFunction = new sst.aws.Function("VerifyFunction", {
  handler: "api/subscribe.verify",
  permissions: [
    {
      actions: ["ses:SendEmail"],
      resources: ["arn:aws:ses:us-east-1:883859713095:identity/*"]
    }
  ],
  link: [mongoDbUri]
});

api.route("POST /subscribe", subscribeFunction.arn);
api.route("GET /verify", verifyFunction.arn);
