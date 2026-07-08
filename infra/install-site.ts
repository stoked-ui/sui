import { InstallDomainInfo } from 'infra/domains';
import { findExistingCert } from 'infra/cert';

/**
 * install.stokd.cloud — product install scripts.
 *
 * A thin CloudFront router that rewrites every request onto the consulting
 * origin's /api/install/* routes:
 *
 *   install.stokd.cloud/<product>.sh  ->  https://consulting.<...>/api/install/<product>.sh
 *   install.stokd.cloud/             ->  https://consulting.<...>/api/install/
 *
 * The API route resolves the product's githubRepo + installPath and streams the
 * script straight from GitHub. Because everything proxies to the consulting API
 * (the single auth authority, same as cdn.stokd.cloud's /api/* proxy), OAuth is
 * optional and shares the same credentials as cdn/consulting/sui.
 */
export const createInstallSite = async (domainInfo: InstallDomainInfo) => {
  const enableDomain = process.env.INSTALL_ENABLE_DOMAIN !== '0';

  let certArn: string | undefined;
  if ($app.stage === 'production') {
    certArn =
      process.env.INSTALL_CERT_ARN
      ?? (await findExistingCert([domainInfo.domain], {
        appName: $app.name,
        stage: $app.stage,
      }));
  }

  const router = new sst.aws.Router(domainInfo.resourceName, {
    ...(enableDomain
      ? {
          domain: {
            name: domainInfo.domain,
            ...(certArn ? { cert: certArn } : {}),
            dns: sst.aws.dns({ zone: domainInfo.primaryZoneId }),
          },
        }
      : {}),
  });

  router.route('/', domainInfo.consultingOrigin, {
    rewrite: {
      regex: '^/(.*)$',
      to: '/api/install/$1',
    },
  });

  return router;
};
