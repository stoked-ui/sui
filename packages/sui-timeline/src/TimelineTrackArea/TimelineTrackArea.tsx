import * as React from 'react';
import { styled } from "@mui/material/styles";
import { AutoSizer, Grid, GridCellRenderer } from 'react-virtualized';
// import {animated, useSpring} from "@react-spring/web";
// import {useGesture} from "@use-gesture/react";
import Box from "@mui/material/Box";
import { TimelineBaseProps } from "../Timeline/Timeline.types";
import { prefix } from '../utils/deal_class_prefix';
import { parserTimeToPixel } from '../utils/deal_data';
import { DragLines } from '../DragLines/DragLines';
import TimelineTrack from '../TimelineTrack/TimelineTrack';
import { useDragLines } from '../DragLines/useDragLines';
import {TimelineTrackAreaProps, TimelineTrackAreaState} from "./TimelineTrackArea.types";
import ScrollPinchDrag from "../ScrollPinchDrag";
import { ScrollSyncNode } from 'scroll-sync-react';


// const TimelineTrackAreaRoot = styled(animated(Box))(() => ({
const TimelineTrackAreaRoot = styled(Box)(() => ({
  flex: '1 1 auto',
  marginTop: '10px',
  overflow: 'hidden',
  position: 'relative',
  height: '100%',
  minHeight: 'fit-content',
  '& .ReactVirtualized__Grid': {
    outline: 'none !important',
    overflow: 'overlay !important',

  },
}));

const TimelineTrackArea = React.forwardRef<TimelineTrackAreaState, TimelineTrackAreaProps>((props, ref) => {
  const {
    tracks,
    rowHeight,
    scaleWidth,
    scaleCount,
    scrollSyncNode,
    startLeft,
    scale,
    hideCursor,
    cursorTime,
    dragLine,
    getAssistDragLineActionIds,
    onActionMoveEnd,
    onActionMoveStart,
    onActionMoving,
    onActionResizeEnd,
    onActionResizeStart,
    onActionResizing,
  } = props;
  const { dragLineData, initDragLine, updateDragLine, disposeDragLine, defaultGetAssistPosition, defaultGetMovePosition } = useDragLines();
  const editAreaRef = React.useRef<HTMLDivElement>();
  const gridRef = React.useRef<Grid>();
  const heightRef = React.useRef(-1);
/*

  const [springProps, api] = useSpring(() => ({
    x: 0,
      scale: 1,
    rotateZ: 0,
  }));

  const bind = useGesture(
    {
      onDrag: ({ offset: [x, y] }) => api.start({ x, y }),
      onPinch: ({ offset: [d, a] }) => api.start({ scale: d / 100, rotateZ: a }),
      onWheel: ({ offset: [x, y] }) => api.start({ scale: 1 + y / 100 }),
    },
    {
      drag: { from: () => [springProps.x.get(), springProps.y.get()] },
      pinch: { scaleBounds: { min: 0.5, max: 4 }, from: () => [springProps.scale.get(), springProps.rotateZ.get()] },
      wheel: { from: () => [springProps.scale.get(), 0] },
    }
  );
*/

  // ref data
  React.useImperativeHandle(ref, () => ({
    get domRef() {
      return editAreaRef;
    },
  }));

  const handleInitDragLine: TimelineBaseProps['onActionMoveStart'] = (data) => {
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

  const handleUpdateDragLine: TimelineBaseProps['onActionMoving'] = (data) => {
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

/** Get the /* rendering content of each cell *!/
  const CellRenderer: GridCellRenderer = ({ rowIndex, key, style }) => {
    const track = tracks[rowIndex]; // track data
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
        rowHeight={track?.rowHeight || rowHeight}
        track={track}
        dragLineData={dragLineData}

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
  }; */

  return (
    /* <ScrollSyncNode group={'tracks'}> */
      <React.Fragment>
        {tracks.map((track, index) => {
            return (
              <ScrollSyncNode>
                <TimelineTrack
                  {...props}
                  style={{
                    backgroundPositionX: `0, ${startLeft}px`,
                    backgroundSize: `${startLeft}px, ${scaleWidth}px`,
                    overflow: 'auto',
                    position: 'relative',
                    height: '32px'
                  }}
                  areaRef={editAreaRef}
                  key={index}
                  rowHeight={track?.rowHeight || rowHeight}
                  track={track}
                  dragLineData={dragLineData}
                  scrollLeft={props.scrollLeft}
                  deltaScrollLeft={(scrollLeft: number) => {}}
                  onActionMoveStart={(data) => {
                    handleInitDragLine(data);
                    return onActionMoveStart?.(data);
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
              </ScrollSyncNode>

          )}) as React.ReactNode}
      </React.Fragment>
    /* </ScrollSyncNode> */
  )
});

export default TimelineTrackArea;
