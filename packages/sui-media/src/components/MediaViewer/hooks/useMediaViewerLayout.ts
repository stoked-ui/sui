/**
 * useMediaViewerLayout - Simplified layout calculation hook for MediaViewer
 *
 * Calculates optimal layout for media viewer including:
 * - Container dimensions
 * - Media dimensions (respecting aspect ratio)
 * - Preview card grid layout
 * - Available space for components
 *
 * This is a simplified version that maintains core functionality while
 * being framework-agnostic and easier to integrate.
 */

import { useEffect, useRef, useState } from 'react';
import type { MediaItem, MediaViewerLayoutResult } from '../MediaViewer.types';

// ============================================================================
// Constants
// ============================================================================

const NAVBAR_HEIGHT = 64;
const CONTAINER_PADDING = 32;
const PREVIEW_MARGIN = 8;
const PREVIEW_HEADER_HEIGHT = 32;
const PREVIEW_CONTAINER_PADDING = 16;
const CARD_GAP = 8;
const CARD_ASPECT_RATIO = 16 / 9;
const SAFETY_BUFFER = 16;
const MIN_CARD_WIDTH = 120;
const MIN_MEDIA_HEIGHT = 300;
const MOBILE_BREAKPOINT = 600;

// ============================================================================
// Hook Props
// ============================================================================

export interface UseMediaViewerLayoutProps {
  /** Current media item */
  item: MediaItem;
  /** All media items in collection */
  mediaItems: MediaItem[];
  /** Current item index */
  currentIndex: number;
  /** Whether navbar is hidden */
  hideNavbar: boolean;
  /** Whether to show preview cards */
  showPreviewCards: boolean;
  /** Fullscreen state: 0=normal, 1=theater, 2=fullscreen */
  fullscreenState: 0 | 1 | 2;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get media aspect ratio from item dimensions
 */
function getMediaAspectRatio(item: MediaItem): number {
  if (item.width && item.height && item.width > 0 && item.height > 0) {
    return item.width / item.height;
  }
  return 16 / 9; // Default aspect ratio
}

/**
 * Calculate media dimensions within max constraints
 */
function calculateMediaDimensions(
  aspectRatio: number,
  maxWidth: number,
  maxHeight: number,
  minHeight: number
): { mediaWidth: number; mediaHeight: number } {
  const heightFromWidth = maxWidth / aspectRatio;
  const widthFromMinHeight = minHeight * aspectRatio;

  let mediaWidth: number;
  let mediaHeight: number;

  if (heightFromWidth <= maxHeight) {
    if (heightFromWidth >= minHeight) {
      mediaWidth = maxWidth;
      mediaHeight = heightFromWidth;
    } else {
      mediaHeight = minHeight;
      mediaWidth = Math.min(widthFromMinHeight, maxWidth);
    }
  } else {
    mediaHeight = Math.max(minHeight, maxHeight);
    mediaWidth = Math.min(mediaHeight * aspectRatio, maxWidth);
  }

  return {
    mediaWidth: Math.floor(mediaWidth),
    mediaHeight: Math.floor(mediaHeight),
  };
}

/**
 * Calculate preview grid layout
 */
function calculatePreviewGrid(
  containerWidth: number,
  availableHeight: number,
  itemCount: number,
  isMobile: boolean
): {
  columns: number;
  rows: number;
  visibleCards: number;
  previewHeight: number;
} {
  if (availableHeight <= 0 || itemCount === 0) {
    return { columns: 0, rows: 0, visibleCards: 0, previewHeight: 0 };
  }

  const maxColumns = isMobile ? 4 : 6;
  const minColumns = 2;

  // Calculate for different column counts and pick best fit
  let bestConfig = { columns: 3, rows: 0, visibleCards: 0, previewHeight: 0 };
  let maxCards = 0;

  for (let cols = minColumns; cols <= maxColumns; cols++) {
    const usableWidth = containerWidth - PREVIEW_CONTAINER_PADDING;
    const cardWidth = (usableWidth - (cols - 1) * CARD_GAP) / cols;

    if (cardWidth < MIN_CARD_WIDTH) continue;

    const cardHeight = Math.max(cardWidth / CARD_ASPECT_RATIO, MIN_CARD_WIDTH / CARD_ASPECT_RATIO);
    const rowHeight = cardHeight + CARD_GAP;

    const usableHeight = availableHeight - PREVIEW_HEADER_HEIGHT - PREVIEW_CONTAINER_PADDING - SAFETY_BUFFER;
    const rowsThatFit = Math.floor(usableHeight / rowHeight);

    if (rowsThatFit < 1) continue;

    const maxRowsNeeded = Math.ceil(itemCount / cols);
    const actualRows = Math.min(rowsThatFit, maxRowsNeeded);
    const totalCards = Math.min(cols * actualRows, itemCount);

    if (totalCards > maxCards) {
      maxCards = totalCards;
      bestConfig = {
        columns: cols,
        rows: actualRows,
        visibleCards: totalCards,
        previewHeight:
          actualRows * cardHeight +
          (actualRows - 1) * CARD_GAP +
          PREVIEW_HEADER_HEIGHT +
          PREVIEW_CONTAINER_PADDING +
          PREVIEW_MARGIN,
      };
    }
  }

  return bestConfig;
}

/**
 * Get ordered preview items (items after current, then before)
 */
function getOrderedPreviewItems(props: UseMediaViewerLayoutProps): MediaItem[] {
  const afterCurrent = props.mediaItems.slice(props.currentIndex + 1);
  const beforeCurrent = props.mediaItems.slice(0, props.currentIndex);
  return [...afterCurrent, ...beforeCurrent];
}

// ============================================================================
// Layout Calculation
// ============================================================================

function calculateLayout(props: UseMediaViewerLayoutProps): MediaViewerLayoutResult {
  if (typeof window === 'undefined') {
    return getDefaultLayout(props);
  }

  const vh = window.innerHeight;
  const vw = window.innerWidth;
  const isMobile = vw < MOBILE_BREAKPOINT;

  const navbarOffset = props.hideNavbar ? 0 : NAVBAR_HEIGHT;
  const containerHeight = vh - navbarOffset;
  const containerWidth = isMobile ? vw * 0.98 : vw * 0.95;

  const mediaAspectRatio = getMediaAspectRatio(props.item);
  const isPortrait = mediaAspectRatio < 1;

  // No preview cases (theater/fullscreen or disabled)
  if (!props.showPreviewCards || props.fullscreenState !== 0) {
    const availableHeight = containerHeight - CONTAINER_PADDING;
    const { mediaWidth, mediaHeight } = calculateMediaDimensions(
      mediaAspectRatio,
      containerWidth,
      availableHeight,
      MIN_MEDIA_HEIGHT
    );

    return {
      containerWidth,
      containerHeight,
      mediaWidth,
      mediaHeight,
      mediaSectionHeight: Math.max(mediaHeight, MIN_MEDIA_HEIGHT),
      previewHeight: 0,
      previewItems: [],
      previewColumns: 0,
      previewRows: 0,
      visibleCardsCount: 0,
      navbarOffset,
      isPortrait,
      isMobile,
    };
  }

  // With preview cards - calculate grid first
  const availableItems = getOrderedPreviewItems(props);
  const minPreviewHeight = 150; // Minimum space for 1 row
  const maxMediaHeight = containerHeight - CONTAINER_PADDING - minPreviewHeight;

  let { mediaWidth, mediaHeight } = calculateMediaDimensions(
    mediaAspectRatio,
    containerWidth,
    maxMediaHeight,
    MIN_MEDIA_HEIGHT
  );

  const remainingForPreview = containerHeight - CONTAINER_PADDING - mediaHeight;

  const gridConfig = calculatePreviewGrid(
    containerWidth,
    remainingForPreview,
    availableItems.length,
    isMobile
  );

  // If grid doesn't fit, shrink media
  if (gridConfig.rows === 0 && availableItems.length > 0) {
    let attempts = 0;
    while (gridConfig.rows === 0 && attempts < 20) {
      mediaHeight = Math.floor(mediaHeight * 0.95);
      mediaWidth = Math.floor(mediaHeight * mediaAspectRatio);

      const newRemaining = containerHeight - CONTAINER_PADDING - mediaHeight;
      const newGrid = calculatePreviewGrid(containerWidth, newRemaining, availableItems.length, isMobile);

      if (newGrid.rows > 0) {
        Object.assign(gridConfig, newGrid);
        break;
      }
      attempts++;
    }
  }

  const previewItems = availableItems.slice(0, gridConfig.visibleCards);

  return {
    containerWidth,
    containerHeight,
    mediaWidth,
    mediaHeight,
    mediaSectionHeight: Math.max(mediaHeight, MIN_MEDIA_HEIGHT),
    previewHeight: gridConfig.previewHeight,
    previewItems,
    previewColumns: gridConfig.columns,
    previewRows: gridConfig.rows,
    visibleCardsCount: gridConfig.visibleCards,
    navbarOffset,
    isPortrait,
    isMobile,
  };
}

function getDefaultLayout(props: UseMediaViewerLayoutProps): MediaViewerLayoutResult {
  const mediaAspectRatio = getMediaAspectRatio(props.item);

  return {
    containerWidth: 1200,
    containerHeight: 800,
    mediaWidth: 800,
    mediaHeight: Math.floor(800 / mediaAspectRatio),
    mediaSectionHeight: 500,
    previewHeight: 200,
    previewItems: [],
    previewColumns: 4,
    previewRows: 1,
    visibleCardsCount: 0,
    navbarOffset: NAVBAR_HEIGHT,
    isPortrait: mediaAspectRatio < 1,
    isMobile: false,
  };
}

// ============================================================================
// Hook
// ============================================================================

/**
 * MediaViewer layout calculation hook
 *
 * Calculates optimal layout for media and preview cards based on:
 * - Viewport dimensions
 * - Media aspect ratio
 * - Available space
 * - Number of items to preview
 */
export function useMediaViewerLayout(
  props: UseMediaViewerLayoutProps
): MediaViewerLayoutResult {
  const [layout, setLayout] = useState<MediaViewerLayoutResult>(() => calculateLayout(props));
  const propsRef = useRef(props);

  useEffect(() => {
    propsRef.current = props;
  });

  // Handle window resize
  useEffect(() => {
    let resizeTimer: NodeJS.Timeout | null = null;

    const handleResize = () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        setLayout(calculateLayout(propsRef.current));
      }, 50);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', handleResize);
      }
      if (resizeTimer) clearTimeout(resizeTimer);
    };
  }, []);

  // Recalculate when props change
  useEffect(() => {
    setLayout(calculateLayout(props));
  }, [
    props.item.id,
    props.item.width,
    props.item.height,
    props.currentIndex,
    props.mediaItems.length,
    props.hideNavbar,
    props.showPreviewCards,
    props.fullscreenState,
  ]);

  return layout;
}

export default useMediaViewerLayout;
