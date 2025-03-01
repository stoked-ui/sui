import * as React from 'react';
import upperFirst from 'lodash/upperFirst';
import camelCase from 'lodash/camelCase';
import clipboardCopy from 'clipboard-copy';

export function useClipboardCopy() {
  const [isCopied, setIsCopied] = React.useState(false);
  const timeout = React.useRef<ReturnType<typeof setTimeout>>();
  const mounted = React.useRef(false);

  React.useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const copy = async (text: string) => {
    try {
      setIsCopied(true);
      clearTimeout(timeout.current);
      timeout.current = setTimeout(() => {
        if (mounted) {
          setIsCopied(false);
        }
      }, 1200);
      await clipboardCopy(text);
    } catch (error) {
      // ignore error
    }
  };

  return { copy, isCopied };
}

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

function pascalCase(str: string) {
  return upperFirst(camelCase(str));
}

function titleize(hyphenedString: string): string {
  return upperFirst(hyphenedString.split('-').join(' '));
}

export interface Page {
  pathname: string;
  query?: object;
  subheader?: string;
  title?: string | false;
}

export function pageToTitle(page: Page): string | null {
  if (page.title === false) {
    return null;
  }

  if (page.title) {
    return page.title;
  }

  const path = page.subheader || page.pathname;
  const name = path.replace(/.*\//, '').replace('react-', '').replace(/\..*/, '');

  // TODO remove post migration
  if (path.indexOf('/api-docs/') !== -1) {
    return pascalCase(name);
  }

  // TODO support more than React component API (PascalCase)
  if (path.indexOf('/api/') !== -1) {
    return name.startsWith('use') ? camelCase(name) : pascalCase(name);
  }

  return titleize(name);
}

export type Translate = (id: string, options?: Partial<{ ignoreWarning: boolean }>) => string;

export function pageToTitleI18n(page: Page, t: Translate): string | null {
  const path = page.subheader || page.pathname;
  return page.query
    ? pageToTitle(page)
    : t(`pages.${path}`, { ignoreWarning: true }) || pageToTitle(page);
}

/**
 * Get the value of a cookie
 * Source: https://vanillajstoolkit.com/helpers/getcookie/
 * @param name - The name of the cookie
 * @return The cookie value
 */
export function getCookie(name: string): string | undefined {
  if (typeof document === 'undefined') {
    throw new Error(
      'getCookie() is not supported on the server. Fallback to a different value when rendering on the server.',
    );
  }

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts[1].split(';').shift();
  }

  return undefined;
}
