import { isConsultingPublicProductId } from 'docs/src/modules/utils/siteRouting';

 
export function handler(event: any) {
  const request = event.request;
  const uri = request.uri;
  const host = (request.headers.host.value || '').toLowerCase().replace(/:\d+$/, '');

  const shouldRedirectToConsulting = (
    host === 'sui.stokd.cloud'
    || host === 'www.sui.stokd.cloud'
  ) && isConsultingPublicProductId(uri.replace(/^\/products\/([^/]+).*$/, '$1'));

  if (shouldRedirectToConsulting) {
    return {
      statusCode: 301,
      statusDescription: 'Moved Permanently',
      headers: {
        location: {
          value: `https://consulting.stokd.cloud${uri}`,
        },
      },
    };
  }

  // Redirect logic
  if (uri.startsWith('/editor/') || uri === '/editor') {
    return {
      statusCode: 301,
      statusDescription: 'Moved Permanently',
      headers: {
        location: {
          value: `https://editor.${request.headers.host.value}${uri}`,
        },
      },
    };
  }

  if (uri.startsWith('/file-explorer/') || uri === '/file-explorer') {
    return {
      statusCode: 301,
      statusDescription: 'Moved Permanently',
      headers: {
        location: {
          value: `https://file-explorer.${request.headers.host.value}${uri}`,
        },
      },
    };
  }

  if (uri.startsWith('/timeline/') || uri === '/timeline') {
    return {
      statusCode: 301,
      statusDescription: 'Moved Permanently',
      headers: {
        location: {
          value: `https://timeline.${request.headers.host.value}${uri}`,
        },
      },
    };
  }

  // If no redirect is needed, return the original request
  return request;
}
