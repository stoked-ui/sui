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

const TimelineTrackRoot = styled('div', {
  name: 'MuiTimelineTrack',
  slot: 'Root',
  overridesResolver: (props, styles) => styles.root,
  shouldForwardProp: (prop) =>
    shouldForwardProp(prop) &&
    prop !== 'lock' &&
    prop !== 'hidden' &&
    prop !== 'color' &&
    prop !== 'collapsed' &&
    prop !== 'trackHeight' &&
    prop !== 'hover',
})<{
  lock?: boolean;
  color: string;
  selected?: boolean;
  hidden?: boolean;
  trackHeight: number;
  hover?: boolean;
  collapsed?: boolean;
  disabled: boolean;
  dim?: boolean;
}>(({ theme, color, selected, hover, collapsed, disabled, dim }) => {
  if (collapsed) {
    color = theme.palette.mode === 'dark' ? '#ccc' : '#444';
  }
  const trackBack = getTrackBackgroundColor(color, theme.palette.mode, selected, hover, disabled, dim);

  return {
    ...trackBack.row,
    borderBottom: `1px solid ${theme.palette.background.default}`,
    borderTop: `1px solid ${emphasize(theme.palette.background.default, 0.04)}`,
    '& .label': {},
    position: 'relative',
    display: 'flex',
    flexDirection: 'row',
    cursor: 'pointer',
    boxSizing: 'border-box',
    variants: [
      {
        props: {
          hidden: true,
        },
        style: {
          opacity: '.4',
        },
      },
    ],
  };
});

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

export function getTrackColor<TrackType extends ITimelineTrack = ITimelineTrack>(track: TrackType) {
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
  const {
    settings: { trackHoverId },
    components,
  } = useTimeline();
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
            zIndex: 1000,
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
    actions: PropTypes.any.isRequired,
    classNames: PropTypes.arrayOf(PropTypes.string).isRequired,
    controller: PropTypes.any.isRequired,
    controllerName: PropTypes.string.isRequired,
    file: PropTypes.any.isRequired,
    hidden: PropTypes.bool.isRequired,
    id: PropTypes.string.isRequired,
    image: PropTypes.string.isRequired,
    lock: PropTypes.bool.isRequired,
    name: PropTypes.string.isRequired,
  }).isRequired,
} as any;

export { TimelineTrackLabel };
function TimelineTrack<
  TrackType extends ITimelineTrack = ITimelineTrack,
  ActionType extends ITimelineAction = ITimelineAction,
>(props: TimelineTrackProps<TrackType, ActionType>) {
  const context = useTimeline();
  const {
    settings: {
      scrollLeft, startLeft, scale, scaleWidth, trackHoverId, getTrackHeight, editorMode
    },
    selectedTrack,
    dispatch,
    flags,
    file
  } = context;

  const { track,
    style = {},
    onDoubleClickTrack,
    onClickTrack,
    onContextMenuTrack,
    onClickAction,
    onDoubleClickAction,
    onContextMenuAction,
    areaRef } = props;

  const index = file?.tracks?.indexOf(track);
  const trackHeight = getTrackHeight(index, context);
  const classNames = ['edit-track'];
  const isTrackSelected = (isSelectedTrack: TrackType) => {
    return selectedTrack?.id === isSelectedTrack.id || flags.collapsed;
  };
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

  const [sizerData, setSizerData] = React.useState<{
    hover: boolean;
    down: boolean;
    startY: number;
  }>({ hover: false, down: false, startY: 0 });

  if (!track) {
    return undefined;
  }

  if (track?.id === selectedTrack?.id || flags.collapsed) {
    classNames.push('edit-track-selected');
  }

  return (
    <React.Fragment>
      <TimelineTrackRoot
        className={`${prefix(...classNames)} ${(track?.classNames || []).join(' ')}`}
        lock={track.lock}
        disabled={track.disabled}
        dim={editorMode !== 'project' && selectedTrack?.id !== track.id}
        onMouseEnter={() => {
          dispatch({
            type: 'SET_SETTING',
            payload: { key: 'trackHoverId', value: track.id },
          });
        }}
        onMouseLeave={() => {
          dispatch({
            type: 'SET_SETTING',
            payload: { key: 'trackHoverId', value: undefined },
          });
        }}
        hover={trackHoverId === track.id ? true : undefined}
        selected={isTrackSelected(track)}
        color={track.id === 'newTrack' ? '#8882' : getTrackColor(track)}
        style={{ ...style }}
        trackHeight={trackHeight}
        sx={{
          opacity: 0,
          transform: 'scaleX(100%):nth-child(3n+1)',
          transitionProperty: 'opacity, color, transform',
          transitionDuration: '1s',
          transitionTimingFunction: 'ease-in-out',
          alignItems: 'center',
        }}
        onKeyDown={(e) => {
          console.info('row root', e);
        }}
        onClick={(e) => {
          dispatch({ type: 'SELECT_TRACK', payload: track });
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
            e.stopPropagation();
            e.preventDefault();
            const time = handleTime(e);
            onContextMenuTrack(e, { track, time });
          }
        }}
      >
        {flags.noLabels && !flags.isMobile && <TimelineTrackActions track={track} />}

        <TrackSizer
          onMouseEnter={() => {
            setSizerData({ ...sizerData, hover: true });
          }}
          onMouseLeave={() => {
            setSizerData({ ...sizerData, hover: false });
          }}
        />
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
    </React.Fragment>
  );
}

TimelineTrack.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  actionTrackMap: PropTypes.object.isRequired,
  areaRef: PropTypes.shape({
    current: PropTypes.object.isRequired,
  }).isRequired,
  /**
   * setUp scroll left
   */
  deltaScrollLeft: PropTypes.func.isRequired,
  dragLineData: PropTypes.shape({
    assistPositions: PropTypes.arrayOf(PropTypes.number).isRequired,
    isMoving: PropTypes.bool.isRequired,
    movePositions: PropTypes.arrayOf(PropTypes.number).isRequired,
  }).isRequired,
  /**
   * @description Get the action id list to prompt the auxiliary line. Calculate it when
   *   move/resize start. By default, get all the action ids except the current move action.
   */
  getAssistDragLineActionIds: PropTypes.func.isRequired,
  /**
   * @description Custom scale rendering
   */
  getScaleRender: PropTypes.func.isRequired,
  /**
   * @description Move end callback (return false to prevent onChange from triggering)
   */
  onActionMoveEnd: PropTypes.func.isRequired,
  /**
   * @description Start moving callback
   */
  onActionMoveStart: PropTypes.func.isRequired,
  /**
   * @description Move callback (return false to prevent movement)
   */
  onActionMoving: PropTypes.func.isRequired,
  /**
   * @description size change end callback (return false to prevent onChange from triggering)
   */
  onActionResizeEnd: PropTypes.func.isRequired,
  /**
   * @description Start changing the size callback
   */
  onActionResizeStart: PropTypes.func.isRequired,
  /**
   * @description Start size callback (return false to prevent changes)
   */
  onActionResizing: PropTypes.func.isRequired,
  onAddFiles: PropTypes.func.isRequired,
  /**
   * @description click action callback
   */
  onClickAction: PropTypes.func.isRequired,
  /**
   * @description Click action callback (not executed when drag is triggered)
   */
  onClickActionOnly: PropTypes.func.isRequired,
  /**
   * @description Click time area event, prevent setting time when returning false
   */
  onClickTimeArea: PropTypes.func.isRequired,
  /**
   * @description Click track callback
   */
  onClickTrack: PropTypes.func.isRequired,
  /**
   * @description Right-click action callback
   */
  onContextMenuAction: PropTypes.func.isRequired,
  /**
   * @description Right-click track callback
   */
  onContextMenuTrack: PropTypes.func.isRequired,
  /**
   * @description cursor drag event
   */
  onCursorDrag: PropTypes.func.isRequired,
  /**
   * @description cursor ends drag event
   */
  onCursorDragEnd: PropTypes.func.isRequired,
  /**
   * @description cursor starts drag event
   */
  onCursorDragStart: PropTypes.func.isRequired,
  /**
   * @description Double-click action callback
   */
  onDoubleClickAction: PropTypes.func.isRequired,
  /**
   * @description Double-click track callback
   */
  onDoubleClickTrack: PropTypes.func.isRequired,
  onScroll: PropTypes.func.isRequired,
  /**
   * scroll distance from left
   */
  scrollLeft: PropTypes.number.isRequired,
  /**
   * Set the number of scales
   */
  setScaleCount: PropTypes.func.isRequired,
  /**
   * @description Custom timelineControl style
   */
  style: PropTypes.object.isRequired,
  sx: PropTypes.oneOfType([
    PropTypes.arrayOf(
      PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool]).isRequired,
    ),
    PropTypes.func,
    PropTypes.object,
  ]).isRequired,
  track: PropTypes.any.isRequired,
  trackRef: PropTypes.shape({
    current: PropTypes.object.isRequired,
  }).isRequired,
  useProvider: PropTypes.func.isRequired,
} as any;

export default TimelineTrack;

function ControlledTrack({ width, height }: { name?: string; width: number; height?: number }) {
  const context = useTimeline();
  const { settings, selectedTrack } = context;
  const {
    startLeft, fitScaleData
  } = settings;

  if (!selectedTrack) {
    return undefined;
  }

  const scaleData = fitScaleData(
    [selectedTrack],
    context,
    width,
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
          overscrollBehavior: 'none',
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
  height: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  width: PropTypes.number.isRequired,
} as any;

export { ControlledTrack };
