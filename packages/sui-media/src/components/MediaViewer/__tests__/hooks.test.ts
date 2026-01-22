/**
 * MediaViewer Hooks Tests
 *
 * Tests for custom hooks used by MediaViewer.
 */

import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMediaViewerState, MediaViewerMode } from '../hooks/useMediaViewerState';
import { useMediaClassPlayback } from '../hooks/useMediaClassPlayback';
import type { MediaClassConfig } from '../MediaViewer.types';

describe('useMediaViewerState', () => {
  it('should initialize with NORMAL mode by default', () => {
    const { result } = renderHook(() => useMediaViewerState());

    expect(result.current.mode).toBe('NORMAL');
    expect(result.current.isNormal).toBe(true);
    expect(result.current.isTheater).toBe(false);
    expect(result.current.isFullscreen).toBe(false);
    expect(result.current.legacyState).toBe(0);
  });

  it('should initialize with custom mode', () => {
    const { result } = renderHook(() => useMediaViewerState('THEATER' as MediaViewerMode));

    expect(result.current.mode).toBe('THEATER');
    expect(result.current.isNormal).toBe(false);
    expect(result.current.isTheater).toBe(true);
    expect(result.current.isFullscreen).toBe(false);
    expect(result.current.legacyState).toBe(1);
  });

  it('should transition to THEATER on ENTER_THEATER action', async () => {
    const { result } = renderHook(() => useMediaViewerState());

    await act(async () => {
      await result.current.transition('ENTER_THEATER');
    });

    expect(result.current.mode).toBe('THEATER');
    expect(result.current.isTheater).toBe(true);
    expect(result.current.legacyState).toBe(1);
  });

  it('should transition to NORMAL on EXIT_TO_NORMAL action', async () => {
    const { result } = renderHook(() => useMediaViewerState('THEATER' as MediaViewerMode));

    await act(async () => {
      await result.current.transition('EXIT_TO_NORMAL');
    });

    expect(result.current.mode).toBe('NORMAL');
    expect(result.current.isNormal).toBe(true);
    expect(result.current.legacyState).toBe(0);
  });
});

describe('useMediaClassPlayback', () => {
  const mockMediaClass: MediaClassConfig = {
    id: 'class-1',
    name: 'Test Class',
    beforeIdent: {
      id: 'ident-before',
      duration: 5,
    },
    afterIdent: {
      id: 'ident-after',
      duration: 3,
    },
  };

  const mockGetMediaUrl = (type: 'videos' | 'images', id: string) => {
    return `/api/media/${type}/${id}`;
  };

  it('should start with beforeIdent phase when configured', () => {
    const { result } = renderHook(() =>
      useMediaClassPlayback({
        mediaClass: mockMediaClass,
        mainVideoId: 'main-video',
        getMediaUrl: mockGetMediaUrl,
        enabled: true,
      })
    );

    expect(result.current.phase).toBe('beforeIdent');
    expect(result.current.isPlayingIdent).toBe(true);
    expect(result.current.hasBeforeIdent).toBe(true);
    expect(result.current.hasAfterIdent).toBe(true);
  });

  it('should transition through phases correctly', () => {
    const { result } = renderHook(() =>
      useMediaClassPlayback({
        mediaClass: mockMediaClass,
        mainVideoId: 'main-video',
        getMediaUrl: mockGetMediaUrl,
        enabled: true,
      })
    );

    // Start: beforeIdent
    expect(result.current.phase).toBe('beforeIdent');

    // After beforeIdent ends -> main
    act(() => {
      result.current.handleVideoEnded();
    });
    expect(result.current.phase).toBe('main');
    expect(result.current.isPlayingIdent).toBe(false);

    // After main ends -> afterIdent
    act(() => {
      result.current.handleVideoEnded();
    });
    expect(result.current.phase).toBe('afterIdent');
    expect(result.current.isPlayingIdent).toBe(true);

    // After afterIdent ends -> complete
    act(() => {
      result.current.handleVideoEnded();
    });
    expect(result.current.phase).toBe('complete');
  });

  it('should skip to main content', () => {
    const { result } = renderHook(() =>
      useMediaClassPlayback({
        mediaClass: mockMediaClass,
        mainVideoId: 'main-video',
        getMediaUrl: mockGetMediaUrl,
        enabled: true,
      })
    );

    expect(result.current.phase).toBe('beforeIdent');

    act(() => {
      result.current.skipToMain();
    });

    expect(result.current.phase).toBe('main');
    expect(result.current.isPlayingIdent).toBe(false);
  });

  it('should reset playback', () => {
    const { result } = renderHook(() =>
      useMediaClassPlayback({
        mediaClass: mockMediaClass,
        mainVideoId: 'main-video',
        getMediaUrl: mockGetMediaUrl,
        enabled: true,
      })
    );

    // Advance to main phase
    act(() => {
      result.current.handleVideoEnded();
    });
    expect(result.current.phase).toBe('main');

    // Reset should go back to beforeIdent
    act(() => {
      result.current.resetPlayback();
    });
    expect(result.current.phase).toBe('beforeIdent');
  });

  it('should start with main phase when no MediaClass', () => {
    const { result } = renderHook(() =>
      useMediaClassPlayback({
        mediaClass: null,
        mainVideoId: 'main-video',
        getMediaUrl: mockGetMediaUrl,
        enabled: true,
      })
    );

    expect(result.current.phase).toBe('main');
    expect(result.current.hasBeforeIdent).toBe(false);
    expect(result.current.hasAfterIdent).toBe(false);
  });

  it('should start with main phase when disabled', () => {
    const { result } = renderHook(() =>
      useMediaClassPlayback({
        mediaClass: mockMediaClass,
        mainVideoId: 'main-video',
        getMediaUrl: mockGetMediaUrl,
        enabled: false,
      })
    );

    expect(result.current.phase).toBe('main');
    expect(result.current.hasBeforeIdent).toBe(false);
    expect(result.current.hasAfterIdent).toBe(false);
  });
});
