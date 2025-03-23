import { DomainInfo } from 'infra/domains';


export const createSite = (domainInfo: DomainInfo) => {
  const doBuild = !!process.env.SST_BUILD;
  console.info('DO_BUILD = ', process.env.SST_BUILD)
  const buildData = doBuild ?
    {path:  '.', build: { command: `pnpm build:prod`, output: `docs/export` }} :
    {path:  'docs/export'}

  const invalidationPaths = process.env.INVALIDATION_PATHS;

  let invalidation: any;
  if (invalidationPaths) {
    invalidation = { paths: invalidationPaths, wait: true };
  }

  return new sst.aws.StaticSite(domainInfo.resourceName, {
    ...buildData,
    domain: {
      name: domainInfo.domains[0], aliases: domainInfo.domains.slice(1),
    }, environment: {
      runtime: "nodejs20.x", // Match the Node.js runtime
    }, edge: {
      viewerResponse: {
        injection: `
          // Add CORS headers for video playback
          event.response.headers['access-control-allow-origin'] = { value: '*' }; // Allow all origins
          event.response.headers['access-control-allow-methods'] = { value: 'GET, HEAD, OPTIONS' };
          event.response.headers['access-control-allow-headers'] = { value: 'Range' };
          event.response.headers['access-control-expose-headers'] = { value: 'Content-Range, Accept-Ranges, Content-Encoding, Content-Length' };
          /* 
          // Fix for navigation issues - inject a script to handle navigation properly
          if (event.response.headers['content-type'] && 
              event.response.headers['content-type'].value && 
              event.response.headers['content-type'].value.includes('text/html')) {
            const originalBody = event.response.body.toString();
            const navigationFix = '<script>' +
              '// Fix for navigation issues - replace client-side router functionality\\n' +
              'document.addEventListener("DOMContentLoaded", function() {\\n' +
              '  document.addEventListener("click", function(event) {\\n' +
              '    const link = event.target.closest("a");\\n' +
              '    if (link && link.getAttribute("href") && \\n' +
              '        link.getAttribute("href").startsWith("/") && \\n' +
              '        !link.getAttribute("target") && \\n' +
              '        !event.ctrlKey && !event.metaKey && !event.shiftKey) {\\n' +
              '        event.preventDefault();\\n' +
              '        window.location.href = link.getAttribute("href");\\n' +
              '    }\\n' +
              '  });\\n' +
              '});\\n' +
              '</script>';
            
            // Add script before closing body tag
            const newBody = originalBody.replace('</body>', navigationFix + '</body>');
            event.response.body = newBody;
          }
          
           */
        `
      }
    },
    assets: {

      textEncoding: "utf-8",
      fileOptions: [{
        files: "**/*.pdf",
        contentType: "application/pdf",
        cacheControl: "public,max-age=31536000,immutable",
      }, {
        files: "**/*.docx",
        contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        cacheControl: "public,max-age=31536000,immutable",
      }, {
        files: "**/*.mp4",
        contentType: "video/mp4",
        cacheControl: "public,max-age=31536000,immutable",
      }, {
        files: "**/*.webm",
        contentType: "video/webm",
        cacheControl: "public,max-age=31536000,immutable",
      }, {
        files: "**/*.mov",
        contentType: "video/quicktime",
        cacheControl: "public,max-age=31536000,immutable",
      }, {
        files: "**/*.mp3",
        contentType: "audio/mp3",
        cacheControl: "public,max-age=31536000,immutable",
      }, {
        files: "**/*.m4a",
        contentType: "audio/m4a",
        cacheControl: "public,max-age=31536000,immutable",
      }, {
        files: ["**/*.css", "**/*.js", "**/*.ico", "**/*.json", "**/*.txt", "**/*.png", "**/*.jpg", "**/*.jpeg", "**/*.gif", "**/*.svg", "**/*.webp", "**/*.woff", "**/*.woff2", "**/*.ttf", "**/*.eot", "**/*.otf"],
        cacheControl: "max-age=31536000,public,immutable"
      }, {
        files: "**/*.html", cacheControl: "max-age=0,no-cache,no-store,must-revalidate"
      }],
    },
    invalidation
  });
}
