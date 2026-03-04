import * as React from "react";
import Typography from "@mui/material/Typography";
import {
  CtrlCell,
  CtrlRow,
} from './Detail'
import {DetailViewProps} from "./Detail.types";
import {useEditorContext} from "../EditorProvider";


function safeStringify(obj: unknown, indent = 2): string {
  const seen = new WeakSet();
  return JSON.stringify(obj, (_key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) return '[Circular]';
      seen.add(value);
    }
    if (typeof value === 'function') return '[Function]';
    if (value instanceof HTMLElement) return `[${value.tagName}#${value.id}]`;
    return value;
  }, indent);
}

export function DetailSettings(props: DetailViewProps) {
  const { state } = useEditorContext();
  const settingsDoc = safeStringify(state.settings);
  // const flagsDoc = JSON.parse(JSON.stringify(state.flags));

  // const [docs, setDocs] = React.useState<{settingsDoc: object, flagsDoc: object, componentDoc: object}>();
  // React.useEffect(() => {
  //   setDocs({ settingsDoc: state.settings, flagsDoc: state.flags, componentDoc: state.components})
  // }, []);

  return (
   <div>
      <CtrlRow>
        <CtrlCell width="95%">
          <Typography>Settings</Typography>
{/*
          <ReactJson src={docs?.settingsDoc ?? {}} />
*/}
          <pre>
            {settingsDoc}
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
