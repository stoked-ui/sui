/**
 * React component representing a draggable cursor on a timeline.
 * @description This cursor allows users to interact with the timeline by dragging it.
 * @param {object} props - The props object containing event handlers and scroll information.
 * @property {number} props.scrollLeft - Scroll distance from the left.
 * @property {function} props.onCursorDragStart - Cursor drag start event handler.
 * @property {function} props.onCursorDrag - Cursor drag event handler.
 * @property {function} props.onCursorDragEnd - Cursor drag end event handler.
 * @property {object} props.rowRnd - Reference object for scroll synchronization.
 * @returns {JSX.Element} Rendered JSX element of the TimelineCursor component.
 * @fires onCursorDrag
 * @fires onCursorDragEnd
 * @fires onCursorDragStart
 * @example
 * <TimelineCursor
 *   scrollLeft={200}
 *   onCursorDragStart={handleCursorDragStart}
 *   onCursorDrag={handleCursorDrag}
 *   onCursorDragEnd={handleCursorDragEnd}
 *   rowRnd={rowRndRef}
 * />
 */
function TimelineCursor({
  scrollLeft,
  onCursorDragStart,
  onCursorDrag,
  onCursorDragEnd,
}: TimelineCursorProps) {
  const rowRnd = React.useRef<RowRndApi>();
  const cursorRef = React.useRef<HTMLDivElement>();
  const draggingLeft = React.useRef<undefined | number>();
  const context = useTimeline();
  const { state, dispatch } = context;
  const { engine, components, settings, flags, file } = state;
  const {
    cursorTime,
    setCursor,
    startLeft,
    timelineWidth,
    scaleWidth,
    scale,
    maxScaleCount,
  } = settings;
  const scrollSync = components.scrollSync as React.PureComponent & { state: Readonly<any> };

  React.useEffect(() => {
    if (cursorRef.current && !components.cursor) {
      dispatch({ type: 'SET_COMPONENT', payload: { key: 'cursor', value: cursorRef.current } });
    }
  }, [cursorRef.current]);

  React.useEffect(() => {
    if (typeof draggingLeft.current === 'undefined' && rowRnd.current) {
      // When not dragging, update the cursor scale based on the dragging parameters.
      rowRnd.current.updateLeft(
        parserTimeToPixel(cursorTime, { startLeft, scaleWidth, scale }) - scrollLeft,
      );
    }
  }, [cursorTime, startLeft, scaleWidth, scale, scrollLeft]);

  React.useEffect(() => {
    if (flags.detailMode && settings.playbackMode !== 'canvas') {
      setCursor({ time: settings.actionTime }, context);
    }
  }, [settings.actionTime]);

  React.useEffect(() => {
    setCursor({ time: engine.getStartTime() }, context);
  }, []);

  if (!file || !file.tracks || !file.tracks.length) {
    return null;
  }
  return (
    <TimelineTrackDnd
      ref={rowRnd}
      bounds={{
        left: 0,
        right: Math.min(timelineWidth, maxScaleCount * scaleWidth + startLeft - scrollLeft),
      }}
      enableDragging={!engine.isPlaying}
      enableResizing={false}
      onDragStart={() => {
        onCursorDragStart?.(cursorTime);
        draggingLeft.current =
          parserTimeToPixel(cursorTime, { startLeft, scaleWidth, scale }) - scrollLeft;
        rowRnd.current.updateLeft(draggingLeft.current);
      }}
      onDragEnd={() => {
        const time = parserPixelToTime(draggingLeft.current + scrollLeft, {
          startLeft,
          scale,
          scaleWidth,
        });
        setCursor({ time }, context);
        onCursorDragEnd?.(time);
        draggingLeft.current = undefined;
      }}
      onDrag={({ left }, scroll = 0) => {
        const scrollLeftDrag = scrollSync.state.scrollLeft;

        if (!scroll || scrollLeftDrag === 0) {
          if (left < startLeft - scrollLeftDrag) {
            draggingLeft.current = startLeft - scrollLeftDrag;
          } else {
            draggingLeft.current = left;
          }
        } else if (draggingLeft.current < startLeft - scrollLeftDrag - scroll) {
          draggingLeft.current = startLeft - scrollLeftDrag - scroll;
        }
        rowRnd.current.updateLeft(draggingLeft.current);
        const time = parserPixelToTime(draggingLeft.current + scrollLeftDrag, {
          startLeft,
          scale,
          scaleWidth,
        });
        onCursorDrag?.(time);
        setCursor({ time }, context);
        return false;
      }}
    >
      <CursorRoot id={'timeline-cursor'} ref={cursorRef}>
        <CursorTopRoot width="8" height="12" viewBox="0 0 8 12" fill="none">
          <path
            d="M0 1C0 0.447715 0.447715 0 1 0H7C7.55228 0 8 0.447715 8 1V9.38197C8 9.76074 7.786 10.107 7.44721 10.2764L4.44721 11.7764 C4.16569 11.9172 3.83431 11.9172 3.55279 11.7764L0.552786 10.2764C0.214002 10.107 0 9.76074 0 9.38197V1Z"
            fill="#5297FF"
          />
        </CursorTopRoot>
        <CursorAreaRoot className={prefix('cursor-area')} />
      </CursorRoot>
    </TimelineTrackDnd>
  );
}

TimelineCursor.propTypes = {
  draggingLeft: PropTypes.shape({
    current: PropTypes.number,
  }),
  onCursorDrag: PropTypes.func,
  onCursorDragEnd: PropTypes.func,
  onCursorDragStart: PropTypes.func,
  rowRnd: PropTypes.shape({
    current: PropTypes.shape({
      getLeft: PropTypes.func,
      getWidth: PropTypes.func,
      updateLeft: PropTypes.func,
      updateWidth: PropTypes.func,
    }),
  }),
  scrollLeft: PropTypes.number,
} as any;

export default TimelineCursor;
**/