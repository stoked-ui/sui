import * as React from "react";
import { SelectChangeEvent } from "@mui/material/Select";
import { ITimelineTrack } from "@stoked-ui/timeline";
import StokedSelect from "./StokedSelect";
import { useEditorContext } from "../EditorProvider/EditorContext";
import { IEditorTrack } from "../EditorTrack/EditorTrack";
import { Zettor } from "../EditorProvider/EditorProvider.types";
import { Theme } from "@mui/material/styles";
import { SxProps } from "@mui/material";

export default function DetailTracks({ tracks, editor, size, sx }: { tracks: IEditorTrack[], editor: Zettor, size: 'small' | 'medium' | 'large', sx: SxProps<Theme> }) {
  const { dispatch, detail, settings } = useEditorContext();
  return <StokedSelect
    label={'Track'}
    placeholder={'Select Track'}
    name={'tracks'}
    disabled={!editor.isTrue(settings)}
    key={'id'}
    value={'id'}

    size={'small'}
    onClick={editor.setFunc()}
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
