/* eslint-disable no-useless-escape */
/// <reference path="./.sst/platform/config.d.ts" />

const domains = ["stoked-ui.com", "*.stoked-ui.com", "*.stokedconsulting.com", "stokedconsulting.com"];

export default $config({
  app(input) {
    input.stage
    return {
      name: "stoked-ui",
      home: "aws",
    };
  },
  async run({ app }) {
    const stage = app.stage;
    // eslint-disable-next-line no-new
    new sst.aws.StaticSite("stoked-ui-com", {
      
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
        bucket: `stoked-ui-com`,
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
            files: ["**/*.css", "**/*.js"],
            cacheControl: "max-age=31536000,public,immutable"
          },
          {
            files: "**/*.html",
            cacheControl: "max-age=0,no-cache,no-store,must-revalidate"
          }
        ],
      }
    });
  },
});
