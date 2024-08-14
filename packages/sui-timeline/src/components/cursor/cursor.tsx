import * as React from 'react';
import { ScrollSync } from 'react-virtualized';
import { styled } from "@mui/material/styles";
import { CommonProp } from '../../interface/common_prop';
import { prefix } from '../../utils/deal_class_prefix';
import { parserPixelToTime, parserTimeToPixel } from '../../utils/deal_data';
import { RowDnd } from '../row_rnd/row_rnd';
import { RowRndApi } from '../row_rnd/row_rnd_interface';

/** Animation timeline component parameters */
export type CursorProps = CommonProp & {
  /** Scroll distance from the left */
  scrollLeft: number;
  /** Set cursor position */
  setCursor: (param: { left?: number; time?: number }) => boolean;
  /** Timeline area dom ref */
  areaRef: React.MutableRefObject<HTMLDivElement>;
  /** Set scroll left */
  deltaScrollLeft: (delta: number) => void;
  /** Scroll synchronization ref (TODO: This data is used to temporarily solve the problem of out-of-synchronization when scrollLeft is dragged) */
  scrollSync: React.MutableRefObject<ScrollSync>;
};

const CursorRoot = styled('div')({
  cursor: 'ew-resize',
  position: 'absolute',
  top: '32px',
  height: 'calc(100% - 32px)',
  boxSizing: 'border-box',
  borderLeft: '1px solid #5297FF',
  borderRight: '1px solid #5297FF',
  transform: 'translateX(-25%) scaleX(0.5)',
});

const CursorTopRoot = styled('svg')({
  position: 'absolute',
  top: 0,
  left: '50%',
  transform: 'translate(-50%, 0) scaleX(2)',
  margin: 'auto',
});

const CursorAreaRoot = styled('div')({
  width: '16px',
  height: '100%',
  cursor: 'ew-resize',
  position: 'absolute',
  top: 0,
  left: '50%',
  transform: 'translateX(-50%)',
});

export const Cursor: React.FC<CursorProps> = ({
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
}) => {
  const rowRnd = React.useRef<RowRndApi>();
  const draggingLeft = React.useRef<undefined | number>();

  React.useEffect(() => {
    if (typeof draggingLeft.current === 'undefined') {
      // When not dragging, update the cursor scale based on the dragging parameters.
      rowRnd.current.updateLeft(parserTimeToPixel(cursorTime, { startLeft, scaleWidth, scale }) - scrollLeft);
    }
  }, [cursorTime, startLeft, scaleWidth, scale, scrollLeft]);

  return (
    <RowDnd
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
        onCursorDragStart && onCursorDragStart(cursorTime);
        draggingLeft.current = parserTimeToPixel(cursorTime, { startLeft, scaleWidth, scale }) - scrollLeft;
        rowRnd.current.updateLeft(draggingLeft.current);
      }}
      onDragEnd={() => {
        const time = parserPixelToTime(draggingLeft.current + scrollLeft, { startLeft, scale, scaleWidth });
        setCursor({ time });
        onCursorDragEnd && onCursorDragEnd(time);
        draggingLeft.current = undefined;
      }}
      onDrag={({ left }, scroll = 0) => {
        const scrollLeft = scrollSync.current.state.scrollLeft;

        if (!scroll || scrollLeft === 0) {
          // When dragging, if the current left < left min, set the value to left min
          if (left < startLeft - scrollLeft) draggingLeft.current = startLeft - scrollLeft;
          else draggingLeft.current = left;
        } else {
          // During automatic scrolling, if the current left < left min, set the value to left min
          if (draggingLeft.current < startLeft - scrollLeft - scroll) {
            draggingLeft.current = startLeft - scrollLeft - scroll;
          }
        }
        rowRnd.current.updateLeft(draggingLeft.current);
        const time = parserPixelToTime(draggingLeft.current + scrollLeft, { startLeft, scale, scaleWidth });
        setCursor({ time });
        onCursorDrag && onCursorDrag(time);
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
    </RowDnd>
  );
};
