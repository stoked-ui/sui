import * as React from "react";
import { SelectChangeEvent } from "@mui/material/Select";
import { ITimelineTrack } from "@stoked-ui/timeline";
import { Theme } from "@mui/material/styles";
import { SxProps } from "@mui/material";
import StokedSelect from "./StokedSelect";
import { useEditorContext } from "../EditorProvider/EditorContext";
import { IEditorTrack } from "../EditorTrack/EditorTrack";
import { useDetail } from "./DetailProvider";

export default function DetailTracks({ tracks, disabled, size, sx, onClick }: { onClick?: (event: Event) => void, tracks: IEditorTrack[], disabled?: boolean, size: 'small' | 'medium' | 'large', sx: SxProps<Theme> }) {
  const { dispatch } = useDetail();
  return <StokedSelect
    label={'Track'}
    placeholder={'Select Track'}
    name={'tracks'}
    disabled={disabled}
    key={'id'}
    value={'id'}

    size={'small'}
    onClick={onClick || (() => {})}
    options={tracks?.map((track: ITimelineTrack) => {
      return {
        value: track.id,
        label: track.name
      }
    })}
    onChange={(event: SelectChangeEvent, child?: any) => {
      const newTrack = tracks.find((track: ITimelineTrack) => track.id === child.props.value);
      if (newTrack) {
        dispatch({ type: 'SELECT_TRACK', payload: newTrack });
      }
    }}
  />
}
