import { DomainInfo } from 'infra/domains';
import {
  adminSecret,
  auditBotApiKey,
  jwtSecret,
  mongoDbUri,
  stripeSecretKey,
  stripeWebhookSecret,
  telegramBotToken,
  telegramSupportChatId,
} from 'infra/secrets';
import { findExistingCert } from 'infra/cert';
import { CONSULTING_APP_SEGMENTS } from '../docs/src/modules/utils/siteRouteManifest';

const STOKD_CLOUD_ACCOUNT_ID = '167217327520';
const DEFAULT_AUTH_AUTO_DOMAINS = 'stokd.cloud,sui.stokd.cloud,consulting.stokd.cloud,brianstoker.com';

export const createSite = async (domainInfo: DomainInfo) => {
  const consultingSegmentsObject = CONSULTING_APP_SEGMENTS.reduce<Record<string, true>>((segments, segment) => {
    segments[segment] = true;
    return segments;
  }, {});
  const invalidationPaths = process.env.INVALIDATION_PATHS;
  const blogImageBucket = process.env.BLOG_IMAGE_S3_BUCKET ?? 'cdn.stokd.cloud';
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
      // Prevent Next.js telemetry from creating network connections / potential hangs during deploys
      NEXT_TELEMETRY_DISABLED: '1',
      MONGODB_URI: mongoDbUri.value,
      JWT_SECRET: jwtSecret.value,
      STRIPE_SECRET_KEY: stripeSecretKey.value,
      STRIPE_WEBHOOK_SECRET: stripeWebhookSecret.value,
      ADMIN_SECRET: adminSecret.value,
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '',
      AUTH_AUTO_DOMAINS:
        process.env.AUTH_AUTO_DOMAINS ?? DEFAULT_AUTH_AUTO_DOMAINS,
      NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? '',
      SES_FROM_EMAIL: process.env.SES_FROM_EMAIL ?? 'noreply@stokd.cloud',
      BLOG_IMAGE_S3_BUCKET: blogImageBucket,
      BLOG_IMAGE_CDN_URL: process.env.BLOG_IMAGE_CDN_URL ?? 'https://cdn.stokd.cloud',
      // Audit bot inference — Bedrock's OpenAI-compatible endpoint. The local
      // LM Studio default in llmClient.ts is unreachable from Lambda.
      AUDIT_BOT_BASE_URL:
        process.env.AUDIT_BOT_BASE_URL ??
        'https://bedrock-runtime.us-east-1.amazonaws.com/openai/v1',
      AUDIT_BOT_MODEL: process.env.AUDIT_BOT_MODEL ?? 'openai.gpt-oss-120b-1:0',
      AUDIT_BOT_API_KEY: auditBotApiKey.value,
      // Audit bot lead notifications (Telegram pings).
      TELEGRAM_BOT_TOKEN: telegramBotToken.value,
      TELEGRAM_SUPPORT_CHAT_ID: telegramSupportChatId.value,
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
      adminSecret,
      auditBotApiKey,
      telegramBotToken,
      telegramSupportChatId,
    ],
    permissions: [
      {
        actions: ['ses:SendEmail'],
        resources: [`arn:aws:ses:us-east-1:${STOKD_CLOUD_ACCOUNT_ID}:identity/*`],
      },
      {
        actions: ['s3:ListBucket', 's3:ListBucketMultipartUploads'],
        resources: [`arn:aws:s3:::${blogImageBucket}`],
      },
      {
        actions: [
          's3:GetObject',
          's3:PutObject',
          's3:DeleteObject',
          's3:AbortMultipartUpload',
          's3:ListMultipartUploadParts',
        ],
        resources: [`arn:aws:s3:::${blogImageBucket}/*`],
      },
    ],
    ...(enableDomain
      ? {
          domain: {
            name: domainInfo.domains[0],
            aliases: domainInfo.domains.slice(1),
            ...(certArn ? { cert: certArn } : {}),
            dns: sst.aws.dns({ zone: domainInfo.primaryZoneId }),
          },
        }
      : {}),
    edge: {
      viewerRequest: {
        injection: `
          // Handle CORS preflight for media/video playback (Range requests from cross-origin MediaCards, etc.)
          // This must run before domain routing so preflight is answered for all paths including media.
          var method = (event.request.method || 'GET').toUpperCase();
          if (method === 'OPTIONS') {
            var reqHeaders = event.request.headers['access-control-request-headers'];
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

          // Domain-based routing:
          // - sui.stokd.cloud/consulting/* => https://consulting.stokd.cloud/*
          // - consulting.stokd.cloud/* => /consulting/* on the same Next.js site
          var host = event.request.headers.host ? event.request.headers.host.value : '';
          var uri = event.request.uri;
          var querystring = event.request.querystring || {};

          var isConsultingDomain = host === 'consulting.stokd.cloud';
          var isPrimaryDomain = host === 'sui.stokd.cloud' || host === 'www.sui.stokd.cloud';

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
            var consultingSegments = ${JSON.stringify(consultingSegmentsObject)};
            return consultingSegments[firstSegment] === true;
          }

          if (host === 'www.consulting.stokd.cloud') {
            return {
              statusCode: 308,
              statusDescription: 'Permanent Redirect',
              headers: {
                location: {
                  value: 'https://consulting.stokd.cloud' + uri + serializeQuery(querystring),
                },
              },
            };
          } else if (host === 'www.sui.stokd.cloud') {
            return {
              statusCode: 308,
              statusDescription: 'Permanent Redirect',
              headers: {
                location: {
                  value: 'https://sui.stokd.cloud' + uri + serializeQuery(querystring),
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
                  value: 'https://consulting.stokd.cloud' + redirectPath + serializeQuery(querystring),
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
          event.response.headers['access-control-allow-headers'] = { value: 'Range, Content-Type, Authorization' };
          event.response.headers['access-control-expose-headers'] = { value: 'Content-Range, Accept-Ranges, Content-Encoding, Content-Length' };
          event.response.headers['cross-origin-opener-policy'] = { value: 'same-origin-allow-popups' };
          event.response.headers['vary'] = { value: 'Origin, Access-Control-Request-Headers, Access-Control-Request-Method' };
        `,
      },
    },
    invalidation,
  });
};
