import React, { useRef, useState, useEffect } from 'react';
import { styled } from '@mui/system';

interface CustomScrollbarProps {
  parentRef: React.RefObject<HTMLElement>;
  selector: string;
  minScale?: number;
  maxScale?: number;
  initialScale?: number;
  setScale?: (value: number) => void;
  setHorizontalScroll?: (value: number) => void;
}

const ScrollbarContainer = styled('div')(({ theme }) => ({
  width: '100%',
  height: '20px',
  backgroundColor: theme.palette.grey[200],
  position: 'relative',
}));

const ScrollbarTrack = styled('div')(({ theme }) => ({
  height: '100%',
  width: '100%',
  backgroundColor: theme.palette.grey[300],
  position: 'relative',
}));

const ScrollbarThumb = styled('div')<{ width: number; left: number }>(({ theme, width, left }) => ({
  height: '100%',
  width: `${width}px`,
  minWidth: '40px',
  backgroundColor: theme.palette.grey[500],
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

const ScrollResizer: React.FC<CustomScrollbarProps> = ({ parentRef, selector, minScale = 0.5, maxScale = 2, initialScale = 1, setScale, setHorizontalScroll }) => {
  const [scale, setLocalScale] = useState(initialScale);
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
    if (contentRef.current) {
      //contentRef.current.style.transform = `scale(${scale})`;
      setScale(scale);
    }
  }, [scale, contentRef]);

  const handleMouseDownResize = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    setStartX(e.clientX);
    setInitialScaleOnDrag(scale);
  };

  const handleMouseDownDrag = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setStartX(e.clientX);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isResizing) {
      const updateThumbSize = () => {
        if (contentRef.current) {
          const visibleWidth = contentRef.current.clientWidth;
          const totalWidth = contentRef.current.scrollWidth;
          const newThumbWidth = Math.min(visibleWidth, visibleWidth / (totalWidth / visibleWidth));
          console.log('visibleWidth', visibleWidth, 'totalWidth', totalWidth, newThumbWidth);
          setThumbWidth(Math.max(50, newThumbWidth)); // Minimum thumb width is 50px
        }
      };
      const deltaX = e.clientX - startX;
      const scaleChange = deltaX;
      let newScale = initialScaleOnDrag - scaleChange;
      newScale = Math.max(minScale, Math.min(maxScale, newScale));
      setScale(newScale);
      updateThumbSize();
    } else if (isDragging) {
      const deltaX = e.clientX - startX;
      const trackWidth = contentRef.current?.clientWidth || 1;
      const thumbPosition = (scrollThumbPosition / 100);

      const newScrollPosition = Math.max(0, Math.min(100, scrollThumbPosition + (deltaX / trackWidth) * 100));
      console.log('newScrollPosition', newScrollPosition, 'thumbPosition', scrollThumbPosition, 'trackWidth',trackWidth, 'deltaX',deltaX);
      const finalScrollPosition = Math.max(0, Math.min((contentRef.current.clientWidth - thumbWidth) / 100, newScrollPosition));
      setScrollThumbPosition(finalScrollPosition);

      if (contentRef.current) {
        setHorizontalScroll((contentRef.current.scrollWidth - contentRef.current.clientWidth) * (newScrollPosition / 100))
        //contentRef.current.scrollLeft = (contentRef.current.scrollWidth - contentRef.current.clientWidth) * (newScrollPosition / 100);
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
    <ScrollbarContainer>
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
