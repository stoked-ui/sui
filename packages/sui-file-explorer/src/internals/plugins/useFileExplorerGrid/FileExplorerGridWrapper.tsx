import * as React from 'react';
import Box from '@mui/material/Box';
import { SxProps, Theme } from '@mui/system';
import { FileExplorerGridHeaders } from './FileExplorerGridHeaders';
import {
  GridColumns,
  GridHeaders,
} from './useFileExplorerGrid.types';

export interface FileExplorerGridWrapperProps {
  /**
   * Grid columns configuration
   */
  columns: GridColumns;

  /**
   * Grid headers configuration
   */
  headers: GridHeaders;

  /**
   * Component ID for synchronized scrolling
   */
  id: string;

  /**
   * Children to render (tree content)
   */
  children: React.ReactNode;

  /**
   * Additional styles for the wrapper
   */
  sx?: SxProps<Theme>;

  /**
   * Column widths state
   */
  columnWidths: SxProps<Theme>;
}

/**
 * FileExplorerGridWrapper
 *
 * Wrapper component that integrates grid layout with MUI X tree structure.
 * Provides:
 * - Column headers with synchronized scrolling
 * - Dynamic column width management
 * - Grid-based cell rendering for tree items
 *
 * Architecture:
 * ┌────────────────────────────────────────┐
 * │  FileExplorerGridWrapper               │
 * │  ┌──────────────────────────────────┐ │
 * │  │  FileExplorerGridHeaders         │ │
 * │  │  (synchronized horizontal scroll)│ │
 * │  └──────────────────────────────────┘ │
 * │  ┌──────────────────────────────────┐ │
 * │  │  Tree Content Area               │ │
 * │  │  (items with grid cell rendering)│ │
 * │  └──────────────────────────────────┘ │
 * └────────────────────────────────────────┘
 */
export const FileExplorerGridWrapper = React.forwardRef<
  HTMLDivElement,
  FileExplorerGridWrapperProps
>(function FileExplorerGridWrapper(props, ref) {
  const {
    columns,
    headers,
    id,
    children,
    sx,
    columnWidths,
  } = props;

  const headerRef = React.useRef<HTMLDivElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);

  /**
   * AC-3.1.c: Horizontal scroll synchronization between headers and tree body
   * Synchronized scrolling handler - when content scrolls, update header scroll position
   */
  const handleContentScroll = React.useCallback((e: React.UIEvent<HTMLDivElement>) => {
    if (headerRef.current && e.currentTarget) {
      headerRef.current.scrollLeft = e.currentTarget.scrollLeft;
    }
  }, []);

  /**
   * Prevent header scroll from affecting content
   * (content scroll drives header scroll, not vice versa)
   */
  const handleHeaderScroll = React.useCallback((e: React.UIEvent<HTMLDivElement>) => {
    // Sync content scroll when header is scrolled (e.g., via keyboard navigation)
    if (contentRef.current && e.currentTarget) {
      contentRef.current.scrollLeft = e.currentTarget.scrollLeft;
    }
  }, []);

  // AC-3.1.b: FileExplorerGridHeaders displays above tree with pixel-perfect alignment
  return (
    <Box
      ref={ref}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
        ...(sx as any),
      }}
    >
      {/* Grid Headers with synchronized scroll */}
      <Box
        ref={headerRef}
        sx={{
          overflowX: 'hidden', // Header scroll is driven by content scroll
          overflowY: 'hidden',
          flexShrink: 0,
        }}
        onScroll={handleHeaderScroll}
      >
        <FileExplorerGridHeaders
          id={`${id}-headers`}
        />
      </Box>

      {/* Tree Content Area with grid cell rendering */}
      <Box
        ref={contentRef}
        sx={{
          flex: 1,
          overflowX: 'auto',
          overflowY: 'auto',
          ...(columnWidths as any), // AC-3.1.d: columnWidths prop updates both headers and items
        }}
        onScroll={handleContentScroll}
      >
        {children}
      </Box>
    </Box>
  );
});
