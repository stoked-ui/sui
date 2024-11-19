import * as React from 'react';
import { alpha, emphasize, styled } from "@mui/material/styles"
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
import { useTimeline } from "../TimelineProvider";
import { ITimelineAction } from "../TimelineAction";
import { checkProps } from "../utils";
import { Box, Typography } from "@mui/material";
import TimelineTrackActions from "../TimelineLabels/TimelineTrackActions";

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
    borderBottom: `1px solid ${theme.palette.background.default}`,
    borderTop: `1px solid ${emphasize(theme.palette.background.default, 0.04)}`,
    '& .label': {
    },

    position: 'relative',
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
    }]
  }
});

const StickyLabel = styled('div')(props => ({
  position: 'absolute', /* Sticks to the viewport */
  right: 0, /* Aligns to the right edge of the viewport */
  top: '50%', /* Adjust as needed, or use `top: 0` for top-right corner */
  transform: 'translateY(-50%)', /* Vertically center the div */
  backgroundColor: 'lightblue',
  padding: '10px',
  border: '1px solid #000',
  zIndex: 1000,
}));

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

const TrackLabel = styled('label', {
  name: 'MuiTimelineAction',
  slot: 'root',
  overridesResolver: (props, styles) => styles.root,
  shouldForwardProp: (prop) => shouldForwardProp(prop) && prop !== 'color',
})<{
  hover: boolean;
  color: string;
}>(({ theme, hover }) => {

  const bgColor = alpha(theme.palette.background.default, .95);
  return {
    '& p': {
      color: theme.palette.text.primary,
      textWrap: 'none',
      whiteSpace: 'nowrap',
      position: 'sticky',
      left: 0,
    },
    padding: '3px 6px',
    display: 'flex-inline',
    width: 'min-content',
    borderRadius: '4px',
    background: bgColor,
    position: 'relative',
    margin: '8px 0px',
    alignSelf: 'center',
    overflow: 'auto',
    opacity: hover ? '1' : '0',
    marginRight: '8px',
    transition: hover ? 'opacity .4s ease-in' : 'opacity .4s 1s ease-out',
    zIndex: 200,
  }
});

export function TimelineTrackLabel({track }: {track: ITimelineTrack}) {
  const { settings, flags, components } = useTimeline();
  const labelRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (labelRef.current && components.timelineArea && components.timelineArea.clientWidth !== labelRef.current.clientWidth) {
      labelRef.current.style.width = `${components.timelineArea.clientWidth - 8}px`;
    }
  }, [components.timelineArea?.clientWidth]);

  React.useEffect(() => {
    if (labelRef?.current?.style && components.timelineArea && components.timelineArea.scrollLeft !== parseInt(labelRef.current.style.left, 10)) {
      labelRef.current.style.left = `${components.timelineArea?.scrollLeft}px`;
    }
  }, [components.timelineArea?.scrollLeft]);

  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }} ref={labelRef}>
      <TimelineTrackActions track={track} />

      <TrackLabel color={`${track?.controller?.color}`} hover={settings['track-hover'] === track.id} >
        <Typography variant="body2" color="text.primary"
                    sx={(theme) => ({
                      color: `${theme.palette.mode === 'light' ? '#000' : '#FFF'}`,
                      fontWeight: '500',
                      zIndex: 1000,
                    })}>
          {track.name}
        </Typography>

      </TrackLabel>
    </Box>
  )
}
export default function TimelineTrack<
  TrackType extends ITimelineTrack = ITimelineTrack,
  ActionType extends ITimelineAction = ITimelineAction,
>(props: TimelineTrackProps<ActionType, TrackType>) {
  const { settings, id, selectedTrack, dispatch, flags } = useTimeline();

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

  const stickyRef = React.useRef<HTMLDivElement>(null);
  const adjustStickyPosition = () => {
    console.log('adjustStickyPosition')
    if (!areaRef.current || !stickyRef.current) {
      return;
    }
    const containerRect = areaRef.current?.getBoundingClientRect();
    const stickyRect = stickyRef.current?.getBoundingClientRect();


    // Calculate the right position of the sticky element relative to the viewport
    const rightEdge = Math.min(
      containerRect.right, // Prevent sticking beyond the container's right edge
      window.innerWidth // Prevent sticking beyond the viewport
    );

    // Update the sticky element's position
    stickyRef.current.style.right = `${window.innerWidth - rightEdge}px`;

    console.log('containerRect', containerRect, 'stickyRect', stickyRect, 'rightEdge', rightEdge, 'right', window.innerWidth - rightEdge  )

    // Prevent sticky element from moving above or below the container's visible area
    if (containerRect.top > 0) {
      stickyRef.current.style.top = `${containerRect.top}px`;
    } else if (containerRect.bottom < stickyRect.height) {
      stickyRef.current.style.top = `${containerRect.bottom - stickyRect.height}px`;
    } else {
      stickyRef.current.style.top = '0px';
    }
  };

  const [started, setStarted] = React.useState<boolean>(false);
  React.useEffect(() => {
    if (!areaRef.current || !stickyRef.current || started) {
      return;
    }
    setStarted(true);
    // Adjust the position on scroll and resize
    areaRef.current.addEventListener('scroll', adjustStickyPosition);
    window.addEventListener('resize', adjustStickyPosition);
    console.info('setup sticky events');
  }, [areaRef.current, stickyRef.current])

  return (
    <React.Fragment>
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
      hover={settings['track-hover'] === track.id ? true : undefined}
      selected={isTrackSelected(track)}
      color={track.id === 'newTrack' ? '#8882' : getTrackColor(track)}
      style={{...style}}
      trackHeight={settings.timeline.trackHeight}
      sx={{
        opacity: 0,
        transform: 'scaleX(100%):nth-child(3n+1)',
        transitionProperty: 'opacity, color, transform',
        transitionDuration: '1s',
        transitionTimingFunction: 'ease-in-out',
        alignItems: 'center'
      }}

      onKeyDown={(e) => {
        console.info('row root', e);
      }}
      onClick={(e) => {
        if (track.id === 'newTrack') {
          props.onAddFiles();
          e.stopPropagation();
          return;
        }
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
      {!flags.includes('labels') && !flags.includes('isMobile') && <TimelineTrackActions track={track} />}

      <TrackSizer
        onMouseEnter={() => { setSizerData({...sizerData, hover: true }) }}
        onMouseLeave={() => { setSizerData({...sizerData, hover: false }) }} id={'test 123'}/>
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
    </React.Fragment>
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


export function ControlledTrack({ width, height }: {name?: string, width: number, height?: number }) {
  const { settings: initialSettings, selectedTrack, engine  } = useTimeline();
  const { minScaleCount, maxScaleCount, startLeft, ...timelineSettings } = checkProps(initialSettings);

  if (!selectedTrack) {
    return undefined;
  }

  const scaleData = fitScaleData([selectedTrack], minScaleCount, maxScaleCount, startLeft, engine.duration, width);
  const scaledSettings = {...timelineSettings, width, ...scaleData};

  return (
    <div style={{ position: 'relative' }}>
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
    </div>
  )
}
