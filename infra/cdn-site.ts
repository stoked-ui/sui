import { CdnDomainInfo } from 'infra/domains';
import { findExistingCert } from 'infra/cert';

const API_PROXY_CACHE_POLICY_ID = '4135ea2d-6df8-44a3-9df3-4b5a84be39ad';
const API_PROXY_ORIGIN_REQUEST_POLICY_ID = 'b689b0a8-53d0-40ab-baf2-68738e2966ac';

const MEDIA_RESPONSE_HEADERS_INJECTION = `
  event.response.headers['access-control-allow-origin'] = { value: '*' };
  event.response.headers['access-control-allow-methods'] = { value: 'GET, HEAD, OPTIONS' };
  event.response.headers['access-control-allow-headers'] = { value: 'Range' };
  event.response.headers['access-control-expose-headers'] = { value: 'Content-Range, Accept-Ranges, Content-Encoding, Content-Length' };
  event.response.headers['cross-origin-opener-policy'] = { value: 'same-origin-allow-popups' };
`;

export const createCdnSite = async (domainInfo: CdnDomainInfo) => {
  const enableDomain = process.env.CDN_ENABLE_DOMAIN !== '0';
  const cdnBucket = process.env.CDN_S3_BUCKET
    ?? process.env.BLOG_IMAGE_S3_BUCKET
    ?? domainInfo.domain;
  const consultingHost = new URL(domainInfo.consultingOrigin).hostname;

  let certArn: string | undefined;
  if ($app.stage === 'production') {
    certArn =
      process.env.CDN_CERT_ARN
      ?? (await findExistingCert([domainInfo.domain], {
        appName: $app.name,
        stage: $app.stage,
      }));
  }

  return new sst.aws.StaticSite(domainInfo.resourceName, {
    path: 'packages-internal/cdn',
    dev: {
      command: 'pnpm dev',
    },
    build: {
      command: 'pnpm build',
      output: 'dist',
    },
    environment: {
      VITE_CDN_NAME: process.env.VITE_CDN_NAME ?? 'Stoked CDN',
      VITE_CDN_PUBLIC_BASE_URL: process.env.CDN_PUBLIC_BASE_URL ?? `https://${domainInfo.domain}`,
      VITE_STOKED_CONSULTING_ORIGIN:
        process.env.VITE_STOKED_CONSULTING_ORIGIN ?? domainInfo.consultingOrigin,
      VITE_STOKED_UI_ORIGIN:
        process.env.VITE_STOKED_UI_ORIGIN ?? domainInfo.stokedUiOrigin,
      VITE_LOCAL_AUTH_ORIGIN: process.env.VITE_LOCAL_AUTH_ORIGIN ?? 'http://localhost:5199',
    },
    // The CDN hostname already fronts the public media bucket. Reuse that bucket
    // and avoid purging so site deploys do not remove uploaded client assets.
    assets: {
      bucket: cdnBucket,
      purge: false,
      routes: ['/'],
    },
    invalidation: {
      paths: 'all',
      wait: $app.stage === 'production',
    },
    edge: {
      viewerRequest: {
        injection: `
          if (event.request.uri === '/api' || event.request.uri.indexOf('/api/') === 0) {
            setUrlOrigin(${JSON.stringify(consultingHost)});
            return event.request;
          }
        `,
      },
      viewerResponse: {
        injection: MEDIA_RESPONSE_HEADERS_INJECTION,
      },
    },
    transform: {
      cdn: (args: any) => {
        args.orderedCacheBehaviors = [
          {
            pathPattern: '/api/*',
            targetOriginId: 'default',
            viewerProtocolPolicy: 'redirect-to-https',
            allowedMethods: ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'PATCH', 'POST', 'PUT'],
            cachedMethods: ['GET', 'HEAD'],
            compress: false,
            cachePolicyId: API_PROXY_CACHE_POLICY_ID,
            originRequestPolicyId: API_PROXY_ORIGIN_REQUEST_POLICY_ID,
            functionAssociations: args.defaultCacheBehavior.functionAssociations,
          },
          ...(args.orderedCacheBehaviors ?? []),
        ];
      },
    },
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
};
