import * as React from 'react';
import {alpha, emphasize, styled} from "@mui/material/styles";
import {shouldForwardProp} from "@mui/system/createStyled";
import {blend} from "@mui/system";
import {CommonProps} from '../interface/common_prop';
import {prefix} from '../utils/deal_class_prefix';
import {parserPixelToTime} from '../utils/deal_data';
import {DragLineData} from '../TimelineTrackArea/TimelineTrackAreaDragLines';
import {type TimelineControlPropsBase} from "../TimelineControl/TimelineControl.types";
import TimelineAction from "../TimelineAction/TimelineAction";
import {type ITimelineTrack} from "./TimelineTrack.types";
import {IController} from "../Engine/Controller.types";

export type TimelineTrackProps = CommonProps & TimelineControlPropsBase & {
  areaRef: React.MutableRefObject<HTMLDivElement>;
  track?: ITimelineTrack;
  style?: React.CSSProperties;
  dragLineData: DragLineData;
  setEditorData: (tracks: ITimelineTrack[]) => void;
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
  const lockedBgBase = emphasize(theme.palette.background.default, 0.12);
  const lockedBg = blend(lockedBgBase, color, .3);
  return {
    borderBottom: `1px solid ${theme.palette.background.default}`,
    borderTop: `1px solid ${emphasize(theme.palette.background.default, 0.04)}`,
    display: 'flex',
    flexDirection: 'row',
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

export function getTrackControllerName(track: ITimelineTrack) {
  return track.actionRef.controllerName;
}

export function getTrackController(track: ITimelineTrack, controllers: Record<string, IController>) {
  const controllerName = getTrackControllerName(track);
  return controllers[controllerName];
}

export function getTrackColor(track: ITimelineTrack, controllers: Record<string, IController> ) {
  const trackController = getTrackController(track, controllers);
  return trackController ? alpha(trackController.color ?? '#666', 0.11) : '#00000011';
}

export function isTrackSelected(track: ITimelineTrack) {
  return track.actions.some(action => action.selected);
}

export default function TimelineTrack(props: TimelineTrackProps) {
  const {
    track,
    style = {},
    onClickRow,
    onDoubleClickRow,
    onContextMenuRow,
    areaRef,
    scrollLeft,
    startLeft,
    scale,
    controllers,
    scaleWidth,
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

  if (!track) {
    return undefined;
  }
  return (
    <TimelineTrackRoot
      className={`${prefix(...classNames)} ${(track?.classNames || []).join(
        ' ',
      )}`}
      lock={track.lock}
      hidden={track.hidden}
      selected={isTrackSelected(track)}
      color={getTrackColor(track, controllers)}
      style={style}
      onKeyDown={(e) => {
        console.info('row root', e);
      }}
      onClick={(e) => {
        if (track && onClickRow) {
          const time = handleTime(e);
          onClickRow(e, { track, time });
        }
      }}
      onDoubleClick={(e) => {
        if (track && onDoubleClickRow) {
          const time = handleTime(e);
          onDoubleClickRow(e, { track, time });
        }
      }}
      onContextMenu={(e) => {
        if (track && onContextMenuRow) {
          const time = handleTime(e);
          onContextMenuRow(e, { track, time });
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
