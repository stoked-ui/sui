import {
  CloudFrontClient,
  CreateInvalidationCommand,
} from '@aws-sdk/client-cloudfront';
// Inline rather than importing from cdnMutations to break the circular dep
// (cdnMutations → cdnInvalidation → cdnMutations) that causes a webpack TDZ
// ReferenceError at module init time.
const CDN_REGION = process.env.AWS_REGION || 'us-east-1';

// The CloudFront distribution that fronts the CDN bucket (cdn.stokd.cloud).
// Wired in via SST (infra/cdn-site.ts) as an environment variable on the docs
// Lambda. When absent (e.g. local dev) invalidation is skipped silently.
const CDN_DISTRIBUTION_ID = process.env.CDN_DISTRIBUTION_ID || '';

// CloudFront is a global service; its control-plane endpoint lives in us-east-1.
const cloudfront = new CloudFrontClient({ region: CDN_REGION || 'us-east-1' });

/**
 * Turn an S3 object key (or CDN path) into the absolute, slash-prefixed path
 * that CloudFront invalidation expects. CDN objects are stored under keys like
 * `brian.stokd.cloud/drums/song.mp3`; the matching CloudFront path is
 * `/brian.stokd.cloud/drums/song.mp3`.
 */
function toInvalidationPath(keyOrPath: string) {
  const trimmed = keyOrPath.replace(/^\/+/, '');
  return `/${trimmed}`;
}

/**
 * Invalidate one or more CDN paths so a same-name overwrite (or a move/delete)
 * is reflected immediately instead of being served from the edge cache. CDN
 * objects use long-lived `immutable` Cache-Control, so without this an
 * overwritten file keeps serving the old bytes until the TTL expires.
 *
 * Best-effort: failures are logged and swallowed so they never block the
 * user-facing mutation response. De-duplicates and caps paths per call.
 */
export async function invalidateCdnPaths(keysOrPaths: string | string[]) {
  if (!CDN_DISTRIBUTION_ID) {
    return;
  }

  const raw = Array.isArray(keysOrPaths) ? keysOrPaths : [keysOrPaths];
  const paths = Array.from(
    new Set(raw.filter(Boolean).map(toInvalidationPath)),
  );

  if (!paths.length) {
    return;
  }

  try {
    await cloudfront.send(
      new CreateInvalidationCommand({
        DistributionId: CDN_DISTRIBUTION_ID,
        InvalidationBatch: {
          // CallerReference must be unique per request.
          CallerReference: `cdn-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
          Paths: {
            Quantity: paths.length,
            Items: paths,
          },
        },
      }),
    );
  } catch (error) {
    // Never fail the mutation because cache invalidation failed; just surface it.
    console.error('CloudFront CDN invalidation failed', {
      distributionId: CDN_DISTRIBUTION_ID,
      paths,
      error,
    });
  }
}
