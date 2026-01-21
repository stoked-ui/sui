/**
 * Embed visibility controls whether media can be shown through embed endpoints.
 * This is independent from the general `publicity` field and provides fine-grained
 * control specifically for embed contexts.
 *
 * - `public`: Media can be embedded on any allowed domain without authentication
 * - `authenticated`: Media can be embedded only when embed token has authentication scope
 * - `private`: Media NEVER appears in embed endpoints (even if publicity is 'public')
 */
export type EmbedVisibilityType = 'public' | 'authenticated' | 'private';

/**
 * Default embed visibility for newly created media (most restrictive)
 */
export const DEFAULT_EMBED_VISIBILITY: EmbedVisibilityType = 'private';

/**
 * Embed visibility types that are allowed in public embed endpoints
 */
export const PUBLIC_EMBED_VISIBILITY_TYPES: EmbedVisibilityType[] = ['public'];

/**
 * Embed visibility types that require authentication
 */
export const AUTHENTICATED_EMBED_VISIBILITY_TYPES: EmbedVisibilityType[] = [
  'public',
  'authenticated',
];

/**
 * Check if embed visibility allows public access (no authentication required)
 */
export function isPublicEmbedVisibility(visibility: EmbedVisibilityType): boolean {
  return PUBLIC_EMBED_VISIBILITY_TYPES.includes(visibility);
}

/**
 * Check if embed visibility allows authenticated access
 */
export function isAuthenticatedEmbedVisibility(visibility: EmbedVisibilityType): boolean {
  return AUTHENTICATED_EMBED_VISIBILITY_TYPES.includes(visibility);
}
