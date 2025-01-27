import { domains } from 'infra/domains';


console.info('domains', domains);

const editorOrigin = {
  // The domain of the new origin
  domainName: "editor.stoked-ui.com",
  originId: "editorOrigin",
  customOriginConfig: {
    httpPort: 80,
    httpsPort: 443,
    originSslProtocols: ["TLSv1.2"],
    // If HTTPS is supported
    originProtocolPolicy: "https-only",
  },
};

const editorCacheBehavior = {
  // The path to forward to the new origin
  pathPattern: "/editor/*",
  targetOriginId: editorOrigin.originId,
  viewerProtocolPolicy: "redirect-to-https",
  allowedMethods: ["GET", "HEAD", "OPTIONS"],
  cachedMethods: ["GET", "HEAD"],
  forwardedValues: {
    queryString: true,
    cookies: {
      forward: "all",
    },
  },
};

export const web = new sst.aws.StaticSite("StokedUiComSite", {
  path: 'docs/export',
  domain: {
    name: domains[0],
    aliases: domains.slice(1),
  },
  environment: {
    runtime: "nodejs20.x", // Match the Node.js runtime
  },
  edge: {
    viewerResponse: {
      injection: `
        // Add CORS headers for video playback
        event.response.headers['access-control-allow-origin'] = { value: '*' }; // Allow all origins
        event.response.headers['access-control-allow-methods'] = { value: 'GET, HEAD, OPTIONS' };
        event.response.headers['access-control-allow-headers'] = { value: 'Range' };
        event.response.headers['access-control-expose-headers'] = { value: 'Content-Range, Accept-Ranges, Content-Encoding, Content-Length' };
      `
    }
  },
  assets: {
    textEncoding: "utf-8",
    fileOptions: [
      {
        files: "**/*.mp4",
        contentType: "video/mp4",
        cacheControl: "public,max-age=31536000,immutable",
      },
      {
        files: "**/*.webm",
        contentType: "video/webm",
        cacheControl: "public,max-age=31536000,immutable",
      },
      {
        files: "**/*.mov",
        contentType: "video/quicktime",
        cacheControl: "public,max-age=31536000,immutable",
      },
      {
        files: "**/*.mp3",
        contentType: "audio/mp3",
        cacheControl: "public,max-age=31536000,immutable",
      },
      {
        files: "**/*.m4a",
        contentType: "audio/m4a",
        cacheControl: "public,max-age=31536000,immutable",
      },
      {
        files: ["**/*.css", "**/*.js", "**/*.ico", "**/*.json", "**/*.txt", "**/*.png", "**/*.jpg", "**/*.jpeg", "**/*.gif", "**/*.svg", "**/*.webp", "**/*.woff", "**/*.woff2", "**/*.ttf", "**/*.eot", "**/*.otf"],
        cacheControl: "max-age=31536000,public,immutable"
      },
      {
        files: "**/*.html",
        cacheControl: "max-age=0,no-cache,no-store,must-revalidate"
      }
    ],
  },
  transform: {
    cdn: (options: sst.aws.CdnArgs) => {
      options.origins = $resolve(options.origins).apply(val => [...val, editorOrigin]);

      options.orderedCacheBehaviors = $resolve(
        options.orderedCacheBehaviors || []
      ).apply(val => [...val, editorCacheBehavior]);
    },
  }
});
