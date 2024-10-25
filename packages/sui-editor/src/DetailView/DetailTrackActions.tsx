import * as React from "react";
import { SelectChangeEvent } from "@mui/material/Select";
import { ITimelineAction } from "@stoked-ui/timeline";
import DesSelect from "./DesSelect";

export default function DetailTrackActions({ control, detail, editMode, setDetail, onClickEdit, size, sx }) {
  return <DesSelect
    control={control}
    label={'Action'}
    placeholder={'Select Action'}
    name={'actions'}
    disabled={!editMode}
    key={'id'}
    value={'id'}
    size={size}
    format={(action: ITimelineAction) => `${action.start} - ${action.end}`}
    onClick={onClickEdit}
    sx={sx}
    options={detail.track?.actions.map((action: ITimelineAction) => {
      return {
        value: action.id,
        label: `start: ${action.start}s; end: ${action.end}s`
      }
    })}
    onChange={(event: SelectChangeEvent, fieldOnChange: (event: SelectChangeEvent, child?: any) => void, child?: any) => {
      fieldOnChange(event, child);
      console.info('event', event, 'child', child)
      const newAction = detail.track?.actions.find((action) => action.id === child.props.value)
      if (!detail.action || (newAction && detail.action.id !== newAction.id)) {
        setDetail({...detail, action: newAction})
      }
    }}
  />
}
