import { Resource } from "sst";

const getSubdomains = () => {
  const stage = Resource.App.stage;
  if (stage === 'production' || stage === 'prod') {
    return [`sui.stokd.cloud`, `www.sui.stokd.cloud`, `www.consulting.stokd.cloud`, `consulting.stokd.cloud`];
  }
  return [`${stage}.sui.stokd.cloud`, `*.${stage}.sui.stokd.cloud`, `*.${stage}.consulting.stokd.cloud`, `${stage}.consulting.stokd.cloud`];
}

export const domains = getSubdomains();
