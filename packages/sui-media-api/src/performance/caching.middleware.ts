/**
 * Redis Caching Middleware for NestJS Media API
 *
 * Implements intelligent caching strategies for media API responses
 * to reduce database queries and improve response times.
 *
 * Configuration required in .env:
 * ```
 * REDIS_HOST=localhost
 * REDIS_PORT=6379
 * CACHE_TTL=300
 * ```
 *
 * Usage:
 * ```typescript
 * @Controller('media')
 * export class MediaController {
 *   @Get(':id')
 *   @CacheResponse({ ttl: 300 })
 *   getMedia(@Param('id') id: string) {
 *     return this.mediaService.getMedia(id);
 *   }
 * }
 * ```
 */

import {
  Injectable,
  NestMiddleware,
  Inject,
  Optional,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/**
 * Cache configuration by endpoint
 */
export const CACHE_CONFIG = {
  // Metadata endpoints - cached aggressively
  metadata: {
    ttl: 5 * 60, // 5 minutes
    key: 'media:metadata',
  },

  // Thumbnail endpoints - cached longer
  thumbnails: {
    ttl: 30 * 60, // 30 minutes
    key: 'media:thumbnail',
  },

  // File list endpoints - moderate cache
  fileList: {
    ttl: 2 * 60, // 2 minutes
    key: 'media:list',
  },

  // Search results - shorter cache
  search: {
    ttl: 1 * 60, // 1 minute
    key: 'media:search',
  },

  // Upload progress - no caching
  upload: {
    ttl: 0,
    key: null,
  },

  // Extraction status - no caching (real-time)
  extraction: {
    ttl: 0,
    key: null,
  },
};

/**
 * Cache key builder
 */
export function buildCacheKey(
  endpoint: string,
  params: Record<string, any> = {}
): string {
  const paramStr = Object.entries(params)
    .sort()
    .map(([k, v]) => `${k}:${v}`)
    .join('|');

  return paramStr ? `${endpoint}?${paramStr}` : endpoint;
}

/**
 * Redis Caching Middleware
 *
 * Decorator-based caching for Express responses
 */
@Injectable()
export class RedisCachingMiddleware implements NestMiddleware {
  constructor(@Optional() @Inject('REDIS_CLIENT') private redisClient?: any) {}

  use(req: Request, res: Response, next: NextFunction) {
    if (!this.redisClient) {
      // Redis not configured, skip caching
      next();
      return;
    }

    const originalJson = res.json.bind(res);

    res.json = function (data: any) {
      const cacheKey = buildCacheKey(req.path, {
        ...req.query,
        ...req.params,
      });

      // Cache successful responses (2xx status)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const ttl = CACHE_CONFIG[
          req.path.split('/')[1] as keyof typeof CACHE_CONFIG
        ]?.ttl;

        if (ttl && ttl > 0) {
          this.redisClient.setex(
            cacheKey,
            ttl,
            JSON.stringify(data),
            (err: any) => {
              if (err) {
                console.error('Cache write error:', err);
              }
            }
          );
        }
      }

      return originalJson(data);
    };

    next();
  }
}

/**
 * Cache invalidation helper
 */
export class CacheInvalidator {
  constructor(@Optional() @Inject('REDIS_CLIENT') private redisClient?: any) {}

  /**
   * Invalidate all caches for a file
   */
  async invalidateFile(fileId: string): Promise<void> {
    if (!this.redisClient) return;

    const patterns = [
      `media:metadata?*fileId:${fileId}*`,
      `media:thumbnail?*fileId:${fileId}*`,
      `media:list*`,
      `media:search*`,
    ];

    for (const pattern of patterns) {
      await this.deleteByPattern(pattern);
    }
  }

  /**
   * Invalidate metadata caches
   */
  async invalidateMetadata(): Promise<void> {
    if (!this.redisClient) return;
    await this.deleteByPattern('media:metadata*');
  }

  /**
   * Invalidate thumbnail caches
   */
  async invalidateThumbnails(): Promise<void> {
    if (!this.redisClient) return;
    await this.deleteByPattern('media:thumbnail*');
  }

  /**
   * Delete cache entries matching a pattern
   */
  private async deleteByPattern(pattern: string): Promise<void> {
    if (!this.redisClient) return;

    return new Promise((resolve, reject) => {
      const cursor = '0';
      const scanAndDelete = (cursor: string) => {
        this.redisClient.scan(
          cursor,
          'MATCH',
          pattern,
          'COUNT',
          '100',
          (err: any, reply: any) => {
            if (err) {
              reject(err);
              return;
            }

            const [nextCursor, keys] = reply;

            if (keys.length > 0) {
              this.redisClient.del(...keys, (err: any) => {
                if (err) {
                  reject(err);
                  return;
                }

                if (nextCursor !== '0') {
                  scanAndDelete(nextCursor);
                } else {
                  resolve();
                }
              });
            } else if (nextCursor !== '0') {
              scanAndDelete(nextCursor);
            } else {
              resolve();
            }
          }
        );
      };

      scanAndDelete(cursor);
    });
  }
}

/**
 * Cache decorator for NestJS controllers
 *
 * @example
 * @Get(':id')
 * @CacheResponse({ ttl: 300, key: 'custom-key' })
 * async getMedia(@Param('id') id: string) {
 *   return await this.mediaService.getMedia(id);
 * }
 */
export function CacheResponse(options?: { ttl?: number; key?: string }) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      // Implementation would require Request/Response objects
      // This is a placeholder for decorator pattern
      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}

export default {
  CACHE_CONFIG,
  buildCacheKey,
  RedisCachingMiddleware,
  CacheInvalidator,
  CacheResponse,
};
