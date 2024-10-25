import * as React from 'react';
import {styled} from "@mui/material/styles";
import {TimelineCursorProps} from './TimelineCursor.types';
import {prefix} from '../utils/deal_class_prefix';
import {parserPixelToTime, parserTimeToPixel} from '../utils/deal_data';
import TimelineTrackDnd from '../TimelineTrack/TimelineTrackDnd';
import {RowRndApi} from '../TimelineTrack/TimelineTrackDnd.types';

const CursorRoot = styled('div')({
  cursor: 'ew-resize',
  position: 'absolute',
  top: '1px',
  height: '100%',
  boxSizing: 'border-box',
  borderLeft: '1px solid #5297FF',
  borderRight: '1px solid #5297FF',
  transform: 'translateX(-25%) scaleX(0.5)',
});

const CursorTopRoot = styled('svg')({
  position: 'absolute',
  top: '0px',
  left: '50%',
  transform: 'translate(-50%, 0) scaleX(2)',
  margin: 'auto',
});

const CursorAreaRoot = styled('div')({
  width: '16px',
  height: 'calc(100% - 34px)',
  cursor: 'ew-resize',
  position: 'absolute',
  top: 0,
  left: '50%',
  transform: 'translateX(-50%)',
});

function TimelineCursor({
  disableDrag,
  cursorTime,
  setCursor,
  startLeft,
  timelineWidth,
  scaleWidth,
  scale,
  scrollLeft,
  scrollSync,
  areaRef,
  maxScaleCount,
  deltaScrollLeft,
  onCursorDragStart,
  onCursorDrag,
  onCursorDragEnd,
}: TimelineCursorProps) {
  const rowRnd = React.useRef<RowRndApi>();
  const draggingLeft = React.useRef<undefined | number>();

  React.useEffect(() => {
    if (typeof draggingLeft.current === 'undefined') {
      // When not dragging, update the cursor scale based on the dragging parameters.
      rowRnd.current.updateLeft(parserTimeToPixel(cursorTime, { startLeft, scaleWidth, scale }) - scrollLeft);
    }
  }, [cursorTime, startLeft, scaleWidth, scale, scrollLeft]);

  return (
    <TimelineTrackDnd
      start={startLeft}
      ref={rowRnd}
      parentRef={areaRef}
      bounds={{
        left: 0,
        right: Math.min(timelineWidth, maxScaleCount * scaleWidth + startLeft - scrollLeft),
      }}
      deltaScrollLeft={deltaScrollLeft}
      enableDragging={!disableDrag}
      enableResizing={false}
      onDragStart={() => {
        onCursorDragStart?.(cursorTime);
        draggingLeft.current = parserTimeToPixel(cursorTime, { startLeft, scaleWidth, scale }) - scrollLeft;
        rowRnd.current.updateLeft(draggingLeft.current);
      }}
      onDragEnd={() => {
        const time = parserPixelToTime(draggingLeft.current + scrollLeft, { startLeft, scale, scaleWidth });
        setCursor({ time });
        onCursorDragEnd?.(time);
        draggingLeft.current = undefined;
      }}
      onDrag={({ left }, scroll = 0) => {
        const scrollLeftDrag = scrollSync.current.state.scrollLeft;

        if (!scroll || scrollLeftDrag === 0) {
          // When dragging, if the current left < left min, set the value to left min
          if (left < startLeft - scrollLeftDrag) {
            draggingLeft.current = startLeft - scrollLeftDrag;
          }
          else {
            draggingLeft.current = left;
          }
        } else if (draggingLeft.current < startLeft - scrollLeftDrag - scroll) {
          draggingLeft.current = startLeft - scrollLeftDrag - scroll;
        }
        rowRnd.current.updateLeft(draggingLeft.current);
        const time = parserPixelToTime(draggingLeft.current + scrollLeftDrag, { startLeft, scale, scaleWidth });
        setCursor({ time });
        onCursorDrag?.(time);
        return false;
      }}
    >
      <CursorRoot>
        <CursorTopRoot width="8" height="12" viewBox="0 0 8 12" fill="none">
          <path
            d="M0 1C0 0.447715 0.447715 0 1 0H7C7.55228 0 8 0.447715 8 1V9.38197C8 9.76074 7.786 10.107 7.44721 10.2764L4.44721 11.7764 C4.16569 11.9172 3.83431 11.9172 3.55279 11.7764L0.552786 10.2764C0.214002 10.107 0 9.76074 0 9.38197V1Z"
            fill="#5297FF"
          />
        </CursorTopRoot>
        <CursorAreaRoot className={prefix('cursor-area')} />
      </CursorRoot>
    </TimelineTrackDnd>
  );
}
export default TimelineCursor;
