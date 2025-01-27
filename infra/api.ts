import { mongoDbUri } from 'infra/secrets'
import { domains } from 'infra/domains'

export const api = new sst.aws.ApiGatewayV2("Api", { 
  domain: `api.${domains[0]}`,
  link: [mongoDbUri],
});

api.route("POST /subscribe", "api/subscribe.subscribe");

