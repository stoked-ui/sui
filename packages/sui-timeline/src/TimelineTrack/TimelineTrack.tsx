import * as React from 'react';
import { styled } from "@mui/material/styles";
import { prefix } from '../utils/deal_class_prefix';
import { parserPixelToTime } from '../utils/deal_data';
import TimelineAction from "../TimelineAction/TimelineAction";
import {TimelineTrackProps} from "./TimelineTrack.types";

const TimelineTrackRoot = styled('div', {
  name: 'MuiTimelineTrack',
  slot: 'Root'
})(({ theme }) => ({
  backgroundRepeat: 'no-repeat, repeat',
  backgroundImage: `linear-gradient(#0000, #0000), linear-gradient(90deg, ${theme.palette.action.selected} 1px, transparent 0)`,
  display: 'flex',
  flexDirection: 'row',
  boxSizing: 'border-box',
  height: '32px',
}));

export default function TimelineTrack(props: TimelineTrackProps) {
  const {
    track,
    style = {},
    onClickRow,
    onDoubleClickRow,
    onContextMenuRow,
    areaRef,
    scale,
    scaleWidth,
    scrollLeft,
    startLeft,
  } = props;

  const classNames = ['edit-track'];
  if (track?.selected) {
    classNames.push('edit-track-selected');
  }

  const handleTime = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (!areaRef.current) {
      return undefined;
    }
    const rect = areaRef.current.getBoundingClientRect();
    const position = e.clientX - rect.x;
    const left = position + scrollLeft;
    const time = parserPixelToTime(left, { startLeft, scale, scaleWidth });
    return time;
  };

  return (
    <TimelineTrackRoot
      className={`${prefix(...classNames)} ${(track?.classNames || []).join(
        ' ',
      )}`}
      style={style}
      onKeyDown={(e) => {
        console.log('row root', e);
      }}
      onClick={(e) => {
        if (track && onClickRow) {
          const time = handleTime(e);
          onClickRow(e, { track: track, time });
        }
      }}
      onDoubleClick={(e) => {
        if (track && onDoubleClickRow) {
          const time = handleTime(e);
          onDoubleClickRow(e, { track: track, time });
        }
      }}
      onContextMenu={(e) => {
        if (track && onContextMenuRow) {
          const time = handleTime(e);
          onContextMenuRow(e, { track: track, time });
        }
      }}
    >
      {(track?.actions || []).map((action) => {
        return <TimelineAction
          key={action.id}
          {...props}
          handleTime={handleTime}
          track={track}
          action={action}
        />
      })}
    </TimelineTrackRoot>
  );
};
