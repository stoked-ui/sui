/**
 * Detail Combined Component
 *
 * Displays a combined view of the selected detail, including track, action, project, and settings components.
 *
 * @returns {JSX.Element} The rendered component.
 */

import * as React from "react";
import {
  FormWrap,
  useEditMode,
} from './Detail';
import { 
  // Add type documentation for DetailCombined
  /**
   * @typedef {Object} Props
   * @property {Object} state - The current state of the editor context.
   * @property {boolean} state.selectedType - The currently selected type (track, action, project, or settings).
   * @property {Object} state.selectedDetail - The currently selected detail.
   * @property {Object} state.settings - The current settings.
   * @property {boolean} state.selected - Whether the selected type is a track.
   */
  // ...
} from "./Detail.types";
import {useEditorContext} from "../EditorProvider";
import BlendModeSelect from "./BlendModeSelect";
import {DetailTrack} from "./DetailTrack";
import {DetailAction} from "./DetailAction";
import {DetailProject} from "./DetailProject";
import {DetailSettings} from "./DetailSettings";

const seen = new WeakSet();
const replacer = (key, value) => {
  if (typeof value === 'object' && value !== null) {
    if (seen.has(value)) {
      return '[Circular]';
    }
    seen.add(value);
  }
  return value;
};

/**
 * DetailCombined Component Function
 *
 * Renders the combined view of the selected detail.
 *
 * @param {Props} props - The component props.
 * @returns {JSX.Element} The rendered component.
 */
export function DetailCombined(props) {
  /**
   * Extract state and settings from editor context.
   */
  const { state: {selectedType, selectedDetail, settings, selected} } = useEditorContext();
  
  /**
   * Initialize edit mode state.
   */
  const [editMode, setEditMode] = React.useState(false);
  
  /**
   * Enable or disable edit mode based on the current state.
   *
   * @param {boolean} enabled - Whether to enable or disable edit mode.
   */
  const enableEdit = () => {
    console.info('edit mode: enabled');
    setEditMode(true);
  }
  
  const disableEdit = () => {
    console.info('edit mode: disabled');
    setEditMode(false);
  }

  /**
   * Determine the type of detail to render based on the selected type.
   */
  const isAction = selectedType === 'action';
  const isTrack = selectedType === 'track';
  const isProject = selectedType === 'project';
  const isSettings = selectedType === 'settings';

  return (
    <React.Fragment>
      {isTrack && <DetailTrack detail={selectedDetail!} enableEdit={enableEdit} disableEdit={disableEdit} editMode={editMode} />}
      {isAction &&  <DetailAction detail={selectedDetail!} enableEdit={enableEdit} disableEdit={disableEdit} editMode={editMode} />}
      {isProject && <DetailProject detail={selectedDetail!} enableEdit={enableEdit} disableEdit={disableEdit} editMode={editMode} />}
      {isSettings && <DetailSettings detail={selectedDetail!} enableEdit={enableEdit} disableEdit={disableEdit} editMode={editMode} />}
    </React.Fragment>
  )
}

/**
 * 
 */