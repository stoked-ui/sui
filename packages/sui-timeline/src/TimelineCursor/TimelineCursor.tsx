import * as React from 'react';
import {styled} from "@mui/material/styles";
import {Box} from "@mui/material";
import {TimelineCursorProps} from './TimelineCursor.types';
import {prefix} from '../utils/deal_class_prefix';
import {parserPixelToTime, parserTimeToPixel} from '../utils/deal_data';
import TimelineTrackDnd from '../TimelineTrack/TimelineTrackDnd';
import {RowRndApi} from '../TimelineTrack/TimelineTrackDnd.types';

const CursorRoot = styled('div')(({ theme}) => {
  return {
    cursor: 'ew-resize',
    position: 'absolute',
    top: '1px',
    height: 'calc(100% - 20px)',
    boxSizing: 'border-box',
    borderRight: `1px solid ${theme.palette.mode === 'light' ? '#183259' : '#90b5ec'}`,
    transform: 'translateX(-25%) scaleX(0.5)',
  }});

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
                          hideCursor,
                          onClickTimeArea
                        }: TimelineCursorProps) {
  const rowRnd = React.useRef<RowRndApi>();
  const draggingLeft = React.useRef<undefined | number>();
  const timeInteract = React.useRef<HTMLDivElement>();

  React.useEffect(() => {
    if (typeof draggingLeft.current === 'undefined') {
      // When not dragging, update the cursor scale based on the dragging parameters.
      rowRnd.current.updateLeft(parserTimeToPixel(cursorTime, { startLeft, scaleWidth, scale }) - scrollLeft);
    }
  }, [cursorTime, startLeft, scaleWidth, scale, scrollLeft]);
const onDrag = ({ left }, scroll = 0) => {
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
}
const onDragEnd = () => {
  const time = parserPixelToTime(draggingLeft.current + scrollLeft, { startLeft, scale, scaleWidth });
  setCursor({ time });
  onCursorDragEnd?.(time);
  draggingLeft.current = undefined;
}
const onDragStart = () => {
  onCursorDragStart?.(cursorTime);
  draggingLeft.current = parserTimeToPixel(cursorTime, { startLeft, scaleWidth, scale }) - scrollLeft;
  rowRnd.current.updateLeft(draggingLeft.current);
}
  const [isDragging, setIsDragging] = React.useState(false);
  const [position, setPosition] = React.useState({ x: 0, y: 0 });

  const clickTime = (e) => {
    if (hideCursor) {
      return;
    }
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const position = e.clientX - rect.x;
    const left = Math.max(position + scrollLeft, startLeft);
    if (left > maxScaleCount * scaleWidth + startLeft - scrollLeft) {
      return;
    }

    const time = parserPixelToTime(left, { startLeft, scale, scaleWidth });
    const result = onClickTimeArea && onClickTimeArea(time, e);
    if (result === false) {
      return; // Prevent setting time when returning false}
    }
    setCursor({ time });
  }


  const handleMouseDown = (e) => {
    clickTime(e);
    setIsDragging(true);
    setPosition({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e) => {
    console.info('buttons', e.buttons);
    if (isDragging) {
      if (e.buttons === 0) {
        setIsDragging(false);
        return;
      }
      clickTime(e);
      setPosition({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  React.useEffect(() => {
    if (timeInteract.current && areaRef?.current) {
      timeInteract.current.style.width = `${areaRef.current.clientWidth}px`;
    }
  }, [cursorTime, startLeft, scaleWidth, scale, scrollLeft]);

  return (
    <React.Fragment>
      <Box
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        sx={{
          position: 'absolute',
          top: 0,
          left: '0%',
          width: '100%',
          height: '37.5px',
          cursor: 'pointer',
          backgroundColor: 'transparent'
        }}
        ref={timeInteract}
        draggable
      />
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
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDrag={onDrag}
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
    </React.Fragment>
  );
}
export default TimelineCursor;
