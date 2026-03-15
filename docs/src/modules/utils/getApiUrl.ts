export const getApiUrl = (path: string) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  // Ensure API paths have a trailing slash (Next.js trailingSlash: true strips
  // auth headers on redirect from /api/foo to /api/foo/), but preserve query strings.
  const [pathname, query] = normalizedPath.split('?');
  const slashed = pathname.endsWith('/') ? pathname : `${pathname}/`;
  const finalPath = query ? `${slashed}?${query}` : slashed;

  const baseUrl = process.env.NEXT_PUBLIC_DOCS_API_BASE_URL;
  if (!baseUrl) {
    return finalPath;
  }

  return `${baseUrl.replace(/\/$/, '')}${finalPath}`;
};
