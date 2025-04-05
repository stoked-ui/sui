/**
 * edit area ref data
 */
export interface TimelineTrackAreaState {
  domRef: React.MutableRefObject<HTMLDivElement>;
  tracksRef: React.MutableRefObject<HTMLDivElement>;
}

/**
 * @typedef {Object} TimelineTrackAreaProps
 * @property {number} trackHeight - The height of the track
 * @property {number} scaleWidth - The width of the scale
 * @property {number} startLeft - The starting position from the left
 * @property {number} scale - The scale value
 * @property {number} cursorTime - The time of the cursor
 * @property {Function} getAssistDragLineActionIds - Function to get assist drag line action IDs
 * @property {Function} onActionMoveEnd - Event handler for action move end
 * @property {Function} onActionMoveStart - Event handler for action move start
 * @property {Function} onActionMoving - Event handler for action moving
 * @property {Function} onActionResizeEnd - Event handler for action resize end
 * @property {Function} onActionResizeStart - Event handler for action resize start
 * @property {Function} onActionResizing - Event handler for action resizing
 */
 
const TimelineTrackAreaRoot = styled('div')(() => ({
  flex: '1 1 auto',
  overflow: 'hidden',
  position: 'relative',
  minHeight: 'fit-content',
  '& .ReactVirtualized__Grid': {
    outline: 'none !important',
    overflow: 'overlay !important',
    '&::-webkit-scrollbar': {
      width: 0,
      height: 0,
      display: 'none',
    },
  },
}));

/**
 * @description Component for collapsed timeline track area
 * @param {TimelineTrackAreaProps} props - The props for the component
 * @returns {JSX.Element} React component
 */
const TimelineTrackAreaCollapsed = React.forwardRef<TimelineTrackAreaState, TimelineTrackAreaProps>((props, ref) => {
  const { state: { file, settings, flags } } = useTimeline();
  const { trackHeight, scaleWidth, startLeft, scale, cursorTime } = settings;
  const { dragLine } = flags;

  const { track, actionTrackMap } = TimelineFile.collapsedTrack(file?.tracks);
  const {
    getAssistDragLineActionIds,
    onActionMoveEnd,
    onActionMoveStart,
    onActionMoving,
    onActionResizeEnd,
    onActionResizeStart,
    onActionResizing,
  } = props;
  const {
    dragLineData,
    initDragLine,
    updateDragLine,
    disposeDragLine,
    defaultGetAssistPosition,
    defaultGetMovePosition
  } = useDragLine();
  const editAreaRef = React.useRef<HTMLDivElement>();
  const tracksElementRef = React.useRef<HTMLDivElement>();
  const heightRef = React.useRef(-1);

  /**
   * @param {ITimelineActionHandlers['onActionMoveStart']} data - Data for action move start
   */
  const handleInitDragLine = (data) => {
    if (dragLine) {
      const assistActionIds = getAssistDragLineActionIds && getAssistDragLineActionIds({
        action: data.action, track: data.track, tracks: [track],
      });
      const cursorLeft = parserTimeToPixel(cursorTime, { scaleWidth, scale, startLeft });
      const assistPositions = defaultGetAssistPosition({
        tracks: [track], assistActionIds, action: data.action, track: data.track, cursorLeft,
      });
      initDragLine({ assistPositions });
    }
  };

  /**
   * @param {ITimelineActionHandlers['onActionMoving']} data - Data for action moving
   */
  const handleUpdateDragLine = (data) => {
    if (dragLine) {
      const movePositions = defaultGetMovePosition({
        ...data,
      });
      updateDragLine({ movePositions });
    }
  };

  return (
    <TimelineTrackAreaRoot ref={editAreaRef} className={`SuiTimelineEditArea-root ${prefix('edit-area')}`}>
      <AutoSizer className={'auto-sizer'} style={{ height: 'fit-content' }}>
        {({ width }) => {
          heightRef.current = trackHeight;
          return (
            <TimelineTrack
              {...props}
              style={{
                width,
                height: trackHeight,
                overscrollBehaviorX: 'none',
                backgroundPositionX: `0, ${startLeft}px`,
                backgroundSize: `${startLeft}px, ${scaleWidth}px`,
              }}
              trackRef={tracksElementRef}
              scrollLeft={0}
              actionTrackMap={actionTrackMap}
              areaRef={editAreaRef}
              track={track}
              dragLineData={dragLineData}
              onActionMoveStart={(data) => {
                handleInitDragLine(data);
                return onActionMoveStart && onActionMoveStart(data);
              }}
              onActionResizeStart={(data) => {
                handleInitDragLine(data);
                return onActionResizeStart && onActionResizeStart(data);
              }}
              onActionMoving={(data) => {
                handleUpdateDragLine(data);
                return onActionMoving && onActionMoving(data);
              }}
              onActionResizing={(data) => {
                handleUpdateDragLine(data);
                return onActionResizing && onActionResizing(data);
              }}
              onActionResizeEnd={(data) => {
                disposeDragLine();
                return onActionResizeEnd && onActionResizeEnd(data);
              }}
              onActionMoveEnd={(data) => {
                disposeDragLine();
                return onActionMoveEnd && onActionMoveEnd(data);
              }}
            />
          );
        }}
      </AutoSizer>
      {dragLine && <TimelineTrackAreaDragLines scrollLeft={0} {...dragLineData} />}
    </TimelineTrackAreaRoot>
  );
});

export { TimelineTrackAreaCollapsed };