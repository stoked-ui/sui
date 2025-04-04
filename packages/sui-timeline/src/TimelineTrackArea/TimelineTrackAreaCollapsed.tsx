/**
 * Timeline Track Area Collapsed Component
 *
 * This component represents the area where timeline tracks are displayed.
 * It contains the necessary logic for handling drag and drop events, as well as resizing actions.
 */

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
import {ITimelineAction, ITimelineActionHandlers} from '../TimelineAction';
import { ITimelineTrack } from '../TimelineTrack';

/**
 * State interface for the Timeline Track Area Collapsed component
 */
export interface TimelineTrackAreaState {
  /**
   * Ref to the DOM element of the edit area
   */
  domRef: React.MutableRefObject<HTMLDivElement>;
  /**
   * Ref to the DOM element of the tracks container
   */
  tracksRef: React.MutableRefObject<HTMLDivElement>;
}

const TimelineTrackAreaRoot = styled('div')(() => ({
  flex: '1 1 auto',
  overflow: 'hidden',
  position: 'relative',
  minHeight: 'fit-content',
  '& .ReactVirtualized__Grid': {
    outline: 'none !important', overflow: 'overlay !important', '&::-webkit-scrollbar': {
      width: 0, height: 0, display: 'none',
    },
  },
}));

const TimelineTrackAreaCollapsed = React.forwardRef<TimelineTrackAreaState, TimelineTrackAreaProps>((props, ref) => {
  const { state: {file, settings, flags} } = useTimeline();
  const { trackHeight, scaleWidth, startLeft, scale, cursorTime } = settings;
  const {dragLine} = flags;

  return (
    <TimelineTrackAreaRoot ref={ref}
                            className={`SuiTimelineEditArea-root ${prefix('edit-area')}`}>
      <AutoSizer className={'auto-sizer'} style={{height: 'fit-content'}}>
        {({width}) => {
          return (
            <TimelineTrack
              {...props}
              style={{
                width,
                height: trackHeight,
                overscrollBehaviorX: 'none',
                backgroundPositionX: `0, ${startLeft}px`,
                backgroundSize: `${startLeft}px, ${scaleWidth}px`,
              }}
              trackRef={ref}
              scrollLeft={0}
              actionTrackMap={file.actionTrackMap}
              areaRef={ref}
              track={file.track}
              dragLineData={dragLine ? dragLine.data : null}
              onActionMoveStart={(data: { action: ITimelineAction; track: ITimelineTrack<ITimelineAction>; }) => {
                handleInitDragLine(data);
                return onActionMoveStart && onActionMoveStart(data);
              }}
              onActionResizeStart={(data: { action: ITimelineAction; track: ITimelineTrack<ITimelineAction>; dir: "left" | "right"; }) => {
                handleInitDragLine(data);
                return onActionResizeStart && onActionResizeStart(data);
              }}
              onActionMoving={(data: { action: ITimelineAction; track: ITimelineTrack<ITimelineAction>; start: number; end: number; }) => {
                handleUpdateDragLine(data);
                return onActionMoving && onActionMoving(data);
              }}
              onActionResizing={(data: { action: ITimelineAction; track: ITimelineTrack<ITimelineAction>; start: number; end: number; dir: "left" | "right"; }) => {
                handleUpdateDragLine(data);
                return onActionResizing && onActionResizing(data);
              }}
              onActionResizeEnd={(data: { action: ITimelineAction; track: ITimelineTrack<ITimelineAction>; start: number; end: number; dir: "left" | "right"; }) => {
                disposeDragLine();
                return onActionResizeEnd && onActionResizeEnd(data);
              }}
              onActionMoveEnd={(data: { action: ITimelineAction; track: ITimelineTrack<ITimelineAction>; start: number; end: number; }) => {
                disposeDragLine();
                return onActionMoveEnd && onActionMoveEnd(data);
              }}
            />
          );
        }}
      </AutoSizer>
      {dragLine && <TimelineTrackAreaDragLines scrollLeft={0} {...dragLineData} />}
    </TimelineTrackAreaRoot>
  );
});

/**
 * Handles the initialization of drag and drop events
 */
function handleInitDragLine(data: { action: ITimelineAction; track: ITimelineTrack<ITimelineAction>; }) {
  // Initialize drag line data here
}

/**
 * Handles the updating of drag and drop events
 */
function handleUpdateDragLine(data: { action: ITimelineAction; track: ITimelineTrack<ITimelineAction>; start: number; end: number; }) {
  // Update drag line data here
}

export { TimelineTrackAreaCollapsed };