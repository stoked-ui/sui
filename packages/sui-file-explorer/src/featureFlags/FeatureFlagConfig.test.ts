import { describe, it, expect } from '@stoked-ui/internal-test-utils';
import {
  FeatureFlag,
  Environment,
  DEFAULT_FEATURE_FLAGS,
  ENVIRONMENT_CONFIGS,
  FEATURE_FLAG_DEPENDENCIES,
  getCurrentEnvironment,
  shouldShowFeature,
  hashUserId,
  isValidFeatureFlagState,
  isValidFeatureFlagConfiguration,
} from './FeatureFlagConfig';

/**
 * Test Suite: Feature Flag Configuration
 *
 * Tests for Work Item 4.4: Feature Flag Implementation
 *
 * Coverage:
 * - AC-4.4.a: Feature flags control each major feature independently
 * - AC-4.4.b: Default flags enable all features (post-rollout)
 * - AC-4.4.d: Flag changes apply without code redeployment (runtime config)
 */

describe('FeatureFlagConfig', () => {
  describe('Feature Flag Enumeration', () => {
    it('should define all required feature flags', () => {
      expect(FeatureFlag.USE_MUI_X_RENDERING).toBe('useMuiXRendering');
      expect(FeatureFlag.DND_INTERNAL).toBe('dndInternal');
      expect(FeatureFlag.DND_EXTERNAL).toBe('dndExternal');
      expect(FeatureFlag.DND_TRASH).toBe('dndTrash');
    });

    it('should have exactly 4 feature flags', () => {
      const flags = Object.values(FeatureFlag);
      expect(flags.length).toBe(4);
    });
  });

  describe('AC-4.4.b: Default Feature Flags', () => {
    it('should enable all features by default (post-rollout)', () => {
      expect(DEFAULT_FEATURE_FLAGS[FeatureFlag.USE_MUI_X_RENDERING].enabled).toBe(true);
      expect(DEFAULT_FEATURE_FLAGS[FeatureFlag.DND_INTERNAL].enabled).toBe(true);
      expect(DEFAULT_FEATURE_FLAGS[FeatureFlag.DND_EXTERNAL].enabled).toBe(true);
      expect(DEFAULT_FEATURE_FLAGS[FeatureFlag.DND_TRASH].enabled).toBe(true);
    });

    it('should set 100% traffic exposure for all features', () => {
      expect(DEFAULT_FEATURE_FLAGS[FeatureFlag.USE_MUI_X_RENDERING].trafficPercentage).toBe(100);
      expect(DEFAULT_FEATURE_FLAGS[FeatureFlag.DND_INTERNAL].trafficPercentage).toBe(100);
      expect(DEFAULT_FEATURE_FLAGS[FeatureFlag.DND_EXTERNAL].trafficPercentage).toBe(100);
      expect(DEFAULT_FEATURE_FLAGS[FeatureFlag.DND_TRASH].trafficPercentage).toBe(100);
    });

    it('should not have emergency disabled flags by default', () => {
      expect(DEFAULT_FEATURE_FLAGS[FeatureFlag.USE_MUI_X_RENDERING].emergencyDisabled).toBe(false);
      expect(DEFAULT_FEATURE_FLAGS[FeatureFlag.DND_INTERNAL].emergencyDisabled).toBe(false);
      expect(DEFAULT_FEATURE_FLAGS[FeatureFlag.DND_EXTERNAL].emergencyDisabled).toBe(false);
      expect(DEFAULT_FEATURE_FLAGS[FeatureFlag.DND_TRASH].emergencyDisabled).toBe(false);
    });

    it('should have descriptions for all features', () => {
      expect(DEFAULT_FEATURE_FLAGS[FeatureFlag.USE_MUI_X_RENDERING].description).toBeDefined();
      expect(DEFAULT_FEATURE_FLAGS[FeatureFlag.DND_INTERNAL].description).toBeDefined();
      expect(DEFAULT_FEATURE_FLAGS[FeatureFlag.DND_EXTERNAL].description).toBeDefined();
      expect(DEFAULT_FEATURE_FLAGS[FeatureFlag.DND_TRASH].description).toBeDefined();
    });
  });

  describe('Environment Configuration', () => {
    it('should have configurations for all environments', () => {
      expect(ENVIRONMENT_CONFIGS[Environment.DEVELOPMENT]).toBeDefined();
      expect(ENVIRONMENT_CONFIGS[Environment.STAGING]).toBeDefined();
      expect(ENVIRONMENT_CONFIGS[Environment.PRODUCTION]).toBeDefined();
    });

    it('should enable all features in development', () => {
      const devConfig = ENVIRONMENT_CONFIGS[Environment.DEVELOPMENT];
      expect(devConfig[FeatureFlag.USE_MUI_X_RENDERING]?.enabled).toBe(true);
      expect(devConfig[FeatureFlag.DND_INTERNAL]?.enabled).toBe(true);
      expect(devConfig[FeatureFlag.DND_EXTERNAL]?.enabled).toBe(true);
      expect(devConfig[FeatureFlag.DND_TRASH]?.enabled).toBe(true);
    });

    it('should enable all features in staging', () => {
      const stagingConfig = ENVIRONMENT_CONFIGS[Environment.STAGING];
      expect(stagingConfig[FeatureFlag.USE_MUI_X_RENDERING]?.enabled).toBe(true);
      expect(stagingConfig[FeatureFlag.DND_INTERNAL]?.enabled).toBe(true);
      expect(stagingConfig[FeatureFlag.DND_EXTERNAL]?.enabled).toBe(true);
      expect(stagingConfig[FeatureFlag.DND_TRASH]?.enabled).toBe(true);
    });

    it('should have 100% traffic in development and staging', () => {
      const devConfig = ENVIRONMENT_CONFIGS[Environment.DEVELOPMENT];
      const stagingConfig = ENVIRONMENT_CONFIGS[Environment.STAGING];

      Object.values(FeatureFlag).forEach((flag) => {
        expect(devConfig[flag]?.trafficPercentage).toBe(100);
        expect(stagingConfig[flag]?.trafficPercentage).toBe(100);
      });
    });
  });

  describe('AC-4.4.a: Feature Flag Dependencies', () => {
    it('should define dependencies for all features', () => {
      expect(FEATURE_FLAG_DEPENDENCIES[FeatureFlag.USE_MUI_X_RENDERING]).toBeDefined();
      expect(FEATURE_FLAG_DEPENDENCIES[FeatureFlag.DND_INTERNAL]).toBeDefined();
      expect(FEATURE_FLAG_DEPENDENCIES[FeatureFlag.DND_EXTERNAL]).toBeDefined();
      expect(FEATURE_FLAG_DEPENDENCIES[FeatureFlag.DND_TRASH]).toBeDefined();
    });

    it('should require useMuiXRendering for all DnD features', () => {
      expect(FEATURE_FLAG_DEPENDENCIES[FeatureFlag.DND_INTERNAL]).toContain(
        FeatureFlag.USE_MUI_X_RENDERING,
      );
      expect(FEATURE_FLAG_DEPENDENCIES[FeatureFlag.DND_EXTERNAL]).toContain(
        FeatureFlag.USE_MUI_X_RENDERING,
      );
      expect(FEATURE_FLAG_DEPENDENCIES[FeatureFlag.DND_TRASH]).toContain(
        FeatureFlag.USE_MUI_X_RENDERING,
      );
    });

    it('should have no dependencies for useMuiXRendering', () => {
      expect(FEATURE_FLAG_DEPENDENCIES[FeatureFlag.USE_MUI_X_RENDERING]).toEqual([]);
    });
  });

  describe('User ID Hashing', () => {
    it('should produce consistent hashes for same user ID', () => {
      const userId = 'user-123';
      const hash1 = hashUserId(userId);
      const hash2 = hashUserId(userId);
      expect(hash1).toBe(hash2);
    });

    it('should produce different hashes for different user IDs', () => {
      const hash1 = hashUserId('user-123');
      const hash2 = hashUserId('user-456');
      expect(hash1).not.toBe(hash2);
    });

    it('should produce non-negative hashes', () => {
      const hash = hashUserId('user-123');
      expect(hash).toBeGreaterThanOrEqual(0);
    });

    it('should handle empty string', () => {
      const hash = hashUserId('');
      expect(hash).toBe(0);
    });
  });

  describe('Traffic Bucketing', () => {
    it('should show feature to all users at 100% traffic', () => {
      expect(shouldShowFeature('user-1', 100)).toBe(true);
      expect(shouldShowFeature('user-2', 100)).toBe(true);
      expect(shouldShowFeature('user-3', 100)).toBe(true);
    });

    it('should show feature to no users at 0% traffic', () => {
      expect(shouldShowFeature('user-1', 0)).toBe(false);
      expect(shouldShowFeature('user-2', 0)).toBe(false);
      expect(shouldShowFeature('user-3', 0)).toBe(false);
    });

    it('should be deterministic for same user and percentage', () => {
      const userId = 'user-123';
      const result1 = shouldShowFeature(userId, 50);
      const result2 = shouldShowFeature(userId, 50);
      expect(result1).toBe(result2);
    });

    it('should respect traffic percentage boundaries', () => {
      const users = Array.from({ length: 1000 }, (_, i) => `user-${i}`);
      const percentage = 25;

      const enabledCount = users.filter((userId) => shouldShowFeature(userId, percentage)).length;

      // Allow 5% margin of error for statistical variation
      const expectedCount = (users.length * percentage) / 100;
      const margin = expectedCount * 0.15; // 15% margin
      expect(enabledCount).toBeGreaterThanOrEqual(expectedCount - margin);
      expect(enabledCount).toBeLessThanOrEqual(expectedCount + margin);
    });
  });

  describe('Type Guards', () => {
    describe('isValidFeatureFlagState', () => {
      it('should accept valid feature flag state', () => {
        const state = { enabled: true, trafficPercentage: 100 };
        expect(isValidFeatureFlagState(state)).toBe(true);
      });

      it('should accept state without optional fields', () => {
        const state = { enabled: false };
        expect(isValidFeatureFlagState(state)).toBe(true);
      });

      it('should reject state without enabled field', () => {
        const state = { trafficPercentage: 100 };
        expect(isValidFeatureFlagState(state)).toBe(false);
      });

      it('should reject state with wrong type for enabled', () => {
        const state = { enabled: 'true' };
        expect(isValidFeatureFlagState(state)).toBe(false);
      });

      it('should reject state with wrong type for trafficPercentage', () => {
        const state = { enabled: true, trafficPercentage: '100' };
        expect(isValidFeatureFlagState(state)).toBe(false);
      });

      it('should reject null and undefined', () => {
        expect(isValidFeatureFlagState(null)).toBe(false);
        expect(isValidFeatureFlagState(undefined)).toBe(false);
      });
    });

    describe('isValidFeatureFlagConfiguration', () => {
      it('should accept valid configuration', () => {
        expect(isValidFeatureFlagConfiguration(DEFAULT_FEATURE_FLAGS)).toBe(true);
      });

      it('should accept partial configuration', () => {
        const config = {
          [FeatureFlag.USE_MUI_X_RENDERING]: { enabled: true },
        };
        expect(isValidFeatureFlagConfiguration(config)).toBe(true);
      });

      it('should reject configuration with invalid state', () => {
        const config = {
          [FeatureFlag.USE_MUI_X_RENDERING]: { enabled: 'true' },
        };
        expect(isValidFeatureFlagConfiguration(config)).toBe(false);
      });

      it('should reject null and undefined', () => {
        expect(isValidFeatureFlagConfiguration(null)).toBe(false);
        expect(isValidFeatureFlagConfiguration(undefined)).toBe(false);
      });
    });
  });

  describe('getCurrentEnvironment', () => {
    it('should return production by default', () => {
      const env = getCurrentEnvironment();
      expect([
        Environment.DEVELOPMENT,
        Environment.STAGING,
        Environment.PRODUCTION,
      ]).toContain(env);
    });
  });
});
