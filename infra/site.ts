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
          // Domain-based routing: stokedconsulting.com → /consulting/
          var host = event.request.headers.host ? event.request.headers.host.value : '';
          var uri = event.request.uri;

          // Check if this is a stokedconsulting.com request
          var isConsultingDomain = host === 'stokedconsulting.com' || host === 'www.stokedconsulting.com';

          if (isConsultingDomain) {
            // Rewrite root path to consulting
            if (uri === '/' || uri === '') {
              event.request.uri = '/consulting/';
            }
            // Rewrite /index.html to consulting
            else if (uri === '/index.html') {
              event.request.uri = '/consulting/index.html';
            }
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
