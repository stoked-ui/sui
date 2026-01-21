/**
 * Media API Client Module
 *
 * Provides a type-safe client for interacting with the NestJS Media API.
 * Supports CRUD operations, metadata extraction, thumbnail generation, and file uploads.
 */

export { MediaApiClient, createMediaApiClient } from './media-api-client';
export { UploadClient, createUploadClient, UploadError } from './upload-client';
export type * from './types';
