import * as React from "react";
import { SelectChangeEvent } from "@mui/material/Select";
import { ITimelineTrack } from "@stoked-ui/timeline";
import { Theme } from "@mui/material/styles";
import { SxProps } from "@mui/material";
import StokedSelect from "./StokedSelect";
import { useEditorContext } from "../EditorProvider/EditorContext";
import { IEditorTrack } from "../EditorTrack/EditorTrack";

export default function DetailTracks({  disabled, size, sx, onClick }: { onClick?: (event: Event) => void, disabled?: boolean, size: 'small' | 'medium' | 'large', sx: SxProps<Theme> }) {
  const { state: {file, selectedTrack}, dispatch } = useEditorContext();
  return <StokedSelect
    label={'Track'}
    placeholder={'Select Track'}
    name={'tracks'}
    disabled={disabled}
    key={'id'}
    value={selectedTrack}

    size={'small'}
    onClick={onClick || (() => {})}
    options={file?.tracks?.map((track: ITimelineTrack) => {
      return {
        value: track,
        label: track.name
      }
    })}
    onChange={(event: SelectChangeEvent, child?: any) => {

      if ( child.props.value) {
        dispatch({ type: 'SELECT_TRACK', payload:  child.props.value as IEditorTrack});
      }
    }}
  />
}
