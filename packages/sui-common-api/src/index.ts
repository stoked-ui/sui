// Server-side NestJS/Mongoose models, decorators, and DTOs
// This package should only be used in backend/API packages

export * from './models/index.js';
export * from './dtos/index.js';
export * from './decorators/index.js';

// Re-export interfaces from @stoked-ui/common for convenience
export {
  type PublicityType,
  PUBLICITY_TYPES,
  ADMIN_ONLY_PUBLICITY_TYPES,
  ALL_FILTER_PUBLICITY_TYPES,
  isAdminOnlyPublicity,
  isIncludedInAllFilter,
  type EmbedVisibilityType,
  DEFAULT_EMBED_VISIBILITY,
  PUBLIC_EMBED_VISIBILITY_TYPES,
  AUTHENTICATED_EMBED_VISIBILITY_TYPES,
  isPublicEmbedVisibility,
  isAuthenticatedEmbedVisibility,
} from '@stoked-ui/common';
