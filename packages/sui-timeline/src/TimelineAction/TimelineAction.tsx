/**
 * Represents a styled div component for a single action on the timeline.
 *
 * @param {TimelineActionProps<TrackType, ActionType>} props - The props for the TimelineAction component.
 * @returns {JSX.Element} A React JSX Element representing the TimelineAction component.
 */
function TimelineAction<
  TrackType extends ITimelineTrack = ITimelineTrack,
  ActionType extends ITimelineAction = ITimelineAction,
>(props: TimelineActionProps<TrackType, ActionType>) {
  const context = useTimeline();
  const { state, dispatch } = context;
  const { settings, file, flags, engine, selectedTrack, selectedAction } = state;
  const {
    scaleCount,
    startLeft,
    scale,
    scaleWidth,
    maxScaleCount,
    scaleSplitCount,
    actionHoverId,
    setScaleCount,
    trackHeight,
    editorMode,
    selected: currentSelection,
    videoTrack,
  } = settings;

  const { gridSnap } = flags;
  const disableDrag = flags.disableDrag || engine.isPlaying;
  const { action } = props;
  const { selected, flexible = true, movable = true } = action;
  const actionEl = React.useRef<HTMLDivElement>(null);
  const rowRnd = React.useRef<RowRndApi>();
  const isDragWhenClick = React.useRef(false);
  const { id, maxEnd, minStart, end, start } = action;
  const { track } = props;

  // get the maximum minimum pixel range
  const leftLimit = parserTimeToPixel(minStart || 0, {
    startLeft,
    scale,
    scaleWidth,
  });

  const rightLimit = Math.min(
    maxScaleCount * scaleWidth + startLeft, // 根据maxScaleCount限制移动范围
    parserTimeToPixel(maxEnd || Number.MAX_VALUE, {
      startLeft,
      scale,
      scaleWidth,
    }),
  );

  // initialize action coordinate data
  const [transform, setTransform] = React.useState(() => {
    return parserTimeToTransform({ start, end }, { startLeft, scale, scaleWidth });
  });

  React.useEffect(() => {
    if (track.locked) {
      return;
    }
    setTransform(parserTimeToTransform({ start, end }, { startLeft, scale, scaleWidth }));
  }, [end, start, startLeft, scaleWidth, scale]);

  // configure drag grid and its properties
  const gridSize = scaleWidth / scale;

  // actionName
  const classNames = ['action'];
  if (movable && !track.locked) {
    classNames.push('action-movable');
  }
  if (selectedAction?.id === action.id) {
    classNames.push('action-selected');
  }
  if (flexible) {
    classNames.push('action-flexible');
  }

  // rootProps.className = classNames.join(' ')

  /** calculate scale count */
  const handleScaleCount = (left: number, width: number) => {
    const curScaleCount = getScaleCountByPixel(left + width, {
      startLeft,
      scaleCount,
      scaleWidth,
    });
    if (curScaleCount !== scaleCount) {
      setScaleCount(curScaleCount, context, dispatch);
    }
  };

  const { onActionMoveStart, onActionMoving } = props;
  const handleDragStart: RndDragStartCallback = () => {
    if (track.locked) {
      return;
    }
    if (onActionMoveStart) {
      onActionMoveStart({ action, track });
    }
  };

  const handleDrag: RndDragCallback = ({ left, width }) => {
    if (track.locked) {
      return;
    }
    isDragWhenClick.current = true;

    if (onActionMoving) {
      const { start: dragStart, end: dragEnd } = parserTransformToTime(
        { left, width },
        { scaleWidth, scale, startLeft },
      );
      const result = onActionMoving({ action, track, start: dragStart, end: dragEnd });
      if (result === false) {
        return;
      }
    }
    setTransform({ left, width });
    handleScaleCount(left, width);
  };

  const { onActionMoveEnd } = props;
  const handleDragEnd: RndDragEndCallback = ({ left, width }) => {
    if (track.locked) {
      return;
    }
    // Computation time
    const { start: dragEndStart, end: dragEndEnd } = parserTransformToTime(
      { left, width },
      { scaleWidth, scale, startLeft },
    );

    // setData
    const rowItem = file.tracks.find((item) => item.id === track.id);
    const dragEndAction = rowItem.actions.find((item) => item.id === id);
    dragEndAction.start = dragEndStart;
    dragEndAction.end = dragEndEnd;
    dispatch({ type: 'SET_TRACKS', payload: file.tracks });

    // executeCallback
    if (onActionMoveEnd) {
      onActionMoveEnd({
        action: dragEndAction as ActionType,
        track,
        start: dragEndStart,
        end: dragEndEnd,
      });
    }
  };

  const { onActionResizeStart, onActionResizing, onActionResizeEnd } = props;

  const handleResizeStart: RndResizeStartCallback = (dir) => {
    if (track.locked) {
      return;
    }
    if (onActionResizeStart) {
      onActionResizeStart({ action, track, dir });
    }
  };

  const handleResizing: RndResizeCallback = (dir, { left, width }) => {
    if (track.locked) {
      return;
    }
    isDragWhenClick.current = true;
    if (onActionResizing) {
      const { start: resizingStart, end: resizingEnd } = parserTransformToTime(
        { left, width },
        { scaleWidth, scale, startLeft },
      );
      const result = onActionResizing({
        action,
        track,
        start: resizingStart,
        end: resizingEnd,
        dir,
      });
      if (result === false) {
        return;
      }
    }
    setTransform({ left, width });
    handleScaleCount(left, width);
  };

  const handleResizeEnd: RndResizeEndCallback = (dir, { left, width }) => {
    if (track.locked) {
      return;
    }
    // calculatingTime
    const { start: resizeEndStart, end: resizeEndEnd } = parserTransformToTime(
      { left, width },
      { scaleWidth, scale, startLeft },
    );

    // Set data
    const rowItem = file.tracks.find((item) => item.id === track.id);
    const resizeEndAction = rowItem.actions.find((item) => item.id === id);
    resizeEndAction.start = resizeEndStart;
    resizeEndAction.end = resizeEndEnd;
    dispatch({ type: 'SET_TRACKS', payload: file.tracks });

    // triggerCallback
    if (onActionResizeEnd) {
      onActionResizeEnd({
        action: resizeEndAction as ActionType,
        track,
        start: resizeEndStart,
        end: resizeEndEnd,
        dir,
      });
    }
  };

  const nowAction = {
    ...action,
    ...parserTransformToTime(
      { left: transform.left, width: transform.width },
      { startLeft, scaleWidth, scale },
    ),
  };

  const nowRow: TrackType = {
    ...track,
    actions: [...track.actions],
  };
  if (track.actions.includes(action)) {
    nowRow.actions[track.actions.indexOf(action)] = nowAction;
  }

  const {
    areaRef,
    dragLineData,
    deltaScrollLeft,
    handleTime,
    onClickAction,
    onClickActionOnly,
    onDoubleClickAction,
    onContextMenuAction,
  } = props;

  const [actionStyle, setActionStyle] = React.useState<any | false>(false);
  React.useEffect(() => {
    if (track.file) {
      const newActionStyle = track.file?.actionStyle(
        settings,
        getActionFileTimespan<ITimelineAction>(action),
      );
      if (JSON.stringify(newActionStyle) !== JSON.stringify(actionStyle)) {
        setActionStyle(newActionStyle);
      }
    }
  }, [
    track.file,
    action.trimEnd,
    action.trimStart,
    action.start,
    action.end,
    scaleWidth,
    scale,
    trackHeight,
    track.file?.media.backgroundImage,
  ]);

  const currTrackHeight = getTrackHeight(track, state);
  const [dynamicTrackHeight, setDynamicTrackHeight] = React.useState(currTrackHeight);
  React.useEffect(() => {
    if (dynamicTrackHeight !== currTrackHeight) {
      setDynamicTrackHeight(currTrackHeight);
    }
  }, [currTrackHeight]);

  const [screenshots, setScreenshots] = React.useState<Screenshot[]>([]);
  const [screenshotData, setScreenshotData] = React.useState<{
    start: number;
    end: number;
    scaleWidth: number;
    height: number;
    scale: number;
    screensMissing: boolean;
  }>({ start, end, scaleWidth, height: dynamicTrackHeight, scale, screensMissing: true });

  React.useEffect(() => {
    console.info('screenshot data', screenshotData.start !== start,
      screenshotData.end !== end,
      scaleWidth !== screenshotData.scaleWidth,
      screenshotData.height !== dynamicTrackHeight,
      scale !== screenshotData.scale ,
      screenshotData.screensMissing &&
      track.file?.media?.screenshotStore)
    if (
      screenshotData.start !== start ||
      screenshotData.end !== end ||
      scaleWidth !== screenshotData.scaleWidth ||
      screenshotData.height !== dynamicTrackHeight ||
      scale !== screenshotData.scale ||
      screenshotData.screensMissing
    ) {
      if (track.file?.media && track.file?.media?.screenshotStore) {
        track.file.media.screenshotStore.scaleWidth = scaleWidth;
        track.file.media.screenshotStore.scale = scale;
      }
      track.file?.media?.screenshotStore
        ?.queryScreenshots('track', getActionFileTimespan(action), dynamicTrackHeight)
        .then((queryRes: { found: Screenshot[]; missing: number[] }) => {
          setScreenshotData({
            end,
            start,
            scaleWidth,

             height: dynamicTrackHeight,
            scale,
            screensMissing: queryRes.missing.length > 0,
          });
          setScreenshots(queryRes.found);
        });
    }
  }, [
    end,
    start,
    dynamicTrackHeight,
    scaleWidth,
    scaleSplitCount,
    track.file?.media?.screenshotStore?.count,
  ]);

  const loopCount =
    !!action?.loop && typeof action.loop === 'number' && action.loop > 0 ? action.loop : undefined;

  const locked = (right: boolean) => (
    <Zoom in={track.locked}>
      <LockIcon
        sx={(theme) => ({
          margin: '0 10px',
          color: alpha(`${theme.palette.text.primary}`, 0.65),
          position: 'absolute',
          right: right ? '0' : undefined,
        })}
        fontSize={'small'}
      />
    </Zoom>
  );

  const locks = track.locked ? (
    <React.Fragment>
      {locked(false)}
      {locked(true)}
    </React.Fragment>
  ) : undefined;

  // @ts-ignore
  // @ts-ignore
  return (
    <TimelineTrackDnd
      ref={rowRnd}
      parentRef={areaRef}
      start={startLeft}
      left={transform.left}
      width={transform.width}
      grid={(gridSnap && gridSize) || DEFAULT_MOVE_GRID}
      adsorptionDistance={
        gridSnap
          ? Math.max((gridSize || DEFAULT_MOVE_GRID) / 2, DEFAULT_ADSORPTION_DISTANCE)
          : DEFAULT_ADSORPTION_DISTANCE
      }
      adsorptionPositions={dragLineData.assistPositions}
      bounds={{
        left: leftLimit,
        right: rightLimit,
      }}
      edges={{
        left: !disableDrag && flexible && `.${prefix('action-left-stretch')}`,
        right: !disableDrag && flexible && `.${prefix('action-right-stretch')}`,
      }}
      enableDragging={!disableDrag && movable}
      enableResizing={!disableDrag && flexible}
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      onResizeStart={handleResizeStart}
      onResize={handleResizing}
      onResizeEnd={handleResizeEnd}
      deltaScrollLeft={deltaScrollLeft}
    >
      <Action
        ref={actionEl}
        duration={action?.duration}
        scaleWidth={100 / scaleWidth}
        loop={!!action?.loop}
        loopCount={loopCount}
        disabled={action?.disabled}
        id={action.id}
        tabIndex={0}
        dim={action?.dim}
        trackHeight={trackHeight}
        onKeyDown={(event: any) => {
          event.currentTarget = action;
          // eslint-disable-next-line default-case
          switch (event.key) {
            case 'Backspace':
            case 'Delete': {
              // track.actions = track.actions.filter((trackAction) => trackAction.id !== action.id);
              //const trackIndex = file.tracks.indexOf(track);
              // file.tracks[trackIndex] = { ...track };

              const command = new RemoveActionCommand(file, action.id);
              dispatch({ type: 'EXECUTE_COMMAND', payload: command });

              event.preventDefault();
              break;
            }
          }
        }}
        hover={actionHoverId === action.id ? true : undefined}
        onMouseEnter={(event) => {
          dispatch({
            type: 'SET_SETTING',
            payload: { key: 'actionHoverId', value: action.id },
          });
          event.stopPropagation();
        }}
        onMouseLeave={(event) => {
          dispatch({
            type: 'SET_SETTING',
            payload: { key: 'actionHoverId', value: undefined },
          });
          event.stopPropagation();
        }}
        onMouseDown={() => {
          if (track.locked) {
            return;
          }
          isDragWhenClick.current = false;
        }}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          dispatch({ type: 'SELECT_ACTION', payload: action });
          const time: number = handleTime(e);
          if (onClickAction) {
            onClickAction(e, { track, action, time });
          }
          if (!isDragWhenClick.current && onClickActionOnly) {
            onClickActionOnly(e, { track, action, time });
          }
        }}
        onDoubleClick={(e) => {
          e.stopPropagation();
          if (track.locked) {
            return;
          }
          if (onDoubleClickAction) {
            e.stopPropagation();
            e.preventDefault();
            const time: number = handleTime(e);
            onDoubleClickAction(e, { track, action, time });
          }
        }}
        onContextMenu={(e) => {
          if (track.locked) {
            return;
          }
          if (onContextMenuAction) {
            const time: number = handleTime(e);
            // e.stopPropagation();
            // e.preventDefault();
            // onContextMenuAction(e, { track, action, time });
          }
        }}
        className={prefix((classNames || []).join(' '))}
        selected={action.selected !== undefined ? action.selected : false}
        style={{
          height: trackHeight,
          alignItems: 'center',
          justifyContent: 'space-between',
          ...actionStyle,
        }}
        color={`${TimelineFile.getTrackColor(track)}`}
      >
        <ImageList
          gap={0}
          cols={screenshots?.length}
          sx={{
            overflow: 'hidden',
            height: '100%',
          }}
        >
          {screenshots.map((screen, index) => (
            <ImageListItem key={`key-${index}`}>
              <img
                key={`ss-${screen.timestamp}`}
                src={screen.data}
                alt={`ss-${screen.timestamp}`}
                className={'screen-shot'}
                style={{
                  aspectRatio: track.file.media.screenshotStore?.aspectRatio,
                  objectFit: 'cover',
                  height: '100%',
                  opacity: track.locked ? 0.5 : 0.9,
                  // @ts-ignore
                  WebkitUserDrag: 'none',
                }}
              />
            </ImageListItem>
          ))}
        </ImageList>
        {locks}
        <Fade in={!disableDrag && flexible && !videoTrack}>
          <LeftStretch className={`${prefix('action-left-stretch')}`} />
        </Fade>
        <Fade in={!disableDrag && flexible && !videoTrack}>
          <RightStretch className={`${prefix('action-right-stretch')}`} />
        </Fade>
      </Action>
    </TimelineTrackDnd>
  );
}

TimelineAction.propTypes = {
  action: PropTypes.shape({
    backgroundImage: PropTypes.string,
    backgroundImageStyle: PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.shape({
        backgroundImage: PropTypes.string,
        backgroundPosition: PropTypes.string,
        backgroundSize: PropTypes.string,
      }),
    ]),
    dim: PropTypes.bool,
    disabled: PropTypes.bool,
    duration: PropTypes.number,
    end: PropTypes.number,
    flexible: PropTypes.bool,
    frameSyncId: PropTypes.number,
    freeze: PropTypes.number,
    id: PropTypes.string,
    locked: PropTypes.bool,
    loop: PropTypes.oneOfType([PropTypes.number, PropTypes.bool]),
    maxEnd: PropTypes.number,
    minStart: PropTypes.number,
    movable: PropTypes.bool,
    muted: PropTypes.bool,
    name: PropTypes.string,
    onKeyDown: PropTypes.func,
    playbackRate: PropTypes.number,
    playCount: PropTypes.number,
    selected: PropTypes.bool,
    start: PropTypes.number,
    style: PropTypes.object,
    trimEnd: PropTypes.any,
    trimStart: PropTypes.any,
    volume: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)),
    volumeIndex: PropTypes.number,
  }),
  areaRef: PropTypes.shape({
    current: PropTypes.object,
  }),
  children: PropTypes.node,
  classes: PropTypes.object,
  className: PropTypes.string,
  deltaScrollLeft: PropTypes.func,
  disabled: PropTypes.bool,
  dragLineData: PropTypes.shape({
    assistPositions: PropTypes.arrayOf(PropTypes.number),
    isMoving: PropTypes.bool,
    movePositions: PropTypes.arrayOf(PropTypes.number),
  }),
  flexible: PropTypes.bool,
  handleTime: PropTypes.func,
  locked: PropTypes.bool,
  movable: PropTypes.bool,
  onActionMoveEnd: PropTypes.func,
  onActionMoveStart: PropTypes.func,
  onActionMoving: PropTypes.func,
  onActionResizeEnd: PropTypes.func,
  onActionResizeStart: PropTypes.func,
  onActionResizing: PropTypes.func,
  onClickAction: PropTypes.func,
  onClickActionOnly: PropTypes.func,
  onContextMenuAction: PropTypes.func,
  onDoubleClickAction: PropTypes.func,
  selected: PropTypes.bool