/**
 * useAdaptiveBitrate Hook
 *
 * Manages adaptive bitrate MP4 source switching for the MediaViewer.
 * Estimates bandwidth from video buffer progress events, selects the
 * best resolution track with hysteresis to prevent thrashing, and
 * handles seamless source switching (preserving playback position).
 */

import * as React from 'react';
import type { ResolutionTrack, QualityMode, QualityState } from '../MediaViewer.types';

// ============================================================================
// Constants
// ============================================================================

/** EWMA smoothing factor for bandwidth samples */
const EWMA_ALPHA = 0.3;
/** Maximum number of bandwidth samples to retain */
const MAX_SAMPLES = 10;
/** Minimum seconds between automatic quality switches */
const SWITCH_COOLDOWN_MS = 5_000;
/** Bandwidth must exceed this multiple of target bitrate to upgrade */
const UPGRADE_FACTOR = 1.5;
/** Bandwidth must fall below this multiple of current bitrate to downgrade */
const DOWNGRADE_FACTOR = 0.8;
/** Default bandwidth seed in bits/sec (5 Mbps) */
const DEFAULT_BANDWIDTH = 5_000_000;

// ============================================================================
// Types
// ============================================================================

export interface UseAdaptiveBitrateOptions {
  /** Sorted array of available resolution tracks */
  tracks: ResolutionTrack[] | undefined;
  /** Ref to the HTML video element */
  videoRef: React.RefObject<HTMLVideoElement | null>;
  /** Whether adaptive bitrate is enabled */
  enabled?: boolean;
  /** Fallback URL when tracks are unavailable */
  fallbackUrl?: string;
}

export interface UseAdaptiveBitrateReturn {
  /** The current source URL to use on the <source> element */
  currentSrc: string | undefined;
  /** Full quality state for UI rendering */
  qualityState: QualityState;
  /** Manually select a track by index (switches to manual mode) */
  selectTrack: (index: number) => void;
  /** Re-enable automatic mode */
  enableAutoMode: () => void;
  /** Whether adaptive bitrate is active (2+ tracks) */
  isActive: boolean;
}

// ============================================================================
// Helpers
// ============================================================================

/** Sort tracks by bitrate ascending */
function sortTracks(tracks: ResolutionTrack[]): ResolutionTrack[] {
  return [...tracks].sort((a, b) => a.bitrate - b.bitrate);
}

/** Pick a default track index — prefer 720p-equivalent or middle */
function pickDefaultIndex(sorted: ResolutionTrack[]): number {
  const idx720 = sorted.findIndex((t) => t.height >= 720);
  if (idx720 !== -1) return idx720;
  return Math.floor(sorted.length / 2);
}

/** Seed bandwidth from Network Information API when available */
function seedBandwidth(): number {
  try {
    const conn = (navigator as any).connection;
    if (conn?.downlink) {
      // downlink is in Mbps → convert to bps
      return conn.downlink * 1_000_000;
    }
  } catch {
    // ignore — API not available
  }
  return DEFAULT_BANDWIDTH;
}

/** Compute EWMA given previous value and new sample */
function ewma(prev: number, sample: number): number {
  return EWMA_ALPHA * sample + (1 - EWMA_ALPHA) * prev;
}

// ============================================================================
// Hook
// ============================================================================

export function useAdaptiveBitrate({
  tracks: rawTracks,
  videoRef,
  enabled = true,
  fallbackUrl,
}: UseAdaptiveBitrateOptions): UseAdaptiveBitrateReturn {
  // Sorted tracks (stable reference when input is the same)
  const sorted = React.useMemo(
    () => (rawTracks && rawTracks.length >= 2 ? sortTracks(rawTracks) : []),
    [rawTracks],
  );

  const isActive = enabled && sorted.length >= 2;

  // ── State ──────────────────────────────────────────────────────────────
  const [activeIndex, setActiveIndex] = React.useState(() =>
    sorted.length >= 2 ? pickDefaultIndex(sorted) : 0,
  );
  const [mode, setMode] = React.useState<QualityMode>('auto');
  const [bandwidth, setBandwidth] = React.useState(seedBandwidth);
  const [isSwitching, setIsSwitching] = React.useState(false);

  // Mutable refs for event-handler access without re-renders
  const bandwidthRef = React.useRef(bandwidth);
  const samplesRef = React.useRef<number[]>([]);
  const lastSwitchRef = React.useRef(0);
  const lastBufferedEndRef = React.useRef(0);
  const lastProgressTimeRef = React.useRef(0);
  const modeRef = React.useRef(mode);
  const activeIndexRef = React.useRef(activeIndex);
  const isSwitchingRef = React.useRef(false);

  // Keep refs in sync
  React.useEffect(() => { bandwidthRef.current = bandwidth; }, [bandwidth]);
  React.useEffect(() => { modeRef.current = mode; }, [mode]);
  React.useEffect(() => { activeIndexRef.current = activeIndex; }, [activeIndex]);

  // Reset when tracks change
  React.useEffect(() => {
    if (sorted.length >= 2) {
      const idx = pickDefaultIndex(sorted);
      setActiveIndex(idx);
      activeIndexRef.current = idx;
      setMode('auto');
      modeRef.current = 'auto';
      setBandwidth(seedBandwidth());
      bandwidthRef.current = seedBandwidth();
      samplesRef.current = [];
      lastSwitchRef.current = 0;
      lastBufferedEndRef.current = 0;
      lastProgressTimeRef.current = 0;
    }
  }, [sorted]);

  // ── Track Selection Logic ──────────────────────────────────────────────
  const pickBestTrack = React.useCallback(
    (bw: number, currentIdx: number): number => {
      // Find the highest track whose bitrate is comfortably below bandwidth
      let best = 0;
      for (let i = sorted.length - 1; i >= 0; i--) {
        if (bw >= sorted[i].bitrate * UPGRADE_FACTOR) {
          best = i;
          break;
        }
      }

      // Hysteresis: don't downgrade unless bandwidth clearly insufficient
      if (best < currentIdx && bw >= sorted[currentIdx].bitrate * DOWNGRADE_FACTOR) {
        return currentIdx; // stay
      }

      return best;
    },
    [sorted],
  );

  // ── Source Switching ───────────────────────────────────────────────────
  const performSwitch = React.useCallback(
    (newIndex: number) => {
      const video = videoRef.current;
      if (!video || newIndex === activeIndexRef.current || isSwitchingRef.current) return;

      isSwitchingRef.current = true;
      setIsSwitching(true);

      const currentTime = video.currentTime;
      const wasPaused = video.paused;

      setActiveIndex(newIndex);
      activeIndexRef.current = newIndex;

      // After React updates the <source>, we need to reload
      // Use a microtask to let the DOM update first
      requestAnimationFrame(() => {
        video.load();

        const onCanPlay = () => {
          video.removeEventListener('canplay', onCanPlay);
          video.currentTime = currentTime;
          if (!wasPaused) {
            video.play().catch(() => { /* autoplay policy */ });
          }
          isSwitchingRef.current = false;
          setIsSwitching(false);
        };
        video.addEventListener('canplay', onCanPlay);
      });

      lastSwitchRef.current = Date.now();
    },
    [videoRef],
  );

  // ── Bandwidth Measurement via progress events ─────────────────────────
  React.useEffect(() => {
    if (!isActive) return;
    const video = videoRef.current;
    if (!video) return;

    const handleProgress = () => {
      if (modeRef.current !== 'auto') return;

      const buffered = video.buffered;
      if (buffered.length === 0) return;

      const bufferedEnd = buffered.end(buffered.length - 1);
      const now = performance.now();

      // Skip the first sample (no delta to compute)
      if (lastProgressTimeRef.current === 0) {
        lastBufferedEndRef.current = bufferedEnd;
        lastProgressTimeRef.current = now;
        return;
      }

      const timeDelta = (now - lastProgressTimeRef.current) / 1000; // seconds
      const bytesDelta = bufferedEnd - lastBufferedEndRef.current; // seconds of video

      if (timeDelta <= 0 || bytesDelta <= 0) {
        lastBufferedEndRef.current = bufferedEnd;
        lastProgressTimeRef.current = now;
        return;
      }

      // Estimate: seconds of video buffered in real-time seconds → throughput in bits
      const currentTrack = sorted[activeIndexRef.current];
      if (!currentTrack) return;

      const bitsBuffered = bytesDelta * currentTrack.bitrate;
      const throughput = bitsBuffered / timeDelta;

      // Update EWMA
      const samples = samplesRef.current;
      samples.push(throughput);
      if (samples.length > MAX_SAMPLES) samples.shift();

      const newBw = ewma(bandwidthRef.current, throughput);
      bandwidthRef.current = newBw;
      setBandwidth(newBw);

      // Check if we should switch
      const elapsed = Date.now() - lastSwitchRef.current;
      if (elapsed >= SWITCH_COOLDOWN_MS && !isSwitchingRef.current) {
        const bestIdx = pickBestTrack(newBw, activeIndexRef.current);
        if (bestIdx !== activeIndexRef.current) {
          performSwitch(bestIdx);
        }
      }

      lastBufferedEndRef.current = bufferedEnd;
      lastProgressTimeRef.current = now;
    };

    video.addEventListener('progress', handleProgress);
    return () => {
      video.removeEventListener('progress', handleProgress);
    };
  }, [isActive, videoRef, sorted, pickBestTrack, performSwitch]);

  // ── Public API ─────────────────────────────────────────────────────────
  const selectTrack = React.useCallback(
    (index: number) => {
      if (index < 0 || index >= sorted.length) return;
      setMode('manual');
      modeRef.current = 'manual';
      performSwitch(index);
    },
    [sorted, performSwitch],
  );

  const enableAutoMode = React.useCallback(() => {
    setMode('auto');
    modeRef.current = 'auto';
    // Immediately evaluate best track
    const bestIdx = pickBestTrack(bandwidthRef.current, activeIndexRef.current);
    if (bestIdx !== activeIndexRef.current) {
      performSwitch(bestIdx);
    }
  }, [pickBestTrack, performSwitch]);

  // ── Return ─────────────────────────────────────────────────────────────
  const activeTrack = sorted[activeIndex] as ResolutionTrack | undefined;

  const qualityState: QualityState = React.useMemo(
    () => ({
      mode,
      activeTrack: activeTrack ?? { url: '', width: 0, height: 0, bitrate: 0, label: '' },
      activeTrackIndex: activeIndex,
      availableTracks: sorted,
      estimatedBandwidth: bandwidth,
      isSwitching,
    }),
    [mode, activeTrack, activeIndex, sorted, bandwidth, isSwitching],
  );

  const currentSrc = isActive ? activeTrack?.url : fallbackUrl;

  return {
    currentSrc,
    qualityState,
    selectTrack,
    enableAutoMode,
    isActive,
  };
}
