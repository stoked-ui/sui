import * as React from 'react';
import { alpha, emphasize, styled } from "@mui/material/styles";
import {shouldForwardProp} from "@mui/system/createStyled";
import {prefix} from '../utils/deal_class_prefix';
import {parserPixelToTime} from '../utils/deal_data';
import {TimelineAction} from "../TimelineAction/TimelineAction";
import {
  fitScaleData,
  getTrackBackgroundColor,
  type ITimelineTrack,
  TimelineTrackProps
} from "./TimelineTrack.types";
import {IController} from "../Controller/Controller.types";
import {useTimeline} from "../TimelineProvider";
import { ITimelineAction } from "../TimelineAction";
import { checkProps } from "../utils";

const TimelineTrackRoot = styled('div', {
  name: 'MuiTimelineTrack',
  slot: 'Root',
  overridesResolver: (props, styles) => styles.root,
  shouldForwardProp: (prop) => shouldForwardProp(prop)
    && prop !== 'lock'
    && prop !== 'hidden'
    && prop !== 'color'
    && prop !== 'collapsed'
    && prop !== 'trackHeight'
    && prop !== 'hover'
})<{ lock?: boolean, color: string, selected?: boolean, hidden?: boolean, trackHeight: number, hover?: boolean, collapsed?: boolean}>
(({ theme, color, selected, hover, collapsed}) => {

  if (collapsed) {
    color = theme.palette.mode === 'dark' ? '#ccc' : '#444';
  }
  const trackBack = getTrackBackgroundColor(color, theme.palette.mode, selected, hover, true);

  return {
    ...trackBack.row,
    transition: 'all 0.5s ease',
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
    },]
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
  TrackType extends ITimelineTrack = ITimelineTrack,
  ActionType extends ITimelineAction = ITimelineAction,
>(props: TimelineTrackProps<ActionType, TrackType>) {
  const { settings, selectedTrack, dispatch } = useTimeline();
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
    collapsed,
  } = props;

  const classNames = ['edit-track'];
  const isTrackSelected = (isSelectedTrack: TrackType) => {
    return selectedTrack?.id === isSelectedTrack.id || collapsed;
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

  const [sizerData, setSizerData] = React.useState<{hover: boolean, down: boolean, startY: number }>({hover: false, down: false, startY: 0})

  if (!track) {
    return undefined;
  }

  if (track?.id === selectedTrack?.id || collapsed) {
    classNames.push('edit-track-selected');
  }

  return (
    <TimelineTrackRoot
      className={`${prefix(...classNames)} ${(track?.classNames || []).join(
        ' ',
      )}`}
      lock={track.lock}
      hidden={track.hidden}
      collapsed={collapsed}
      onMouseEnter={(() => {
        dispatch({ type: 'SET_SETTING', payload: { key: 'track-hover', value: track.id } })
      })}
      onMouseLeave={(() => {
        dispatch({ type: 'SET_SETTING', payload: { key: 'track-hover', value: undefined} })
      })}
      hover={settings['track-hover'] === track.id}
      selected={isTrackSelected(track)}
      color={track.id === 'newTrack' ? '#8882' : getTrackColor(track)}
      style={{...style}}
      trackHeight={settings.trackHeight}
      sx={{
        opacity: 0,
        transform: 'scaleX(100%):nth-child(3n+1)',
        transitionProperty: 'opacity, color, transform',
        transitionDuration: '1s',
        transitionTimingFunction: 'ease-in-out',
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
          track={collapsed ? props.actionTrackMap[action.id] : track}
          action={action}
        />
      })}
    </TimelineTrackRoot>
  );
};
/*

export function useFileLoadMonitor() {
  const [lastLoaded, setLastLoaded] = React.useState<number>(0);
  const { settings: initialSettings, selectedTrack, engine, dispatch } = useTimeline();
  React.useEffect(() => {

  }, [TimelineFile.lastLoadedTime])
  const { minScaleCount, maxScaleCount, startLeft, ...timelineSettings } = checkProps(initialSettings);

  React.useEffect(() => {

  }, []);

  if (!selectedTrack) {
    return undefined;
  }

  const scaleData = fitScaleData([selectedTrack], minScaleCount, maxScaleCount, startLeft, engine.duration, timelineWidth);
  const scaledSettings = {...timelineSettings, timelineWidth, ...scaleData};

  let key = 'timeline';

  if (name?.length) {
    key = `timeline-${name}`;
  }

  dispatch({ type: 'SET_SETTING', payload: { key, value: scaledSettings } });
}
*/


export function ControlledTrack({name, width, height}: {name?: string, width: number, height?: number }) {
  const { settings: initialSettings, selectedTrack, engine, dispatch,  } = useTimeline();
  const { minScaleCount, maxScaleCount, startLeft, ...timelineSettings } = checkProps(initialSettings);

  React.useEffect(() => {

  }, []);

  if (!selectedTrack) {
    return undefined;
  }

  const scaleData = fitScaleData([selectedTrack], minScaleCount, maxScaleCount, startLeft, engine.duration, width);
  const scaledSettings = {...timelineSettings, width, ...scaleData};

  let key = 'timeline';

  if (name?.length) {
    key = `timeline-${name}`;
  }

  dispatch({ type: 'SET_SETTING', payload: { key, value: scaledSettings } });

  return (
    <TimelineTrack
      {...scaledSettings}
      timelineWidth={width}
      style={{
        width: '100%',
        height: height || scaledSettings.trackHeight,
        overscrollBehavior: 'none',
        backgroundPositionX: `0, ${startLeft}px`,
        backgroundSize: `${startLeft}px, ${scaleData.scaleWidth}px`,
      }}
      track={selectedTrack}
      disableDrag
      dragLineData={{
        isMoving: false,
        assistPositions: [],
        movePositions: []
      }}
      deltaScrollLeft={() => {}}
      setScaleCount={() => {}}
      cursorTime={0}
      scrollLeft={0}
    />
  )
}
