/**
 * Publicity type definitions and constants
 *
 * Defines the visibility states for content (media, reviews, etc.)
 * with special handling for admin-only deleted state.
 */

/**
 * Content publicity/visibility types
 * - public: Visible to all users
 * - private: Visible to owner and explicitly granted users
 * - paid: Visible after token payment
 * - deleted: Admin-only, soft-deleted items (excluded from 'all' filter)
 */
export type PublicityType = 'public' | 'private' | 'paid' | 'deleted';

/**
 * Publicity type constants for type-safe usage
 */
export const PUBLICITY_TYPES = {
  PUBLIC: 'public' as const,
  PRIVATE: 'private' as const,
  PAID: 'paid' as const,
  DELETED: 'deleted' as const,
} as const;

/**
 * Admin-only publicity types that require admin role to access
 */
export const ADMIN_ONLY_PUBLICITY_TYPES: PublicityType[] = ['deleted'];

/**
 * Publicity types included in "all" filter
 * Note: 'deleted' is explicitly excluded from "all" selection
 */
export const ALL_FILTER_PUBLICITY_TYPES: PublicityType[] = [
  'public',
  'private',
  'paid'
];

/**
 * Check if a publicity type requires admin access
 */
export function isAdminOnlyPublicity(publicity: PublicityType): boolean {
  return ADMIN_ONLY_PUBLICITY_TYPES.includes(publicity);
}

/**
 * Check if a publicity type is included in "all" filter
 */
export function isIncludedInAllFilter(publicity: PublicityType): boolean {
  return ALL_FILTER_PUBLICITY_TYPES.includes(publicity);
}
