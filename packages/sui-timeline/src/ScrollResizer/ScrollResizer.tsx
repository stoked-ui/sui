import * as React from 'react';
import { styled } from '@mui/system';
import useForkRef from "@mui/utils/useForkRef";
import {ScrollResizerProps} from "./ScrollResizer.types";

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
export interface ScrollResizerState {
  scrollResizerRef: React.MutableRefObject<HTMLDivElement>
}

const ScrollResizer = React.forwardRef(
  function ScrollResizer({
    parentRef,
    selector,
    minScale = 0.5,
    maxScale = 2,
    scale = 1,
    setScale,
    setHorizontalScroll,
    scrollThumbPosition,
    setScrollThumbPosition,
  }: ScrollResizerProps,  ref: React.Ref<HTMLDivElement>,) {

  const [isResizing, setIsResizing] = React.useState(false);
  const [isDragging, setIsDragging] = React.useState(false);
  const [startX, setStartX] = React.useState(0);
  const [initialScaleOnDrag, setInitialScaleOnDrag] = React.useState(scale);
  const [thumbWidth, setThumbWidth] = React.useState(50);
  const contentRef = React.useRef<HTMLElement>(null);

  const localResizerRef = React.useRef<HTMLDivElement>(null);
  const forkedResizerRef = useForkRef(ref, localResizerRef);

    React.useEffect(()=> {
    if (localResizerRef.current) {
      localResizerRef.current.setAttribute('dragging', `${isDragging}`);
    }
  }, [isDragging]);


    React.useEffect(()=> {
      console.log('startX', startX)
    }, [startX]);

    React.useEffect(() => {
    if (parentRef.current) {
      const scrollElement = parentRef.current.querySelector(selector);
      if (scrollElement && scrollElement as HTMLElement !== null) {
        contentRef.current = scrollElement as HTMLElement;
      }
    }
  }, [parentRef]);

    React. useEffect(() => {
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
    } else if (isDragging && contentRef.current) {
      const deltaX = e.clientX - startX;
      const trackWidth = contentRef.current.clientWidth;
      const maxScrollPercent = 100 - (thumbWidth / (trackWidth / 100));
      const maxScrollPosition = trackWidth - thumbWidth;
      const scrollPercentage = (contentRef.current.scrollLeft + deltaX) / (contentRef.current.scrollWidth);
      const scrollbarPosition = scrollPercentage * (contentRef.current.clientWidth);

      const newScrollPosition = Math.max(
        0,
        Math.min(maxScrollPercent, scrollThumbPosition + (deltaX / maxScrollPosition) * 100)
      );

     // console.log(`scrollPercentage: ${scrollPercentage}, deltaX: ${deltaX}, trackWidth:
      // ${trackWidth}, maxScrollPercent: ${maxScrollPercent}, maxScrollPosition: ${maxScrollPosition}, `)
      setScrollThumbPosition(newScrollPosition);

      if (contentRef.current) {
        setHorizontalScroll(scrollPercentage);
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
    <ScrollbarContainer className={'SuiScrollbar'} ref={forkedResizerRef}>
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
});

export default ScrollResizer;
