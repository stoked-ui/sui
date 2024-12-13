import * as React from 'react';
import { alpha, styled } from '@mui/system';
import { TimelineScrollResizerProps } from './TimelineScrollResizer.types';
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

const ScrollbarThumb = styled('div')<{ width: number, left: number, disabled: boolean }>(({ theme, width, left, disabled }) => ({
  height: '100%',
  width: `${width}px`,
  minWidth: '40px',
  backgroundColor: disabled ? alpha(theme.palette.action.disabled, 0.1) : '#55555599',
  position: 'absolute',
  left: `${left}px`,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  cursor: disabled ? 'not-allowed' : 'pointer',
}));

const ResizeHandle = styled('div')<{ disabled: boolean }>(({ theme, disabled }) => ({
  width: '10px',
  height: '100%',
  backgroundColor: disabled ? alpha(theme.palette.action.disabled, 0.1) : theme.palette.grey[700],
  cursor: disabled ? 'not-allowed' : 'ew-resize',

  '&:first-of-type': {
    borderRadius: '5px 0 0 5px',
  },

  '&:last-of-type': {
    borderRadius: '0 5px 5px 0',
  },
}));

type MouseState = { dragging: boolean, resizingLeft: boolean, resizingRight: boolean };

const calcBoundaryWidth = (editorId: string, scrollWidth?: number, maxDuration?: number, scaleWidth?: number, scale?: number) => {
  let width: number | undefined = scrollWidth;
  if (!width) {
    const element = document.getElementById(editorId);
    width = element?.scrollWidth;
  }
  if (width && (!maxDuration || !scaleWidth || !scale)) {
    return width;
  }
  return maxDuration * (scaleWidth);
};

export default function TimelineScrollResizer({
  elementRef,
  type = 'horizontal',
}: TimelineScrollResizerProps) {
  const context = useTimeline();
  const { state, dispatch } = context;
  const { engine, settings, flags } = state;
  const { noResizer } = flags;
  const { editorId, scale, scaleWidth, fitScaleData } = settings;

  const getBoundaryWidth = () => {
    return calcBoundaryWidth(editorId, elementRef.current?.scrollWidth, engine?.maxDuration, scaleWidth, scale);
  };

  const [boundaryWidth, setBoundaryWidth] = React.useState(getBoundaryWidth());
  const [mouseState, setMouseState] = React.useState<MouseState>({ resizingRight: false, resizingLeft: false, dragging: false });
  const [startX, setStartX] = React.useState(0);
  const [scrollThumbPosition, setScrollThumbPosition] = React.useState(0);
  const [startScrollThumbPosition, setStartScrollThumbPosition] = React.useState(null);
  const [thumbWidth, setThumbWidth] = React.useState(50);
  const [resizing, setResizing] = React.useState(false); // Track whether resizing is happening
  const thumbRef = React.useRef<HTMLDivElement>(null);
  const leftResizerRef = React.useRef<HTMLDivElement>(null);
  const rightResizerRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    setBoundaryWidth(getBoundaryWidth());
  }, [elementRef.current?.scrollWidth, engine?.maxDuration, scaleWidth, scale]);

  const getThumbnailWidth = (totalWidth = boundaryWidth) => {
    if (!elementRef.current) {
      return thumbWidth;
    }
    const visibleWidth = elementRef.current.clientWidth;
    const thumbWidthRes = visibleWidth / (totalWidth / visibleWidth);
    console.info('getThumbnailWidth', thumbWidthRes, visibleWidth, totalWidth, elementRef.current.clientWidth);
    return thumbWidthRes;
  };

  const updateThumbSize = () => {
    const tWidth = getThumbnailWidth();
    setThumbWidth(tWidth);
  }
  window.updateThumbSize = updateThumbSize;

  React.useEffect(() => {
    if (!elementRef.current || resizing) {
      return undefined; // Don't set thumb width if resizing is active
    }

    const observer = new ResizeObserver(() => {
      // if (!resizing) { // Only resize the thumb if we aren't manually resizing it
        const tWidth = getThumbnailWidth();
        setThumbWidth(tWidth);
        console.info('tWidth', tWidth);
      // }
    });

    observer.observe(elementRef.current);

    return () => {
      observer.disconnect();
    };
  }, [elementRef.current, resizing]);


  const handleMouseResizingMove = (e: MouseEvent) => {
    if (!elementRef.current || !resizing) {
      return
    }

    const deltaX = mouseState.resizingLeft ? e.clientX + startX : e.clientX - startX;
    console.info('handleMouseResizingMove deltaX:', deltaX, e.clientX, startX, e);

    // Handle resizing
    if (mouseState.resizingLeft || mouseState.resizingRight) {
      const newThumbWidth = Math.max(50, thumbWidth + deltaX);
      const newLeftPosition = mouseState.resizingLeft
        ? Math.min(scrollThumbPosition + deltaX, scrollThumbPosition)
        : scrollThumbPosition;
      if (newThumbWidth <= elementRef.current.clientWidth) {
        setThumbWidth(Math.min(elementRef.current.clientWidth, newThumbWidth));
        setScrollThumbPosition(newLeftPosition); // Keep thumb aligned to left during resizing
        dispatch({type: 'SET_SETTING', payload: {key: 'scaleWidth', value: scaleWidth - deltaX}});
      }
    }
  };

  const handleMouseThumbMove = (e: MouseEvent) => {
    if (!elementRef.current) {
      return
    }
    const deltaX = e.clientX - startX;
    const containerWidth = elementRef.current.clientWidth;
    const scrollableWidth = getBoundaryWidth() - containerWidth;

    if (mouseState.dragging) {
      console.info('dragg handleMouseThumbMove deltaX:', deltaX, e.clientX, startX, e);

      const thumbRange = containerWidth - thumbWidth;
      let newPos = scrollThumbPosition + deltaX;

      newPos = Math.max(0, Math.min(newPos, thumbRange));

      const scrollRatio = newPos / thumbRange;
      const newScrollLeft = scrollRatio * scrollableWidth;

      setScrollThumbPosition(newPos);
      console.info('drag', newScrollLeft, elementRef);
      elementRef.current.scrollLeft = newScrollLeft;
    }
  };

  const handleMouseUp = () => {
    console.info('handleMouseUp', settings)
    document.removeEventListener('mousemove', handleMouseResizingMove);
    document.removeEventListener('mousemove', handleMouseThumbMove);
    document.removeEventListener('mouseup', handleMouseUp);
    setMouseState({ dragging: false, resizingRight: false, resizingLeft: false });
    setTimeout(() => {
      setResizing(false); // Reset resizing flag
    }, 200);
  };

  const handleMouseDown = (e: React.MouseEvent, actionType: 'resize' | 'drag') => {
    if (mouseState.dragging || mouseState.resizingLeft || mouseState.resizingRight) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();
    setStartX(e.clientX);

    if (actionType === 'resize') {
      setResizing(true); // Set resizing flag
      console.info('resizing', thumbRef.current, leftResizerRef.current, rightResizerRef.current);
      if (e.target === leftResizerRef.current) {
        console.info('resizing left');
        setMouseState({ ...mouseState, resizingLeft: true });
      } else {
        setMouseState({ ...mouseState, resizingRight: true });
      }
    } else if (actionType === 'drag') {
      setMouseState({ ...mouseState, dragging: true });
      setStartScrollThumbPosition(scrollThumbPosition);
    }
  };


  React.useEffect(() => {
    if (mouseState.resizingLeft || mouseState.resizingRight || mouseState.dragging) {
      if (mouseState.resizingLeft || mouseState.resizingRight) {
        window.addEventListener('mousemove', handleMouseResizingMove);
      } else {
        window.addEventListener('mousemove', handleMouseThumbMove);
      }
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseThumbMove);
      window.removeEventListener('mousemove', handleMouseResizingMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseThumbMove);
      window.removeEventListener('mousemove', handleMouseResizingMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [mouseState]);

  if (noResizer) {
    return null;
  }

  return (
    <ScrollbarContainer className={'SuiScrollbar'}>
      <ScrollbarTrack>
        <ScrollbarThumb
          id={`${type}-scroll-thumb`}
          ref={thumbRef}
          width={thumbWidth}
          left={scrollThumbPosition}
          onMouseDown={(e) => handleMouseDown(e, 'drag')}
          disabled={settings.disabled}
        >
          <ResizeHandle
            id={`${type}-resizer-left`}
            ref={leftResizerRef}
            onMouseDown={(e) => handleMouseDown(e, 'resize')}
            disabled={settings.disabled}
          />
          <ResizeHandle
            id={`${type}-resizer-right`}
            ref={rightResizerRef}
            onMouseDown={(e) => handleMouseDown(e, 'resize')}
            disabled={settings.disabled}
          />
        </ScrollbarThumb>
      </ScrollbarTrack>
    </ScrollbarContainer>
  );
}
