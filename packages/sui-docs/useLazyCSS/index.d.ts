/**
 * Convenience wrapper around fgLoadCSS for hooks usage
 * @param href - URL of the CSS file to load
 * @param before - CSS selector to insert before
 * @returns cleanup function
 */
export default function useLazyCSS(href: string, before: string): void; 

