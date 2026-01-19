import * as React from 'react';
import { describe, it, expect, beforeEach, afterEach } from '@stoked-ui/internal-test-utils';
import { renderHook, act } from '@testing-library/react';
import {
  FeatureFlagProvider,
  useFeatureFlags,
  useFeatureFlag,
  FeatureFlagProviderProps,
} from './FeatureFlagContext';
import { FeatureFlag, FEATURE_FLAG_STORAGE_KEY } from './FeatureFlagConfig';

/**
 * Test Suite: Feature Flag Context
 *
 * Tests for Work Item 4.4: Feature Flag Implementation
 *
 * Coverage:
 * - AC-4.4.a: Feature flags control each major feature independently
 * - AC-4.4.c: Rollback to legacy rendering works without errors
 * - AC-4.4.d: Flag changes apply without code redeployment (runtime config)
 */

describe('FeatureFlagContext', () => {
  // Mock localStorage
  let localStorageMock: { [key: string]: string } = {};

  beforeEach(() => {
    localStorageMock = {};
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: (key: string) => localStorageMock[key] || null,
        setItem: (key: string, value: string) => {
          localStorageMock[key] = value;
        },
        removeItem: (key: string) => {
          delete localStorageMock[key];
        },
        clear: () => {
          localStorageMock = {};
        },
      },
      writable: true,
    });
  });

  afterEach(() => {
    localStorageMock = {};
  });

  const createWrapper = (props?: Partial<FeatureFlagProviderProps>) => {
    return ({ children }: { children: React.ReactNode }) => (
      <FeatureFlagProvider {...props}>{children}</FeatureFlagProvider>
    );
  };

  describe('FeatureFlagProvider', () => {
    it('should provide default feature flags', () => {
      const { result } = renderHook(() => useFeatureFlags(), {
        wrapper: createWrapper(),
      });

      expect(result.current.flags).toBeDefined();
      expect(result.current.flags[FeatureFlag.USE_MUI_X_RENDERING]).toBeDefined();
      expect(result.current.flags[FeatureFlag.DND_INTERNAL]).toBeDefined();
      expect(result.current.flags[FeatureFlag.DND_EXTERNAL]).toBeDefined();
      expect(result.current.flags[FeatureFlag.DND_TRASH]).toBeDefined();
    });

    it('should accept initial flags', () => {
      const initialFlags = {
        [FeatureFlag.USE_MUI_X_RENDERING]: { enabled: false, trafficPercentage: 0 },
      };

      const { result } = renderHook(() => useFeatureFlags(), {
        wrapper: createWrapper({ initialFlags }),
      });

      expect(result.current.flags[FeatureFlag.USE_MUI_X_RENDERING].enabled).toBe(false);
    });

    it('should provide environment information', () => {
      const { result } = renderHook(() => useFeatureFlags(), {
        wrapper: createWrapper(),
      });

      expect(result.current.environment).toBeDefined();
      expect(typeof result.current.environment).toBe('string');
    });
  });

  describe('AC-4.4.a: isFeatureEnabled - Independent Feature Control', () => {
    it('should check if useMuiXRendering is enabled', () => {
      const { result } = renderHook(() => useFeatureFlags(), {
        wrapper: createWrapper(),
      });

      const isEnabled = result.current.isFeatureEnabled(FeatureFlag.USE_MUI_X_RENDERING);
      expect(typeof isEnabled).toBe('boolean');
    });

    it('should respect enabled flag', () => {
      const { result } = renderHook(() => useFeatureFlags(), {
        wrapper: createWrapper({
          initialFlags: {
            [FeatureFlag.USE_MUI_X_RENDERING]: { enabled: false },
          },
        }),
      });

      expect(result.current.isFeatureEnabled(FeatureFlag.USE_MUI_X_RENDERING)).toBe(false);
    });

    it('should respect emergency disable', () => {
      const { result } = renderHook(() => useFeatureFlags(), {
        wrapper: createWrapper({
          initialFlags: {
            [FeatureFlag.USE_MUI_X_RENDERING]: {
              enabled: true,
              emergencyDisabled: true,
            },
          },
        }),
      });

      expect(result.current.isFeatureEnabled(FeatureFlag.USE_MUI_X_RENDERING)).toBe(false);
    });

    it('should respect traffic percentage with userId', () => {
      const { result } = renderHook(() => useFeatureFlags(), {
        wrapper: createWrapper({
          userId: 'user-123',
          initialFlags: {
            [FeatureFlag.USE_MUI_X_RENDERING]: {
              enabled: true,
              trafficPercentage: 0,
            },
          },
        }),
      });

      expect(result.current.isFeatureEnabled(FeatureFlag.USE_MUI_X_RENDERING)).toBe(false);
    });

    it('should respect feature dependencies', () => {
      const { result } = renderHook(() => useFeatureFlags(), {
        wrapper: createWrapper({
          initialFlags: {
            [FeatureFlag.USE_MUI_X_RENDERING]: { enabled: false },
            [FeatureFlag.DND_INTERNAL]: { enabled: true },
          },
        }),
      });

      // DND_INTERNAL requires USE_MUI_X_RENDERING
      expect(result.current.isFeatureEnabled(FeatureFlag.DND_INTERNAL)).toBe(false);
    });

    it('should enable dependent feature when dependencies are met', () => {
      const { result } = renderHook(() => useFeatureFlags(), {
        wrapper: createWrapper({
          initialFlags: {
            [FeatureFlag.USE_MUI_X_RENDERING]: { enabled: true, trafficPercentage: 100 },
            [FeatureFlag.DND_INTERNAL]: { enabled: true, trafficPercentage: 100 },
          },
        }),
      });

      expect(result.current.isFeatureEnabled(FeatureFlag.DND_INTERNAL)).toBe(true);
    });
  });

  describe('AC-4.4.d: updateFlags - Runtime Configuration', () => {
    it('should update flags at runtime', () => {
      const { result } = renderHook(() => useFeatureFlags(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.updateFlags({
          [FeatureFlag.USE_MUI_X_RENDERING]: { enabled: false },
        });
      });

      expect(result.current.flags[FeatureFlag.USE_MUI_X_RENDERING].enabled).toBe(false);
    });

    it('should update traffic percentage at runtime', () => {
      const { result } = renderHook(() => useFeatureFlags(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.updateFlags({
          [FeatureFlag.USE_MUI_X_RENDERING]: { enabled: true, trafficPercentage: 50 },
        });
      });

      expect(result.current.flags[FeatureFlag.USE_MUI_X_RENDERING].trafficPercentage).toBe(50);
    });

    it('should persist flags to localStorage when persist=true', () => {
      const { result } = renderHook(() => useFeatureFlags(), {
        wrapper: createWrapper({ persist: true }),
      });

      act(() => {
        result.current.updateFlags({
          [FeatureFlag.USE_MUI_X_RENDERING]: { enabled: false },
        });
      });

      const stored = JSON.parse(localStorageMock[FEATURE_FLAG_STORAGE_KEY] || '{}');
      expect(stored[FeatureFlag.USE_MUI_X_RENDERING].enabled).toBe(false);
    });

    it('should not persist flags when persist=false', () => {
      const { result } = renderHook(() => useFeatureFlags(), {
        wrapper: createWrapper({ persist: false }),
      });

      act(() => {
        result.current.updateFlags({
          [FeatureFlag.USE_MUI_X_RENDERING]: { enabled: false },
        });
      });

      expect(localStorageMock[FEATURE_FLAG_STORAGE_KEY]).toBeUndefined();
    });
  });

  describe('resetFlags', () => {
    it('should reset flags to default configuration', () => {
      const { result } = renderHook(() => useFeatureFlags(), {
        wrapper: createWrapper(),
      });

      // Update flags
      act(() => {
        result.current.updateFlags({
          [FeatureFlag.USE_MUI_X_RENDERING]: { enabled: false },
        });
      });

      expect(result.current.flags[FeatureFlag.USE_MUI_X_RENDERING].enabled).toBe(false);

      // Reset flags
      act(() => {
        result.current.resetFlags();
      });

      expect(result.current.flags[FeatureFlag.USE_MUI_X_RENDERING].enabled).toBe(true);
    });
  });

  describe('emergencyDisable', () => {
    it('should emergency disable a feature', () => {
      const { result } = renderHook(() => useFeatureFlags(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.emergencyDisable(FeatureFlag.USE_MUI_X_RENDERING);
      });

      expect(result.current.flags[FeatureFlag.USE_MUI_X_RENDERING].emergencyDisabled).toBe(true);
      expect(result.current.isFeatureEnabled(FeatureFlag.USE_MUI_X_RENDERING)).toBe(false);
    });

    it('should disable feature even when enabled=true', () => {
      const { result } = renderHook(() => useFeatureFlags(), {
        wrapper: createWrapper({
          initialFlags: {
            [FeatureFlag.USE_MUI_X_RENDERING]: { enabled: true, trafficPercentage: 100 },
          },
        }),
      });

      expect(result.current.isFeatureEnabled(FeatureFlag.USE_MUI_X_RENDERING)).toBe(true);

      act(() => {
        result.current.emergencyDisable(FeatureFlag.USE_MUI_X_RENDERING);
      });

      expect(result.current.isFeatureEnabled(FeatureFlag.USE_MUI_X_RENDERING)).toBe(false);
    });
  });

  describe('useFeatureFlag hook', () => {
    it('should check if specific feature is enabled', () => {
      const { result } = renderHook(() => useFeatureFlag(FeatureFlag.USE_MUI_X_RENDERING), {
        wrapper: createWrapper(),
      });

      expect(typeof result.current).toBe('boolean');
    });

    it('should return false when feature is disabled', () => {
      const { result } = renderHook(() => useFeatureFlag(FeatureFlag.USE_MUI_X_RENDERING), {
        wrapper: createWrapper({
          initialFlags: {
            [FeatureFlag.USE_MUI_X_RENDERING]: { enabled: false },
          },
        }),
      });

      expect(result.current).toBe(false);
    });

    it('should return true when feature is enabled', () => {
      const { result } = renderHook(() => useFeatureFlag(FeatureFlag.USE_MUI_X_RENDERING), {
        wrapper: createWrapper({
          initialFlags: {
            [FeatureFlag.USE_MUI_X_RENDERING]: { enabled: true, trafficPercentage: 100 },
          },
        }),
      });

      expect(result.current).toBe(true);
    });

    it('should accept optional userId parameter', () => {
      const { result } = renderHook(
        () => useFeatureFlag(FeatureFlag.USE_MUI_X_RENDERING, 'custom-user-id'),
        {
          wrapper: createWrapper({
            initialFlags: {
              [FeatureFlag.USE_MUI_X_RENDERING]: { enabled: true, trafficPercentage: 0 },
            },
          }),
        },
      );

      expect(result.current).toBe(false);
    });
  });

  describe('Flag Combinations', () => {
    it('should handle all flags disabled', () => {
      const { result } = renderHook(() => useFeatureFlags(), {
        wrapper: createWrapper({
          initialFlags: {
            [FeatureFlag.USE_MUI_X_RENDERING]: { enabled: false },
            [FeatureFlag.DND_INTERNAL]: { enabled: false },
            [FeatureFlag.DND_EXTERNAL]: { enabled: false },
            [FeatureFlag.DND_TRASH]: { enabled: false },
          },
        }),
      });

      expect(result.current.isFeatureEnabled(FeatureFlag.USE_MUI_X_RENDERING)).toBe(false);
      expect(result.current.isFeatureEnabled(FeatureFlag.DND_INTERNAL)).toBe(false);
      expect(result.current.isFeatureEnabled(FeatureFlag.DND_EXTERNAL)).toBe(false);
      expect(result.current.isFeatureEnabled(FeatureFlag.DND_TRASH)).toBe(false);
    });

    it('should handle all flags enabled', () => {
      const { result } = renderHook(() => useFeatureFlags(), {
        wrapper: createWrapper({
          initialFlags: {
            [FeatureFlag.USE_MUI_X_RENDERING]: { enabled: true, trafficPercentage: 100 },
            [FeatureFlag.DND_INTERNAL]: { enabled: true, trafficPercentage: 100 },
            [FeatureFlag.DND_EXTERNAL]: { enabled: true, trafficPercentage: 100 },
            [FeatureFlag.DND_TRASH]: { enabled: true, trafficPercentage: 100 },
          },
        }),
      });

      expect(result.current.isFeatureEnabled(FeatureFlag.USE_MUI_X_RENDERING)).toBe(true);
      expect(result.current.isFeatureEnabled(FeatureFlag.DND_INTERNAL)).toBe(true);
      expect(result.current.isFeatureEnabled(FeatureFlag.DND_EXTERNAL)).toBe(true);
      expect(result.current.isFeatureEnabled(FeatureFlag.DND_TRASH)).toBe(true);
    });

    it('should handle partial rollout (MUI X only, no DnD)', () => {
      const { result } = renderHook(() => useFeatureFlags(), {
        wrapper: createWrapper({
          initialFlags: {
            [FeatureFlag.USE_MUI_X_RENDERING]: { enabled: true, trafficPercentage: 100 },
            [FeatureFlag.DND_INTERNAL]: { enabled: false },
            [FeatureFlag.DND_EXTERNAL]: { enabled: false },
            [FeatureFlag.DND_TRASH]: { enabled: false },
          },
        }),
      });

      expect(result.current.isFeatureEnabled(FeatureFlag.USE_MUI_X_RENDERING)).toBe(true);
      expect(result.current.isFeatureEnabled(FeatureFlag.DND_INTERNAL)).toBe(false);
    });

    it('should handle gradual rollout with traffic percentage', () => {
      const { result } = renderHook(() => useFeatureFlags(), {
        wrapper: createWrapper({
          userId: 'user-with-low-hash',
          initialFlags: {
            [FeatureFlag.USE_MUI_X_RENDERING]: { enabled: true, trafficPercentage: 10 },
          },
        }),
      });

      const isEnabled = result.current.isFeatureEnabled(FeatureFlag.USE_MUI_X_RENDERING);
      expect(typeof isEnabled).toBe('boolean');
    });
  });

  describe('Error Handling', () => {
    it('should throw error when useFeatureFlags is used outside provider', () => {
      expect(() => {
        renderHook(() => useFeatureFlags());
      }).toThrow('useFeatureFlags must be used within a FeatureFlagProvider');
    });

    it('should throw error when useFeatureFlag is used outside provider', () => {
      expect(() => {
        renderHook(() => useFeatureFlag(FeatureFlag.USE_MUI_X_RENDERING));
      }).toThrow('useFeatureFlags must be used within a FeatureFlagProvider');
    });
  });

  describe('Storage Persistence', () => {
    it('should load flags from storage on mount', () => {
      const storedFlags = {
        [FeatureFlag.USE_MUI_X_RENDERING]: { enabled: false, trafficPercentage: 0 },
      };
      localStorageMock[FEATURE_FLAG_STORAGE_KEY] = JSON.stringify(storedFlags);

      const { result } = renderHook(() => useFeatureFlags(), {
        wrapper: createWrapper({ persist: true }),
      });

      expect(result.current.flags[FeatureFlag.USE_MUI_X_RENDERING].enabled).toBe(false);
    });

    it('should handle corrupted storage data gracefully', () => {
      localStorageMock[FEATURE_FLAG_STORAGE_KEY] = 'invalid-json';

      const { result } = renderHook(() => useFeatureFlags(), {
        wrapper: createWrapper({ persist: true }),
      });

      // Should fall back to default flags
      expect(result.current.flags).toBeDefined();
    });

    it('should use custom storage key', () => {
      const customKey = 'custom-feature-flags';
      const { result } = renderHook(() => useFeatureFlags(), {
        wrapper: createWrapper({ persist: true, storageKey: customKey }),
      });

      act(() => {
        result.current.updateFlags({
          [FeatureFlag.USE_MUI_X_RENDERING]: { enabled: false },
        });
      });

      expect(localStorageMock[customKey]).toBeDefined();
    });
  });
});
