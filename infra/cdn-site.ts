import { CdnDomainInfo } from 'infra/domains';
import { findExistingCert } from 'infra/cert';

const API_PROXY_CACHE_POLICY_ID = '4135ea2d-6df8-44a3-9df3-4b5a84be39ad';
const API_PROXY_ORIGIN_REQUEST_POLICY_ID = 'b689b0a8-53d0-40ab-baf2-68738e2966ac';

const MEDIA_RESPONSE_HEADERS_INJECTION = `
  event.response.headers['access-control-allow-origin'] = { value: '*' };
  event.response.headers['access-control-allow-methods'] = { value: 'GET, HEAD, OPTIONS' };
  event.response.headers['access-control-allow-headers'] = { value: 'Range, Content-Type, Authorization' };
  event.response.headers['access-control-expose-headers'] = { value: 'Content-Range, Accept-Ranges, Content-Encoding, Content-Length' };
  event.response.headers['cross-origin-opener-policy'] = { value: 'same-origin-allow-popups' };
  // Ensure browsers revalidate CORS when Origin changes
  event.response.headers['vary'] = { value: 'Origin, Access-Control-Request-Headers, Access-Control-Request-Method' };
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
    var isApiRequest = uri === '/api' || uri.indexOf('/api/') === 0;
    var isFileRequest = /\\.[^/]+$/.test(uri);
    var isDirectoryLikeRequest = uri === '/' || uri.slice(-1) === '/' || !isFileRequest;

    // Handle CORS preflight for media/video playback (Range requests from cross-origin MediaCards)
    // Must return immediately so browsers can fetch video/audio with crossOrigin="anonymous"
    var method = (event.request.method || 'GET').toUpperCase();
    if (method === 'OPTIONS') {
      var origin = event.request.headers.origin ? event.request.headers.origin.value : '*';
      var reqHeaders = event.request.headers['access-control-request-headers'];
      var reqMethod = event.request.headers['access-control-request-method'];
      return {
        statusCode: 204,
        statusDescription: 'No Content',
        headers: {
          'access-control-allow-origin': { value: '*' },
          'access-control-allow-methods': { value: 'GET, HEAD, OPTIONS' },
          'access-control-allow-headers': { value: reqHeaders ? reqHeaders.value : 'Range, Content-Type, Authorization' },
          'access-control-expose-headers': { value: 'Content-Range, Accept-Ranges, Content-Encoding, Content-Length' },
          'access-control-max-age': { value: '86400' },
          'vary': { value: 'Origin, Access-Control-Request-Headers, Access-Control-Request-Method' },
        },
      };
    }

    // Route public directory listing requests onto a path-based API route so
    // the edge path never depends on forwarding injected query strings.
    if (!isApiRequest && (f === 'json' || f === 'yaml') && isDirectoryLikeRequest) {
      var cdnPrefix = (uri === '/' || uri === '') ? '' : uri.replace(/^\\//, '').replace(/\\/$/, '');
      event.request.uri = '/api/cdn/path/' + f + (cdnPrefix ? '/' + cdnPrefix : '');
      uri = event.request.uri;
      isApiRequest = true;
    }

    if (isApiRequest) {
      setUrlOrigin(${JSON.stringify(consultingHost)});
      return event.request;
    }

    // SPA fallback: a directory-like (extensionless or trailing-slash) request
    // is a client-side route of the CDN browser app, not a real S3 object.
    // Rewrite it to the app shell so a hard refresh on a nested path (e.g.
    // /brian.stokd.cloud/drums/) serves the SPA instead of an S3 403
    // AccessDenied. Real media files keep their extension and fall through to
    // the S3 routes mechanism below. routeSite (the SST-generated router that
    // runs after this injection) resolves /index.html against the bucket
    // origin, since it is a KV-indexed asset of this StaticSite build.
    if (isDirectoryLikeRequest) {
      event.request.uri = '/index.html';
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
  // We ALSO allow public media playback (video/audio in MediaCards) from any origin
  // with Range header support so cross-origin hover-to-play previews work.
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
      {
        id: 'cdn-public-media-playback',
        allowedHeaders: ['Range', 'Content-Type', 'Authorization'],
        allowedMethods: ['GET', 'HEAD'],
        allowedOrigins: ['*'],
        exposeHeaders: ['Content-Range', 'Accept-Ranges', 'Content-Encoding', 'Content-Length', 'ETag'],
        maxAgeSeconds: 86400,
      },
    ],
  });
  void bucketCors.bucket;

  return site;
};

export const createCdnSuiSite = async (domainInfo: CdnDomainInfo) => {
  const enableDomain = process.env.CDN_ENABLE_DOMAIN !== '0';
  // cdn-sui browses the same CDN content but serves its own SPA from a separate bucket
  const cdnPublicBaseUrl = process.env.CDN_PUBLIC_BASE_URL ?? 'https://cdn.stokd.cloud';
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
    var isApiRequest = uri === '/api' || uri.indexOf('/api/') === 0;
    var isFileRequest = /\\.[^/]+$/.test(uri);
    var isDirectoryLikeRequest = uri === '/' || uri.slice(-1) === '/' || !isFileRequest;

    // Handle CORS preflight for media/video playback (Range requests from cross-origin MediaCards)
    // Must return immediately so browsers can fetch video/audio with crossOrigin="anonymous"
    var method = (event.request.method || 'GET').toUpperCase();
    if (method === 'OPTIONS') {
      var origin = event.request.headers.origin ? event.request.headers.origin.value : '*';
      var reqHeaders = event.request.headers['access-control-request-headers'];
      var reqMethod = event.request.headers['access-control-request-method'];
      return {
        statusCode: 204,
        statusDescription: 'No Content',
        headers: {
          'access-control-allow-origin': { value: '*' },
          'access-control-allow-methods': { value: 'GET, HEAD, OPTIONS' },
          'access-control-allow-headers': { value: reqHeaders ? reqHeaders.value : 'Range, Content-Type, Authorization' },
          'access-control-expose-headers': { value: 'Content-Range, Accept-Ranges, Content-Encoding, Content-Length' },
          'access-control-max-age': { value: '86400' },
          'vary': { value: 'Origin, Access-Control-Request-Headers, Access-Control-Request-Method' },
        },
      };
    }

    // Route public directory listing requests onto a path-based API route so
    // the edge path never depends on forwarding injected query strings.
    if (!isApiRequest && (f === 'json' || f === 'yaml') && isDirectoryLikeRequest) {
      var cdnPrefix = (uri === '/' || uri === '') ? '' : uri.replace(/^\\//, '').replace(/\\/$/, '');
      event.request.uri = '/api/cdn/path/' + f + (cdnPrefix ? '/' + cdnPrefix : '');
      uri = event.request.uri;
      isApiRequest = true;
    }

    if (isApiRequest) {
      setUrlOrigin(${JSON.stringify(consultingHost)});
      return event.request;
    }

    // SPA fallback: a directory-like (extensionless or trailing-slash) request
    // is a client-side route of the CDN browser app, not a real S3 object.
    // Rewrite it to the app shell so a hard refresh on a nested path (e.g.
    // /brian.stokd.cloud/drums/) serves the SPA instead of an S3 403
    // AccessDenied. Real media files keep their extension and fall through to
    // the S3 routes mechanism below. routeSite (the SST-generated router that
    // runs after this injection) resolves /index.html against the bucket
    // origin, since it is a KV-indexed asset of this StaticSite build.
    if (isDirectoryLikeRequest) {
      event.request.uri = '/index.html';
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
