// Re-export types from individual declaration files
import './file-explorer.d.ts';
import './timeline.d.ts';
import './media-selector.d.ts';
import './editor-state.d.ts';

// Editor package's own types can be declared here or imported from separate files 

// Re-export the EditorState type for use in other modules
export { EditorState } from './editor-state';
