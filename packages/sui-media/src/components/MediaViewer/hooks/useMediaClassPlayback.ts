/**
 * useMediaClassPlayback - MediaClass playback state machine
 *
 * Manages playback sequence for MediaClass branded content:
 * beforeIdent → main → afterIdent → complete
 *
 * This is a framework-agnostic version that doesn't depend on
 * Next.js utilities. The media URL generation should be provided
 * by the consuming application.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import type {
  PlaybackPhase,
  MediaClassConfig,
  VideoBugConfig,
} from '../MediaViewer.types';

// ============================================================================
// Hook Types
// ============================================================================

export interface UseMediaClassPlaybackOptions {
  /** MediaClass configuration (null if no MediaClass applied) */
  mediaClass?: MediaClassConfig | null;
  /** Main video ID */
  mainVideoId: string;
  /** Function to generate media URLs from IDs */
  getMediaUrl: (type: 'videos' | 'images', id: string) => string;
  /** Callback when playback fully completes */
  onPlaybackComplete?: () => void;
  /** Whether MediaClass playback is enabled */
  enabled?: boolean;
}

export interface UseMediaClassPlaybackReturn {
  /** Current playback phase */
  phase: PlaybackPhase;
  /** URL of the current video to play */
  currentVideoUrl: string;
  /** Whether we're currently playing an ident */
  isPlayingIdent: boolean;
  /** Duration of current ident if playing one */
  currentIdentDuration?: number;
  /** Handler for when the current video ends */
  handleVideoEnded: () => void;
  /** Reset playback to beginning */
  resetPlayback: () => void;
  /** Skip to main content */
  skipToMain: () => void;
  /** Skip to completion */
  skipToComplete: () => void;
  /** Whether beforeIdent is configured */
  hasBeforeIdent: boolean;
  /** Whether afterIdent is configured */
  hasAfterIdent: boolean;
  /** VideoBug configuration if applicable */
  videoBug?: VideoBugConfig;
  /** Whether video bug should be shown in current phase */
  showVideoBug: boolean;
}

// ============================================================================
// Hook
// ============================================================================

/**
 * Hook to manage MediaClass playback state machine
 *
 * Handles the sequence: beforeIdent → main → afterIdent → complete
 * Only activates when a MediaClass is configured on the video.
 */
export function useMediaClassPlayback({
  mediaClass,
  mainVideoId,
  getMediaUrl,
  onPlaybackComplete,
  enabled = true,
}: UseMediaClassPlaybackOptions): UseMediaClassPlaybackReturn {
  // Determine initial phase based on mediaClass configuration
  const getInitialPhase = useCallback((): PlaybackPhase => {
    if (!enabled || !mediaClass) return 'main';
    if (mediaClass.beforeIdent) return 'beforeIdent';
    return 'main';
  }, [enabled, mediaClass]);

  const [phase, setPhase] = useState<PlaybackPhase>(getInitialPhase);
  const previousMediaClassId = useRef<string | null>(null);

  // Reset phase when mediaClass changes
  useEffect(() => {
    const currentId = mediaClass?.id ?? null;
    if (currentId !== previousMediaClassId.current) {
      previousMediaClassId.current = currentId;
      setPhase(getInitialPhase());
    }
  }, [mediaClass?.id, getInitialPhase]);

  // Computed values
  const hasBeforeIdent = Boolean(enabled && mediaClass?.beforeIdent);
  const hasAfterIdent = Boolean(enabled && mediaClass?.afterIdent);
  const isPlayingIdent = phase === 'beforeIdent' || phase === 'afterIdent';
  const showVideoBug = enabled && phase === 'main' && Boolean(mediaClass?.videoBug);

  // Get current video URL based on phase
  const getCurrentVideoUrl = useCallback((): string => {
    if (!enabled || !mediaClass) {
      return getMediaUrl('videos', mainVideoId);
    }

    switch (phase) {
      case 'beforeIdent':
        if (mediaClass.beforeIdent) {
          return getMediaUrl('videos', mediaClass.beforeIdent.id);
        }
        return getMediaUrl('videos', mainVideoId);

      case 'afterIdent':
        if (mediaClass.afterIdent) {
          return getMediaUrl('videos', mediaClass.afterIdent.id);
        }
        return getMediaUrl('videos', mainVideoId);

      case 'main':
      case 'complete':
      default:
        return getMediaUrl('videos', mainVideoId);
    }
  }, [enabled, mediaClass, mainVideoId, phase, getMediaUrl]);

  // Get current ident duration if playing one
  const getCurrentIdentDuration = useCallback((): number | undefined => {
    if (!enabled || !mediaClass) return undefined;

    switch (phase) {
      case 'beforeIdent':
        return mediaClass.beforeIdent?.duration;
      case 'afterIdent':
        return mediaClass.afterIdent?.duration;
      default:
        return undefined;
    }
  }, [enabled, mediaClass, phase]);

  // Handle video ended - advance to next phase
  const handleVideoEnded = useCallback(() => {
    if (!enabled || !mediaClass) {
      onPlaybackComplete?.();
      return;
    }

    switch (phase) {
      case 'beforeIdent':
        setPhase('main');
        break;

      case 'main':
        if (mediaClass.afterIdent) {
          setPhase('afterIdent');
        } else {
          setPhase('complete');
          onPlaybackComplete?.();
        }
        break;

      case 'afterIdent':
        setPhase('complete');
        onPlaybackComplete?.();
        break;

      case 'complete':
        onPlaybackComplete?.();
        break;
    }
  }, [enabled, mediaClass, phase, onPlaybackComplete]);

  // Reset playback to beginning
  const resetPlayback = useCallback(() => {
    setPhase(getInitialPhase());
  }, [getInitialPhase]);

  // Skip to main content
  const skipToMain = useCallback(() => {
    if (phase === 'beforeIdent') {
      setPhase('main');
    }
  }, [phase]);

  // Skip to complete
  const skipToComplete = useCallback(() => {
    setPhase('complete');
  }, []);

  return {
    phase,
    currentVideoUrl: getCurrentVideoUrl(),
    isPlayingIdent,
    currentIdentDuration: getCurrentIdentDuration(),
    handleVideoEnded,
    resetPlayback,
    skipToMain,
    skipToComplete,
    hasBeforeIdent,
    hasAfterIdent,
    videoBug: enabled ? mediaClass?.videoBug : undefined,
    showVideoBug,
  };
}

export default useMediaClassPlayback;
