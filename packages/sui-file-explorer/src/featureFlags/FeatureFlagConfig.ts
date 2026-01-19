/**
 * Feature Flag Configuration for FileExplorer Migration to MUI X RichTreeView
 *
 * This configuration system enables gradual rollout and safe deployment with
 * rollback capability for the FileExplorer migration to MUI X RichTreeView.
 *
 * **Rollout Strategy:**
 * - Stage 1: Internal Beta (Phases 1-2 only)
 * - Stage 2: Limited Production (10% users, Phases 1-3, no trash)
 * - Stage 3: Expanded Rollout (50% users, all features)
 * - Stage 4: Full Rollout (100% users, all flags default true)
 *
 * **Feature Flags:**
 * - useMuiXRendering: Phase 1 - RichTreeView rendering engine
 * - dndInternal: Phase 2 - Internal drag-and-drop with MUI X
 * - dndExternal: Phase 3 - External drag-and-drop
 * - dndTrash: Phase 3 - Trash management
 *
 * **Default State:** All flags default to true (full feature set post-rollout)
 * **Rollback:** Setting useMuiXRendering=false reverts to legacy rendering
 */

/**
 * Feature flag identifiers for FileExplorer migration
 */
export enum FeatureFlag {
  /**
   * Phase 1: Enable MUI X RichTreeView rendering
   * When false, falls back to legacy rendering system
   */
  USE_MUI_X_RENDERING = 'useMuiXRendering',

  /**
   * Phase 2: Enable internal drag-and-drop using MUI X itemsReordering
   * Requires USE_MUI_X_RENDERING to be enabled
   */
  DND_INTERNAL = 'dndInternal',

  /**
   * Phase 3: Enable external drag-and-drop (files from outside)
   * Requires USE_MUI_X_RENDERING to be enabled
   */
  DND_EXTERNAL = 'dndExternal',

  /**
   * Phase 3: Enable trash management functionality
   * Requires DND_INTERNAL or DND_EXTERNAL to be enabled
   */
  DND_TRASH = 'dndTrash',
}

/**
 * Feature flag state for runtime configuration
 */
export interface FeatureFlagState {
  /**
   * Whether the feature is enabled
   */
  enabled: boolean;

  /**
   * Percentage of users to expose (0-100)
   * Used for gradual rollout
   */
  trafficPercentage?: number;

  /**
   * Emergency kill switch
   * When true, disables feature regardless of other settings
   */
  emergencyDisabled?: boolean;

  /**
   * Optional description for monitoring/logging
   */
  description?: string;
}

/**
 * Complete feature flag configuration
 */
export interface FeatureFlagConfiguration {
  [FeatureFlag.USE_MUI_X_RENDERING]: FeatureFlagState;
  [FeatureFlag.DND_INTERNAL]: FeatureFlagState;
  [FeatureFlag.DND_EXTERNAL]: FeatureFlagState;
  [FeatureFlag.DND_TRASH]: FeatureFlagState;
}

/**
 * Environment types for feature flag configuration
 */
export enum Environment {
  DEVELOPMENT = 'development',
  STAGING = 'staging',
  PRODUCTION = 'production',
}

/**
 * Default feature flag configuration
 *
 * **Post-Rollout Defaults:** All features enabled (true)
 * **Production:** Can be overridden at runtime via configuration
 */
export const DEFAULT_FEATURE_FLAGS: FeatureFlagConfiguration = {
  [FeatureFlag.USE_MUI_X_RENDERING]: {
    enabled: true,
    trafficPercentage: 100,
    emergencyDisabled: false,
    description: 'Phase 1: MUI X RichTreeView rendering engine',
  },
  [FeatureFlag.DND_INTERNAL]: {
    enabled: true,
    trafficPercentage: 100,
    emergencyDisabled: false,
    description: 'Phase 2: Internal drag-and-drop with MUI X',
  },
  [FeatureFlag.DND_EXTERNAL]: {
    enabled: true,
    trafficPercentage: 100,
    emergencyDisabled: false,
    description: 'Phase 3: External drag-and-drop',
  },
  [FeatureFlag.DND_TRASH]: {
    enabled: true,
    trafficPercentage: 100,
    emergencyDisabled: false,
    description: 'Phase 3: Trash management',
  },
};

/**
 * Environment-specific feature flag overrides
 *
 * Development: All features enabled for testing
 * Staging: All features enabled for validation
 * Production: Controlled rollout (can be configured at runtime)
 */
export const ENVIRONMENT_CONFIGS: Record<Environment, Partial<FeatureFlagConfiguration>> = {
  [Environment.DEVELOPMENT]: {
    // Development: All features enabled
    [FeatureFlag.USE_MUI_X_RENDERING]: { enabled: true, trafficPercentage: 100 },
    [FeatureFlag.DND_INTERNAL]: { enabled: true, trafficPercentage: 100 },
    [FeatureFlag.DND_EXTERNAL]: { enabled: true, trafficPercentage: 100 },
    [FeatureFlag.DND_TRASH]: { enabled: true, trafficPercentage: 100 },
  },
  [Environment.STAGING]: {
    // Staging: All features enabled for testing
    [FeatureFlag.USE_MUI_X_RENDERING]: { enabled: true, trafficPercentage: 100 },
    [FeatureFlag.DND_INTERNAL]: { enabled: true, trafficPercentage: 100 },
    [FeatureFlag.DND_EXTERNAL]: { enabled: true, trafficPercentage: 100 },
    [FeatureFlag.DND_TRASH]: { enabled: true, trafficPercentage: 100 },
  },
  [Environment.PRODUCTION]: {
    // Production: Use DEFAULT_FEATURE_FLAGS (can be overridden at runtime)
    // This allows for gradual rollout without code changes
  },
};

/**
 * Feature flag dependencies
 * Defines which features require other features to be enabled
 */
export const FEATURE_FLAG_DEPENDENCIES: Record<FeatureFlag, FeatureFlag[]> = {
  [FeatureFlag.USE_MUI_X_RENDERING]: [],
  [FeatureFlag.DND_INTERNAL]: [FeatureFlag.USE_MUI_X_RENDERING],
  [FeatureFlag.DND_EXTERNAL]: [FeatureFlag.USE_MUI_X_RENDERING],
  [FeatureFlag.DND_TRASH]: [FeatureFlag.USE_MUI_X_RENDERING],
};

/**
 * Storage key for persisting feature flag overrides
 */
export const FEATURE_FLAG_STORAGE_KEY = 'sui-file-explorer-feature-flags';

/**
 * Type guard to check if a value is a valid FeatureFlagState
 */
export function isValidFeatureFlagState(value: any): value is FeatureFlagState {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof value.enabled === 'boolean' &&
    (value.trafficPercentage === undefined || typeof value.trafficPercentage === 'number') &&
    (value.emergencyDisabled === undefined || typeof value.emergencyDisabled === 'boolean')
  );
}

/**
 * Type guard to check if a value is a valid FeatureFlagConfiguration
 */
export function isValidFeatureFlagConfiguration(value: any): value is FeatureFlagConfiguration {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const flags = Object.values(FeatureFlag);
  for (const flag of flags) {
    if (value[flag] !== undefined && !isValidFeatureFlagState(value[flag])) {
      return false;
    }
  }

  return true;
}

/**
 * Get the current environment
 */
export function getCurrentEnvironment(): Environment {
  if (typeof process !== 'undefined' && process.env) {
    const nodeEnv = process.env.NODE_ENV?.toLowerCase();
    if (nodeEnv === 'production') return Environment.PRODUCTION;
    if (nodeEnv === 'test' || nodeEnv === 'staging') return Environment.STAGING;
    return Environment.DEVELOPMENT;
  }
  return Environment.PRODUCTION; // Default to production for safety
}

/**
 * Hash function for user ID bucketing
 * Ensures consistent assignment of users to feature flag cohorts
 */
export function hashUserId(userId: string): number {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    const char = userId.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Determine if a user should see a feature based on traffic percentage
 */
export function shouldShowFeature(userId: string, trafficPercentage: number): boolean {
  if (trafficPercentage >= 100) return true;
  if (trafficPercentage <= 0) return false;

  const hash = hashUserId(userId);
  const bucket = hash % 100;
  return bucket < trafficPercentage;
}
