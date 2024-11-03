import * as React from 'react';
import {styled} from '@mui/system';
import {alpha, emphasize, Theme} from "@mui/material/styles";
import {TimelineScrollResizerProps} from './TimelineScrollResizer.types';

const ScrollbarContainer = styled('div')(({theme}) => ({
  width: '100%',
  height: '0px',
  // backgroundColor: emphasize(theme.palette.background.default, 0.1),
  position: 'relative',
  marginLeft: '7px'
}));

const ScrollbarTrack = styled('div')(({theme}) => ({
  height: '100%',
  width: '100%',
  // backgroundColor: emphasize(theme.palette.background.default, 0.1),
  position: 'relative',
}));

const ScrollbarThumb = styled('div')<{ width: number; left: number; }>(({width, left, theme}) => ({
  height: '100%',
  width: `${width}px`,
  minWidth: '40px',
  position: 'absolute',
  backgroundColor: alpha(theme.palette.text.primary, 0.3),
  borderRadius: '9px',
  left: `${left}px`,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: alpha(theme.palette.text.primary, 0.4)
  }
}));

const ResizeHandleRoot = styled('div')(({theme}) => ({
  width: '18px',
  height: '18px',
  cursor: 'ew-resize',

  '&:first-of-type': {
    borderRadius: '5px 0 0 5px',
  },

  '&:last-of-type': {
    borderRadius: '0 5px 5px 0',
  },
  '& svg': {
    fill: theme.palette.mode === 'dark' ? '#222' : '#DDD',
    stroke: theme.palette.mode === 'dark' ? '#000' : '#FFF'
  }
}));

function Handle({onMouseDown}) {
  return <ResizeHandleRoot onMouseDown={onMouseDown}>
    <svg width={18}>
    <g strokeWidth="3">
      <circle cx="9" cy="9" r="7"/>
    </g>
    </svg>
  </ResizeHandleRoot>
}

export default function TimelineScrollResizer({
  element, adjustScale, type,
}: TimelineScrollResizerProps) {
  const [isResizing, setIsResizing] = React.useState(false);
  const [isDragging, setIsDragging] = React.useState(false);
  const [startX, setStartX] = React.useState(0);
  const [clientPercentage, setClientPercentage] = React.useState(100);
  const [scrollThumbPosition, setScrollThumbPosition] = React.useState(0);
  const [startScrollThumbPosition, setStartScrollThumbPosition] = React.useState(null);
  const [thumbWidth, setThumbWidth] = React.useState<number>();
  // const contentRef = React.useRef<HTMLElement>(null);

  React.useEffect(() => {
    if (!isResizing && !isDragging && element?.current?.clientWidth) {
      setThumbWidth(element.current.clientWidth - 7)
    }
  }, [element?.current?.clientWidth])

  const getThumbnailWidth = (totalWidth = element.current.scrollWidth) => {
    const visibleWidth = element.current.clientWidth;
    return visibleWidth / (totalWidth / visibleWidth);
  }

  React.useEffect(() => {
    if (!element.current) {
      return undefined;
    }

    const observer = new ResizeObserver(() => {
      if (!element.current) {
        return;
      }

      setClientPercentage(element.current.scrollWidth / element.current.clientWidth)
      const tWidth = getThumbnailWidth();
      setThumbWidth(tWidth);
    });

    observer.observe(element.current!);

    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, [element.current]);

  const handleMouseDownResize = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    setStartX(e.clientX);
  };

  const handleMouseDownDrag = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setStartX(e.clientX );
    setStartScrollThumbPosition(scrollThumbPosition);
    console.log(scrollThumbPosition)
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isResizing) {
      const updateThumbSize = (newThumbWidth: number) => {
        if (element.current) {
          setThumbWidth(Math.max(50, newThumbWidth)); // Minimum thumb width is 50px
        }
      };
      const deltaX = (e.clientX - startX);
      // let newScale = initialScaleOnDrag + deltaX;
      // newScale = Math.max(minScale, Math.min(maxScale, newScale));
      if (thumbWidth + deltaX > element.current.clientWidth) {
        return;
      }
      const valid = adjustScale(deltaX);
      const newWidth = Math.min(thumbWidth + deltaX, element.current.clientWidth);

      updateThumbSize(newWidth);
      // const newThumbWidth = getThumbnailWidth(element.current.scrollWidth - deltaX);
      // if (thumbWidth !== newThumbWidth && newThumbWidth <= contentRef.current.clientWidth) {
      //  console.log('newScale', newThumbWidth, contentRef.current.clientWidth, newScale)
      //  setScale(newScale);
      //  updateThumbSize(newThumbWidth);
      // }
    } else if (isDragging) {
      const deltaX = e.clientX - startX;
      const newPos = startScrollThumbPosition + deltaX;
      const adjustedPos = Math.min(Math.max(0, newPos), element.current.clientWidth - thumbWidth);
      console.log('adjustedPos', adjustedPos)
      setScrollThumbPosition(adjustedPos);
      if (element.current && deltaX) {
        element.current.scrollLeft += deltaX;
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

  return (<ScrollbarContainer className={'SuiScrollbar'}>
      <ScrollbarTrack>
        <ScrollbarThumb
          width={thumbWidth}
          left={scrollThumbPosition}
          onMouseDown={handleMouseDownDrag}
        >
          <Handle onMouseDown={handleMouseDownResize} />
          <Handle onMouseDown={handleMouseDownResize} />
        </ScrollbarThumb>
      </ScrollbarTrack>
    </ScrollbarContainer>);
};

