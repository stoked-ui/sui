import * as React from 'react';
import {styled} from '@mui/system';
import {TimelineScrollResizerProps} from './TimelineScrollResizer.types';
import { useTimeline } from '../TimelineProvider/TimelineProvider';

const ScrollbarContainer = styled('div')(({ theme }) => ({
  width: '100%',
  height: '0px',
  backgroundColor: theme.palette.action.divider,
  position: 'relative',
}));

const ScrollbarTrack = styled('div')(({ theme }) => ({
  height: '100%',
  width: '100%',
  backgroundColor: theme.palette.action.hover,
  position: 'relative',
}));

const ScrollbarThumb = styled('div')<{ width: number; left: number }>(({  width, left }) => ({
  height: '100%',
  width: `${width}px`,
  minWidth: '40px',
  backgroundColor: '#55555599',
  position: 'absolute',
  left: `${left}px`,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  cursor: 'pointer',
}));

const ResizeHandle = styled('div')(({ theme }) => ({
  width: '10px',
  height: '100%',
  backgroundColor: theme.palette.grey[700],
  cursor: 'ew-resize',

  '&:first-of-type': {
    borderRadius: '5px 0 0 5px',
  },

  '&:last-of-type': {
    borderRadius: '0 5px 5px 0',
  },
}));

export default function TimelineScrollResizer({
  elementRef,
  adjustScale,
  type = 'horizontal',
}: TimelineScrollResizerProps) {
  const { engine, settings }  = useTimeline();
  const [isResizingLeft, setIsResizingLeft] = React.useState(false);
  const [isResizingRight, setIsResizingRight] = React.useState(false);
  const [isDragging, setIsDragging] = React.useState(false);
  const [startX, setStartX] = React.useState(0);
  const [clientPercentage, setClientPercentage] = React.useState(100);
  const [scrollThumbPosition, setScrollThumbPosition] = React.useState(0);
  const [startScrollThumbPosition, setStartScrollThumbPosition] = React.useState(null);
  const [thumbWidth, setThumbWidth] = React.useState(50);
  // const contentRef = React.useRef<HTMLElement>(null);

  const getBoundaryWidth = () => {
    const adjustedScaleWidth = settings.scaleWidth / settings.scaleSplitCount;
    const extraSpace = (adjustedScaleWidth * 2);
    const durationSpace = engine.canvasDuration * adjustedScaleWidth;
    return durationSpace + extraSpace;
  }
  const getThumbnailWidth = (totalWidth = getBoundaryWidth()) => {
    if (!elementRef.current) {
      return thumbWidth;
    }
    const visibleWidth = elementRef.current?.clientWidth;
    return visibleWidth / (totalWidth / visibleWidth);
  }

  React.useEffect(() => {
    if (!elementRef.current) {
      return undefined;
    }

    const observer = new ResizeObserver(() => {
      if (!elementRef.current) {
        return;
      }

      setTimeout(() => {
        const grid = document.getElementById('thisisedit');
        if (!grid) {
          return;
        }
        setClientPercentage(getBoundaryWidth() / grid.clientWidth)
        const tWidth = getThumbnailWidth();
        setThumbWidth(tWidth);
      }, 1000)

    });

    observer.observe(elementRef.current!);

    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, [elementRef.current]);

  const handleMouseDownResizeRight = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizingRight(true);
    setStartX(e.clientX);
  };

  const handleMouseDownResizeLeft = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizingLeft(true);
    setStartX(e.clientX);
  };

  const handleMouseDownDrag = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setStartX(e.clientX);
    setStartScrollThumbPosition(scrollThumbPosition);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isResizingLeft || isResizingRight) {
      const updateThumbSize = (newThumbWidth: number) => {
        if (elementRef.current) {
          setThumbWidth(Math.max(50, newThumbWidth)); // Minimum thumb width is 50px
        }
      };
      console.log('e.clientX', e.clientX)
      const deltaX = (e.clientX - startX);
      // let newScale = initialScaleOnDrag + deltaX;
      // newScale = Math.max(minScale, Math.min(maxScale, newScale));

      const valid = adjustScale(deltaX);
      updateThumbSize(thumbWidth + deltaX);
      // const newThumbWidth = getThumbnailWidth(elementRef.current.scrollWidth - deltaX);
      // if (thumbWidth !== newThumbWidth && newThumbWidth <= contentRef.current.clientWidth) {
      //  console.log('newScale', newThumbWidth, contentRef.current.clientWidth, newScale)
      //  setScale(newScale);
      //  updateThumbSize(newThumbWidth);
      // }
    } else if (isDragging) {
     /*  const deltaX = e.clientX - startX;
      const newPos = startScrollThumbPosition + deltaX;
      const adjustedPos = Math.min(Math.max(0, newPos), elementRef.current.clientWidth - thumbWidth);
      console.log('adjustedPos', adjustedPos)
      setScrollThumbPosition(adjustedPos);
      if (elementRef.current && deltaX) {
        elementRef.current.scrollLeft += deltaX;
        //setScroll(startScrollThumbPosition + deltaX);
      } */
      const deltaX = e.clientX - startX;
      const containerWidth = elementRef.current.clientWidth;
      const scrollableWidth = getBoundaryWidth() - containerWidth; // Total scrollable area
      const thumbRange = containerWidth - thumbWidth; // Range the thumb can move

      // Calculate the new thumb position
      let newPos = startScrollThumbPosition + deltaX;
      newPos = Math.max(0, Math.min(newPos, thumbRange)); // Clamp position

      // Calculate the scrollLeft based on the thumb position
      const scrollRatio = newPos / thumbRange;
      const newScrollLeft = scrollRatio * scrollableWidth;

      // Apply the new positions
      setScrollThumbPosition(newPos);
      elementRef.current.scrollLeft = newScrollLeft;

      console.log('DeltaX:', deltaX, 'ThumbPos:', newPos, 'ScrollLeft:', newScrollLeft);
    }
  };

  const handleMouseUp = () => {
    setIsResizingLeft(false);
    setIsResizingRight(false);
    setIsDragging(false);
  };

  React.useEffect(() => {
    if (isResizingLeft || isResizingRight || isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizingLeft, isResizingRight, isDragging]);

  return (
    <ScrollbarContainer className={'SuiScrollbar'}>
      <ScrollbarTrack>
        <ScrollbarThumb
          width={thumbWidth}
          left={scrollThumbPosition}
          onMouseDown={handleMouseDownDrag}
        >
          <ResizeHandle onMouseDown={handleMouseDownResizeLeft} />
          <ResizeHandle onMouseDown={handleMouseDownResizeRight} />
        </ScrollbarThumb>
      </ScrollbarTrack>
    </ScrollbarContainer>
  );
};

