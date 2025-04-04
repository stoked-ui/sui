/**
 * DetailSettings Component
 *
 * Displays settings, flags and components for editing purposes.
 */

import * as React from "react";
import { lazy } from "react"
import ReactJson from "react-json-view";
import Typography from "@mui/material/Typography";
import {
  CtrlCell,
  CtrlRow,
  DetailActions,
} from './Detail'
import {DetailViewProps} from "./Detail.types";
import {useEditorContext} from "../EditorProvider";

/**
 * Props for the DetailSettings component.
 *
 * @typedef {object} DetailViewProps
 * @property {object} state - The current editor state.
 * @property {function} dispatch - The dispatch function for updating the editor state.
 */

export function DetailSettings(props: DetailViewProps) {
  /**
   * Retrieves the current editor state and dispatch function from the context.
   *
   * @type {object}
   */
  const { state, dispatch } = useEditorContext();
  
  /**
   * Parses the settings and flags from the editor state as JSON objects.
   *
   * @type {object}
   */
  const settingsDoc = JSON.parse(JSON.stringify(state.settings));
  const flagsDoc = JSON.parse(JSON.stringify(state.flags));

  /**
   * State for the component, containing the parsed JSON documents.
   *
   * @type {object}
   */
  const [docs, setDocs] = React.useState<{settingsDoc: object, flagsDoc: object, componentDoc: object}>();

  /**
   * Effect hook to update the state with the latest editor state on mount.
   */
  React.useEffect(() => {
    setDocs({ settingsDoc: state.settings, flagsDoc: state.flags, componentDoc: state.components})
  }, []);

  return (
    <div>
      <CtrlRow>
        <CtrlCell width="95%">
          <Typography>Settings</Typography>
          <pre>
            {JSON.stringify(settingsDoc, null, 2)}
          </pre>
        </CtrlCell>
      </CtrlRow>
      <CtrlRow>
        <CtrlCell width="95%">
          <Typography>Flags</Typography>
        </CtrlCell>
      </CtrlRow>
      <CtrlRow>
        <CtrlCell width="95%">
          <Typography>Components</Typography>
        </CtrlCell>
      </CtrlRow>
    </div>
  );
}