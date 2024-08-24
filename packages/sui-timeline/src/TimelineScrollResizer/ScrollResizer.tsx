import React, { useRef, useState, useEffect } from 'react';
import { styled } from '@mui/system';

interface CustomScrollbarProps {
  parentRef: React.RefObject<HTMLElement>;
  selector: string;
  minScale?: number;
  maxScale?: number;
  scale?: number;
  setScale?: (value: number) => void;
  setHorizontalScroll?: (value: number) => void;
  scrollLeft?: number;
}

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

const ScrollbarThumb = styled('div')<{ width: number; left: number }>(({ theme, width, left }) => ({
  height: '100%',
  width: `${width}px`,
  minWidth: '40px',
  backgroundColor: '#55555599',
  position: 'absolute',
  left: `${left}%`,
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

const ScrollResizer: React.FC<CustomScrollbarProps> = ({
  parentRef,
  selector,
  minScale = 0.5,
  maxScale = 2,
  scale = 1,
  setScale,
  setHorizontalScroll,
}) => {
  const [isResizing, setIsResizing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [initialScaleOnDrag, setInitialScaleOnDrag] = useState(scale);
  const [scrollThumbPosition, setScrollThumbPosition] = useState(0);
  const [thumbWidth, setThumbWidth] = useState(50);
  const contentRef = React.useRef<HTMLElement>(null);

  useEffect(() => {
    if (parentRef.current) {
      const scrollElement = parentRef.current.querySelector(selector);
      if (scrollElement && scrollElement as HTMLElement !== null) {
        contentRef.current = scrollElement as HTMLElement;
      }
    }
  }, [parentRef]);

  useEffect(() => {
    if (setScale && contentRef.current) {
      setScale(scale);
    }
  }, [scale, contentRef]);

  const handleMouseDownResize = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    setStartX(e.clientX);
    setInitialScaleOnDrag(scale);
  };

  const getThumbnailWidth = () => {
    const visibleWidth = contentRef.current.clientWidth;
    const totalWidth = contentRef.current.scrollWidth;
    return visibleWidth / (totalWidth / visibleWidth);
  }
  const handleMouseDownDrag = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setStartX(e.clientX);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isResizing) {
      const updateThumbSize = (newThumbWidth: number) => {
        if (contentRef.current) {
          setThumbWidth(Math.max(50, newThumbWidth)); // Minimum thumb width is 50px
        }
      };
      const deltaX = e.clientX - startX;
      const scaleChange = deltaX * -0.5; // Adjusting scale change factor
      let newScale = initialScaleOnDrag + scaleChange;
      newScale = Math.max(minScale, Math.min(maxScale, newScale));
      const newThumbWidth = getThumbnailWidth();
      if (newThumbWidth <= contentRef.current.clientWidth) {
        setScale(newScale);
        updateThumbSize(newThumbWidth);
      }
    } else if (isDragging) {
      const deltaX = e.clientX - startX;
      const trackWidth = contentRef.current?.clientWidth  || 1;
      const maxScrollPercent = 100 - (thumbWidth / (trackWidth / 100));
      const maxScrollPosition = trackWidth - thumbWidth;

      const newScrollPosition = Math.max(
        0,
        Math.min(maxScrollPercent, scrollThumbPosition + (deltaX / maxScrollPosition) * 100)
      );
      console.log('newScrollPosition', newScrollPosition, maxScrollPercent);
      setScrollThumbPosition(newScrollPosition);

      if (contentRef.current) {
        setHorizontalScroll(newScrollPosition);
      }
    }
  };

  const handleMouseUp = () => {
    setIsResizing(false);
    setIsDragging(false);
  };

  useEffect(() => {
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

export default ScrollResizer;
