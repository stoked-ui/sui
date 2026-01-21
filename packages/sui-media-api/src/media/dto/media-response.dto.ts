import { MediaEntity } from '../entities/media.entity';

/**
 * DTO for media response
 * Ensures consistent response structure
 */
export class MediaResponseDto {
  _id: string;
  author: string;
  title?: string;
  description?: string;
  mediaType: 'image' | 'video' | 'album';
  mime: string;
  file: string;
  bucket?: string;
  width?: number;
  height?: number;
  duration?: number;
  size?: number;
  thumbnail?: string;
  paidThumbnail?: string;
  publicity: 'public' | 'private' | 'paid' | 'subscription';
  rating?: 'ga' | 'nc17';
  price?: number;
  starring?: string[];
  views?: number;
  tags?: string[];
  mediaClass?: string;
  videoBug?: string;
  processingStatus?: 'pending' | 'processing' | 'complete' | 'failed';
  processingTasks?: {
    thumbnails?: boolean;
    duration?: boolean;
    dimensions?: boolean;
    blurredThumbnail?: boolean;
    sprites?: boolean;
  };
  uploadSessionId?: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(entity: MediaEntity) {
    this._id = entity._id;
    this.author = entity.author;
    this.title = entity.title;
    this.description = entity.description;
    this.mediaType = entity.mediaType;
    this.mime = entity.mime;
    this.file = entity.file;
    this.bucket = entity.bucket;
    this.width = entity.width;
    this.height = entity.height;
    this.duration = entity.duration;
    this.size = entity.size;
    this.thumbnail = entity.thumbnail;
    this.paidThumbnail = entity.paidThumbnail;
    this.publicity = entity.publicity;
    this.rating = entity.rating;
    this.price = entity.price;
    this.starring = entity.starring;
    this.views = entity.views;
    this.tags = entity.tags;
    this.mediaClass = entity.mediaClass;
    this.videoBug = entity.videoBug;
    this.processingStatus = entity.processingStatus;
    this.processingTasks = entity.processingTasks;
    this.uploadSessionId = entity.uploadSessionId;
    this.createdAt = entity.createdAt;
    this.updatedAt = entity.updatedAt;
  }
}

/**
 * Paginated media response
 * Includes pagination metadata
 */
export class PaginatedMediaResponseDto {
  data: MediaResponseDto[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
  cursor?: string; // Next cursor for cursor-based pagination

  constructor(data: MediaEntity[], total: number, limit: number, offset: number, cursor?: string) {
    this.data = data.map((entity) => new MediaResponseDto(entity));
    this.total = total;
    this.limit = limit;
    this.offset = offset;
    this.hasMore = offset + data.length < total;
    this.cursor = cursor;
  }
}
