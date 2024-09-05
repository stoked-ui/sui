import * as React from 'react';
import { loadCSS } from 'fg-loadcss/src/loadCSS';

/**
 * Convenience wrapper around fgLoadCSS for hooks usage
 * @param {string} href
 * @param {string} before - CSS selector
 * @returns {() => void} cleanup function
 */
function useLazyCSS(href: string, before: string): void {
  React.useEffect(() => {
    const link = loadCSS(href, document.querySelector(before));
    return () => {
      link.parentElement?.removeChild(link);
    };
  }, [href, before]);
}

export default useLazyCSS;
