import * as React from 'react';
import { styled } from "@mui/material/styles";
import { AutoSizer, Grid, GridCellRenderer, OnScrollParams } from 'react-virtualized';
import { TimelineTrack } from '../../interface/action';
import { CommonProp } from '../../interface/common_prop';
import { EditData, TimelineControlProps } from '../../TimelineControl/TimelineControl.types';
import { prefix } from '../../utils/deal_class_prefix';
import { parserTimeToPixel } from '../../utils/deal_data';
import { DragLines } from './drag_lines';
import { EditRow } from './edit_row';
import { useDragLine } from './hooks/use_drag_line';

export type EditAreaProps =  CommonProp & {
  /** Scroll distance from the left */
  scrollLeft: number;
  /** Scroll distance from top */
  scrollTop?: number;
  /** Scroll callback, used for synchronous scrolling */
  onScroll: (params: OnScrollParams) => void;
  /** Set editor data */
  setEditorData: (tracks: TimelineTrack[]) => void;
  /** Set scroll left */
  deltaScrollLeft: (scrollLeft: number) => void;
};

/** edit area ref data */
export interface EditAreaState {
  domRef: React.MutableRefObject<HTMLDivElement>;
}

const EditAreaRoot = styled('div')(({ theme }) => ({
  flex: '1 1 auto',
  marginTop: '10px',
  overflow: 'hidden',
  position: 'relative',
  '& .ReactVirtualized__Grid': {
    outline: 'none !important',
    overflow: 'overlay !important',
    '&::-webkit-scrollbar': {
      width: 0,
      height: 0,
    },

    '&::-webkit-scrollbar-track': {
      backgroundColor: 'transparent !important',
    },

    '&::-webkit-scrollbar-thumb': {
      background: theme.palette.action.active,
      borderRadius: '16px',
    }
  }
}));

export const EditArea = React.forwardRef<EditAreaState, EditAreaProps>((props, ref) => {
  const {
    tracks,
    rowHeight,
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
  const gridRef = React.useRef<Grid>();
  const heightRef = React.useRef(-1);

  // ref 数据
  React.useImperativeHandle(ref, () => ({
    get domRef() {
      return editAreaRef;
    },
  }));

  const handleInitDragLine: EditData['onActionMoveStart'] = (data) => {
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

  const handleUpdateDragLine: EditData['onActionMoving'] = (data) => {
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
    const track = tracks[rowIndex]; // track data
    return (
      <EditRow
        {...props}
        style={{
          ...style,
          backgroundPositionX: `0, ${startLeft}px`,
          backgroundSize: `${startLeft}px, ${scaleWidth}px`,
        }}
        areaRef={editAreaRef}
        key={key}
        rowHeight={track?.rowHeight || rowHeight}
        rowData={track}
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
  };

  React.useEffect(() => {
    gridRef.current?.scrollToPosition({ scrollTop, scrollLeft });
  }, [scrollTop, scrollLeft]);

  React.useEffect(() => {
    gridRef.current.recomputeGridSize();
  }, [tracks]);

  return (
    <EditAreaRoot ref={editAreaRef} className={prefix('edit-area')}>
      <AutoSizer>
        {({ width, height }) => {
          // Get full height
          let totalHeight = 0;
          // HEIGHT LIST
          const heights = tracks?.map((track) => {
            const itemHeight = track.rowHeight || rowHeight;
            totalHeight += itemHeight;
            return itemHeight;
          });
          if (totalHeight < height && heights) {
            heights.push(height - totalHeight);
            if (heightRef.current !== height && heightRef.current >= 0) {
              setTimeout(() =>
                gridRef.current?.recomputeGridSize({
                  rowIndex: heights?.length ?? 0 - 1,
                }),
              );
            }
          }
          heightRef.current = height;

          console.log('calculated height', totalHeight, heights, width, height);
          return (
            <Grid
              columnCount={1}
              rowCount={heights?.length ?? 0}
              ref={gridRef}
              cellRenderer={cellRenderer}
              columnWidth={Math.max(scaleCount * scaleWidth + startLeft, width)}
              width={width}
              height={height}
              rowHeight={({ index }) => heights[index] || rowHeight}
              overscanRowCount={10}
              overscanColumnCount={0}
              onScroll={(param) => {
                onScroll(param);
              }}
            />
          );
        }}
      </AutoSizer>
      {dragLine && <DragLines scrollLeft={scrollLeft} {...dragLineData} />}
    </EditAreaRoot>
  );
});
