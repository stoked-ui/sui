export const getApiUrl = (path: string) => {
  const baseUrl = process.env.NEXT_PUBLIC_DOCS_API_BASE_URL;
  if (!baseUrl) {
    return path;
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl.replace(/\/$/, '')}${normalizedPath}`;
};
