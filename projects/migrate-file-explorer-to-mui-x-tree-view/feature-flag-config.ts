/**
 * Feature Flag Configuration: MUI X File Explorer Migration
 *
 * This file defines the feature flag for the File Explorer migration from custom
 * implementation to MUI X RichTreeView. Supports environment-level and user-level
 * control for phased rollout.
 */

/**
 * Feature flag name used throughout the application
 */
export const FEATURE_FLAG_NAME = 'use-mui-x-file-explorer' as const;

/**
 * Environment-specific feature flag configuration
 */
export const FEATURE_FLAG_CONFIG = {
  /**
   * Development environment - enabled for internal testing
   * Set to true to allow developers to test the MUI X implementation
   */
  development: {
    enabled: true,
    trafficPercentage: 100,
    description: 'All dev users use MUI X File Explorer for testing',
  },

  /**
   * Staging environment - enabled for pre-production validation
   * Set to true after Phase 1 validation completes
   */
  staging: {
    enabled: true,
    trafficPercentage: 100,
    description: 'All staging users use MUI X File Explorer for integration validation',
  },

  /**
   * Production environment - controlled rollout
   * Starts at 0% and increases through phased rollout stages
   */
  production: {
    /**
     * Phase 1: Internal (0-2 days)
     * enabled: false, trafficPercentage: 0
     *
     * Phase 2: Beta (2-7 days)
     * enabled: true, trafficPercentage: 5-10
     *
     * Phase 3: Canary (7-10 days)
     * enabled: true, trafficPercentage: 25
     *
     * Phase 4: Gradual (10-13 days)
     * enabled: true, trafficPercentage: 50
     *
     * Phase 5: Full Rollout (13+ days)
     * enabled: true, trafficPercentage: 100
     */
    enabled: false,
    trafficPercentage: 0,
    description: 'MUI X File Explorer rollout disabled (at rest position)',
  },
} as const;

/**
 * Type definitions for feature flag values
 */
export type EnvironmentType = keyof typeof FEATURE_FLAG_CONFIG;
export type FeatureFlagValue = typeof FEATURE_FLAG_CONFIG[EnvironmentType];

/**
 * Feature flag state interface for user-level control
 */
export interface FeatureFlagState {
  /**
   * Global flag enabled/disabled status
   */
  enabled: boolean;

  /**
   * Traffic percentage to expose feature to (0-100)
   * Used for gradual rollout
   */
  trafficPercentage: number;

  /**
   * Current rollout phase
   * Used for monitoring and status reporting
   */
  phase: 'internal' | 'beta' | 'canary' | 'gradual' | 'full' | 'rolled-back';

  /**
   * Timestamp of last flag update
   */
  lastUpdated: string;

  /**
   * Notes about current state (e.g., reason for rollback)
   */
  notes?: string;

  /**
   * Emergency kill switch - immediately disables feature regardless of traffic %
   */
  emergencyDisabled: boolean;
}

/**
 * Helper function to determine if user should see the feature
 *
 * @param userId - User ID for consistent bucketing
 * @param state - Current feature flag state
 * @returns true if user should see the MUI X implementation
 *
 * @example
 * ```
 * const showMuiX = shouldShowFeature(user.id, flagState);
 * const Component = showMuiX ? FileExplorerMuiX : FileExplorerOriginal;
 * ```
 */
export function shouldShowFeature(userId: string, state: FeatureFlagState): boolean {
  // Emergency kill switch takes precedence
  if (state.emergencyDisabled) {
    return false;
  }

  // Feature must be globally enabled
  if (!state.enabled) {
    return false;
  }

  // Check traffic percentage using consistent hash-based bucketing
  if (state.trafficPercentage === 0) {
    return false;
  }

  if (state.trafficPercentage === 100) {
    return true;
  }

  // Consistent bucketing: same user always gets same result
  // Use simple hash to distribute users evenly across 0-100
  const userHash = hashUserId(userId);
  return userHash < state.trafficPercentage;
}

/**
 * Simple hash function for consistent user bucketing
 * Provides stable distribution across percentage ranges
 *
 * @param userId - User ID to hash
 * @returns number between 0-100 representing user's bucket
 */
function hashUserId(userId: string): number {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    const char = userId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash) % 100;
}

/**
 * Storage key for persisting feature flag state
 * Used to maintain sticky sessions during rollout
 */
export const FEATURE_FLAG_STORAGE_KEY = `${FEATURE_FLAG_NAME}:state` as const;

/**
 * Storage key for rollout status and metrics
 */
export const ROLLOUT_STATUS_STORAGE_KEY = `${FEATURE_FLAG_NAME}:rollout-status` as const;

/**
 * Type guard to validate feature flag state
 */
export function isValidFeatureFlagState(obj: unknown): obj is FeatureFlagState {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }

  const state = obj as Record<string, unknown>;
  return (
    typeof state.enabled === 'boolean' &&
    typeof state.trafficPercentage === 'number' &&
    state.trafficPercentage >= 0 &&
    state.trafficPercentage <= 100 &&
    typeof state.phase === 'string' &&
    ['internal', 'beta', 'canary', 'gradual', 'full', 'rolled-back'].includes(
      state.phase as string
    ) &&
    typeof state.lastUpdated === 'string' &&
    typeof state.emergencyDisabled === 'boolean'
  );
}
