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
  const uploadOrigins = [
    `https://${domainInfo.domain}`,
    'http://localhost:4173',
    'http://127.0.0.1:4173',
    'http://localhost:6160',
    'http://127.0.0.1:6160',
  ];

  let certArn: string | undefined;
  if ($app.stage === 'production') {
    certArn =
      process.env.CDN_CERT_ARN
      ?? (await findExistingCert([domainInfo.domain], {
        appName: $app.name,
        stage: $app.stage,
      }));
  }

  const viewerRequestInjection = `
    var uri = event.request.uri || '/';
    var rawQs = event.request.querystring || '';
    var fMatch = typeof rawQs === 'string' ? /(?:^|&)f=([^&]*)/.exec(rawQs) : null;
    var f = fMatch ? decodeURIComponent(fMatch[1]) : (rawQs.f ? rawQs.f.value : null);

    if (f === 'json' || f === 'yaml') {
      var cdnPrefix = (uri === '/' || uri === '') ? '' : uri.replace(/^\\//, '');
      event.request.uri = '/api/cdn/contents';
      event.request.querystring = 'prefix=' + encodeURIComponent(cdnPrefix) + '&f=' + f;
      uri = event.request.uri;
    }

    if (uri === '/api' || uri.indexOf('/api/') === 0) {
      setUrlOrigin(${JSON.stringify(consultingHost)});
      return event.request;
    }

    var isDirectoryRequest = uri === '/' || uri.slice(-1) === '/';
    var isFileRequest = /\\.[^/]+$/.test(uri);

    if (isDirectoryRequest && !isFileRequest) {
      event.request.uri = '/index.html';
      return event.request;
    }
  `;

  const site = new sst.aws.StaticSite(domainInfo.resourceName, {
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
        injection: viewerRequestInjection,
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

  // Browser uploads go directly to S3 using presigned multipart URLs, so the
  // bucket itself must allow preflight and expose ETag for part completion.
  const bucketCors = new aws.s3.BucketCorsConfiguration(`${domainInfo.resourceName}BucketCors`, {
    bucket: cdnBucket,
    corsRules: [
      {
        id: 'cdn-browser-uploads',
        allowedHeaders: ['*'],
        allowedMethods: ['GET', 'HEAD', 'PUT', 'POST', 'DELETE'],
        allowedOrigins: uploadOrigins,
        exposeHeaders: ['ETag'],
        maxAgeSeconds: 3600,
      },
    ],
  });
  bucketCors.bucket;

  return site;
};

export const createCdnSuiSite = async (domainInfo: CdnDomainInfo) => {
  const enableDomain = process.env.CDN_ENABLE_DOMAIN !== '0';
  // cdn-sui browses the same CDN content but serves its own SPA from a separate bucket
  const cdnPublicBaseUrl = process.env.CDN_PUBLIC_BASE_URL ?? 'https://cdn.stokedconsulting.com';
  const consultingHost = new URL(domainInfo.consultingOrigin).hostname;

  let certArn: string | undefined;
  if ($app.stage === 'production') {
    certArn =
      process.env.CDN_SUI_CERT_ARN
      ?? (await findExistingCert([domainInfo.domain], {
        appName: $app.name,
        stage: $app.stage,
      }));
  }

  const viewerRequestInjection = `
    var uri = event.request.uri || '/';
    var rawQs = event.request.querystring || '';
    var fMatch = typeof rawQs === 'string' ? /(?:^|&)f=([^&]*)/.exec(rawQs) : null;
    var f = fMatch ? decodeURIComponent(fMatch[1]) : (rawQs.f ? rawQs.f.value : null);

    if (f === 'json' || f === 'yaml') {
      var cdnPrefix = (uri === '/' || uri === '') ? '' : uri.replace(/^\\//, '');
      event.request.uri = '/api/cdn/contents';
      event.request.querystring = 'prefix=' + encodeURIComponent(cdnPrefix) + '&f=' + f;
      uri = event.request.uri;
    }

    if (uri === '/api' || uri.indexOf('/api/') === 0) {
      setUrlOrigin(${JSON.stringify(consultingHost)});
      return event.request;
    }

    var isDirectoryRequest = uri === '/' || uri.slice(-1) === '/';
    var isFileRequest = /\\.[^/]+$/.test(uri);

    if (isDirectoryRequest && !isFileRequest) {
      event.request.uri = '/index.html';
      return event.request;
    }
  `;

  return new sst.aws.StaticSite(domainInfo.resourceName, {
    path: 'packages-internal/cdn-sui',
    dev: {
      command: 'pnpm dev',
    },
    build: {
      command: 'pnpm build',
      output: 'dist',
    },
    environment: {
      VITE_CDN_NAME: process.env.VITE_CDN_NAME ?? 'Stoked CDN',
      VITE_CDN_PUBLIC_BASE_URL: cdnPublicBaseUrl,
      VITE_STOKED_CONSULTING_ORIGIN:
        process.env.VITE_STOKED_CONSULTING_ORIGIN ?? domainInfo.consultingOrigin,
      VITE_STOKED_UI_ORIGIN:
        process.env.VITE_STOKED_UI_ORIGIN ?? domainInfo.stokedUiOrigin,
      VITE_LOCAL_AUTH_ORIGIN: process.env.VITE_LOCAL_AUTH_ORIGIN ?? 'http://localhost:5199',
    },
    invalidation: {
      paths: 'all',
      wait: $app.stage === 'production',
    },
    edge: {
      viewerRequest: {
        injection: viewerRequestInjection,
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
