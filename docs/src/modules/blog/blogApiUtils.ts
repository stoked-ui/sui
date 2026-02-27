import type { NextApiResponse } from 'next';
import type { ParsedUrlQuery } from 'querystring';
import { BlogQuery, BlogSortBy, BlogStatus, BlogStoreError } from './blogStore';

const BLOG_STATUSES: BlogStatus[] = ['draft', 'published', 'archived'];
const BLOG_SORT_FIELDS: BlogSortBy[] = ['date', 'title', 'createdAt'];

function parsePositiveInt(raw: string | string[] | undefined, fallback: number): number {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (!value) {
    return fallback;
  }
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback;
  }
  return Math.floor(parsed);
}

function parseString(raw: string | string[] | undefined): string | undefined {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (!value) {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed || undefined;
}

export function parseBlogQuery(query: ParsedUrlQuery): BlogQuery {
  const status = parseString(query.status);
  const sortBy = parseString(query.sortBy);

  return {
    page: parsePositiveInt(query.page, 1),
    limit: parsePositiveInt(query.limit, 20),
    search: parseString(query.search),
    tag: parseString(query.tag),
    status: status && BLOG_STATUSES.includes(status as BlogStatus)
      ? (status as BlogStatus)
      : undefined,
    author: parseString(query.author),
    site: parseString(query.site),
    sortBy: sortBy && BLOG_SORT_FIELDS.includes(sortBy as BlogSortBy)
      ? (sortBy as BlogSortBy)
      : undefined,
  };
}

export function handleBlogApiError(res: NextApiResponse, error: unknown, fallback = 'Unexpected server error') {
  if (error instanceof BlogStoreError) {
    return res.status(error.status).json({ message: error.message });
  }

  if (error instanceof Error) {
    return res.status(500).json({ message: error.message || fallback });
  }

  return res.status(500).json({ message: fallback });
}
