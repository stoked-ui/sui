import * as React from 'react';
import {styled} from "@mui/material/styles";
import { AutoSizer } from 'react-virtualized';
import {type TimelineControlPropsBase} from '../Timeline/TimelineControl.types';
import {prefix} from '../utils/deal_class_prefix';
import {parserTimeToPixel} from '../utils/deal_data';
import TimelineTrackAreaDragLines from './TimelineTrackAreaDragLines';
import TimelineTrack from '../TimelineTrack/TimelineTrack';
import {TimelineTrackAreaProps} from './TimelineTrackArea.types'
import {useDragLine} from './useDragLine';
import {useTimeline} from "../TimelineProvider";
import TimelineFile from "../TimelineFile";

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

const TimelineTrackAreaCollapsed = React.forwardRef<TimelineTrackAreaState, TimelineTrackAreaProps>((props, ref) => {
  const { file } = useTimeline();
  const { track, actionTrackMap } = TimelineFile.collapsedTrack(file?.tracks);
  const {
    trackHeight,
    scaleWidth,
    startLeft,
    scrollLeft,
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
  const { dragLineData, initDragLine, updateDragLine, disposeDragLine, defaultGetAssistPosition, defaultGetMovePosition } = useDragLine();
  const editAreaRef = React.useRef<HTMLDivElement>();
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
          tracks: [track],
        });
      const cursorLeft = parserTimeToPixel(cursorTime, { scaleWidth, scale, startLeft });
      const assistPositions = defaultGetAssistPosition({
        tracks: [track],
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

  return (
    <TimelineTrackAreaRoot ref={editAreaRef} className={`SuiTimelineEditArea-root ${prefix('edit-area')}`}>
      <AutoSizer className={'auto-sizer'} style={{height: 'fit-content'}}>
        {({ width, height }) => {
          heightRef.current = trackHeight;
          return (
            <TimelineTrack {...props}
              style={{
                width,
                height: trackHeight,
                overscrollBehavior: 'none',
                backgroundPositionX: `0, ${startLeft}px`,
                backgroundSize: `${startLeft}px, ${scaleWidth}px`,
              }}
              trackRef={tracksElementRef}
              actionTrackMap={actionTrackMap}
              areaRef={editAreaRef}
              trackHeight={ trackHeight}
              track={track}
              dragLineData={dragLineData}
              disableDrag={props.disableDrag}

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
        }}
      </AutoSizer>
      {dragLine && <TimelineTrackAreaDragLines scrollLeft={scrollLeft} {...dragLineData} />}
    </TimelineTrackAreaRoot>
  );
});

export { TimelineTrackAreaCollapsed };
