/**
 * @stoked-ui/complete
 * 
 * This package serves as a convenient aggregator for all @stoked-ui editor-related
 * packages, making it easier to use the complete editor stack.
 */

// Re-export everything from editor (as the main functionality)
export * from '@stoked-ui/editor';
export { default } from '@stoked-ui/editor';

// Re-export from other packages with namespaces to avoid conflicts
export * as Common from '@stoked-ui/common';
export * as FileExplorer from '@stoked-ui/file-explorer';
export * as MediaSelector from '@stoked-ui/media-selector';
export * as Timeline from '@stoked-ui/timeline';

// Re-export frequently used types directly
export type { EditorState, EditorFile, EditorAction } from '@stoked-ui/editor';
export type { MediaFile, MediaType, Fit, BlendMode, IMediaFile, IAppFile } from '@stoked-ui/media-selector';
export type { FileBase, FileElement, FileExplorerProps } from '@stoked-ui/file-explorer';
export type { TimelineProps, TimelineState, IEngine, ITimelineTrack, ITimelineAction } from '@stoked-ui/timeline'; 
