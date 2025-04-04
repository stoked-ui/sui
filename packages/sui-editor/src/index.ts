/**
 * Default export for the Editor component.
 * 
 * @example
 * import { Editor } from './Editor';
 */
export default Editor;

/**
 * Export of additional components and models.
 * 
 * @see {@link EditorFile}
 * @see {@link Controllers}
 * @see {@link EditorEngine}
 * @see {@link EditorView}
 * @see {@link EditorProvider}
 */
export { EditorFile, Controllers, EditorEngine, EditorView, EditorProvider };

/**
 * Export of additional components.
 * 
 * @see {@link EditorControls}
 * @see {@link models}
 * @see {@link hooks}
 */
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