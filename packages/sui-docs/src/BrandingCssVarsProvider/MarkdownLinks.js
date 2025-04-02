import * as React from 'react';
import Router from 'next/router';

/**
 * as is a reference to Next.js's as, the path in the URL
 * pathname is a reference to Next.js's pathname, the name of page in the filesystem
 * https://nextjs.org/docs/api-reference/next/router
 */
export function pathnameToLanguage(languages, pathname) {
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

export function samePageLinkNavigation(event) {
  if (
    event.defaultPrevented ||
    event.button !== 0 || // ignore everything but left-click
    event.metaKey ||
    event.ctrlKey ||
    event.altKey ||
    event.shiftKey
  ) {
    return true;
  }
  return false;
}

function isLink(event) {
  let activeElement = event.target;
  while (activeElement?.nodeType === Node.ELEMENT_NODE && activeElement.nodeName !== 'A') {
    activeElement = activeElement.parentElement;
  }

  // Ignore non internal link clicks.
  // Absolute URLs can be internal, we delegate this to Next.js's router
  if (
    activeElement === null ||
    activeElement.nodeName !== 'A' ||
    activeElement.getAttribute('target') === '_blank' ||
    activeElement.getAttribute('data-no-markdown-link') === 'true'
  ) {
    return null;
  }

  return activeElement;
}

/**
 * @param {MouseEvent} event
 */
function handleClick(event) {
  // Ignore click events meant for native link handling, for example open in new tab
  if (samePageLinkNavigation(event)) {
    return;
  }

  const activeElement = isLink(event);
  if (activeElement === null) {
    return;
  }

  event.preventDefault();
  const as = activeElement.getAttribute('href');
  // Fix: Pass the languages array to pathnameToLanguage function
  // We're using an empty array for now as we'll rely on the default 'en' language behavior
  const { canonicalPathname } = pathnameToLanguage([], as);
  Router.push(canonicalPathname, as);
}

/**
 * Source copied from https://github.com/vercel/next.js/blob/ebc4eaaa2564b4283711646079d68e430496c88b/packages/next/src/client/link.tsx
 */
function handleMouseOver(event) {
  const activeElement = isLink(event);
  if (activeElement === null) {
    return;
  }

  const as = activeElement.getAttribute('href');
  // Fix: Pass the languages array to pathnameToLanguage function
  // We're using an empty array for now as we'll rely on the default 'en' language behavior
  const { canonicalPathname } = pathnameToLanguage([], as);

  const prefetchPromise = Router.prefetch(canonicalPathname, as, { priority: true });
  // Prefetch the JSON page if asked (only in the client)
  // We need to handle a prefetch error here since we may be
  // loading with priority which can reject but we don't
  // want to force navigation since this is only a prefetch
  Promise.resolve(prefetchPromise).catch((err) => {
    if (process.env.NODE_ENV !== 'production') {
      // rethrow to show invalid URL errors
      throw err;
    }
  });
}

export default function MarkdownLinks() {
  React.useEffect(() => {
    document.addEventListener('click', handleClick);
    document.addEventListener('mouseover', handleMouseOver);
    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('mouseover', handleMouseOver);
    };
  }, []);

  return null;
}

