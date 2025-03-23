import * as React from 'react';
import PropTypes from 'prop-types';
import { alpha, styled } from '@mui/material/styles';
import { shouldForwardProp } from '@mui/system/createStyled';
import { Box, Typography } from '@mui/material';
import { VariableSizeList, ListChildComponentProps } from 'react-window';
import { useResizeDetector } from 'react-resize-detector';
import { prefix } from '../utils/deal_class_prefix';
import { parserTimeToPixel } from '../utils/deal_data';
import TimelineTrack from '../TimelineTrack/TimelineTrack';
import { TimelineTrackAreaProps } from './TimelineTrackArea.types';
import { useDragLine } from './useDragLine';
import { RemoveTrackCommand } from '../TimelineFile/Commands/RemoveTrackCommand';
import { useTimeline } from '../TimelineProvider';
import { EngineState, PlaybackMode } from '../Engine';
import { ITimelineAction, ITimelineActionHandlers } from '../TimelineAction';
import { ITimelineTrack } from '../TimelineTrack';
import ZoomControls from './ZoomControls';

/** edit area ref data */
export interface TimelineTrackAreaState {
  domRef: React.MutableRefObject<HTMLDivElement>;
  tracksRef: React.MutableRefObject<HTMLDivElement>;
}

const TimelineTrackAreaRoot = styled('div')(() => ({
  flex: '1 1 auto',
  overflow: 'hidden',
  position: 'relative',
  minHeight: 'fit-content',
  touchAction: 'none', // Necessary for custom gestures
  '& #timeline-grid::before': {
    content: "''",
    display: 'block',
    position: 'absolute',
    height: '100%',
    width: '101%',
    top: 0,
    zIndex: -1,
  },
  '& .timeline-list': {
    outline: 'none !important',
    overflow: 'overlay !important',
  },
}));

const TrackLabel = styled('label', {
  name: 'MuiTimelineAction',
  slot: 'root',
  overridesResolver: (props, styles) => styles.root,
  shouldForwardProp: (prop) => shouldForwardProp(prop) && prop !== 'hover' && prop !== 'color',
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
    position: 'absolute',
    display: 'flex-inline',
    width: 'min-content',
    whiteSpace: 'nowrap',
    borderRadius: '4px',
    background: bgColor,
    alignSelf: 'center',
    right: 0,
    overflow: 'auto',
    opacity: hover ? '1' : '0',
    marginRight: '8px',
    transition: hover ? 'opacity .2s ease-in' : 'opacity .2s .7s ease-out',
    zIndex: 200,
  };
});

const FloatingTracksRoot = styled('div', {
  shouldForwardProp: (prop) => shouldForwardProp(prop) && prop !== 'hover',
})(() => ({
  position: 'absolute',
  width: '100%',
  height: '100%',
  justifyItems: 'end',
  paddingTop: '37px',
}));

function FloatingTrackLabels({ tracks }) {
  const { state, dispatch } = useTimeline();
  const { settings, flags } = state;
  const { trackHoverId, selectedTrack, editorMode, trackHeight, selectedTrackIndex } = settings;
  if (!flags.noLabels) {
    return undefined;
  }
  const editorModeHidden = editorMode === 'track' || editorMode === 'action';
  const isSelected = (index: number) => selectedTrackIndex === index;
  const selectedHeight =
    flags.detailMode && selectedTrackIndex !== -1 ? settings.growScale : trackHeight;
  const unselectedHeight =
    flags.detailMode && selectedTrackIndex !== -1 ? settings.growUnselectedScale : trackHeight;
  const getHeight = (index: number) => (isSelected(index) ? selectedHeight : unselectedHeight);
  return (
    <FloatingTracksRoot id={'floating-track-labels'}>
      {tracks.map((track: ITimelineTrack, index: number) => (
        <Box
          sx={{
            height: getHeight(index),
            display: 'flex',
            background:
              editorModeHidden && selectedTrack?.id !== track.id ? 'transparent' : undefined,
            transition: 'all 1s ease-in-out',
          }}
          key={`${track.name}-${index}`}
          onMouseEnter={(event) => {
            dispatch({
              type: 'SET_SETTING',
              payload: { key: 'trackHoverId', value: track.id },
            });
            event.stopPropagation();
          }}
          onMouseLeave={(event) => {
            dispatch({
              type: 'SET_SETTING',
              payload: { key: 'trackHoverId', value: undefined },
            });
            event.stopPropagation();
          }}
        >
          <TrackLabel
            color={track.controller?.color}
            hover={trackHoverId === track.id ? true : undefined}
            sx={{
              display: 'flex',
              alignItems: 'center',
              height: `${isSelected(index) ? trackHeight : trackHeight - 10}px`,
              background:
                editorModeHidden && selectedTrack?.id !== track.id ? 'transparent' : undefined,
              transition: 'all 1s ease-in-out',
            }}
          >
            <Typography variant="button" color="text.secondary">
              {track.name}
            </Typography>
          </TrackLabel>
        </Box>
      ))}
    </FloatingTracksRoot>
  );
}

const TimelineTrackArea = React.forwardRef<TimelineTrackAreaState, TimelineTrackAreaProps>(
  (props, ref) => {
    const { state, dispatch } = useTimeline();
    const { file, getState, settings, flags, engine } = state;
    const {
      scaleCount,
      scaleWidth,
      startLeft,
      scrollLeft,
      scrollTop,
      scale,
      cursorTime,
      selectedTrackIndex,
      getTrackHeight,
      setScaleWidth,
    } = settings;

    const tracks = file?.tracks || [];
    const { dragLine } = flags;
    const {
      onScroll,
      getAssistDragLineActionIds,
      onActionMoveEnd,
      onActionMoveStart,
      onActionMoving,
      onActionResizeEnd,
      onActionResizeStart,
      onActionResizing,
      onClickTrack,
      onDoubleClickTrack,
      onContextMenuTrack,
      onClickAction,
      onDoubleClickAction,
      onContextMenuAction,
    } = props;
    const {
      dragLineData,
      initDragLine,
      updateDragLine,
      disposeDragLine,
      defaultGetAssistPosition,
      defaultGetMovePosition,
    } = useDragLine();
    const editAreaRef = React.useRef<HTMLDivElement>();
    const listRef = React.useRef<VariableSizeList>();
    const tracksElementRef = React.useRef<HTMLDivElement>();
    const heightRef = React.useRef(-1);
    
    // Use resize detector instead of AutoSizer
    const { width = 0, height = 0, ref: resizeRef } = useResizeDetector({
      refreshMode: 'debounce',
      refreshRate: 100,
    });

    // ref data
    React.useImperativeHandle(ref, () => ({
      get domRef() {
        return editAreaRef;
      },
      get tracksRef() {
        return tracksElementRef;
      },
    }));

    const handleInitDragLine: ITimelineActionHandlers['onActionMoveStart'] = (data) => {
      if (dragLine) {
        const assistActionIds =
          getAssistDragLineActionIds &&
          getAssistDragLineActionIds({
            action: data.action,
            track: data.track,
            tracks,
          });
        const cursorLeft = parserTimeToPixel(cursorTime, { scaleWidth, scale, startLeft });
        const assistPositions = defaultGetAssistPosition({
          tracks,
          assistActionIds,
          action: data.action,
          track: data.track,
          cursorLeft,
        });
        initDragLine({ assistPositions });
      }
    };

    const handleUpdateDragLine: ITimelineActionHandlers['onActionMoving'] = (data) => {
      if (dragLine) {
        const movePositions = defaultGetMovePosition({
          ...data,
        });
        updateDragLine({ movePositions });
      }
    };

    React.useEffect(() => {
      if (editAreaRef.current) {
        dispatch({
          type: 'SET_COMPONENT',
          payload: { key: 'timelineArea', value: editAreaRef.current as HTMLDivElement },
        });
      }
    }, [editAreaRef.current]);

    // Item renderer for VariableSizeList
    const Row = React.useCallback(
      ({ index, style }: ListChildComponentProps) => {
        const gridTrack = tracks[index]; // track data
        const className = index === selectedTrackIndex ? 'selected' : '';
        return (
          <TimelineTrack
            {...props}
            style={{
              ...style,
              backgroundPositionX: `0, ${startLeft}px`,
              backgroundSize: `${startLeft}px, ${scaleWidth}px`,
            }}
            onKeyDown={(event: any) => {
              console.info('test', event);
              event.currentTarget = gridTrack;
              // eslint-disable-next-line default-case
              switch (event.key) {
                case 'Backspace':
                case 'Delete': {
                  const command = new RemoveTrackCommand(file, gridTrack.id);
                  dispatch({ type: 'EXECUTE_COMMAND', payload: command });

                  event.preventDefault();
                  break;
                }
              }
            }}
            className={className}
            areaRef={editAreaRef}
            scrollLeft={scrollLeft}
            track={gridTrack}
            dragLineData={dragLineData}
            onAddFiles={props.onAddFiles}
            onActionMoveStart={(data: {
              action: ITimelineAction;
              track: ITimelineTrack<ITimelineAction>;
            }) => {
              handleInitDragLine(data);
              return onActionMoveStart && onActionMoveStart(data);
            }}
            onActionResizeStart={(data: {
              action: ITimelineAction;
              track: ITimelineTrack<ITimelineAction>;
              dir: 'left' | 'right';
            }) => {
              handleInitDragLine(data);
              return onActionResizeStart && onActionResizeStart(data);
            }}
            onActionMoving={(data: {
              action: ITimelineAction;
              track: ITimelineTrack<ITimelineAction>;
              start: number;
              end: number;
            }) => {
              handleUpdateDragLine(data);
              return onActionMoving && onActionMoving(data);
            }}
            onActionResizing={(data: {
              action: ITimelineAction;
              track: ITimelineTrack<ITimelineAction>;
              start: number;
              end: number;
              dir: 'left' | 'right';
            }) => {
              handleUpdateDragLine(data);
              return onActionResizing && onActionResizing(data);
            }}
            onActionResizeEnd={(data: {
              action: ITimelineAction;
              track: ITimelineTrack<ITimelineAction>;
              start: number;
              end: number;
              dir: 'left' | 'right';
            }) => {
              disposeDragLine();
              return onActionResizeEnd && onActionResizeEnd(data);
            }}
            onActionMoveEnd={(data: {
              action: ITimelineAction;
              track: ITimelineTrack<ITimelineAction>;
              start: number;
              end: number;
            }) => {
              disposeDragLine();
              return onActionMoveEnd && onActionMoveEnd(data);
            }}
            onClickTrack={onClickTrack}
            onDoubleClickTrack={onDoubleClickTrack}
            onContextMenuTrack={onContextMenuTrack}
            onClickAction={onClickAction}
            onDoubleClickAction={onDoubleClickAction}
            oncontextMenuAction={onContextMenuAction}
          />
        );
      },
      [tracks, selectedTrackIndex, scrollLeft, dragLineData, startLeft, scaleWidth]
    );

    // Get item height for VariableSizeList
    const getItemHeight = React.useCallback((index) => {
      return getTrackHeight(tracks[index], state);
    }, [getTrackHeight, tracks, state]);

    // Sync scroll position
    React.useEffect(() => {
      if (listRef.current) {
        // Scroll to position when scrollTop or scrollLeft changes
        listRef.current.scrollTo(scrollTop);
      }
    }, [scrollTop]);

    // Recompute sizes when tracks change
    React.useEffect(() => {
      if (listRef.current && tracks.length > 0) {
        listRef.current.resetAfterIndex(0);
      }
    }, [tracks]);

    if (getState() === EngineState.LOADING) {
      return undefined;
    }

    // Calculate total height
    let totalHeight = 0;
    tracks?.forEach((track, index) => {
      totalHeight += getTrackHeight(track, state);
    });
    heightRef.current = totalHeight;

    return (
      <React.Fragment>
        <FloatingTrackLabels tracks={tracks} />
        <TimelineTrackAreaRoot
          ref={(el) => {
            // Set both refs
            editAreaRef.current = el;
            resizeRef(el);
          }}
          className={`SuiTimelineEditArea-root ${prefix('edit-area')}`}
        >
          {width > 0 && (
            <VariableSizeList
              ref={listRef}
              className="timeline-list"
              id="timeline-grid"
              height={totalHeight}
              width={width}
              itemCount={tracks?.length || 0}
              itemSize={getItemHeight}
              overscanCount={10}
              style={{
                overscrollBehaviorX: 'none',
                touchAction: 'none',
                width: Math.max(scaleCount * scaleWidth + startLeft, width),
              }}
              onScroll={(scrollInfo) => {
                onScroll({
                  scrollTop: scrollInfo.scrollOffset,
                  scrollLeft,
                  clientHeight: totalHeight,
                  clientWidth: width,
                  scrollHeight: totalHeight,
                  scrollWidth: Math.max(scaleCount * scaleWidth + startLeft, width)
                });
              }}
            >
              {Row}
            </VariableSizeList>
          )}
        </TimelineTrackAreaRoot>
      </React.Fragment>
    );
  },
);

TimelineTrackArea.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  /**
   * Set scroll left
   */
  deltaScrollLeft: PropTypes.func,
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
   * @description Click time area event, prevent setting time when returning false
   */
  onClickTimeArea: PropTypes.func,
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
   * Scroll callback, used for synchronous scrolling
   */
  onScroll: PropTypes.func,
  /**
   * Set the number of scales
   */
  /**
   * @description Custom timelineControl style
   */
  /* sx: PropTypes.oneOfType([
    PropTypes.arrayOf(
      PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool]),
    ),
    PropTypes.func,
    PropTypes.object,
  ]), */
};

export default TimelineTrackArea;
