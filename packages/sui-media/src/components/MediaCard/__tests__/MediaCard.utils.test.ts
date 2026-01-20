import { describe, it, expect } from 'vitest';
import {
  calculateAspectRatio,
  formatDuration,
  timeCodeToSeconds,
  calculateSkipAmount,
  pixelsToPercentage,
  constrainPosition,
  getSpritePosition,
} from '../MediaCard.utils';
import { DEFAULT_ASPECT_RATIO } from '../MediaCard.constants';

describe('MediaCard.utils', () => {
  describe('calculateAspectRatio', () => {
    it('calculates aspect ratio correctly', () => {
      expect(calculateAspectRatio(1920, 1080)).toBeCloseTo(56.25, 2);
      expect(calculateAspectRatio(1280, 720)).toBeCloseTo(56.25, 2);
      expect(calculateAspectRatio(800, 600)).toBe(75);
    });

    it('returns default aspect ratio for invalid inputs', () => {
      expect(calculateAspectRatio(undefined, undefined)).toBe(DEFAULT_ASPECT_RATIO);
      expect(calculateAspectRatio(0, 1080)).toBe(DEFAULT_ASPECT_RATIO);
      expect(calculateAspectRatio(1920, 0)).toBe(DEFAULT_ASPECT_RATIO);
    });
  });

  describe('formatDuration', () => {
    it('formats seconds to MM:SS', () => {
      expect(formatDuration(0)).toBe('0:00');
      expect(formatDuration(5)).toBe('0:05');
      expect(formatDuration(65)).toBe('1:05');
      expect(formatDuration(125)).toBe('2:05');
    });

    it('formats seconds to HH:MM:SS for durations >= 1 hour', () => {
      expect(formatDuration(3600)).toBe('1:00:00');
      expect(formatDuration(3665)).toBe('1:01:05');
      expect(formatDuration(7325)).toBe('2:02:05');
    });

    it('handles invalid inputs', () => {
      expect(formatDuration(NaN)).toBe('0:00');
      expect(formatDuration(Infinity)).toBe('0:00');
    });
  });

  describe('timeCodeToSeconds', () => {
    it('converts MM:SS to seconds', () => {
      expect(timeCodeToSeconds('0:05')).toBe(5);
      expect(timeCodeToSeconds('1:05')).toBe(65);
      expect(timeCodeToSeconds('2:05')).toBe(125);
    });

    it('converts HH:MM:SS to seconds', () => {
      expect(timeCodeToSeconds('1:00:00')).toBe(3600);
      expect(timeCodeToSeconds('1:01:05')).toBe(3665);
      expect(timeCodeToSeconds('2:02:05')).toBe(7325);
    });

    it('handles invalid inputs', () => {
      expect(timeCodeToSeconds('')).toBe(0);
      expect(timeCodeToSeconds('invalid')).toBe(NaN);
    });
  });

  describe('calculateSkipAmount', () => {
    it('returns 1/5 of duration for videos < 10 minutes', () => {
      expect(calculateSkipAmount(300)).toBe(60); // 5 min -> 1 min
      expect(calculateSkipAmount(540)).toBe(108); // 9 min -> 1.8 min
    });

    it('returns 1/10 of duration for videos >= 10 minutes', () => {
      expect(calculateSkipAmount(600)).toBe(60); // 10 min -> 1 min
      expect(calculateSkipAmount(1200)).toBe(120); // 20 min -> 2 min
    });

    it('handles invalid inputs', () => {
      expect(calculateSkipAmount(0)).toBe(0);
      expect(calculateSkipAmount(-100)).toBe(0);
    });
  });

  describe('pixelsToPercentage', () => {
    it('converts pixel delta to percentage', () => {
      expect(pixelsToPercentage(100, 1000, 1)).toBe(10);
      expect(pixelsToPercentage(50, 500, 1)).toBe(10);
    });

    it('handles scaling', () => {
      expect(pixelsToPercentage(100, 1000, 2)).toBe(5);
      expect(pixelsToPercentage(100, 1000, 0.5)).toBe(10);
    });
  });

  describe('constrainPosition', () => {
    it('constrains position within bounds', () => {
      expect(constrainPosition({ x: 50, y: 50 })).toEqual({ x: 50, y: 50 });
      expect(constrainPosition({ x: -10, y: 50 })).toEqual({ x: 0, y: 50 });
      expect(constrainPosition({ x: 110, y: 50 })).toEqual({ x: 100, y: 50 });
      expect(constrainPosition({ x: 50, y: -10 })).toEqual({ x: 50, y: 0 });
      expect(constrainPosition({ x: 50, y: 110 })).toEqual({ x: 50, y: 100 });
    });
  });

  describe('getSpritePosition', () => {
    it('calculates sprite position correctly', () => {
      const config = {
        framesPerRow: 5,
        frameWidth: 160,
        frameHeight: 90,
      };

      // First frame (0,0)
      expect(getSpritePosition(0, config)).toBe('0px 0px');

      // Second frame (1,0)
      expect(getSpritePosition(1, config)).toBe('-160px 0px');

      // Sixth frame (0,1)
      expect(getSpritePosition(5, config)).toBe('0px -90px');

      // Seventh frame (1,1)
      expect(getSpritePosition(6, config)).toBe('-160px -90px');
    });
  });
});
