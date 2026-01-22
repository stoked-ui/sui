import type { GlobalEditingState } from './MediaCard.types';

/**
 * Debug flag for poster transform - set to true to enable console logging
 */
export const DEBUG_POSTER_TRANSFORM = false;

/**
 * Default 16:9 aspect ratio as fallback (expressed as percentage for padding-bottom)
 */
export const DEFAULT_ASPECT_RATIO = (9 / 16) * 100;

/**
 * Hover delay before starting video preview (milliseconds)
 */
export const HOVER_PREVIEW_DELAY = 150;

/**
 * Minimum thumbnail generation attempts before giving up
 */
export const MAX_THUMBNAIL_GENERATION_ATTEMPTS = 3;

/**
 * Default thumbnail capture time (seconds from start)
 */
export const DEFAULT_THUMBNAIL_TIME = 1;

/**
 * Video playback speed levels for fast-forward/rewind
 */
export const PLAYBACK_SPEED_LEVELS = [1, 2, 3, 4];

/**
 * Double-click threshold for publicity toggle (milliseconds)
 */
export const DOUBLE_CLICK_THRESHOLD = 300;

/**
 * Small card width threshold (pixels)
 */
export const SMALL_CARD_WIDTH_THRESHOLD = 300;

/**
 * Global editing state for coordinating poster edits across cards.
 * This prevents unnecessary re-renders of cards that aren't being edited.
 *
 * Note: This is a mutable singleton that lives outside React's state system
 * for performance reasons. The MediaCardWrapper uses this in its memo comparison.
 */
export const globalEditingState: GlobalEditingState = {
  isEditing: false,
  editingCardId: null
};
