import { Injectable, Logger } from '@nestjs/common';
import { ActionDto, TrackDto, SueManifestDto, VolumeKeyframe } from '../dto';

/**
 * Active action with additional metadata for rendering
 */
export interface ActiveAction extends ActionDto {
  trackId: string;
  trackType: string;
  trackUrl: string;
  localTime: number; // Time within the action (accounting for trimStart)
  interpolatedVolume?: number;
  interpolatedOpacity?: number;
}

/**
 * TimelineEvaluator Service
 *
 * Evaluates which actions are active at a given time and computes
 * interpolated values for keyframe properties (volume, opacity, transforms).
 */
@Injectable()
export class TimelineEvaluatorService {
  private readonly logger = new Logger(TimelineEvaluatorService.name);

  /**
   * Get all active actions at a specific time, sorted by z-order
   *
   * @param manifest .sue manifest data
   * @param time Current time in seconds
   * @returns Array of active actions sorted by z-order (lowest first)
   */
  getActiveActions(manifest: SueManifestDto, time: number): ActiveAction[] {
    const activeActions: ActiveAction[] = [];

    for (const track of manifest.tracks) {
      for (const action of track.actions) {
        // Check if action is active at this time
        if (time >= action.start && time <= action.end) {
          const localTime = this.calculateLocalTime(action, time);

          const activeAction: ActiveAction = {
            ...action,
            trackId: track.id,
            trackType: track.controllerName,
            trackUrl: track.url,
            localTime,
            interpolatedVolume: this.interpolateVolume(action, time),
            interpolatedOpacity: this.interpolateOpacity(action, time),
          };

          activeActions.push(activeAction);
        }
      }
    }

    // Sort by z-order (lower z renders first, higher z on top)
    return activeActions.sort((a, b) => (a.z || 0) - (b.z || 0));
  }

  /**
   * Calculate local time within an action
   * Accounts for trimStart offset
   *
   * @param action Action definition
   * @param globalTime Current global timeline time
   * @returns Local time within the action
   */
  private calculateLocalTime(action: ActionDto, globalTime: number): number {
    const timeIntoAction = globalTime - action.start;
    const trimStart = action.trimStart || 0;
    return timeIntoAction + trimStart;
  }

  /**
   * Interpolate volume at a specific time using keyframes
   *
   * Volume keyframes format: [[value, startTime, endTime], ...]
   *
   * @param action Action with volume keyframes
   * @param time Current time in seconds
   * @returns Interpolated volume (0-1)
   */
  private interpolateVolume(action: ActionDto, time: number): number {
    if (!action.volume || action.volume.length === 0) {
      return 1.0; // Default volume
    }

    // Find applicable keyframe
    for (const keyframe of action.volume) {
      const [value, startTime, endTime] = keyframe;

      if (time >= startTime && time <= endTime) {
        return value;
      }
    }

    // If no keyframe found, return last keyframe value or default
    const lastKeyframe = action.volume[action.volume.length - 1];
    return lastKeyframe ? lastKeyframe[0] : 1.0;
  }

  /**
   * Interpolate opacity at a specific time
   *
   * @param action Action with opacity property
   * @param time Current time in seconds
   * @returns Interpolated opacity (0-1)
   */
  private interpolateOpacity(action: ActionDto, time: number): number {
    // For now, return static opacity
    // TODO: Implement opacity keyframes similar to volume
    return action.opacity !== undefined ? action.opacity : 1.0;
  }

  /**
   * Calculate fit position for media element
   *
   * @param srcWidth Source media width
   * @param srcHeight Source media height
   * @param dstWidth Destination canvas width
   * @param dstHeight Destination canvas height
   * @param fitMode Fit mode: fill, contain, cover, none
   * @returns Position and dimensions {x, y, w, h}
   */
  calculateFitPosition(
    srcWidth: number,
    srcHeight: number,
    dstWidth: number,
    dstHeight: number,
    fitMode: string = 'fill',
  ): { x: number; y: number; w: number; h: number } {
    switch (fitMode) {
      case 'fill':
        // Stretch to fill entire canvas
        return { x: 0, y: 0, w: dstWidth, h: dstHeight };

      case 'contain': {
        // Fit within canvas, maintaining aspect ratio
        const scale = Math.min(dstWidth / srcWidth, dstHeight / srcHeight);
        const w = srcWidth * scale;
        const h = srcHeight * scale;
        return {
          x: (dstWidth - w) / 2,
          y: (dstHeight - h) / 2,
          w,
          h,
        };
      }

      case 'cover': {
        // Cover entire canvas, maintaining aspect ratio (may crop)
        const scale = Math.max(dstWidth / srcWidth, dstHeight / srcHeight);
        const w = srcWidth * scale;
        const h = srcHeight * scale;
        return {
          x: (dstWidth - w) / 2,
          y: (dstHeight - h) / 2,
          w,
          h,
        };
      }

      case 'none':
      default:
        // No scaling, center
        return {
          x: (dstWidth - srcWidth) / 2,
          y: (dstHeight - srcHeight) / 2,
          w: srcWidth,
          h: srcHeight,
        };
    }
  }

  /**
   * Calculate total duration of the project
   *
   * @param manifest .sue manifest data
   * @returns Total duration in seconds
   */
  calculateDuration(manifest: SueManifestDto): number {
    if (manifest.duration) {
      return manifest.duration;
    }

    // Calculate from tracks
    let maxEndTime = 0;

    for (const track of manifest.tracks) {
      for (const action of track.actions) {
        maxEndTime = Math.max(maxEndTime, action.end);
      }
    }

    return maxEndTime;
  }

  /**
   * Optimize action retrieval by building interval index
   * Useful for avoiding "render every frame" overhead
   *
   * @param manifest .sue manifest data
   * @returns Map of time ranges to active actions
   */
  buildIntervalIndex(manifest: SueManifestDto): Map<string, ActionDto[]> {
    const index = new Map<string, ActionDto[]>();

    // Build index with 0.1s granularity
    const granularity = 0.1;
    const duration = this.calculateDuration(manifest);

    for (let t = 0; t < duration; t += granularity) {
      const key = t.toFixed(1);
      const actions = this.getActiveActions(manifest, t);
      index.set(key, actions);
    }

    this.logger.log(`Built interval index with ${index.size} entries`);
    return index;
  }

  /**
   * Detect scene stability (when active actions don't change)
   * Returns time ranges where the scene is stable
   *
   * @param manifest .sue manifest data
   * @param granularity Time granularity in seconds
   * @returns Array of stable time ranges
   */
  detectStableScenes(
    manifest: SueManifestDto,
    granularity: number = 0.1,
  ): Array<{ start: number; end: number; actions: ActiveAction[] }> {
    const scenes: Array<{ start: number; end: number; actions: ActiveAction[] }> = [];
    const duration = this.calculateDuration(manifest);

    let currentScene: { start: number; end: number; actions: ActiveAction[] } | null = null;
    let previousActionIds: string[] = [];

    for (let t = 0; t < duration; t += granularity) {
      const actions = this.getActiveActions(manifest, t);
      const actionIds = actions.map(a => `${a.trackId}-${a.name || 'unnamed'}`).sort();

      // Check if scene changed
      const sceneChanged = JSON.stringify(actionIds) !== JSON.stringify(previousActionIds);

      if (sceneChanged) {
        // Save previous scene
        if (currentScene) {
          scenes.push(currentScene);
        }

        // Start new scene
        currentScene = {
          start: t,
          end: t + granularity,
          actions,
        };
      } else if (currentScene) {
        // Extend current scene
        currentScene.end = t + granularity;
      }

      previousActionIds = actionIds;
    }

    // Add final scene
    if (currentScene) {
      scenes.push(currentScene);
    }

    this.logger.log(`Detected ${scenes.length} stable scenes`);
    return scenes;
  }
}
