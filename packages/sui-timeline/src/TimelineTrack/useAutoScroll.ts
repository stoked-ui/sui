/**
 * Custom hook for auto-scroll functionality
 * 
 * @param {React.MutableRefObject<HTMLDivElement>} target - Ref for the target HTML element
 * 
 * @typedef {Object} AutoScrollObject
 * @property {Function} initAutoScroll - Function to initialize auto-scroll
 * @property {Function} dealDragAutoScroll - Function to handle auto-scroll during drag events
 * @property {Function} dealResizeAutoScroll - Function to handle auto-scroll during resize events
 * @property {Function} stopAutoScroll - Function to stop auto-scroll
 * 
 * @returns {AutoScrollObject}
 */
export function useAutoScroll(target) {
  const leftBoundRef = React.useRef(Number.MIN_SAFE_INTEGER);
  const rightBoundRef = React.useRef(Number.MAX_SAFE_INTEGER);

  const speed = React.useRef(DEFAULT_SPEED);
  const frame = React.useRef();

  /**
   * Initializes auto-scroll boundaries based on the target element's position
   */
  const initAutoScroll = () => {
    if (target?.current) {
      const { left, width } = target.current.getBoundingClientRect();
      leftBoundRef.current = left;
      rightBoundRef.current = left + width;
    }
  };

  /**
   * Handles auto-scroll during drag events
   * 
   * @param {DragEvent} e - Drag event object
   * @param {Function} deltaScroll - Callback function to update scroll position
   * 
   * @returns {boolean} Returns true if auto-scroll is not triggered, false otherwise
   */
  const dealDragAutoScroll = (e, deltaScroll) => {
    if (e.clientX >= rightBoundRef.current || e.clientX <= leftBoundRef.current) {
      if (frame.current !== undefined) {
        cancelAnimationFrame(frame.current);
      }
      const over = Math.abs(e.clientX >= rightBoundRef.current ? e.clientX - rightBoundRef.current : e.clientX - leftBoundRef.current);
      speed.current = Math.min(Number((over / CRITICAL_SIZE).toFixed(0)) * DEFAULT_SPEED, MAX_SPEED);

      const dir = e.clientX >= rightBoundRef.current ? 1 : -1;
      const delta = dir * speed.current;
      const loop = () => {
        if (deltaScroll) {
          deltaScroll(delta);
        }
        frame.current = requestAnimationFrame(loop);
      };

      frame.current = requestAnimationFrame(loop);
      return false;
    }
    if (frame.current !== undefined) {
      cancelAnimationFrame(frame.current);
    }

    return true;
  };

  /**
   * Handles auto-scroll during resize events
   * 
   * @param {ResizeEvent} e - Resize event object
   * @param {'left' | 'right'} dir - Direction of resize
   * @param {Function} deltaScroll - Callback function to update scroll position
   * 
   * @returns {boolean} Returns true if auto-scroll is not triggered, false otherwise
   */
  const dealResizeAutoScroll = (e, dir, deltaScroll) => {
    if (e.clientX >= rightBoundRef.current || e.clientX < leftBoundRef.current) {
      if (frame.current !== undefined) {
        cancelAnimationFrame(frame.current);
      }
      const over = Math.abs(e.clientX >= rightBoundRef.current ? e.clientX - rightBoundRef.current : e.clientX - leftBoundRef.current);
      speed.current = Math.min(Number((over / CRITICAL_SIZE).toFixed(0)) * DEFAULT_SPEED, MAX_SPEED);

      const direction = e.clientX >= rightBoundRef.current ? 1 : -1;
      const delta = direction * speed.current;
      const loop = () => {
        if (deltaScroll) {
          deltaScroll(delta);
        }
        frame.current = requestAnimationFrame(loop);
      };

      frame.current = requestAnimationFrame(loop);

      return false;
    }
    if (frame.current !== undefined) {
      cancelAnimationFrame(frame.current);
    }
    return true;
  };

  /**
   * Stops auto-scroll and resets values
   */
  const stopAutoScroll = () => {
    leftBoundRef.current = Number.MIN_SAFE_INTEGER;
    rightBoundRef.current = Number.MAX_SAFE_INTEGER;
    speed.current = DEFAULT_SPEED;
    if (frame.current !== undefined) {
      cancelAnimationFrame(frame.current);
    }
  };

  return {
    initAutoScroll,
    dealDragAutoScroll,
    dealResizeAutoScroll,
    stopAutoScroll,
  };
}