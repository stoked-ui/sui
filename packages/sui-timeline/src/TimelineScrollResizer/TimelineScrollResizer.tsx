import * as React from 'react';
import {alpha, styled} from '@mui/system';
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

const ScrollbarThumb = styled('div')
  <{ width: number, left: number, disabled: boolean }>(({ theme, width, left, disabled }) => ({
  height: '100%',
  width: `${width}px`,
  minWidth: '40px',
  backgroundColor: disabled ? alpha(theme.palette.action.disabled, 0.1) : '#55555599',
  position: 'absolute',
  left: `${left}px`,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  cursor: disabled ? 'not-allowed' :'pointer',
}));

const ResizeHandle = styled('div')<{ disabled: boolean }>(({ theme, disabled }) => ({
  width: '10px',
  height: '100%',
  backgroundColor: disabled ? alpha(theme.palette.action.disabled, 0.1) : theme.palette.grey[700],
  cursor: disabled ? 'not-allowed' :'ew-resize',

  '&:first-of-type': {
    borderRadius: '5px 0 0 5px',
  },

  '&:last-of-type': {
    borderRadius: '0 5px 5px 0',
  },
}));

export default function TimelineScrollResizer({
  elementId,
  type = 'horizontal',
}: TimelineScrollResizerProps) {
  const context = useTimeline();
  const { state: {engine, settings, flags} } = context;
  const { fitScaleData } = settings;
  const { noResizer } = flags;
  const [element, setElement] = React.useState<HTMLElement | null>(null);
  const [isResizingLeft, setIsResizingLeft] = React.useState(false);
  const [isResizingRight, setIsResizingRight] = React.useState(false);
  const [isDragging, setIsDragging] = React.useState(false);
  const [startX, setStartX] = React.useState(0);
  const [scrollThumbPosition, setScrollThumbPosition] = React.useState(0);
  const [startScrollThumbPosition, setStartScrollThumbPosition] = React.useState(null);
  const [thumbWidth, setThumbWidth] = React.useState(50);

  const resizeElement = document.getElementById(elementId);

  React.useEffect(() => {
    if (!element || element.id !== elementId) {
      const el = document.getElementById(elementId);
      setElement(el);
    }
  }, [resizeElement])

  const getBoundaryWidth = () => {
    return engine.maxDuration * settings.scaleWidth;
  }

  const getThumbnailWidth = (totalWidth = getBoundaryWidth()) => {
    if (!element) {
      return thumbWidth;
    }
    const visibleWidth = element?.clientWidth;
    return visibleWidth / (totalWidth / visibleWidth);
  }

  React.useEffect(() => {
    if (!element) {
      return undefined;
    }

    const observer = new ResizeObserver(() => {
      if (!element) {
        return;
      }

      const tWidth = getThumbnailWidth();
      setThumbWidth(tWidth);

    });

    observer.observe(element);

    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, [element]);

  const handleMouseDownResizeRight = (e: React.MouseEvent) => {
    if (!element) {
      return;
    }
    e.preventDefault();
    setIsResizingRight(true);
    setStartX(e.clientX);
  };

  const handleMouseDownResizeLeft = (e: React.MouseEvent) => {
    if (!element) {
      return;
    }
    e.preventDefault();
    setIsResizingLeft(true);
    setStartX(e.clientX);
  };

  const handleMouseDownDrag = (e: React.MouseEvent) => {
    if (!element) {
      return;
    }
    e.preventDefault();
    setIsDragging(true);
    setStartX(e.clientX);
    setStartScrollThumbPosition(scrollThumbPosition);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!element) {
      return;
    }

    if (isResizingLeft || isResizingRight) {
      const updateThumbSize = (newThumbWidth: number) => {
        if (element) {
          setThumbWidth(Math.max(50, newThumbWidth)); // Minimum thumb width is 50px
        }
      };
      const deltaX = (e.clientX - startX);
      fitScaleData(context, element.clientWidth - deltaX);
      updateThumbSize(thumbWidth + deltaX);

    } else if (isDragging) {

      const deltaX = e.clientX - startX;
      const containerWidth = element?.clientWidth;
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
      element.scrollLeft = newScrollLeft;

      console.info('DeltaX:', deltaX, 'ThumbPos:', newPos, 'ScrollLeft:', newScrollLeft);
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

  if (noResizer) {
    return null;
  }

  return (
    <ScrollbarContainer className={'SuiScrollbar'}>
      <ScrollbarTrack>
        <ScrollbarThumb
          width={thumbWidth}
          left={scrollThumbPosition}
          onMouseDown={handleMouseDownDrag}
          disabled={settings.disabled}
        >
          <ResizeHandle onMouseDown={handleMouseDownResizeLeft} disabled={settings.disabled} />
          <ResizeHandle onMouseDown={handleMouseDownResizeRight} disabled={settings.disabled} />
        </ScrollbarThumb>
      </ScrollbarTrack>
    </ScrollbarContainer>
  );
};

