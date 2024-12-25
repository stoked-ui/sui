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


export function DetailSettings(props: DetailViewProps) {
  const { state, dispatch } = useEditorContext();
  console.info('settings', state.settings);
  const settingsDoc = JSON.parse(JSON.stringify(state.settings));
  const flagsDoc = JSON.parse(JSON.stringify(state.flags));

  const [docs, setDocs] = React.useState<{settingsDoc: object, flagsDoc: object, componentDoc: object}>();
  React.useEffect(() => {
    setDocs({ settingsDoc: state.settings, flagsDoc: state.flags, componentDoc: state.components})
  }, []);

  return (
   <div>
      <CtrlRow>
        <CtrlCell width="95%">
          <Typography>Settings</Typography>
{/*
          <ReactJson src={docs?.settingsDoc ?? {}} />
*/}
          <pre>
            {JSON.stringify(settingsDoc, null, 2)}
          </pre>
        </CtrlCell>
      </CtrlRow>
      <CtrlRow>
        <CtrlCell width="95%">
          <Typography>Flags</Typography>
{/*
          <ReactJson src={docs?.flagsDoc ?? {}} />
*/}
        </CtrlCell>
      </CtrlRow>
     <CtrlRow>
       <CtrlCell width="95%">
         <Typography>Components</Typography>
{/*
         <ReactJson src={docs?.componentDoc ?? {}} />
*/}
       </CtrlCell>
     </CtrlRow>
   </div>
  )
}
