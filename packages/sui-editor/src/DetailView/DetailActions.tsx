import * as React from "react";
import {SxProps} from "@mui/material";
import { SelectChangeEvent } from "@mui/material/Select";
import { ITimelineAction } from "@stoked-ui/timeline";
import { useEditorContext } from "../EditorProvider/EditorContext";
import StokedSelect from "./StokedSelect";

export default function DetailActions({ disabled, size, sx, onClick }: { onClick?: (event: MouseEvent) => void, disabled?: boolean, size: 'small' | 'medium' , sx?: SxProps }) {
  const { selectedAction, dispatch, selectedTrack } = useEditorContext();
  return <StokedSelect
    label={'Action'}
    placeholder={'Select Action'}
    name={'actions'}
    key={'id'}
    value={'id'}
    size={size}
    onClick={onClick || (() => {})}
    sx={sx}
    options={selectedTrack?.actions.map((action: ITimelineAction) => {
      return {
        value: action,
        label: `start: ${action.start}s; end: ${action.end}s`
      }
    })}
    onChange={(event: SelectChangeEvent,  child?: any) => {
      const newAction = selectedTrack?.actions.find((action) => action.id === child.props.value)
      if (newAction && (!selectedTrack || (newAction && selectedTrack.id !== newAction.id))) {
        dispatch({ type: 'SELECT_ACTION', payload: newAction})
      }
    }}
  />
}
