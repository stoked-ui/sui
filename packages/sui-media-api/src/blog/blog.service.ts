import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BlogPost, BlogPostDocument } from '@stoked-ui/common-api';
import {
  CreateBlogPostDto,
  UpdateBlogPostDto,
  QueryBlogPostsDto,
  BlogPostResponseDto,
  PaginatedBlogPostsResponseDto,
  TagCountDto,
  AuthorDto,
} from './dto';

/**
 * Generates a URL-friendly slug from a title string.
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

@Injectable()
export class BlogService {
  private readonly logger = new Logger(BlogService.name);

  constructor(
    @InjectModel(BlogPost.name)
    private readonly blogPostModel: Model<BlogPostDocument>,
  ) {}

  /**
   * Create a new blog post.
   * Slug is auto-generated from title if not provided.
   * Status defaults to 'draft'.
   */
  async create(dto: CreateBlogPostDto): Promise<BlogPostResponseDto> {
    const slug = dto.slug ?? slugify(dto.title);
    const date = dto.date ? new Date(dto.date) : new Date();

    try {
      const doc = await this.blogPostModel.create({
        title: dto.title,
        slug,
        body: dto.body,
        description: dto.description,
        tags: dto.tags,
        authors: dto.authors,
        targetSites: dto.targetSites ?? ['stoked-ui.com'],
        image: dto.image,
        date,
        status: 'draft',
        source: 'native',
      });

      this.logger.log(`Created blog post: ${doc._id} (slug: ${slug})`);
      return new BlogPostResponseDto(doc);
    } catch (error: unknown) {
      // MongoDB duplicate key error code
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        (error as { code: number }).code === 11000
      ) {
        throw new ConflictException(`A blog post with slug "${slug}" already exists`);
      }
      throw error;
    }
  }

  /**
   * Find a single post by slug.
   * Throws NotFoundException if not found.
   */
  async findBySlug(slug: string): Promise<BlogPostDocument> {
    const doc = await this.blogPostModel.findOne({ slug, deleted: { $ne: true } }).exec();
    if (!doc) {
      throw new NotFoundException(`Blog post with slug "${slug}" not found`);
    }
    return doc;
  }

  /**
   * List posts with pagination, filtering, and search.
   */
  async findAll(query: QueryBlogPostsDto): Promise<PaginatedBlogPostsResponseDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: Record<string, any> = { deleted: { $ne: true } };

    if (query.status) {
      filter['status'] = query.status;
    }

    if (query.tag) {
      filter['tags'] = query.tag;
    }

    if (query.author) {
      filter['authors'] = query.author;
    }

    if (query.site) {
      filter['targetSites'] = query.site;
    }

    if (query.search) {
      filter['$text'] = { $search: query.search };
    }

    const [docs, total] = await Promise.all([
      this.blogPostModel
        .find(filter)
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.blogPostModel.countDocuments(filter).exec(),
    ]);

    return new PaginatedBlogPostsResponseDto(docs, total, page, limit);
  }

  /**
   * List published posts for a specific site (public endpoint).
   */
  async findPublic(site: string, query: QueryBlogPostsDto): Promise<PaginatedBlogPostsResponseDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: Record<string, any> = {
      status: 'published',
      deleted: { $ne: true },
      targetSites: site,
    };

    if (query.tag) {
      filter['tags'] = query.tag;
    }

    if (query.author) {
      filter['authors'] = query.author;
    }

    if (query.search) {
      filter['$text'] = { $search: query.search };
    }

    const [docs, total] = await Promise.all([
      this.blogPostModel
        .find(filter)
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.blogPostModel.countDocuments(filter).exec(),
    ]);

    return new PaginatedBlogPostsResponseDto(docs, total, page, limit);
  }

  /**
   * Update a post by slug.
   */
  async update(slug: string, dto: UpdateBlogPostDto): Promise<BlogPostResponseDto> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updates: Record<string, any> = { ...dto };

    // If slug is being changed, validate new slug
    if (dto.slug && dto.slug !== slug) {
      const existing = await this.blogPostModel.findOne({ slug: dto.slug }).exec();
      if (existing) {
        throw new ConflictException(`A blog post with slug "${dto.slug}" already exists`);
      }
    }

    if (dto.date) {
      updates['date'] = new Date(dto.date);
    }

    const doc = await this.blogPostModel
      .findOneAndUpdate(
        { slug, deleted: { $ne: true } },
        { $set: updates },
        { new: true },
      )
      .exec();

    if (!doc) {
      throw new NotFoundException(`Blog post with slug "${slug}" not found`);
    }

    this.logger.log(`Updated blog post: ${slug}`);
    return new BlogPostResponseDto(doc);
  }

  /**
   * Soft-delete a post by slug.
   */
  async softDelete(slug: string): Promise<void> {
    const doc = await this.blogPostModel
      .findOneAndUpdate(
        { slug, deleted: { $ne: true } },
        { $set: { deleted: true, deletedAt: new Date() } },
        { new: true },
      )
      .exec();

    if (!doc) {
      throw new NotFoundException(`Blog post with slug "${slug}" not found`);
    }

    this.logger.log(`Soft-deleted blog post: ${slug}`);
  }

  /**
   * Publish a post – sets status to 'published' and sets date if not already set.
   */
  async publish(slug: string): Promise<BlogPostResponseDto> {
    const existing = await this.findBySlug(slug);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updates: Record<string, any> = { status: 'published' };
    if (!existing.date) {
      updates['date'] = new Date();
    }

    const doc = await this.blogPostModel
      .findOneAndUpdate(
        { slug, deleted: { $ne: true } },
        { $set: updates },
        { new: true },
      )
      .exec();

    if (!doc) {
      throw new NotFoundException(`Blog post with slug "${slug}" not found`);
    }

    this.logger.log(`Published blog post: ${slug}`);
    return new BlogPostResponseDto(doc);
  }

  /**
   * Unpublish a post – sets status back to 'draft'.
   */
  async unpublish(slug: string): Promise<BlogPostResponseDto> {
    const doc = await this.blogPostModel
      .findOneAndUpdate(
        { slug, deleted: { $ne: true } },
        { $set: { status: 'draft' } },
        { new: true },
      )
      .exec();

    if (!doc) {
      throw new NotFoundException(`Blog post with slug "${slug}" not found`);
    }

    this.logger.log(`Unpublished blog post: ${slug}`);
    return new BlogPostResponseDto(doc);
  }

  /**
   * Aggregate tag counts from published posts.
   */
  async getTagCounts(): Promise<TagCountDto[]> {
    const results = await this.blogPostModel.aggregate<{ _id: string; count: number }>([
      { $match: { status: 'published', deleted: { $ne: true } } },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    return results.map((r) => ({ tag: r._id, count: r.count }));
  }

  /**
   * Aggregate distinct authors from published posts.
   */
  async getAuthors(): Promise<AuthorDto[]> {
    const results = await this.blogPostModel.aggregate<{ _id: string; count: number }>([
      { $match: { status: 'published', deleted: { $ne: true } } },
      { $unwind: '$authors' },
      { $group: { _id: '$authors', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    return results.map((r) => ({ author: r._id, count: r.count }));
  }
}
