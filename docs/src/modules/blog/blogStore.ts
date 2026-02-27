import { ObjectId } from 'mongodb';
import { getDb } from 'docs/src/modules/db/mongodb';

const BLOG_COLLECTION = 'blogposts';

export type BlogStatus = 'draft' | 'published' | 'archived';
export type BlogSortBy = 'date' | 'title' | 'createdAt';

export interface BlogPostInput {
  title: string;
  slug?: string;
  body: string;
  description: string;
  tags: string[];
  authors: string[];
  targetSites?: string[];
  image?: string;
  date?: string;
}

export type BlogPostUpdate = Partial<BlogPostInput>;

export interface BlogQuery {
  page?: number;
  limit?: number;
  search?: string;
  tag?: string;
  status?: BlogStatus;
  author?: string;
  site?: string;
  sortBy?: BlogSortBy;
}

export interface TagCount {
  tag: string;
  count: number;
}

export interface AuthorCount {
  author: string;
  count: number;
}

export interface PaginatedBlogPosts {
  data: unknown[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export class BlogStoreError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function toBlogResponse(doc: Record<string, unknown>) {
  return {
    ...doc,
    _id: (doc._id as ObjectId)?.toString?.() ?? doc._id,
  };
}

function asPositiveInt(value: number | undefined, fallback: number): number {
  if (!value || !Number.isFinite(value) || value < 1) {
    return fallback;
  }
  return Math.floor(value);
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .filter((v) => typeof v === 'string')
    .map((v) => v.trim())
    .filter(Boolean);
}

function parseDateOrNow(value: string | undefined): Date {
  if (!value) {
    return new Date();
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new BlogStoreError(400, 'Invalid date format. Expected ISO 8601 string.');
  }
  return parsed;
}

export async function createBlogPost(input: BlogPostInput) {
  const db = await getDb();
  const collection = db.collection(BLOG_COLLECTION);

  const slug = (input.slug || slugify(input.title || '')).trim();
  if (!slug) {
    throw new BlogStoreError(400, 'Slug is required or could not be generated from title.');
  }

  const existing = await collection.findOne({ slug, deleted: { $ne: true } });
  if (existing) {
    throw new BlogStoreError(409, `A blog post with slug "${slug}" already exists`);
  }

  const now = new Date();
  const doc = {
    title: input.title,
    slug,
    body: input.body,
    description: input.description,
    tags: normalizeStringArray(input.tags),
    authors: normalizeStringArray(input.authors),
    targetSites: normalizeStringArray(input.targetSites).length > 0
      ? normalizeStringArray(input.targetSites)
      : ['stoked-ui.com'],
    image: input.image || undefined,
    date: parseDateOrNow(input.date),
    status: 'draft' as BlogStatus,
    source: 'native',
    deleted: false,
    createdAt: now,
    updatedAt: now,
  };

  try {
    const result = await collection.insertOne(doc);
    return toBlogResponse({ _id: result.insertedId, ...doc });
  } catch (error: unknown) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code?: number }).code === 11000
    ) {
      throw new BlogStoreError(409, `A blog post with slug "${slug}" already exists`);
    }
    throw error;
  }
}

export async function getBlogPostBySlug(slug: string) {
  const db = await getDb();
  const collection = db.collection(BLOG_COLLECTION);

  const doc = await collection.findOne({ slug, deleted: { $ne: true } });
  if (!doc) {
    throw new BlogStoreError(404, `Blog post with slug "${slug}" not found`);
  }

  return toBlogResponse(doc as Record<string, unknown>);
}

export async function listBlogPosts(query: BlogQuery): Promise<PaginatedBlogPosts> {
  const db = await getDb();
  const collection = db.collection(BLOG_COLLECTION);

  const page = asPositiveInt(query.page, 1);
  const limit = asPositiveInt(query.limit, 20);
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = { deleted: { $ne: true } };
  if (query.status) filter.status = query.status;
  if (query.tag) filter.tags = query.tag;
  if (query.author) filter.authors = query.author;
  if (query.site) filter.targetSites = query.site;
  if (query.search) filter.$text = { $search: query.search };

  const sortBy = query.sortBy ?? 'date';
  const sort: Record<string, 1 | -1> = sortBy === 'title' ? { title: 1 } : { [sortBy]: -1 };

  const [docs, total] = await Promise.all([
    collection.find(filter).sort(sort).skip(skip).limit(limit).toArray(),
    collection.countDocuments(filter),
  ]);

  return {
    data: docs.map((doc) => toBlogResponse(doc as Record<string, unknown>)),
    total,
    page,
    limit,
    hasMore: page * limit < total,
  };
}

export async function listPublicBlogPosts(query: BlogQuery): Promise<PaginatedBlogPosts> {
  const db = await getDb();
  const collection = db.collection(BLOG_COLLECTION);

  const page = asPositiveInt(query.page, 1);
  const limit = asPositiveInt(query.limit, 20);
  const skip = (page - 1) * limit;
  const site = query.site ?? 'stoked-ui.com';

  const filter: Record<string, unknown> = {
    status: 'published',
    deleted: { $ne: true },
    targetSites: site,
  };
  if (query.tag) filter.tags = query.tag;
  if (query.author) filter.authors = query.author;
  if (query.search) filter.$text = { $search: query.search };

  const sortBy = query.sortBy ?? 'date';
  const sort: Record<string, 1 | -1> = sortBy === 'title' ? { title: 1 } : { [sortBy]: -1 };

  const projection = {
    __v: 0,
    denyAccess: 0,
    canAccess: 0,
    canEdit: 0,
    deleted: 0,
    deletedAt: 0,
    tokens: 0,
  };

  const [docs, total] = await Promise.all([
    collection.find(filter, { projection }).sort(sort).skip(skip).limit(limit).toArray(),
    collection.countDocuments(filter),
  ]);

  return {
    data: docs.map((doc) => toBlogResponse(doc as Record<string, unknown>)),
    total,
    page,
    limit,
    hasMore: page * limit < total,
  };
}

export async function updateBlogPost(slug: string, updates: BlogPostUpdate) {
  const db = await getDb();
  const collection = db.collection(BLOG_COLLECTION);
  const existing = await collection.findOne({ slug, deleted: { $ne: true } });

  if (!existing) {
    throw new BlogStoreError(404, `Blog post with slug "${slug}" not found`);
  }

  const updateDoc: Record<string, unknown> = { updatedAt: new Date() };

  if (updates.title !== undefined) updateDoc.title = updates.title;
  if (updates.body !== undefined) updateDoc.body = updates.body;
  if (updates.description !== undefined) updateDoc.description = updates.description;
  if (updates.tags !== undefined) updateDoc.tags = normalizeStringArray(updates.tags);
  if (updates.authors !== undefined) updateDoc.authors = normalizeStringArray(updates.authors);
  if (updates.targetSites !== undefined) {
    const targetSites = normalizeStringArray(updates.targetSites);
    updateDoc.targetSites = targetSites.length > 0 ? targetSites : ['stoked-ui.com'];
  }
  if (updates.image !== undefined) updateDoc.image = updates.image || undefined;
  if (updates.date !== undefined) updateDoc.date = parseDateOrNow(updates.date);

  if (updates.slug !== undefined && updates.slug !== slug) {
    const nextSlug = updates.slug.trim();
    if (!nextSlug) {
      throw new BlogStoreError(400, 'slug cannot be empty');
    }

    const existingWithSlug = await collection.findOne({
      slug: nextSlug,
      deleted: { $ne: true },
      _id: { $ne: existing._id },
    });

    if (existingWithSlug) {
      throw new BlogStoreError(409, `A blog post with slug "${nextSlug}" already exists`);
    }

    updateDoc.slug = nextSlug;
  }

  const result = await collection.findOneAndUpdate(
    { _id: existing._id },
    { $set: updateDoc },
    { returnDocument: 'after' },
  );

  if (!result) {
    throw new BlogStoreError(404, `Blog post with slug "${slug}" not found`);
  }

  return toBlogResponse(result as Record<string, unknown>);
}

export async function softDeleteBlogPost(slug: string): Promise<void> {
  const db = await getDb();
  const collection = db.collection(BLOG_COLLECTION);

  const result = await collection.findOneAndUpdate(
    { slug, deleted: { $ne: true } },
    { $set: { deleted: true, deletedAt: new Date(), updatedAt: new Date() } },
    { returnDocument: 'after' },
  );

  if (!result) {
    throw new BlogStoreError(404, `Blog post with slug "${slug}" not found`);
  }
}

export async function publishBlogPost(slug: string) {
  const db = await getDb();
  const collection = db.collection(BLOG_COLLECTION);

  const existing = await collection.findOne({ slug, deleted: { $ne: true } });
  if (!existing) {
    throw new BlogStoreError(404, `Blog post with slug "${slug}" not found`);
  }

  const setFields: Record<string, unknown> = {
    status: 'published',
    updatedAt: new Date(),
  };

  if (!existing.date) {
    setFields.date = new Date();
  }

  const result = await collection.findOneAndUpdate(
    { slug, deleted: { $ne: true } },
    { $set: setFields },
    { returnDocument: 'after' },
  );

  if (!result) {
    throw new BlogStoreError(404, `Blog post with slug "${slug}" not found`);
  }

  return toBlogResponse(result as Record<string, unknown>);
}

export async function unpublishBlogPost(slug: string) {
  const db = await getDb();
  const collection = db.collection(BLOG_COLLECTION);

  const result = await collection.findOneAndUpdate(
    { slug, deleted: { $ne: true } },
    { $set: { status: 'draft', updatedAt: new Date() } },
    { returnDocument: 'after' },
  );

  if (!result) {
    throw new BlogStoreError(404, `Blog post with slug "${slug}" not found`);
  }

  return toBlogResponse(result as Record<string, unknown>);
}

export async function getBlogTagCounts(): Promise<TagCount[]> {
  const db = await getDb();
  const collection = db.collection(BLOG_COLLECTION);

  const rows = await collection.aggregate<{ _id: string; count: number }>([
    { $match: { status: 'published', deleted: { $ne: true } } },
    { $unwind: '$tags' },
    { $group: { _id: '$tags', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]).toArray();

  return rows.map((row) => ({ tag: row._id, count: row.count }));
}

export async function getBlogAuthorCounts(): Promise<AuthorCount[]> {
  const db = await getDb();
  const collection = db.collection(BLOG_COLLECTION);

  const rows = await collection.aggregate<{ _id: string; count: number }>([
    { $match: { status: 'published', deleted: { $ne: true } } },
    { $unwind: '$authors' },
    { $group: { _id: '$authors', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]).toArray();

  return rows.map((row) => ({ author: row._id, count: row.count }));
}
