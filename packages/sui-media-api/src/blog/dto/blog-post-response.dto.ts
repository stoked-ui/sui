import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Response DTO for a single blog post
 */
export class BlogPostResponseDto {
  @ApiProperty({
    description: 'MongoDB document ID',
    example: '507f1f77bcf86cd799439011',
  })
  _id: string;

  @ApiProperty({
    description: 'Blog post title',
    example: 'Getting Started with Stoked UI',
  })
  title: string;

  @ApiProperty({
    description: 'URL-friendly slug',
    example: 'getting-started-with-stoked-ui',
  })
  slug: string;

  @ApiProperty({
    description: 'Full post body content',
    example: '# Introduction\n\nWelcome to Stoked UI...',
  })
  body: string;

  @ApiProperty({
    description: 'Short description / excerpt',
    example: 'A quick guide to getting started with Stoked UI components.',
  })
  description: string;

  @ApiProperty({
    description: 'Publication status',
    enum: ['draft', 'published', 'archived'],
    example: 'published',
  })
  status: 'draft' | 'published' | 'archived';

  @ApiProperty({
    description: 'Tags',
    type: [String],
    example: ['typescript', 'react', 'ui'],
  })
  tags: string[];

  @ApiProperty({
    description: 'Authors',
    type: [String],
    example: ['jane.doe@example.com'],
  })
  authors: string[];

  @ApiProperty({
    description: 'Target sites',
    type: [String],
    example: ['stoked-ui.com'],
  })
  targetSites: string[];

  @ApiPropertyOptional({
    description: 'Cover image URL',
    example: 'https://cdn.example.com/blog/cover.jpg',
  })
  image?: string;

  @ApiPropertyOptional({
    description: 'Publication date',
    example: '2026-02-19T00:00:00.000Z',
  })
  date?: Date;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2026-02-19T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2026-02-19T12:00:00.000Z',
  })
  updatedAt: Date;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(doc: any) {
    this._id = doc._id?.toString?.() ?? doc._id;
    this.title = doc.title;
    this.slug = doc.slug;
    this.body = doc.body;
    this.description = doc.description;
    this.status = doc.status;
    this.tags = doc.tags ?? [];
    this.authors = doc.authors ?? [];
    this.targetSites = doc.targetSites ?? ['stoked-ui.com'];
    this.image = doc.image;
    this.date = doc.date;
    this.createdAt = doc.createdAt;
    this.updatedAt = doc.updatedAt;
  }
}

/**
 * Paginated blog posts response
 */
export class PaginatedBlogPostsResponseDto {
  @ApiProperty({
    description: 'Array of blog posts',
    type: [BlogPostResponseDto],
  })
  data: BlogPostResponseDto[];

  @ApiProperty({ description: 'Total number of matching posts', example: 42 })
  total: number;

  @ApiProperty({ description: 'Current page', example: 1 })
  page: number;

  @ApiProperty({ description: 'Posts per page', example: 20 })
  limit: number;

  @ApiProperty({ description: 'Whether there are more pages', example: true })
  hasMore: boolean;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(data: any[], total: number, page: number, limit: number) {
    this.data = data.map((doc) => new BlogPostResponseDto(doc));
    this.total = total;
    this.page = page;
    this.limit = limit;
    this.hasMore = page * limit < total;
  }
}

/**
 * Tag count response item
 */
export class TagCountDto {
  @ApiProperty({ description: 'Tag name', example: 'typescript' })
  tag: string;

  @ApiProperty({ description: 'Number of published posts with this tag', example: 5 })
  count: number;
}

/**
 * Author response item
 */
export class AuthorDto {
  @ApiProperty({ description: 'Author identifier', example: 'jane.doe@example.com' })
  author: string;

  @ApiProperty({ description: 'Number of published posts by this author', example: 3 })
  count: number;
}
