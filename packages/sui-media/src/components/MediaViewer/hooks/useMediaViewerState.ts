/**
 * MediaViewer State Machine
 *
 * Provides a finite state machine (FSM) for managing MediaViewer display modes.
 * Replaces the previous implicit numeric states (0, 1, 2) with explicit named states.
 *
 * State Transitions:
 * - NORMAL → THEATER (double-click or button)
 * - THEATER → FULLSCREEN (double-click or button)
 * - FULLSCREEN → NORMAL (ESC, double-click, or browser exit)
 * - Any state → NORMAL (ESC key or close button)
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  MediaViewerMode,
  ViewerAction,
  ViewerStateConfig,
} from '../MediaViewer.types';

/**
 * Hook return type
 */
export interface UseMediaViewerStateReturn {
  state: ViewerStateConfig;
  mode: MediaViewerMode;
  isTheater: boolean;
  isFullscreen: boolean;
  isNormal: boolean;
  transition: (action: ViewerAction) => Promise<void>;
  /** For backwards compatibility with fullscreenState: 0 | 1 | 2 */
  legacyState: 0 | 1 | 2;
}

const TRANSITION_DEBOUNCE_MS = 300;

/**
 * Re-export MediaViewerMode enum from types for convenience
 */
export { MediaViewerMode } from '../MediaViewer.types';

/**
 * Custom hook for managing MediaViewer state with FSM pattern
 */
export function useMediaViewerState(
  initialMode: MediaViewerMode = 'NORMAL' as MediaViewerMode
): UseMediaViewerStateReturn {
  const [state, setState] = useState<ViewerStateConfig>({
    mode: initialMode,
    isFullscreenApiActive: false,
    lastTransitionTime: 0,
  });

  const isTransitioning = useRef(false);

  /**
   * Request browser fullscreen on document element
   */
  const requestFullscreen = useCallback(async (): Promise<boolean> => {
    try {
      if (typeof document === 'undefined') return false;
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        return true;
      }
      return false;
    } catch (error) {
      console.warn('Fullscreen request denied:', error);
      return false;
    }
  }, []);

  /**
   * Exit browser fullscreen
   */
  const exitFullscreen = useCallback(async (): Promise<boolean> => {
    try {
      if (typeof document === 'undefined') return false;
      if (document.fullscreenElement) {
        await document.exitFullscreen();
        return true;
      }
      return false;
    } catch (error) {
      console.warn('Fullscreen exit failed:', error);
      return false;
    }
  }, []);

  /**
   * Main transition handler - single source of truth for all state changes
   */
  const transition = useCallback(async (action: ViewerAction): Promise<void> => {
    const now = Date.now();

    // Debounce rapid transitions
    if (isTransitioning.current || now - state.lastTransitionTime < TRANSITION_DEBOUNCE_MS) {
      return;
    }

    isTransitioning.current = true;

    try {
      switch (action) {
        case 'CYCLE':
          // Double-click behavior: cycle through states
          if (state.mode === 'NORMAL') {
            setState(prev => ({
              ...prev,
              mode: 'THEATER' as MediaViewerMode,
              previousMode: prev.mode,
              lastTransitionTime: now,
            }));
          } else if (state.mode === 'THEATER') {
            const success = await requestFullscreen();
            if (success) {
              setState(prev => ({
                ...prev,
                mode: 'FULLSCREEN' as MediaViewerMode,
                isFullscreenApiActive: true,
                previousMode: prev.mode,
                lastTransitionTime: now,
              }));
            }
          } else if (state.mode === 'FULLSCREEN') {
            await exitFullscreen();
            setState(prev => ({
              ...prev,
              mode: 'NORMAL' as MediaViewerMode,
              isFullscreenApiActive: false,
              previousMode: prev.mode,
              lastTransitionTime: now,
            }));
          }
          break;

        case 'ENTER_THEATER':
          if (state.mode === 'NORMAL') {
            setState(prev => ({
              ...prev,
              mode: 'THEATER' as MediaViewerMode,
              previousMode: prev.mode,
              lastTransitionTime: now,
            }));
          }
          break;

        case 'ENTER_FULLSCREEN':
          if (state.mode !== 'FULLSCREEN') {
            const success = await requestFullscreen();
            if (success) {
              setState(prev => ({
                ...prev,
                mode: 'FULLSCREEN' as MediaViewerMode,
                isFullscreenApiActive: true,
                previousMode: prev.mode,
                lastTransitionTime: now,
              }));
            }
          }
          break;

        case 'EXIT_TO_NORMAL':
          if (state.isFullscreenApiActive) {
            await exitFullscreen();
          }
          setState({
            mode: 'NORMAL' as MediaViewerMode,
            isFullscreenApiActive: false,
            lastTransitionTime: now,
          });
          break;

        case 'EXIT_FULLSCREEN':
          // Exit fullscreen but stay in theater mode
          if (state.mode === 'FULLSCREEN') {
            await exitFullscreen();
            setState(prev => ({
              ...prev,
              mode: 'THEATER' as MediaViewerMode,
              isFullscreenApiActive: false,
              lastTransitionTime: now,
            }));
          }
          break;

        case 'RESET':
          if (state.isFullscreenApiActive) {
            await exitFullscreen();
          }
          setState({
            mode: 'NORMAL' as MediaViewerMode,
            isFullscreenApiActive: false,
            lastTransitionTime: now,
          });
          break;
      }
    } finally {
      // Reset transitioning flag after debounce period
      setTimeout(() => {
        isTransitioning.current = false;
      }, TRANSITION_DEBOUNCE_MS);
    }
  }, [state, requestFullscreen, exitFullscreen]);

  /**
   * Sync with browser fullscreen changes (user pressed ESC, etc.)
   */
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && state.isFullscreenApiActive) {
        // Browser exited fullscreen (user pressed Esc or clicked X)
        setState(prev => ({
          ...prev,
          mode: 'NORMAL' as MediaViewerMode,
          isFullscreenApiActive: false,
          lastTransitionTime: Date.now(),
        }));
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, [state.isFullscreenApiActive]);

  /**
   * Cleanup: exit fullscreen when component unmounts
   */
  useEffect(() => {
    if (typeof document === 'undefined') return;

    return () => {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {
          // Ignore errors on unmount
        });
      }
    };
  }, []);

  // Derived state for convenience
  const isNormal = state.mode === 'NORMAL';
  const isTheater = state.mode === 'THEATER';
  const isFullscreen = state.mode === 'FULLSCREEN';

  // Backwards compatibility mapping
  const legacyState: 0 | 1 | 2 = isNormal ? 0 : isTheater ? 1 : 2;

  return {
    state,
    mode: state.mode,
    isNormal,
    isTheater,
    isFullscreen,
    transition,
    legacyState,
  };
}

export default useMediaViewerState;
