/**
 * React component for resizing the timeline scroll area.
 * @param {TimelineScrollResizerProps} props - The props for the TimelineScrollResizer component.
 * @returns {JSX.Element} The rendered TimelineScrollResizer component.
 */
export default function TimelineScrollResizer({
  elementRef,
  type = 'horizontal',
}: TimelineScrollResizerProps) {
  const [mouseState, setMouseState] = React.useState<MouseState>({ resizingRight: false, resizingLeft: false, dragging: false });
  const [startX, setStartX] = React.useState(0);
  const [scrollThumbPosition, setScrollThumbPosition] = React.useState(0);
  const thumbRef = React.useRef<HTMLDivElement>(null);
  const leftResizerRef = React.useRef<HTMLDivElement>(null);
  const rightResizerRef = React.useRef<HTMLDivElement>(null);
  const [thumbWidth, setThumbWidth] = React.useState(50);
  const [resizing, setResizing] = React.useState(false); // Track whether resizing is happening

  /**
   * Calculates the boundary width based on provided parameters.
   * @param {string} editorId - The id of the editor element.
   * @param {number} scrollWidth - The width of the scroll area.
   * @param {number} maxDuration - The maximum duration.
   * @param {number} scaleWidth - The width of the scale.
   * @param {number} scale - The scale value.
   * @returns {number} The calculated boundary width.
   */
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

  /**
   * Retrieves the boundary width based on the editor id and settings.
   * @returns {number} The boundary width.
   */
  const getBoundaryWidth = () => {
    return calcBoundaryWidth(editorId, elementRef.current?.scrollWidth, engine?.maxDuration, scaleWidth, scale);
  };

  /**
   * Retrieves the thumbnail width based on the total width.
   * @param {number} totalWidth - The total width for calculation.
   * @returns {number} The calculated thumbnail width.
   */
  const getThumbnailWidth = (totalWidth = boundaryWidth) => {
    if (!elementRef.current) {
      return thumbWidth;
    }
    const visibleWidth = elementRef.current.clientWidth;
    const thumbWidthRes = visibleWidth / (totalWidth / visibleWidth);
    console.info('getThumbnailWidth', thumbWidthRes, visibleWidth, totalWidth, elementRef.current.clientWidth);
    return thumbWidthRes;
  };

  /**
   * Updates the thumb size based on the calculated width.
   */
  const updateThumbSize = () => {
    const tWidth = getThumbnailWidth();
    setThumbWidth(tWidth);
  };
  window.updateThumbSize = updateThumbSize;

  /**
   * Handles the mouse movement during resizing.
   * @param {MouseEvent} e - The mouse event.
   */
  const handleMouseResizingMove = (e: MouseEvent) => {
    if (!elementRef.current || !resizing) {
      return;
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
        dispatch({ type: 'SET_SETTING', payload: { key: 'scaleWidth', value: scaleWidth - deltaX } });
      }
    }
  };

  /**
   * Handles the mouse movement for dragging the thumb.
   * @param {MouseEvent} e - The mouse event.
   */
  const handleMouseThumbMove = (e: MouseEvent) => {
    if (!elementRef.current) {
      return;
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

  /**
   * Handles the mouse up event.
   */
  const handleMouseUp = () => {
    console.info('handleMouseUp', settings);
    document.removeEventListener('mousemove', handleMouseResizingMove);
    document.removeEventListener('mousemove', handleMouseThumbMove);
    document.removeEventListener('mouseup', handleMouseUp);
    setMouseState({ dragging: false, resizingRight: false, resizingLeft: false });
    setTimeout(() => {
      setResizing(false); // Reset resizing flag
    }, 200);
  };

  /**
   * Handles the mouse down event for resizing or dragging.
   * @param {React.MouseEvent} e - The mouse event.
   * @param {'resize' | 'drag'} actionType - The type of action (resize or drag).
   */
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
*/