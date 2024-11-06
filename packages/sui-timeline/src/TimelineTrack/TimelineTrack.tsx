import * as React from 'react';
import {alpha, emphasize, styled} from "@mui/material/styles";
import {shouldForwardProp} from "@mui/system/createStyled";
// import {blend} from "@mui/system";
import {CommonProps} from '../interface/common_prop';
import {prefix} from '../utils/deal_class_prefix';
import {parserPixelToTime} from '../utils/deal_data';
import {DragLineData} from '../TimelineTrackArea/TimelineTrackAreaDragLines';
import {type TimelineControlPropsBase} from "../TimelineControl/TimelineControl.types";
import {TimelineAction} from "../TimelineAction/TimelineAction";
import {type ITimelineTrack} from "./TimelineTrack.types";
import {IController} from "../Controller/Controller.types";
import {useTimeline} from "../TimelineProvider";
import { ITimelineAction } from "../TimelineAction";

export type TimelineTrackProps<
  ControllerType extends IController = IController,
  ActionType extends ITimelineAction = ITimelineAction,
  TrackType extends ITimelineTrack = ITimelineTrack,
> = CommonProps & TimelineControlPropsBase<ControllerType, TrackType, ActionType> & {
  areaRef: React.MutableRefObject<HTMLDivElement>;
  track?: TrackType;
  style?: React.CSSProperties;
  dragLineData: DragLineData;
  setEditorData: (tracks: TrackType[]) => void;
  /** scroll distance from left */
  scrollLeft: number;
  /** setUp scroll left */
  deltaScrollLeft: (scrollLeft: number) => void;
};

const TimelineTrackRoot = styled('div', {
  name: 'MuiTimelineTrack',
  slot: 'Root',
  overridesResolver: (props, styles) => styles.root,
  shouldForwardProp: (prop) => shouldForwardProp(prop)
                               && prop !== 'lock'
                               && prop !== 'hidden'
                               && prop !== 'color',
})<{ hidden?: boolean, lock?: boolean, color: string, selected?: boolean}>
(({ theme, color }) => {
  const bgColor = alpha(color, theme.palette.action.focusOpacity);
  // const lockedBgBase = emphasize(theme.palette.background.default, 0.12);
  // const lockedBg = blend(lockedBgBase, color, .3);
  return {
    borderBottom: `1px solid ${theme.palette.background.default}`,
    borderTop: `1px solid ${emphasize(theme.palette.background.default, 0.04)}`,
    display: 'flex',
    flexDirection: 'row',
    cursor: 'pointer',
    boxSizing: 'border-box',
    variants: [{
      props: {
        hidden: true
      },
      style: {
        opacity: '.4'
      }
    },{
      props: {
        lock: true
      },
      style: {
        backgroundImage: `linear-gradient(to bottom, transparent 50%, #28487d 50%), linear-gradient(to right, #617ca2 50%, #28487d 50%);`,
        backgroundSize: `5px 5px, 5px 5px`,
        /* background: lockedBg,
        '& .timeline-editor-action': {
          background: emphasize(theme.palette.background.default, 0.24)
        } */
      }
    },{
      props: { selected: true},
      style: {
        background: `${alpha(color, 0.3)}`
      }
    },{
      props: { selected: false },
      style: {
        background: `${bgColor}`
      }
    }]
  }
});

const TrackSizer = styled('div', {
  name: 'MuiTimelineTrack',
  slot: 'TrackSizer'
})(({ theme }) => ({
  width: '100%',
  display: 'none',
  cursor: 'pointer',
  position: 'absolute',
  height: '3px',
  margin: '-1px',
  zIndex: 5,
  '&:hover': {
    background: theme.palette.action.active
  }
}))
export function getTrackColor<
  TrackType extends ITimelineTrack = ITimelineTrack
>(track: TrackType) {
  const trackController = track.controller;
  return trackController ? alpha(trackController.color ?? '#666', 0.11) : '#00000011';
}


export default function TimelineTrack<
  ControllerType extends IController = IController,
  TrackType extends ITimelineTrack = ITimelineTrack,
  ActionType extends ITimelineAction = ITimelineAction,
>(props: TimelineTrackProps<ControllerType, ActionType, TrackType>) {
  const { selectedTrack, file } = useTimeline();
  const {
    track,
    style = {},
    onClickTrack,
    onDoubleClickRow,
    onContextMenuTrack,
    areaRef,
    scrollLeft,
    startLeft,
    scale,
    scaleWidth,
  } = props;

  const classNames = ['edit-track'];
  const isTrackSelected = (isSelectedTrack: TrackType) => {
    return selectedTrack?.id === isSelectedTrack.id;
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

  const trackIndex = file?.tracks?.findIndex((t) => t.id === track.id);

  const [sizerData, setSizerData] = React.useState<{hover: boolean, down: boolean, startY: number }>({hover: false, down: false, startY: 0})

  if (!track) {
    return undefined;
  }

  if (track?.id === selectedTrack?.id) {
    classNames.push('edit-track-selected');
  }

  return (
    <TimelineTrackRoot
      className={`${prefix(...classNames)} ${(track?.classNames || []).join(
        ' ',
      )}`}
      lock={track.lock}
      hidden={track.hidden}
      selected={isTrackSelected(track)}
      color={track.id === 'newTrack' ? '#8882' : getTrackColor(track)}
      style={{...style}}
      sx={{
        '& .timeline-editor-edit-track': {
          opacity: 0,
          transform: 'scaleX(100%):nth-child(3n+1)',
          transitionProperty: 'opacity, transform',
          transitionDuration: '0.3s',
          transitionTimingFunction: 'cubic-bezier(0.750, -0.015, 0.565, 1.055)'
        },
        '& .MuiTimeline-loaded': {
          '& .timeline-editor-edit-track': {
            opacity: 1,
            transform: 'translateX(0)',
            transitionDelay: `calc(0.055s * var(${trackIndex})))`,
          }
        }
      }}
      onKeyDown={(e) => {
        console.info('row root', e);
      }}
      onClick={(e) => {
        if (track && onClickTrack) {
          const time = handleTime(e);
          onClickTrack(e, { track, time });
        }
      }}
      onDoubleClick={(e) => {
        if (track && onDoubleClickRow) {
          const time = handleTime(e);
          onDoubleClickRow(e, { track, time });
        }
      }}
      onContextMenu={(e) => {
        if (track && onContextMenuTrack) {
          e.stopPropagation();
          e.preventDefault();
          const time = handleTime(e);
          onContextMenuTrack(e, { track, time });
        }
      }}
    >
      <TrackSizer
        onMouseEnter={() => { setSizerData({...sizerData, hover: true }) }}
        onMouseLeave={() => { setSizerData({...sizerData, hover: false }) }}/>
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


