import {
  IsString,
  IsOptional,
  IsArray,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for creating a blog post
 */
export class CreateBlogPostDto {
  @ApiProperty({
    description: 'Blog post title',
    example: 'Getting Started with Stoked UI',
  })
  @IsString()
  title: string;

  @ApiPropertyOptional({
    description: 'URL-friendly slug (auto-generated from title if not provided)',
    example: 'getting-started-with-stoked-ui',
  })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiProperty({
    description: 'Full post body content (supports Markdown)',
    example: '# Introduction\n\nWelcome to Stoked UI...',
  })
  @IsString()
  body: string;

  @ApiProperty({
    description: 'Short description / excerpt',
    example: 'A quick guide to getting started with Stoked UI components.',
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Tags for the post',
    type: [String],
    example: ['typescript', 'react', 'ui'],
  })
  @IsArray()
  @IsString({ each: true })
  tags: string[];

  @ApiProperty({
    description: 'Authors of the post',
    type: [String],
    example: ['jane.doe@example.com'],
  })
  @IsArray()
  @IsString({ each: true })
  authors: string[];

  @ApiPropertyOptional({
    description: 'Sites this post should appear on',
    type: [String],
    example: ['stoked-ui.com'],
    default: ['stoked-ui.com'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  targetSites?: string[];

  @ApiPropertyOptional({
    description: 'Cover image URL',
    example: 'https://cdn.example.com/blog/cover.jpg',
  })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiPropertyOptional({
    description: 'Publication date (ISO 8601)',
    example: '2026-02-19T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  date?: string;
}
