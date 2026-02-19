import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  HttpStatus,
  HttpCode,
  UseGuards,
  ValidationPipe,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { Request } from 'express';
import { BlogService } from './blog.service';
import {
  CreateBlogPostDto,
  UpdateBlogPostDto,
  QueryBlogPostsDto,
  BlogPostResponseDto,
  PaginatedBlogPostsResponseDto,
  TagCountDto,
  AuthorDto,
} from './dto';
import { AuthGuard } from '../media/guards/auth.guard';

@Controller('blog')
@ApiTags('Blog')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  // ---------------------------------------------------------------------------
  // POST /blog  – Create
  // ---------------------------------------------------------------------------

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a blog post',
    description: 'Create a new blog post. Status defaults to draft.',
  })
  @ApiResponse({
    status: 201,
    description: 'Blog post created successfully',
    type: BlogPostResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 409, description: 'Slug already exists' })
  async create(
    @Body(ValidationPipe) dto: CreateBlogPostDto,
  ): Promise<BlogPostResponseDto> {
    return this.blogService.create(dto);
  }

  // ---------------------------------------------------------------------------
  // GET /blog  – List (authenticated)
  // ---------------------------------------------------------------------------

  @Get()
  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'List all blog posts',
    description: 'List/filter/search blog posts with pagination. Requires authentication.',
  })
  @ApiResponse({
    status: 200,
    description: 'Posts retrieved successfully',
    type: PaginatedBlogPostsResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(
    @Query(ValidationPipe) query: QueryBlogPostsDto,
  ): Promise<PaginatedBlogPostsResponseDto> {
    return this.blogService.findAll(query);
  }

  // ---------------------------------------------------------------------------
  // GET /blog/public  – Public published posts
  // ---------------------------------------------------------------------------

  @Get('public')
  @ApiOperation({
    summary: 'List published posts (public)',
    description: 'List published blog posts filtered by site. Does not require authentication.',
  })
  @ApiQuery({
    name: 'site',
    required: false,
    type: String,
    description: 'Filter by target site (default: stoked-ui.com)',
    example: 'stoked-ui.com',
  })
  @ApiResponse({
    status: 200,
    description: 'Published posts retrieved successfully',
    type: PaginatedBlogPostsResponseDto,
  })
  async findPublic(
    @Query(ValidationPipe) query: QueryBlogPostsDto,
  ): Promise<PaginatedBlogPostsResponseDto> {
    const site = query.site ?? 'stoked-ui.com';
    return this.blogService.findPublic(site, query);
  }

  // ---------------------------------------------------------------------------
  // GET /blog/tags  – Tag counts (public)
  // ---------------------------------------------------------------------------

  @Get('tags')
  @ApiOperation({
    summary: 'Get all tags with post counts',
    description: 'Returns all tags used in published posts along with their post counts.',
  })
  @ApiResponse({
    status: 200,
    description: 'Tags retrieved successfully',
    type: [TagCountDto],
  })
  async getTags(): Promise<TagCountDto[]> {
    return this.blogService.getTagCounts();
  }

  // ---------------------------------------------------------------------------
  // GET /blog/authors  – Authors (public)
  // ---------------------------------------------------------------------------

  @Get('authors')
  @ApiOperation({
    summary: 'Get all authors with post counts',
    description: 'Returns all authors who have published posts along with their post counts.',
  })
  @ApiResponse({
    status: 200,
    description: 'Authors retrieved successfully',
    type: [AuthorDto],
  })
  async getAuthors(): Promise<AuthorDto[]> {
    return this.blogService.getAuthors();
  }

  // ---------------------------------------------------------------------------
  // GET /blog/:slug  – Read single post
  // ---------------------------------------------------------------------------

  @Get(':slug')
  @ApiOperation({
    summary: 'Get a blog post by slug',
    description:
      'Returns a published post to anyone. Draft posts require authentication.',
  })
  @ApiParam({ name: 'slug', description: 'URL slug of the post', example: 'my-first-post' })
  @ApiResponse({ status: 200, description: 'Post retrieved', type: BlogPostResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized (draft post requires auth)' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  async findOne(
    @Param('slug') slug: string,
    @Req() req: Request,
  ): Promise<BlogPostResponseDto> {
    const doc = await this.blogService.findBySlug(slug);

    if (doc.status !== 'published') {
      // Draft/archived posts require authentication
      const user = (req as Request & { user?: unknown }).user;
      if (!user) {
        throw new UnauthorizedException('Authentication required to view draft posts');
      }
    }

    return new BlogPostResponseDto(doc);
  }

  // ---------------------------------------------------------------------------
  // PATCH /blog/:slug  – Update
  // ---------------------------------------------------------------------------

  @Patch(':slug')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Update a blog post',
    description: 'Update any fields of a blog post by slug. Requires authentication.',
  })
  @ApiParam({ name: 'slug', description: 'URL slug of the post', example: 'my-first-post' })
  @ApiResponse({ status: 200, description: 'Post updated', type: BlogPostResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  @ApiResponse({ status: 409, description: 'New slug already exists' })
  async update(
    @Param('slug') slug: string,
    @Body(ValidationPipe) dto: UpdateBlogPostDto,
  ): Promise<BlogPostResponseDto> {
    return this.blogService.update(slug, dto);
  }

  // ---------------------------------------------------------------------------
  // DELETE /blog/:slug  – Soft-delete
  // ---------------------------------------------------------------------------

  @Delete(':slug')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete a blog post',
    description: 'Soft-deletes a blog post by slug. Requires authentication.',
  })
  @ApiParam({ name: 'slug', description: 'URL slug of the post', example: 'my-first-post' })
  @ApiResponse({ status: 204, description: 'Post deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  async remove(@Param('slug') slug: string): Promise<void> {
    await this.blogService.softDelete(slug);
  }

  // ---------------------------------------------------------------------------
  // POST /blog/:slug/publish  – Publish
  // ---------------------------------------------------------------------------

  @Post(':slug/publish')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Publish a blog post',
    description:
      'Sets status to published. Sets publication date to now if not already set. Requires authentication.',
  })
  @ApiParam({ name: 'slug', description: 'URL slug of the post', example: 'my-first-post' })
  @ApiResponse({ status: 200, description: 'Post published', type: BlogPostResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  async publish(@Param('slug') slug: string): Promise<BlogPostResponseDto> {
    return this.blogService.publish(slug);
  }

  // ---------------------------------------------------------------------------
  // POST /blog/:slug/unpublish  – Unpublish
  // ---------------------------------------------------------------------------

  @Post(':slug/unpublish')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Unpublish a blog post',
    description: 'Sets status back to draft. Requires authentication.',
  })
  @ApiParam({ name: 'slug', description: 'URL slug of the post', example: 'my-first-post' })
  @ApiResponse({ status: 200, description: 'Post unpublished', type: BlogPostResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  async unpublish(@Param('slug') slug: string): Promise<BlogPostResponseDto> {
    return this.blogService.unpublish(slug);
  }
}
