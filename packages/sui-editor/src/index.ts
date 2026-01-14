import Editor from './Editor';
import Controllers from './Controllers';
import EditorEngine from './EditorEngine';
import EditorView from './EditorView';
import EditorProvider from './EditorProvider';
import EditorFile, { IEditorFileProps } from './EditorFile';
import EditorExample from './EditorFile/EditorFile.example';

export default Editor;
export { Editor, EditorFile, Controllers, EditorEngine, EditorView, EditorProvider };
export * from './EditorFile';
export * from './EditorProvider';
export * from './EditorView';
export * from './Editor';
export * from './EditorControls';
export * from './models';
export * from './hooks';
export * from './Controllers';
export * from './EditorAction';
export * from './EditorTrack';

// Helper function for creating EditorFile instances
export function createEditorFile(props: IEditorFileProps) {
  return new EditorFile(props);
}

// Export example video editor props for demos
export const EditorVideoExampleProps: IEditorFileProps = {
  id: 'stoked-ui-editor-project-example',
  name: 'Stoked UI - Multiverse',
  description: 'demonstrate the @stoked-ui/editor features',
  author: 'Brian Stoker',
  created: 1729783494563,
  version: 1,
};

// Export the full example instance
export { EditorExample };
