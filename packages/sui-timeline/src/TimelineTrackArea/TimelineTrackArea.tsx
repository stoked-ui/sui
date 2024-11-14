import * as React from 'react';
import {styled} from "@mui/material/styles";
import { AutoSizer, Grid, GridCellRenderer } from 'react-virtualized';
import {type TimelineControlPropsBase} from '../TimelineControl/TimelineControl.types';
import {prefix} from '../utils/deal_class_prefix';
import {parserTimeToPixel} from '../utils/deal_data';
import TimelineTrackAreaDragLines from './TimelineTrackAreaDragLines';
import TimelineTrack from '../TimelineTrack/TimelineTrack';
import {TimelineTrackAreaProps} from './TimelineTrackArea.types'
import {useDragLine} from './useDragLine';
import {useTimeline} from "../TimelineProvider";
import {TimelineFile} from "../TimelineFile";

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

const TimelineTrackArea = React.forwardRef<TimelineTrackAreaState, TimelineTrackAreaProps>((props, ref) => {
  const { file } = useTimeline();
  const tracks = TimelineFile.displayTracks(file?.tracks);

  const {
    trackHeight,
    scaleWidth,
    scaleCount,
    startLeft,
    scrollLeft,
    scrollTop,
    scale,
    hideCursor,
    cursorTime,
    onScroll,
    dragLine,
    getAssistDragLineActionIds,
    onActionMoveEnd,
    onActionMoveStart,
    onActionMoving,
    onActionResizeEnd,
    onActionResizeStart,
    onActionResizing,
  } = props;
  const { dragLineData, initDragLine, updateDragLine, disposeDragLine, defaultGetAssistPosition, defaultGetMovePosition } = useDragLine();
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
    }
  }));

  const handleInitDragLine: TimelineControlPropsBase['onActionMoveStart'] = (data) => {
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
        scale,
        scaleWidth,
        startLeft,
        hideCursor,
        cursorLeft,
      });
      initDragLine({ assistPositions });
    }
  };

  const handleUpdateDragLine: TimelineControlPropsBase['onActionMoving'] = (data) => {
    if (dragLine) {
      const movePositions = defaultGetMovePosition({
        ...data,
        startLeft,
        scaleWidth,
        scale,
      });
      updateDragLine({ movePositions });
    }
  };

/** Get the rendering content of each cell */
  const cellRenderer: GridCellRenderer = ({ rowIndex, key, style }) => {
    const gridTrack = tracks[rowIndex]; // track data
    return (
      <TimelineTrack
        {...props}
        style={{
          ...style,
          backgroundPositionX: `0, ${startLeft}px`,
          backgroundSize: `${startLeft}px, ${scaleWidth}px`,
        }}
        areaRef={editAreaRef}
        key={key}
        trackHeight={ trackHeight}
        track={gridTrack}
        dragLineData={dragLineData}
        disableDrag={props.disableDrag}
        onAddFiles={props.onAddFiles}
        onActionMoveStart={(data) => {
          handleInitDragLine(data);
          return onActionMoveStart && onActionMoveStart(data);
        }}
        onActionResizeStart={(data) => {
          handleInitDragLine(data);

          return onActionResizeStart && onActionResizeStart(data);
        }}
        onActionMoving={(data) => {
          handleUpdateDragLine(data);
          return onActionMoving && onActionMoving(data);
        }}
        onActionResizing={(data) => {
          handleUpdateDragLine(data);
          return onActionResizing && onActionResizing(data);
        }}
        onActionResizeEnd={(data) => {
          disposeDragLine();
          return onActionResizeEnd && onActionResizeEnd(data);
        }}
        onActionMoveEnd={(data) => {
          disposeDragLine();
          return onActionMoveEnd && onActionMoveEnd(data);
        }}
      />
    );
  };

  React.useEffect(() => {
    if (tracksRef.current) {
      tracksElementRef.current = document.getElementById('thisisedit') as HTMLDivElement;
    }
  }, [tracksRef])

  React.useEffect(() => {
    tracksRef.current?.scrollToPosition({ scrollTop, scrollLeft });
  }, [scrollTop, scrollLeft]);

  React.useEffect(() => {
    tracksRef.current.recomputeGridSize();
  }, [tracks]);

  return (
    <TimelineTrackAreaRoot ref={editAreaRef} className={`SuiTimelineEditArea-root ${prefix('edit-area')}`}>
      <AutoSizer className={'auto-sizer'} style={{height: 'fit-content'}}>
        {({ width, height }) => {
          // Get full height
          let totalHeight = 0;
          // HEIGHT LIST
          const heights = tracks?.map((heightTrack) => {
            totalHeight += trackHeight;
            return trackHeight;
          });
         /*  if (totalHeight < height && heights && viewMode === 'Renderer') {
            heights.push(height - totalHeight);
            if (heightRef.current !== height && heightRef.current >= 0) {
              setTimeout(() =>
                tracksRef.current?.recomputeGridSize({
                  rowIndex: heights?.length ?? 0 - 1,
                }),
              );
            }
          } */
          heightRef.current = totalHeight;
          return (
            <Grid
              id={'thisisedit'}
              columnCount={1}
              rowCount={heights?.length ?? 0}
              ref={tracksRef}
              style={{
                overscrollBehavior: 'none',
              }}
              cellRenderer={cellRenderer}
              columnWidth={Math.max(scaleCount * scaleWidth + startLeft, width)}
              width={width}
              height={totalHeight}
              rowHeight={({ index }) => heights[index] || trackHeight}
              overscanRowCount={10}
              overscanColumnCount={0}
              onScroll={(param) => {
                onScroll(param);
              }}
            />
          );
        }}
      </AutoSizer>
      {dragLine && <TimelineTrackAreaDragLines scrollLeft={scrollLeft} {...dragLineData} />}
    </TimelineTrackAreaRoot>
  );
});
export default TimelineTrackArea;
