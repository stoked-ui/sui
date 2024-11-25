import * as React from 'react';
import PropTypes from 'prop-types';
import { alpha, styled } from '@mui/material/styles';
import { shouldForwardProp } from '@mui/system/createStyled';
import { Box, Typography } from '@mui/material';
import { AutoSizer, Grid, GridCellRenderer } from 'react-virtualized';
import { type TimelineControlPropsBase } from '../Timeline/TimelineControl.types';
import { prefix } from '../utils/deal_class_prefix';
import { parserTimeToPixel } from '../utils/deal_data';
import TimelineTrack from '../TimelineTrack/TimelineTrack';
import { TimelineTrackAreaProps } from './TimelineTrackArea.types';
import { useDragLine } from './useDragLine';
import { useTimeline } from '../TimelineProvider';
import TimelineFile from '../TimelineFile';
import { EngineState } from '../Engine';
import {ITimelineAction, ITimelineActionHandlers} from '../TimelineAction';
import { ITimelineTrack } from '../TimelineTrack';

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
  '& .ReactVirtualized__Grid': {
    outline: 'none !important',
    overflow: 'overlay !important',
    '&::-webkit-scrollbar': {
      width: 0,
      height: 0,
      display: 'none',
    },
  },
}));

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
  const context = useTimeline();
  const { settings, flags } = context;
  const {trackHoverId, getTrackHeight, selectedTrack, editorMode} = settings;
  if (!flags.noLabels) {
    return undefined;
  }
  const editorModeHidden = editorMode === 'track' || editorMode === 'action';
  return (
    <FloatingTracksRoot>
      {tracks.map(
        (track, index) =>
          track.id !== 'newTrack' && (
            <Box
              sx={{ height: getTrackHeight(index, context), display: 'flex', background: editorModeHidden && selectedTrack?.id !== track.id ? 'transparent' : undefined }}
              key={`${track.name}-${index}`}
            >
              <TrackLabel
                color={track.controller?.color}
                hover={trackHoverId === track.id ? true : undefined}
                sx={{ background: editorModeHidden && selectedTrack?.id !== track.id ? 'transparent' : undefined }}
              >
                <Typography variant="button" color="text.secondary">
                  {track.name}
                </Typography>
              </TrackLabel>
            </Box>
          ),
      )}
    </FloatingTracksRoot>
  );
}

const TimelineTrackArea = React.forwardRef<TimelineTrackAreaState, TimelineTrackAreaProps>(
  (props, ref) => {
    const context = useTimeline();
    const { file, getState, dispatch, settings, flags,  } = context;
    const {
      scaleCount,
      scaleWidth,
      startLeft,
      scrollLeft,
      scrollTop,
      scale,
      cursorTime,
      getTrackHeight,
      selectedTrackIndex
    } = settings;

    const tracks = TimelineFile.displayTracks(file?.tracks, flags.newTrack);
    const {  dragLine } = flags;
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
    const tracksRef = React.useRef<Grid>();
    const tracksElementRef = React.useRef<HTMLDivElement>();
    const heightRef = React.useRef(-1);

    // ref 数据
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

    /** Get the rendering content of each cell */
    const cellRenderer: GridCellRenderer = ({ rowIndex, key, style }) => {
      const gridTrack = tracks[rowIndex]; // track data
      const className = rowIndex === selectedTrackIndex ? 'selected' : '';
      return (
        <TimelineTrack
          {...props}
          style={{
            ...style,
            backgroundPositionX: `0, ${startLeft}px`,
            backgroundSize: `${startLeft}px, ${scaleWidth}px`,
          }}
          className={className}
          areaRef={editAreaRef}
          key={key}
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
    };

    React.useEffect(() => {
      if (tracksRef.current) {
        tracksElementRef.current = document.getElementById('thisisedit') as HTMLDivElement;
      }
    }, [tracksRef]);

    React.useEffect(() => {
      tracksRef.current?.scrollToPosition({ scrollTop, scrollLeft });
    }, [scrollTop, scrollLeft]);

    React.useEffect(() => {
      tracksRef.current.recomputeGridSize();
    }, [tracks]);

    if (getState() === EngineState.LOADING) {
      return undefined;
    }


    return (
      <React.Fragment>
        <FloatingTrackLabels tracks={tracks} />
        <TimelineTrackAreaRoot
          ref={editAreaRef}
          className={`SuiTimelineEditArea-root ${prefix('edit-area')}`}
        >
          <AutoSizer className={'auto-sizer'} style={{ height: 'fit-content' }}>
            {({ width,  }) => {
              // Get full height
              let totalHeight = 0;
              // HEIGHT LIST
              tracks?.forEach((track, index) => {
                const trackHeight = getTrackHeight(index, context);
                totalHeight += trackHeight;
              });

              heightRef.current = totalHeight;

              return (
                <Grid
                  id={'thisisedit'}
                  columnCount={1}
                  rowCount={ (tracks?.length ?? 0)}
                  ref={tracksRef}
                  style={{
                    overscrollBehavior: 'none',
                  }}
                  cellRenderer={cellRenderer}
                  columnWidth={Math.max(scaleCount * scaleWidth + startLeft, width)}
                  width={width}
                  height={totalHeight}
                  rowHeight={({ index }) => getTrackHeight(index, context)}
                  overscanRowCount={10}
                  overscanColumnCount={0}
                  onScroll={(param) => {
                    onScroll(param);
                  }}
                />
              );
            }}
          </AutoSizer>
          {/* {dragLine && <TimelineTrackAreaDragLines scrollLeft={scrollLeft} {...dragLineData} />} */}
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
  deltaScrollLeft: PropTypes.func.isRequired,
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
   * @description Click time area event, prevent setting time when returning false
   */
  onClickTimeArea: PropTypes.func.isRequired,
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
   * Scroll callback, used for synchronous scrolling
   */
  onScroll: PropTypes.func.isRequired,
  /**
   * Set the number of scales
   */
  /**
   * @description Custom timelineControl style
   */
  /* sx: PropTypes.oneOfType([
    PropTypes.arrayOf(
      PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool]).isRequired,
    ),
    PropTypes.func,
    PropTypes.object,
  ]).isRequired, */
};

export default TimelineTrackArea;
