import { mongoDbUri } from 'docs/infra/secrets'

export const api = new sst.aws.ApiGatewayV2("Api", { 
  domain: "api.stoked-ui.com",
  link: [mongoDbUri]
});

api.route("POST /subscribe", "docs/functions/subscribe.main");

