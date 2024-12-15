
import * as React from 'react';
import PropTypes from 'prop-types';
import { alpha, emphasize, styled } from '@mui/material/styles';
import { shouldForwardProp } from '@mui/system/createStyled';
import { Box, Typography } from '@mui/material';
import { prefix } from '../utils/deal_class_prefix';
import { parserPixelToTime } from '../utils/deal_data';
import { TimelineAction } from '../TimelineAction/TimelineAction';
import {
  getTrackBackgroundColor,
  type ITimelineTrack,
  TimelineTrackProps,
} from './TimelineTrack.types';
import { useTimeline } from '../TimelineProvider';
import { ITimelineAction } from '../TimelineAction';
import TimelineTrackActions from '../TimelineLabels/TimelineTrackActions';
import TimelineFile from "../TimelineFile";

/*
 shrinkScale,
 growScale,
 growUnselectedScale,
 trackHeight
 */

const TimelineTrackRoot = styled('div', {
  name: 'MuiTimelineTrack',
  slot: 'Root',
  overridesResolver: (props, styles) => styles.root,
  shouldForwardProp: (prop) =>
    shouldForwardProp(prop) &&
    prop !== 'muted' &&
    prop !== 'locked' &&
    prop !== 'hidden' &&
    prop !== 'color' &&
    prop !== 'collapsed' &&
    prop !== 'trackHeight' &&
    prop !== 'yPercent' &&
    prop !== 'dim' &&
    prop !== 'shrinkScale' &&
    prop !== 'growScale' &&
    prop !== 'growUnselectedScale' &&
    prop !== 'trackHeight' &&
    prop !== 'growContainerScale' &&
    prop !== 'hover',
})<{
  locked?: boolean;
  color: string;
  selected?: boolean;
  muted?: boolean;
  trackHeight: number;
  hover?: boolean;
  collapsed?: boolean;
  disabled: boolean;
  dim?: boolean;
  yPercent?: number;
  shrinkScale: number;
  growScale: number;
  growUnselectedScale: number;
  growContainerScale: number;
}>(({ theme,
  color,
  selected,
  hover,
  collapsed,
  disabled,
  dim,
  yPercent,
  trackHeight,
  shrinkScale,
  growScale,
  growUnselectedScale,
  growContainerScale
}) => {
  if (collapsed) {
    color = theme.palette.mode === 'dark' ? '#ccc' : '#444';
  }
  const trackBack = getTrackBackgroundColor(color, theme.palette.mode, selected, hover, disabled, dim);
  return {
    borderBottom: `1px solid ${theme.palette.background.default}`,
    borderTop: `1px solid ${emphasize(theme.palette.background.default, 0.04)}`,
    position: 'relative',
    height: `${trackHeight}px`,
    display: 'flex',
    flexDirection: 'row',
    cursor: 'pointer',
    boxSizing: 'border-box',
    transformOrigin: `50% ${yPercent}%!important`,
    transition: `all .5s ease-in-out,width .2 ease-in-out!important`,
    '& *': {
      transformOrigin: `50% ${yPercent}%!important`,
      transition: `all .5s ease-in-out, width .2 ease-in-out!important`,
    },
    ...trackBack.row,

    // DETAIL
    '&.timeline-detail': {

      // TRACK UNSELECTED
      '&.timeline-track': {
        height: `${growUnselectedScale}px!important`,

        // ACTION UNSELECTED
        '& .timeline-action': {
          height: `${growUnselectedScale}px!important`,

          // ACTION LEFT / RIGHT AFFORDANCES
          '& .timeline-action-left-stretch, .timeline-action-right-stretch, .timeline-action-left-stretch::after, .timeline-action-right-stretch::after': {
            height: `${growUnselectedScale}px!important`,
          }
        },
      },

      // TRACK SELECTED
      '&.timeline-track-selected': {
        height: `${growScale}px!important`,

        // ACTION UNSELECTED
        '& .timeline-action': {
          height: `${growScale - 16}px!important`,
          marginTop: '7px!important',
          // ACTION LEFT / RIGHT AFFORDANCES
          '& .timeline-action-left-stretch, .timeline-action-right-stretch, .timeline-action-left-stretch::after, .timeline-action-right-stretch::after': {
            height: `${growScale - 16}px!important`,
          }
        },

        // ACTION SELECTED
        '& .timeline-action.timeline-action-selected': {
          height: `${growScale}px!important`,
          marginTop: '0px!important',
          // ACTION LEFT / RIGHT AFFORDANCES
          '& .timeline-action-left-stretch, .timeline-action-right-stretch, .timeline-action-left-stretch::after, .timeline-action-right-stretch::after': {
            height: `${growScale}px!important`,
          }
        },
      },
    },

    // NORMAL
    '& .timeline-action-selected': {
      height: `${trackHeight}px!important`,
      '& .timeline-action-left-stretch, .timeline-action-right-stretch, .timeline-action-left-stretch::after, .timeline-action-right-stretch::after': {
        height: `${trackHeight}px!important`,
      }
    },
    '& .timeline-action': {
      height: `${shrinkScale}px!important`,
      '& .timeline-action-left-stretch, .timeline-action-right-stretch, .timeline-action-left-stretch::after, .timeline-action-right-stretch::after': {
        height: `${shrinkScale}px!important`,
      },
    },
    '&.timeline-track': {
      height: `${trackHeight}px!important`,
    },
    variants: [
      {
        props: {
          muted: true,
        },
        style: {
          opacity: '.4',
        },
      },
    ],
  };
});
/*
TODO: potentially can use this for drag indicators to rearrange track orders.. not right meow though
const TrackSizer = styled('div', {
  name: 'MuiTimelineTrack',
  slot: 'TrackSizer',
})(({ theme }) => ({
  width: '100%',
  display: 'none',
  cursor: 'pointer',
  position: 'absolute',
  height: '3px',
  margin: '-1px',
  zIndex: 5,
  '&:hover': {
    background: theme.palette.action.active,
  },
}));
*/

const TrackLabel = styled('label', {
  name: 'MuiTimelineAction',
  slot: 'root',
  overridesResolver: (props, styles) => styles.root,
  shouldForwardProp: (prop) => shouldForwardProp(prop) && prop !== 'color',
})<{
  hover: boolean;
  color: string;
}>(({ theme, hover }) => {
  const bgColor = alpha(theme.palette.background.default, 0.95);
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
  };
});

function TimelineTrackLabel({ track }: { track: ITimelineTrack }) {

  const {state: {settings: { trackHoverId }, components}} = useTimeline();

  const timelineArea = components.timelineArea as HTMLElement;
  const labelRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (
      labelRef.current &&
      timelineArea &&
      timelineArea.clientWidth !== labelRef.current.clientWidth
    ) {
      labelRef.current.style.width = `${timelineArea.clientWidth - 8}px`;
    }
  }, [timelineArea?.clientWidth]);

  React.useEffect(() => {
    if (
      labelRef?.current?.style &&
      timelineArea &&
      timelineArea.scrollLeft !== parseInt(labelRef.current.style.left, 10)
    ) {
      labelRef.current.style.left = `${timelineArea?.scrollLeft}px`;
    }
  }, [timelineArea?.scrollLeft]);

  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
      ref={labelRef}
    >
      <TimelineTrackActions track={track} />
      <TrackLabel color={`${track?.controller?.color}`} hover={trackHoverId === track.id}>
        <Typography
          variant="body2"
          color="text.primary"
          sx={(theme) => ({
            color: `${theme.palette.mode === 'light' ? '#000' : '#FFF'}`,
            fontWeight: '500',
            zIndex: 250,
          })}
        >
          {track.name}
        </Typography>
      </TrackLabel>
    </Box>
  );
}

TimelineTrackLabel.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  track: PropTypes.shape({
    actions: PropTypes.any,
    classNames: PropTypes.arrayOf(PropTypes.string),
    controller: PropTypes.any,
    controllerName: PropTypes.string,
    file: PropTypes.any,
    hidden: PropTypes.bool,
    id: PropTypes.string,
    image: PropTypes.string,
    locked: PropTypes.bool,
    name: PropTypes.string,
  }),
} as any;


export { TimelineTrackLabel };
function TimelineTrack<
  TrackType extends ITimelineTrack = ITimelineTrack,
  ActionType extends ITimelineAction = ITimelineAction,
>(props: TimelineTrackProps<TrackType, ActionType>) {
  const { state: context, dispatch } = useTimeline();
  const ref = React.useRef<HTMLDivElement>(null);
  const {
    settings,
    selectedTrack,
    flags,
    file
  } = context;
  const  { scrollLeft, startLeft, scale, scaleWidth, trackHoverId, trackHeight } = settings;

  const { track,
    style = {},
    onDoubleClickTrack,
    onClickTrack,
    onContextMenuTrack,
    onClickAction,
    onDoubleClickAction,
    onContextMenuAction,
    areaRef } = props;

  const getIndex = (getIndexTrack: ITimelineTrack) => file?.tracks?.findIndex((fileTrack) => fileTrack.id === getIndexTrack.id);
  const index = getIndex(track);
  const classNames = ['track'];
  const handleTime = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (!areaRef.current) {
      return undefined;
    }
    const rect = areaRef.current.getBoundingClientRect();
    const position = e.clientX - rect.x;
    const left = position + scrollLeft;
    return parserPixelToTime(left, { startLeft, scale, scaleWidth });
  };
  const selected = index === context.settings.selectedTrackIndex;


  if (!track) {
    return undefined;
  }

  if (flags.detailMode) {
    classNames.push('detail')
  }
  if (track?.id === selectedTrack?.id || flags.collapsed) {
    classNames.push('track-selected');
  }

  const calculatePercentage = (totalIndexes: number, currentIndex: number) => {
    if (currentIndex < 0 || currentIndex >= totalIndexes) {
      console.info('Invalid index', currentIndex, totalIndexes, track);
    }
    if (totalIndexes <= 1) {
      return 50;
    }
    return (currentIndex / (totalIndexes - 1)) * 100;
  }

  const detailDisable = flags.detailMode && (!selectedTrack || selectedTrack.id !== track.id);
  return (
    <TimelineTrackRoot
      ref={ref}
      className={`${prefix(...classNames)} ${(track?.classNames || []).join(' ')}`}
      locked={track.locked}
      yPercent={calculatePercentage(file?.tracks?.length, index)}
      disabled={track.disabled || detailDisable}
      dim={!!track.dim}
      onMouseEnter={(event) => {
        dispatch({
          type: 'SET_SETTING',
          payload: { key: 'trackHoverId', value: track.id },
        });
        event.stopPropagation()
      }}
      onMouseLeave={(event) => {
        dispatch({
          type: 'SET_SETTING',
          payload: { key: 'trackHoverId', value: undefined },
        });
        event.stopPropagation()
      }}
      hover={trackHoverId === track.id ? true : undefined}
      selected={selected}
      color={TimelineFile.getTrackColor(track)}
      style={{ ...style }}
      trackHeight={settings.trackHeight}
      growScale={settings.growScale}
      growUnselectedScale={settings.growUnselectedScale}
      growContainerScale={settings.growContainerScale}
      shrinkScale={settings.shrinkScale}
      sx={{
        opacity: 0,
        transform: 'scaleX(100%):nth-child(3n+1)',
        transitionProperty: 'opacity, color, transform',
        transitionDuration: '1s',
        transitionTimingFunction: 'ease-in-out',
        alignItems: 'center',
      }}
      onKeyDown={(e) => {
      }}
      onClick={(e) => {
        if (track.id !== 'newTrack') {
          dispatch({type: 'SELECT_TRACK', payload: track});
        } else {
          props.onAddFiles();
        }
        if (track && onClickTrack) {
          e.stopPropagation();
          e.preventDefault();
          const time = handleTime(e);
          onClickTrack(e, {track, time});
        }
      }}
      onDoubleClick={(e) => {
        if (track && onDoubleClickTrack) {
          e.stopPropagation();
          e.preventDefault();
          const time = handleTime(e);
          onDoubleClickTrack(e, { track, time });
        }
      }}
      onContextMenu={(e) => {
        if (track && onContextMenuTrack) {
          // e.stopPropagation();
          // e.preventDefault();
          // const time = handleTime(e);
          // onContextMenuTrack(e, { track, time });
        }
      }}
    >
      {flags.noLabels && !flags.isMobile && <TimelineTrackActions track={track} />}

      {/*
      TODO: potentially can use this for drag indicators to rearrange track orders.. not right meow though
      <TrackSizer
        onMouseEnter={() => {
          setSizerData({ ...sizerData, hover: true });
        }}
        onMouseLeave={() => {
          setSizerData({ ...sizerData, hover: false });
        }}
      /> */}
      {(track?.actions || []).map((action) => {
        return (
          <TimelineAction
            key={action.id}
            {...props}
            handleTime={handleTime}
            track={flags.collapsed ? props.actionTrackMap[action.id] : track}
            action={action}
            onClickAction={onClickAction}
            onDoubleClickAction={onDoubleClickAction}
            oncontextMenuAction={onContextMenuAction}
          />
        );
      })}
    </TimelineTrackRoot>
  );
}

TimelineTrack.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  actionTrackMap: PropTypes.object,
  areaRef: PropTypes.shape({
    current: PropTypes.object,
  }),
  /**
   * setUp scroll left
   */
  deltaScrollLeft: PropTypes.func,
  dragLineData: PropTypes.shape({
    assistPositions: PropTypes.arrayOf(PropTypes.number),
    isMoving: PropTypes.bool,
    movePositions: PropTypes.arrayOf(PropTypes.number),
  }),
  /**
   * @description Get the action id list to prompt the auxiliary line. Calculate it when
   *   move/resize start. By default, get all the action ids except the current move action.
   */
  getAssistDragLineActionIds: PropTypes.func,
  /**
   * @description Custom scale rendering
   */
  getScaleRender: PropTypes.func,
  /**
   * @description Move end callback (return false to prevent onChange from triggering)
   */
  onActionMoveEnd: PropTypes.func,
  /**
   * @description Start moving callback
   */
  onActionMoveStart: PropTypes.func,
  /**
   * @description Move callback (return false to prevent movement)
   */
  onActionMoving: PropTypes.func,
  /**
   * @description size change end callback (return false to prevent onChange from triggering)
   */
  onActionResizeEnd: PropTypes.func,
  /**
   * @description Start changing the size callback
   */
  onActionResizeStart: PropTypes.func,
  /**
   * @description Start size callback (return false to prevent changes)
   */
  onActionResizing: PropTypes.func,
  onAddFiles: PropTypes.func,
  /**
   * @description click action callback
   */
  onClickAction: PropTypes.func,
  /**
   * @description Click action callback (not executed when drag is triggered)
   */
  onClickActionOnly: PropTypes.func,
  /**
   * @description Click time area event, prevent setting time when returning false
   */
  onClickTimeArea: PropTypes.func,
  /**
   * @description Click track callback
   */
  onClickTrack: PropTypes.func,
  /**
   * @description Right-click action callback
   */
  onContextMenuAction: PropTypes.func,
  /**
   * @description Right-click track callback
   */
  onContextMenuTrack: PropTypes.func,
  /**
   * @description cursor drag event
   */
  onCursorDrag: PropTypes.func,
  /**
   * @description cursor ends drag event
   */
  onCursorDragEnd: PropTypes.func,
  /**
   * @description cursor starts drag event
   */
  onCursorDragStart: PropTypes.func,
  /**
   * @description Double-click action callback
   */
  onDoubleClickAction: PropTypes.func,
  /**
   * @description Double-click track callback
   */
  onDoubleClickTrack: PropTypes.func,
  onScroll: PropTypes.func,
  /**
   * scroll distance from left
   */
  scrollLeft: PropTypes.number,
  /**
   * Set the number of scales
   */
  setScaleCount: PropTypes.func,
  /**
   * @description Custom timelineControl style
   */
  style: PropTypes.object,
  sx: PropTypes.oneOfType([
    PropTypes.arrayOf(
      PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool]),
    ),
    PropTypes.func,
    PropTypes.object,
  ]),
  track: PropTypes.any,
  trackRef: PropTypes.shape({
    current: PropTypes.object,
  }),
} as any;

export default TimelineTrack;

function ControlledTrack({ width, height }: { name?: string; width: number; height?: number }) {
  const context = useTimeline();
  const { state } = context;
  const {settings, selectedTrack } = state;
  const {
    startLeft, fitScaleData
  } = settings;

  if (!selectedTrack) {
    return undefined;
  }

  const scaleData = fitScaleData(
    context,
    false,
    width,
    'timelineTrackControlled'
  );
  const scaledSettings = { ...settings, width, ...scaleData };

  return (
    <div style={{ position: 'relative' }}>
      <TimelineTrack
        {...scaledSettings}
        timelineWidth={width}
        style={{
          width: '100%',
          height: height || scaledSettings.trackHeight,
          overscrollBehaviorX: 'none',
          backgroundPositionX: `0, ${startLeft}px`,
          backgroundSize: `${startLeft}px, ${scaleData.scaleWidth}px`,
        }}
        track={selectedTrack}
        disableDrag
        dragLineData={{
          isMoving: false,
          assistPositions: [],
          movePositions: [],
        }}
        deltaScrollLeft={() => {}}
        setScaleCount={() => {}}
        cursorTime={0}
        scrollLeft={0}
      />
    </div>
  );
}

ControlledTrack.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  height: PropTypes.number,
  name: PropTypes.string,
  width: PropTypes.number,
} as any;

export { ControlledTrack };
