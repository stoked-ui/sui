/**
 * @stoked-ui/complete - Aggregator for all Stoked UI editor-related packages
 */

// Ensure React is imported and initialized first
import * as React from 'react';
import * as ReactDOM from 'react-dom';

// Verify React is available
if (typeof React === 'undefined') {
  throw new Error(
    'React is not found. Make sure React is loaded before @stoked-ui/complete. ' +
    'This component requires React to be loaded globally.'
  );
}

// Re-export components from other packages under namespaces to avoid conflicts
export * as Common from '@stoked-ui/common';
export * as FileExplorer from '@stoked-ui/file-explorer'; 
export * as MediaSelector from '@stoked-ui/media-selector';
export * as Timeline from '@stoked-ui/timeline';
export * as Editor from '@stoked-ui/editor';

// Re-export frequently used types directly
export type { EditorFile, IEditorAction } from '@stoked-ui/editor';
export type { MediaFile, IMediaFile } from '@stoked-ui/media-selector';
export type { FileBase } from '@stoked-ui/file-explorer';
export type { TimelineProps, TimelineAction } from '@stoked-ui/timeline';

// Main components for direct import with explicit React reference
import { default as EditorComponent } from '@stoked-ui/editor';
import { FileExplorer as FileExplorerComponent } from '@stoked-ui/file-explorer';
import { default as MediaSelectorComponent } from '@stoked-ui/media-selector';
import { default as TimelineComponent } from '@stoked-ui/timeline';

// Export a default object for webpack
const StokedUI = {
  Editor: EditorComponent,
  FileExplorer: FileExplorerComponent,
  MediaSelector: MediaSelectorComponent,
  Timeline: TimelineComponent,
};

export default StokedUI; 
