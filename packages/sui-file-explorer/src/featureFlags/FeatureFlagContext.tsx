import * as React from 'react';
import {
  FeatureFlag,
  FeatureFlagConfiguration,
  FeatureFlagState,
  DEFAULT_FEATURE_FLAGS,
  ENVIRONMENT_CONFIGS,
  FEATURE_FLAG_DEPENDENCIES,
  FEATURE_FLAG_STORAGE_KEY,
  getCurrentEnvironment,
  shouldShowFeature,
  isValidFeatureFlagConfiguration,
} from './FeatureFlagConfig';

/**
 * Feature Flag Context for runtime configuration
 *
 * Provides feature flag state and controls to all FileExplorer components.
 * Supports runtime configuration changes without code redeployment.
 */

export interface FeatureFlagContextValue {
  /**
   * Current feature flag configuration
   */
  flags: FeatureFlagConfiguration;

  /**
   * Check if a specific feature is enabled for the current user
   */
  isFeatureEnabled: (flag: FeatureFlag, userId?: string) => boolean;

  /**
   * Update feature flag configuration at runtime
   * This allows for gradual rollout without code deployment
   */
  updateFlags: (updates: Partial<FeatureFlagConfiguration>) => void;

  /**
   * Reset flags to default configuration
   */
  resetFlags: () => void;

  /**
   * Enable emergency kill switch for a feature
   */
  emergencyDisable: (flag: FeatureFlag) => void;

  /**
   * Current environment
   */
  environment: string;
}

const FeatureFlagContext = React.createContext<FeatureFlagContextValue | undefined>(undefined);

export interface FeatureFlagProviderProps {
  /**
   * Children components
   */
  children: React.ReactNode;

  /**
   * Initial feature flag configuration
   * If not provided, uses DEFAULT_FEATURE_FLAGS
   */
  initialFlags?: Partial<FeatureFlagConfiguration>;

  /**
   * User ID for traffic bucketing
   * If not provided, assumes 100% traffic
   */
  userId?: string;

  /**
   * Whether to persist flag overrides to localStorage
   * @default true
   */
  persist?: boolean;

  /**
   * Storage key for persisting flags
   * @default FEATURE_FLAG_STORAGE_KEY
   */
  storageKey?: string;
}

/**
 * Load feature flags from storage
 */
function loadFlagsFromStorage(storageKey: string): Partial<FeatureFlagConfiguration> | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = window.localStorage.getItem(storageKey);
    if (!stored) return null;

    const parsed = JSON.parse(stored);
    if (isValidFeatureFlagConfiguration(parsed)) {
      return parsed;
    }
    return null;
  } catch (error) {
    console.warn('Failed to load feature flags from storage:', error);
    return null;
  }
}

/**
 * Save feature flags to storage
 */
function saveFlagsToStorage(storageKey: string, flags: FeatureFlagConfiguration): void {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(storageKey, JSON.stringify(flags));
  } catch (error) {
    console.warn('Failed to save feature flags to storage:', error);
  }
}

/**
 * Merge feature flag configurations with proper precedence:
 * 1. Runtime overrides (highest priority)
 * 2. Storage overrides
 * 3. Environment-specific config
 * 4. Default config (lowest priority)
 */
function mergeFlagConfigs(
  defaults: FeatureFlagConfiguration,
  envConfig: Partial<FeatureFlagConfiguration>,
  storageConfig: Partial<FeatureFlagConfiguration> | null,
  runtimeConfig: Partial<FeatureFlagConfiguration> | undefined,
): FeatureFlagConfiguration {
  const merged = { ...defaults };

  // Apply environment config
  Object.entries(envConfig).forEach(([key, value]) => {
    if (value) {
      merged[key as FeatureFlag] = { ...merged[key as FeatureFlag], ...value };
    }
  });

  // Apply storage config
  if (storageConfig) {
    Object.entries(storageConfig).forEach(([key, value]) => {
      if (value) {
        merged[key as FeatureFlag] = { ...merged[key as FeatureFlag], ...value };
      }
    });
  }

  // Apply runtime config (highest priority)
  if (runtimeConfig) {
    Object.entries(runtimeConfig).forEach(([key, value]) => {
      if (value) {
        merged[key as FeatureFlag] = { ...merged[key as FeatureFlag], ...value };
      }
    });
  }

  return merged;
}

/**
 * Check if feature dependencies are satisfied
 */
function areDependenciesSatisfied(
  flag: FeatureFlag,
  flags: FeatureFlagConfiguration,
  userId?: string,
): boolean {
  const dependencies = FEATURE_FLAG_DEPENDENCIES[flag];

  for (const dependency of dependencies) {
    const depState = flags[dependency];

    // Check if dependency is enabled
    if (!depState.enabled || depState.emergencyDisabled) {
      return false;
    }

    // Check traffic percentage if userId provided
    if (userId && depState.trafficPercentage !== undefined) {
      if (!shouldShowFeature(userId, depState.trafficPercentage)) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Feature Flag Provider Component
 *
 * Wraps FileExplorer components to provide feature flag configuration.
 * Supports runtime configuration changes and emergency kill switches.
 *
 * @example
 * ```tsx
 * <FeatureFlagProvider userId="user-123">
 *   <FileExplorer items={files} />
 * </FeatureFlagProvider>
 * ```
 *
 * @example
 * // Runtime configuration update (no code deployment needed)
 * const { updateFlags } = useFeatureFlags();
 * updateFlags({
 *   useMuiXRendering: { enabled: true, trafficPercentage: 10 }
 * });
 * ```
 */
export function FeatureFlagProvider({
  children,
  initialFlags,
  userId,
  persist = true,
  storageKey = FEATURE_FLAG_STORAGE_KEY,
}: FeatureFlagProviderProps) {
  const environment = getCurrentEnvironment();
  const envConfig = ENVIRONMENT_CONFIGS[environment];

  // Load flags from storage on mount
  const storedFlags = React.useMemo(
    () => (persist ? loadFlagsFromStorage(storageKey) : null),
    [persist, storageKey],
  );

  // Merge configurations
  const initialMergedFlags = React.useMemo(
    () => mergeFlagConfigs(DEFAULT_FEATURE_FLAGS, envConfig, storedFlags, initialFlags),
    [envConfig, storedFlags, initialFlags],
  );

  const [flags, setFlags] = React.useState<FeatureFlagConfiguration>(initialMergedFlags);

  // Save to storage when flags change
  React.useEffect(() => {
    if (persist) {
      saveFlagsToStorage(storageKey, flags);
    }
  }, [flags, persist, storageKey]);

  /**
   * Check if a feature is enabled for the current user
   */
  const isFeatureEnabled = React.useCallback(
    (flag: FeatureFlag, userIdOverride?: string): boolean => {
      const state = flags[flag];
      const currentUserId = userIdOverride ?? userId;

      // Check emergency disable
      if (state.emergencyDisabled) {
        return false;
      }

      // Check if feature is enabled
      if (!state.enabled) {
        return false;
      }

      // Check dependencies
      if (!areDependenciesSatisfied(flag, flags, currentUserId)) {
        return false;
      }

      // Check traffic percentage
      if (currentUserId && state.trafficPercentage !== undefined) {
        return shouldShowFeature(currentUserId, state.trafficPercentage);
      }

      // If no userId provided, assume 100% traffic
      return state.trafficPercentage === undefined || state.trafficPercentage >= 100;
    },
    [flags, userId],
  );

  /**
   * Update feature flags at runtime
   */
  const updateFlags = React.useCallback((updates: Partial<FeatureFlagConfiguration>) => {
    setFlags((prevFlags) => {
      const newFlags = { ...prevFlags };

      Object.entries(updates).forEach(([key, value]) => {
        if (value) {
          newFlags[key as FeatureFlag] = { ...newFlags[key as FeatureFlag], ...value };
        }
      });

      return newFlags;
    });
  }, []);

  /**
   * Reset flags to default configuration
   */
  const resetFlags = React.useCallback(() => {
    const resetConfig = mergeFlagConfigs(DEFAULT_FEATURE_FLAGS, envConfig, null, undefined);
    setFlags(resetConfig);
  }, [envConfig]);

  /**
   * Enable emergency kill switch for a feature
   */
  const emergencyDisable = React.useCallback((flag: FeatureFlag) => {
    setFlags((prevFlags) => ({
      ...prevFlags,
      [flag]: {
        ...prevFlags[flag],
        emergencyDisabled: true,
      },
    }));
  }, []);

  const contextValue = React.useMemo<FeatureFlagContextValue>(
    () => ({
      flags,
      isFeatureEnabled,
      updateFlags,
      resetFlags,
      emergencyDisable,
      environment,
    }),
    [flags, isFeatureEnabled, updateFlags, resetFlags, emergencyDisable, environment],
  );

  return <FeatureFlagContext.Provider value={contextValue}>{children}</FeatureFlagContext.Provider>;
}

/**
 * Hook to access feature flag context
 *
 * @throws Error if used outside FeatureFlagProvider
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { isFeatureEnabled, updateFlags } = useFeatureFlags();
 *
 *   if (!isFeatureEnabled(FeatureFlag.USE_MUI_X_RENDERING)) {
 *     return <LegacyFileExplorer />;
 *   }
 *
 *   return <MuiXFileExplorer />;
 * }
 * ```
 */
export function useFeatureFlags(): FeatureFlagContextValue {
  const context = React.useContext(FeatureFlagContext);

  if (!context) {
    throw new Error('useFeatureFlags must be used within a FeatureFlagProvider');
  }

  return context;
}

/**
 * Hook to check if a specific feature is enabled
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const isMuiXEnabled = useFeatureFlag(FeatureFlag.USE_MUI_X_RENDERING);
 *
 *   return isMuiXEnabled ? <MuiXView /> : <LegacyView />;
 * }
 * ```
 */
export function useFeatureFlag(flag: FeatureFlag, userId?: string): boolean {
  const { isFeatureEnabled } = useFeatureFlags();
  return isFeatureEnabled(flag, userId);
}
