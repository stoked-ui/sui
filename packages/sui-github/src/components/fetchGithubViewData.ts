export default async function fetchGithubViewData<T>(
  apiUrl: string,
  params: Record<string, string>,
): Promise<T> {
  const query = new URLSearchParams(params);
  const separator = apiUrl.includes('?') ? '&' : '?';
  const response = await fetch(`${apiUrl}${separator}${query.toString()}`);

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new Error(errorBody?.message || 'Failed to fetch GitHub data');
  }

  return response.json() as Promise<T>;
}
