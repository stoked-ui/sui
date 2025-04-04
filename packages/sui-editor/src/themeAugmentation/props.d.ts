/**
 * @module EditorComponentsPropsList
 * @description List of props for Editor components.
 *
 * This list contains all the available props for the Editor component, including its main properties and any extended functionality from other libraries.
 */

import {EditorProps} from '../Editor';

/**
 * @interface EditorComponentsPropsList
 * @property {EditorProps<any, any>} MuiEditor - The main Editor component props.
 */
export interface EditorComponentsPropsList {
  /**
   * The main Editor component props.
   *
   * This property contains all the standard props for the Editor component.
   */
  MuiEditor: EditorProps<any, any>;
}

/**
 * @declaration
 * @extends {EditorComponentsPropsList}
 */
declare module '@mui/material/styles' {
  interface ComponentsPropsList extends EditorComponentsPropsList {}
}

// disable automatic export
export {};