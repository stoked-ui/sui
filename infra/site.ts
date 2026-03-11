import { DomainInfo } from 'infra/domains';
import {
  jwtSecret,
  mongoDbUri,
  stripeSecretKey,
  stripeWebhookSecret,
} from 'infra/secrets';
import { findExistingCert } from 'infra/cert';

export const createSite = async (domainInfo: DomainInfo) => {
  const invalidationPaths = process.env.INVALIDATION_PATHS;
  const blogImageBucket = process.env.BLOG_IMAGE_S3_BUCKET ?? 'cdn.stokedconsulting.com';
  const enableDomain = process.env.SITE_ENABLE_DOMAIN !== '0';
  const openNextVersion = '3.6.6';
  const buildCommand = `npx --yes @opennextjs/aws@${openNextVersion} build && pnpm prune-lambda`;

  // Reuse an external ACM cert if one already covers our domains (avoids duplicate
  // validation CNAME errors). If SST already manages the cert for this stack, keep
  // it under SST ownership so deploys do not try to delete the active certificate.
  let certArn: string | undefined;
  if ($app.stage === 'production') {
    certArn =
      process.env.SITE_CERT_ARN ??
      (await findExistingCert(domainInfo.domains, {
        appName: $app.name,
        stage: $app.stage,
      }));
  }

  let invalidation: any;
  if (invalidationPaths) {
    invalidation = { paths: invalidationPaths, wait: true };
  }

  return new sst.aws.Nextjs(domainInfo.resourceName, {
    path: 'docs',
    // Keep OpenNext pinned to a Next.js 13-compatible release.
    openNextVersion,
    // OpenNext copies large public media into the server bundle even though those
    // files are served from the static asset bucket. Prune them after build so
    // the Lambda package stays under AWS's 250 MB unzipped limit.
    buildCommand,
    environment: {
      // Used in next.config.mjs to disable static export mode for OpenNext builds.
      OPEN_NEXT_BUILD: 'true',
      MONGODB_URI: mongoDbUri.value,
      JWT_SECRET: jwtSecret.value,
      STRIPE_SECRET_KEY: stripeSecretKey.value,
      STRIPE_WEBHOOK_SECRET: stripeWebhookSecret.value,
      AUTH_AUTO_DOMAINS:
        process.env.AUTH_AUTO_DOMAINS ?? 'stokedconsulting.com,stoked-ui.com,brianstoker.com',
      NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? '',
      SES_FROM_EMAIL: process.env.SES_FROM_EMAIL ?? 'noreply@stoked-ui.com',
      BLOG_IMAGE_S3_BUCKET: blogImageBucket,
      BLOG_IMAGE_CDN_URL: process.env.BLOG_IMAGE_CDN_URL ?? 'https://cdn.stokedconsulting.com',
    },
    server: {
      // The docs app has a heavy pages bundle and can exceed the default 20s/1024MB on cold starts.
      timeout: '60 seconds',
      memory: '2048 MB',
      runtime: 'nodejs20.x',
    },
    link: [
      mongoDbUri,
      jwtSecret,
      stripeSecretKey,
      stripeWebhookSecret,
    ],
    permissions: [
      {
        actions: ['ses:SendEmail'],
        resources: ['arn:aws:ses:us-east-1:883859713095:identity/*'],
      },
      {
        actions: ['s3:PutObject'],
        resources: [`arn:aws:s3:::${blogImageBucket}/*`],
      },
    ],
    ...(enableDomain
      ? {
          domain: {
            name: domainInfo.domains[0],
            aliases: domainInfo.domains.slice(1),
            ...(certArn ? { cert: certArn } : {}),
            dns: sst.aws.dns({} as any),
          },
        }
      : {}),
    edge: {
      viewerRequest: {
        injection: `
          // Domain-based routing:
          // - stoked-ui.com/consulting/* => https://stokedconsulting.com/*
          // - stokedconsulting.com/* => /consulting/* on the same Next.js site
          var host = event.request.headers.host ? event.request.headers.host.value : '';
          var uri = event.request.uri;
          var querystring = event.request.querystring || {};

          var isConsultingDomain = host === 'stokedconsulting.com';
          var isPrimaryDomain = host === 'stoked-ui.com' || host === 'www.stoked-ui.com';

          function serializeQuery(params) {
            var parts = [];
            for (var key in params) {
              if (!Object.prototype.hasOwnProperty.call(params, key)) continue;
              var entry = params[key];
              if (!entry) continue;
              if (entry.multiValue && entry.multiValue.length) {
                for (var i = 0; i < entry.multiValue.length; i += 1) {
                  var multi = entry.multiValue[i];
                  parts.push(encodeURIComponent(key) + '=' + encodeURIComponent(multi.value || ''));
                }
              } else {
                parts.push(encodeURIComponent(key) + '=' + encodeURIComponent(entry.value || ''));
              }
            }
            return parts.length ? ('?' + parts.join('&')) : '';
          }

          function isSharedPath(pathname) {
            return pathname === '/favicon.ico'
              || pathname === '/robots.txt'
              || pathname === '/sitemap.xml'
              || pathname === '/manifest.json'
              || pathname.indexOf('/api/') === 0
              || pathname.indexOf('/_next/') === 0
              || pathname.indexOf('/static/') === 0
              || pathname.indexOf('/images/') === 0;
          }

          function isConsultingAppPath(pathname) {
            var normalized = pathname || '/';
            var firstSegment = normalized.replace(/^\\/+/, '').split('/')[0] || '';
            var consultingSegments = {
              '': true,
              'admin': true,
              'ai': true,
              'api-docs': true,
              'back-end': true,
              'billing': true,
              'clients': true,
              'customer': true,
              'deliverables': true,
              'devops': true,
              'front-end': true,
              'groupies': true,
              'home': true,
              'invoices': true,
              'licenses': true,
              'login': true,
              'partners': true,
              'products': true,
              'settings': true,
              'users': true,
            };
            return consultingSegments[firstSegment] === true;
          }

          if (host === 'www.stokedconsulting.com') {
            return {
              statusCode: 308,
              statusDescription: 'Permanent Redirect',
              headers: {
                location: {
                  value: 'https://stokedconsulting.com' + uri + serializeQuery(querystring),
                },
              },
            };
          } else if (host === 'www.stoked-ui.com') {
            return {
              statusCode: 308,
              statusDescription: 'Permanent Redirect',
              headers: {
                location: {
                  value: 'https://stoked-ui.com' + uri + serializeQuery(querystring),
                },
              },
            };
          } else if (isConsultingDomain) {
            if (!isSharedPath(uri) && isConsultingAppPath(uri)) {
              if (uri === '/' || uri === '') {
                event.request.uri = '/consulting/';
              } else if (uri === '/index.html') {
                event.request.uri = '/consulting/index.html';
              } else if (uri.indexOf('/consulting/') !== 0 && uri !== '/consulting') {
                event.request.uri = '/consulting' + (uri.indexOf('/') === 0 ? uri : '/' + uri);
              } else if (uri === '/consulting') {
                event.request.uri = '/consulting/';
              }
            }
          } else if (isPrimaryDomain && (uri === '/consulting' || uri.indexOf('/consulting/') === 0)) {
            var redirectPath = uri === '/consulting' ? '/' : uri.replace(/^\\/consulting/, '') || '/';
            return {
              statusCode: 308,
              statusDescription: 'Permanent Redirect',
              headers: {
                location: {
                  value: 'https://stokedconsulting.com' + redirectPath + serializeQuery(querystring),
                },
              },
            };
          }

          if (isConsultingDomain && event.request.uri === '/consulting') {
            event.request.uri = '/consulting/';
          }

          if (isConsultingDomain && event.request.uri.indexOf('/consulting//') === 0) {
            event.request.uri = event.request.uri.replace('/consulting//', '/consulting/');
          }
        `,
      },
      viewerResponse: {
        injection: `
          // Keep permissive CORS headers for media playback and downloads.
          event.response.headers['access-control-allow-origin'] = { value: '*' }; // Allow all origins
          event.response.headers['access-control-allow-methods'] = { value: 'GET, HEAD, OPTIONS' };
          event.response.headers['access-control-allow-headers'] = { value: 'Range' };
          event.response.headers['access-control-expose-headers'] = { value: 'Content-Range, Accept-Ranges, Content-Encoding, Content-Length' };
          event.response.headers['cross-origin-opener-policy'] = { value: 'same-origin-allow-popups' };
        `,
      },
    },
    invalidation,
  });
};
