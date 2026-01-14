import { Injectable, Logger } from '@nestjs/common';
import { FormatVolumeKeyframe } from '../dto/sue-format.dto';

/**
 * VolumeKeyframeProcessorService
 *
 * Generates FFmpeg volume filter expressions from keyframe arrays
 * Handles linear interpolation between keyframes for smooth volume transitions
 */
@Injectable()
export class VolumeKeyframeProcessorService {
  private readonly logger = new Logger(VolumeKeyframeProcessorService.name);

  /**
   * Generate FFmpeg volume filter expression from keyframes
   *
   * Input: [[0, 0], [1, 5.5], [0.5, 10.2]]
   * Output: volume=enable='between(t,0,10.2)':volume='if(lt(t,5.5), t/5.5, if(lt(t,10.2), 1-(t-5.5)/(10.2-5.5)*0.5, 0.5))'
   */
  generateVolumeFilter(
    keyframes: FormatVolumeKeyframe[],
    timeOffset = 0,
  ): string | null {
    if (!keyframes || keyframes.length === 0) {
      return null;
    }

    // Sort keyframes by timestamp
    const sortedKeyframes = [...keyframes].sort((a, b) => a[1] - b[1]);

    // Validate keyframes
    if (!this.validateKeyframes(sortedKeyframes)) {
      this.logger.warn('Invalid volume keyframes, using constant volume');
      return `volume=${sortedKeyframes[0][0]}`;
    }

    // Single keyframe = constant volume
    if (sortedKeyframes.length === 1) {
      return `volume=${sortedKeyframes[0][0]}`;
    }

    // Multiple keyframes = linear interpolation
    const [firstKeyframe] = sortedKeyframes;
    const lastKeyframe = sortedKeyframes[sortedKeyframes.length - 1];
    const startTime = firstKeyframe[1] + timeOffset;
    const endTime = lastKeyframe[1] + timeOffset;

    // Build piecewise linear interpolation expression
    const volumeExpression = this.buildInterpolationExpression(
      sortedKeyframes,
      timeOffset,
    );

    return `volume=enable='between(t,${startTime},${endTime})':volume='${volumeExpression}'`;
  }

  /**
   * Build FFmpeg expression for piecewise linear interpolation
   */
  private buildInterpolationExpression(
    keyframes: FormatVolumeKeyframe[],
    timeOffset: number,
  ): string {
    if (keyframes.length === 1) {
      return keyframes[0][0].toString();
    }

    if (keyframes.length === 2) {
      // Simple linear interpolation between two points
      const [v0, t0] = keyframes[0];
      const [v1, t1] = keyframes[1];
      const adjustedT0 = t0 + timeOffset;
      const adjustedT1 = t1 + timeOffset;

      // Linear interpolation: v0 + (v1 - v0) * (t - t0) / (t1 - t0)
      const slope = (v1 - v0) / (adjustedT1 - adjustedT0);
      return `${v0} + ${slope} * (t - ${adjustedT0})`;
    }

    // Multiple segments: use nested if statements
    let expression = '';

    for (let i = 0; i < keyframes.length - 1; i++) {
      const [v0, t0] = keyframes[i];
      const [v1, t1] = keyframes[i + 1];
      const adjustedT0 = t0 + timeOffset;
      const adjustedT1 = t1 + timeOffset;

      const slope = (v1 - v0) / (adjustedT1 - adjustedT0);
      const segmentExpr = `${v0} + ${slope} * (t - ${adjustedT0})`;

      if (i === 0) {
        expression = `if(lt(t,${adjustedT1}), ${segmentExpr}, `;
      } else if (i === keyframes.length - 2) {
        expression += `${segmentExpr}${''.padEnd(i, ')')}`;
      } else {
        expression += `if(lt(t,${adjustedT1}), ${segmentExpr}, `;
      }
    }

    return expression;
  }

  /**
   * Validate volume keyframes
   * Ensures timestamps are monotonically increasing and values are reasonable
   */
  private validateKeyframes(keyframes: FormatVolumeKeyframe[]): boolean {
    if (keyframes.length === 0) return false;

    for (let i = 0; i < keyframes.length; i++) {
      const [volume, timestamp] = keyframes[i];

      // Check for valid numbers
      if (!Number.isFinite(volume) || !Number.isFinite(timestamp)) {
        this.logger.warn(`Invalid keyframe: [${volume}, ${timestamp}]`);
        return false;
      }

      // Check for negative timestamp
      if (timestamp < 0) {
        this.logger.warn(`Negative timestamp in keyframe: ${timestamp}`);
        return false;
      }

      // Check for monotonically increasing timestamps
      if (i > 0 && timestamp <= keyframes[i - 1][1]) {
        this.logger.warn(
          `Timestamps not monotonically increasing: ${keyframes[i - 1][1]} -> ${timestamp}`,
        );
        return false;
      }

      // Warn about extreme volume values (allow >1 for amplification)
      if (volume < 0 || volume > 10) {
        this.logger.warn(`Unusual volume value: ${volume}`);
      }
    }

    return true;
  }

  /**
   * Simplify volume filter if possible
   * If all keyframes have same volume, return constant volume
   */
  simplifyVolumeFilter(keyframes: FormatVolumeKeyframe[]): string | null {
    if (!keyframes || keyframes.length === 0) {
      return null;
    }

    const firstVolume = keyframes[0][0];
    const allSame = keyframes.every(kf => kf[0] === firstVolume);

    if (allSame) {
      return `volume=${firstVolume}`;
    }

    return this.generateVolumeFilter(keyframes);
  }

  /**
   * Generate audio filter for multiple tracks with volume keyframes
   */
  generateMultiTrackAudioFilter(
    tracks: Array<{ inputLabel: string; keyframes?: FormatVolumeKeyframe[]; timeOffset?: number }>,
    outputLabel: string,
  ): string[] {
    const filters: string[] = [];

    for (let i = 0; i < tracks.length; i++) {
      const track = tracks[i];
      const volumeFilter = track.keyframes
        ? this.generateVolumeFilter(track.keyframes, track.timeOffset || 0)
        : null;

      if (volumeFilter) {
        const outputLabelName = `a${i}_vol`;
        filters.push(`${track.inputLabel}${volumeFilter}[${outputLabelName}]`);
        tracks[i].inputLabel = `[${outputLabelName}]`; // Update for next stage
      }
    }

    // Mix all tracks together
    if (tracks.length > 1) {
      const inputLabels = tracks.map(t => t.inputLabel).join('');
      filters.push(
        `${inputLabels}amix=inputs=${tracks.length}:duration=longest[${outputLabel}]`,
      );
    } else if (tracks.length === 1) {
      // Single track, just relabel
      filters.push(`${tracks[0].inputLabel}acopy[${outputLabel}]`);
    }

    return filters;
  }
}
