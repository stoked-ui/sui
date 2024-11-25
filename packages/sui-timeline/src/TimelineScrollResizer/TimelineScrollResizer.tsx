import * as React from 'react';
import {styled} from '@mui/system';
import {TimelineScrollResizerProps} from './TimelineScrollResizer.types';

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
  const [isResizing, setIsResizing] = React.useState(false);
  const [isDragging, setIsDragging] = React.useState(false);
  const [startX, setStartX] = React.useState(0);
  const [clientPercentage, setClientPercentage] = React.useState(100);
  const [scrollThumbPosition, setScrollThumbPosition] = React.useState(0);
  const [startScrollThumbPosition, setStartScrollThumbPosition] = React.useState(null);
  const [thumbWidth, setThumbWidth] = React.useState(50);
  // const contentRef = React.useRef<HTMLElement>(null);

  const getThumbnailWidth = (totalWidth = elementRef.current.scrollWidth) => {
    const visibleWidth = elementRef.current.clientWidth;
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

      setClientPercentage(elementRef.current.scrollWidth / elementRef.current.clientWidth)
      const tWidth = getThumbnailWidth();
      setThumbWidth(tWidth);
    });

    observer.observe(elementRef.current!);

    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, [elementRef.current]);

  const handleMouseDownResize = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    setStartX(e.clientX);
  };

  const handleMouseDownDrag = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setStartX(e.clientX);
    setStartScrollThumbPosition(scrollThumbPosition);
    console.log(scrollThumbPosition)
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isResizing) {
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
      const deltaX = e.clientX - startX;
      const newPos = startScrollThumbPosition + deltaX;
      const adjustedPos = Math.min(Math.max(0, newPos), elementRef.current.clientWidth - thumbWidth);
      console.log('adjustedPos', adjustedPos)
      setScrollThumbPosition(adjustedPos);
      if (elementRef.current && deltaX) {
        elementRef.current.scrollLeft += deltaX;
        //setScroll(startScrollThumbPosition + deltaX);
      }
    }
  };

  const handleMouseUp = () => {
    setIsResizing(false);
    setIsDragging(false);
  };

  React.useEffect(() => {
    if (isResizing || isDragging) {
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
  }, [isResizing, isDragging]);

  return (
    <ScrollbarContainer className={'SuiScrollbar'}>
      <ScrollbarTrack>
        <ScrollbarThumb
          width={thumbWidth}
          left={scrollThumbPosition}
          onMouseDown={handleMouseDownDrag}
        >
          <ResizeHandle onMouseDown={handleMouseDownResize} />
          <ResizeHandle onMouseDown={handleMouseDownResize} />
        </ScrollbarThumb>
      </ScrollbarTrack>
    </ScrollbarContainer>
  );
};

