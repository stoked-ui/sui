import * as React from 'react';
import {styled} from "@mui/material/styles";
import {Box} from "@mui/material";
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

/*
import * as React from 'react';
import {styled} from "@mui/material/styles";
import {Box} from "@mui/material";
import {TimelineCursorProps} from './TimelineCursor.types';
import {prefix} from '../utils/deal_class_prefix';
import {parserPixelToTime, parserTimeToPixel} from '../utils/deal_data';
import TimelineTrackDnd from '../TimelineTrack/TimelineTrackDnd';
import {RowRndApi} from '../TimelineTrack/TimelineTrackDnd.types';
import { useTimeline } from "../TimelineProvider";

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

  const { engine } = useTimeline();
  const rowRnd = React.useRef<RowRndApi>();
  const draggingLeft = React.useRef<undefined | number>();
  const sLeft = React.useRef<number>(scrollLeft);
  const timeInteract = React.useRef<HTMLDivElement>();
  /!*

    const handleCursorDragStart = (time: number) => {
      onCursorDragStart?.(time);
      draggingLeft.current = parserTimeToPixel(time, {
        startLeft,
        scaleWidth,
        scale
      }) - scrollLeft;
      rowRnd.current.updateLeft(draggingLeft.current);
    }

    const handleCursorDragEnd = () => {
      const time = parserPixelToTime(draggingLeft.current + scrollLeft, { startLeft, scale, scaleWidth });
      setCursor({ time });
      onCursorDragEnd?.(time);
      draggingLeft.current = undefined;
    }

    const handlerCursorDrag = (left: number, scroll = 0) => {
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
    }
  *!/

  const getLeft = (e) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const position = e.clientX - rect.x;
    const left = Math.max(position + scrollLeft, startLeft);
    if (left > maxScaleCount * scaleWidth + startLeft - scrollLeft) {
      return undefined;
    }
    return left;
  }

  const getTime = (e) => {
    const left = getLeft(e);
    return parserPixelToTime(left, { startLeft, scale, scaleWidth });
  }

  const getCursorData = () => {
    return {
      scrollLeft: sLeft,
      cursorDnd: rowRnd,
      dragLeft: draggingLeft,
      setCursor,
    }
  }

  React.useEffect(() => {
    engine.cursorData = getCursorData;

    engine.cursorDragStart = (time: number) => {
      onCursorDragStart?.(time);

      draggingLeft.current = parserTimeToPixel(time, {
        startLeft,
        scaleWidth,
        scale
      }) - scrollLeft;

      rowRnd.current.updateLeft(draggingLeft.current);
    }

    engine.cursorDragEnd = () => {
      const time = parserPixelToTime(draggingLeft.current + scrollLeft, { startLeft, scale, scaleWidth });
      setCursor({ time });
      onCursorDragEnd?.(time);
      draggingLeft.current = undefined;
    }

    engine.cursorDrag = ({left}, scroll = 0) => {
      const scrollLeftDrag = scrollSync.current.state.scrollLeft;

      if (!scroll || scrollLeftDrag === 0) {
        // When dragging, if the current left < left min, set the value to left min
        if (left < startLeft - scrollLeftDrag) {
          draggingLeft.current = startLeft - scrollLeftDrag;
        } else {
          draggingLeft.current = left;
        }
      } else if (draggingLeft.current < startLeft - scrollLeftDrag - scroll) {
        draggingLeft.current = startLeft - scrollLeftDrag - scroll;
      }
      rowRnd.current.updateLeft(draggingLeft.current);
      const time = parserPixelToTime(draggingLeft.current + scrollLeftDrag, {
        startLeft,
        scale,
        scaleWidth
      });
      setCursor({ time });
      onCursorDrag?.(time);
    }
  }, [rowRnd.current, draggingLeft.current, scrollLeft])

  React.useEffect(() => {
    if (typeof draggingLeft.current === 'undefined') {
      // When not dragging, update the cursor scale based on the dragging parameters.
      rowRnd.current.updateLeft(parserTimeToPixel(cursorTime, { startLeft, scaleWidth, scale }) - scrollLeft);
    }

  }, [cursorTime, startLeft, scaleWidth, scale, scrollLeft]);

  React.useEffect(() => {
    if (timeInteract.current && areaRef?.current) {
      timeInteract.current.style.width = `${areaRef.current.clientWidth}px`;
    }
  }, [cursorTime, startLeft, scaleWidth, scale, scrollLeft]);

  const handleDragStart = (snapTime?: number) => {
    const dragTime = snapTime || cursorTime;
    onCursorDragStart?.(dragTime);
    draggingLeft.current = parserTimeToPixel(dragTime, { startLeft, scaleWidth, scale }) - scrollLeft;
    rowRnd.current.updateLeft(draggingLeft.current);
  }

  const handleDragEnd = () => {
    const time = parserPixelToTime(draggingLeft.current + scrollLeft, { startLeft, scale, scaleWidth });
    setCursor({ time });
    onCursorDragEnd?.(time);
    draggingLeft.current = undefined;
  }

  const handleDrag = ({ left }, scroll = 0) => {
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

  return (
    <React.Fragment>
      <Box
        onMouseDown={(e) => {
          const time = getTime(e);
          setCursor({ time });
          setCursorTime(time);
        }}
        onDragStart={(e) => {
          const time = getTime(e);
          setCursor({ time });
          setCursorTime(time);
          engine.cursorDragStart(time);
        }}
        onDragEnd={engine.cursorDragEnd}
        onDrag={engine.cursorDrag}
        sx={{
          position: 'absolute',
          top: 0,
          left: '50%',
          width: '100%',
          height: '37.5px',
          cursor: 'pointer',
          backgroundColor: 'blue'
        }}
        ref={timeInteract}
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
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDrag={handleDrag}
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
*/
