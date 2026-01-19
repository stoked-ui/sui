/**
 * Feature Flag System for FileExplorer Migration
 *
 * This module provides a comprehensive feature flag system for gradual rollout
 * and safe deployment of the FileExplorer migration to MUI X RichTreeView.
 *
 * @example
 * ```tsx
 * import { FeatureFlagProvider, useFeatureFlag, FeatureFlag } from '@stoked-ui/file-explorer/featureFlags';
 *
 * // Wrap your app with the provider
 * <FeatureFlagProvider userId="user-123">
 *   <App />
 * </FeatureFlagProvider>
 *
 * // Use feature flags in components
 * function MyComponent() {
 *   const isMuiXEnabled = useFeatureFlag(FeatureFlag.USE_MUI_X_RENDERING);
 *   return isMuiXEnabled ? <MuiXView /> : <LegacyView />;
 * }
 * ```
 */

export {
  FeatureFlag,
  Environment,
  DEFAULT_FEATURE_FLAGS,
  ENVIRONMENT_CONFIGS,
  FEATURE_FLAG_DEPENDENCIES,
  FEATURE_FLAG_STORAGE_KEY,
  getCurrentEnvironment,
  shouldShowFeature,
  hashUserId,
  isValidFeatureFlagState,
  isValidFeatureFlagConfiguration,
} from './FeatureFlagConfig';

export type {
  FeatureFlagState,
  FeatureFlagConfiguration,
} from './FeatureFlagConfig';

export {
  FeatureFlagProvider,
  useFeatureFlags,
  useFeatureFlag,
} from './FeatureFlagContext';

export type {
  FeatureFlagContextValue,
  FeatureFlagProviderProps,
} from './FeatureFlagContext';
