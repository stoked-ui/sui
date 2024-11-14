import * as React from 'react';
import {styled} from '@mui/system';
import {alpha} from "@mui/material/styles";
import {TimelineScrollResizerProps} from './TimelineScrollResizer.types';

const ScrollbarContainer = styled('div')<{ type: 'horizontal' | 'vertical' }>(({ type}) => ({
  width: type === 'horizontal' ? '100%' : '0px',
  height: type === 'vertical' ? '100%' : '0px',
  position: 'relative',
  marginLeft: '7px'
}));

const ScrollbarTrack = styled('div')(() => ({
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
  scrollSync, adjustScale, type,
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
    if (!isResizing && !isDragging && scrollSync?.current?.state.clientWidth) {
      setThumbWidth(scrollSync.current.state.clientWidth - 7)
    }
  }, [scrollSync?.current?.state.clientWidth])

  const getThumbnailWidth = () => {
    const clientPercentOfTotal = scrollSync.current.state.clientWidth / scrollSync.current.state.scrollWidth;
    return scrollSync.current.state.clientWidth * clientPercentOfTotal;
  }

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
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isResizing) {
      const updateThumbSize = () => {
        if (scrollSync.current!.state) {
          setThumbWidth(Math.max(50, getThumbnailWidth())); // Minimum thumb width is 50px
        }
      };
      const deltaX = (e.clientX - startX);
      // let newScale = initialScaleOnDrag + deltaX;
      // newScale = Math.max(minScale, Math.min(maxScale, newScale));
      if (thumbWidth + deltaX > scrollSync.current?.state.clientWidth) {
        return;
      }
      const valid = adjustScale(deltaX);
      // const newWidth = Math.min(thumbWidth + deltaX, scrollSync.current.state.clientWidth);

      // if (valid) {
        updateThumbSize();
      // }

      // const newThumbWidth = getThumbnailWidth(element.current.scrollWidth - deltaX);
      // if (thumbWidth !== newThumbWidth && newThumbWidth <= contentRef.current.clientWidth) {
      //  console.log('newScale', newThumbWidth, contentRef.current.clientWidth, newScale)
      //  setScale(newScale);
      //  updateThumbSize(newThumbWidth);
      // }
    } else if (isDragging) {
      const deltaX = e.clientX - startX;
      const newPos = startScrollThumbPosition + deltaX;
      const adjustedPos = Math.min(Math.max(0, newPos), scrollSync.current.state.clientWidth - thumbWidth);
      setScrollThumbPosition(adjustedPos);
      if (scrollSync.current && deltaX) {
        scrollSync.current.setState({scrollLeft: scrollSync.current.state.scrollLeft + deltaX});
        // setScroll(startScrollThumbPosition + deltaX);
      }
    }
  };

  const handleMouseUp = () => {
    setIsResizing(false);
    setIsDragging(false);
  };

  React.useEffect(() => {
    if (!scrollSync.current) {
      return undefined;
    }
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

  React.useEffect(() => {
    if (scrollSync.current?.state?.clientWidth && scrollSync.current?.state?.scrollWidth) {
      setThumbWidth(getThumbnailWidth());
    }

  }, [scrollSync.current?.state?.scrollWidth, scrollSync.current?.state?.clientWidth]);

  return (<ScrollbarContainer className={'SuiScrollbar'} type={type}>
      <ScrollbarTrack onMouseDown={handleMouseDownDrag}>
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

