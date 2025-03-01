
/**
 * as is a reference to Next.js's as, the path in the URL
 * pathname is a reference to Next.js's pathname, the name of page in the filesystem
 * https://nextjs.org/docs/api-reference/next/router
 */
export function pathnameToLanguage(languages: string[], pathname: string) {
  let userLanguage;
  const userLanguageCandidate = pathname.substring(1, 3);

  if (
    [...languages, 'zh'].indexOf(userLanguageCandidate) !== -1 &&
    pathname.indexOf(`/${userLanguageCandidate}/`) === 0
  ) {
    userLanguage = userLanguageCandidate;
  } else {
    userLanguage = 'en';
  }

  const canonicalAs = userLanguage === 'en' ? pathname : pathname.substring(3);
  // Remove hash as it's never sent to the server
  // https://github.com/vercel/next.js/issues/25202
  const canonicalAsServer = canonicalAs.replace(/#(.*)$/, '');

  let canonicalPathname = canonicalAsServer.replace(/^\/api/, '/api-docs');

  // Remove trailing slash as Next.js doesn't expect it here
  // https://nextjs.org/docs/pages/api-reference/functions/use-router#router-object
  if (canonicalPathname !== '/') {
    canonicalPathname = canonicalPathname.replace(/\/$/, '');
  }

  return {
    userLanguage,
    canonicalAs,
    canonicalAsServer,
    canonicalPathname,
  };
}
