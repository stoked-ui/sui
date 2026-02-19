import { PartialType } from '@nestjs/swagger';
import { CreateBlogPostDto } from './create-blog-post.dto';

/**
 * DTO for updating a blog post
 * All fields are optional (extends CreateBlogPostDto with PartialType)
 */
export class UpdateBlogPostDto extends PartialType(CreateBlogPostDto) {}
