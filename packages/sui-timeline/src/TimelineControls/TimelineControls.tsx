/**
 * React Component representing the Controls for the Timeline.
 *
 * @description Controls component that allows users to play, pause, rewind, fast forward, start, and end the timeline.
 *
 * @param {ControlProps} inProps - The props object containing controls, setControls, versions, and disabled flag.
 *
 * @returns {JSX.Element} React component for the Timeline Controls.
 *
 * @example
 * <Controls controls={['play']} setControls={setControls} versions={versions} disabled={false} />
 *
 * @fires Controls#handlePlay
 * @fires Controls#handlePause
 * @fires Controls#handleRewind
 * @fires Controls#handleFastForward
 * @fires Controls#handleStart
 * @fires Controls#handleEnd
 *
 * @see ViewToggle
 */
function Controls(inProps: ControlProps) {
    const {
      state: { engine },
    } = useTimeline();
    const controlsInput: string = '';
    const [controls, setControls] = React.useState<string>(controlsInput);
  
    useThemeProps({ props: inProps, name: 'MuiControls' });
    const { disabled } = inProps;
  
    const handlePlay = () => {
      if (!engine.isPlaying) {
        engine.setPlayRate(1);
        engine.play({ autoEnd: true });
      }
    };
  
    // Start or pause
    const handlePause = () => {
      setControls('');
      if (engine.isPlaying) {
        engine.pause();
      }
    };
  
    const handleRewind = () => {
      const playRate = engine.getPlayRate?.() ?? 1;
      if (playRate > 0 || playRate <= -3) {
        engine.setPlayRate?.(-1);
      } else if (playRate > -3) {
        engine.setPlayRate?.(playRate - 0.5);
      }
      handlePlay();
    };
  
    const handleFastForward = () => {
      const playRate = engine.getPlayRate?.() ?? 1;
      if (playRate < 0 || playRate >= 3) {
        engine.setPlayRate?.(1.5);
      } else if (playRate < 3) {
        engine.setPlayRate?.(playRate + 0.5);
      }
      handlePlay();
    };
  
    const handleStart = () => {
      engine.setTime(0, true);
      engine.tickAction(0);
      engine.reRender();
    };
  
    const handleEnd = () => {
      engine.setTime(engine.duration, true);
      engine.tickAction(engine.duration);
      engine.reRender();
    };
  
    const stateFunc = (value: string, upFunc: () => void, downFunc: () => void) => {
      if (!controls || controls.indexOf(value) === -1) {
        return upFunc();
      }
      return downFunc();
    };
  
    React.useEffect(() => {
      engine?.on('pause', () => {
        setControls('pause');
      });
      engine.on('ended', () => {});
    }, []);
  
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          marginLeft: '6px',
          alignContent: 'center',
          width: '100%',
        }}
      >
        <ToggleButtonGroupEx
          value={controls}
          exclusive
          onChange={() => {
            // if (['start','end', 'rewind', 'fast-forward'].indexOf(changeControls) !== -1) {
            //   return;
            // }
            // setControls(changeControls)
          }}
          size={'small'}
          aria-label="text alignment"
          disabled={disabled}
        >
          <ToggleButton onClick={handleStart} value="start" aria-label="hidden">
            <SkipPreviousIcon fontSize={'small'} />
          </ToggleButton>
          <ToggleButton onClick={handleRewind} value="rewind" aria-label="hidden">
            <FastRewind fontSize={'small'} />
          </ToggleButton>
          <ToggleButton
            value="play"
            onClick={() => {
              stateFunc('play', handlePlay, handlePause);
            }}
          >
            {controls.includes('play') ? <PauseIcon /> : <PlayArrowIcon />}
          </ToggleButton>
          <ToggleButton onClick={handleFastForward} value="fast-forward" aria-label="hidden">
            <FastForward fontSize={'small'} />
          </ToggleButton>
          <ToggleButton onClick={handleEnd} value="end" aria-label="lock">
            <SkipNextIcon />
          </ToggleButton>
        </ToggleButtonGroupEx>
      </div>
    );
  }
  
  Controls.propTypes = {
    controls: PropTypes.arrayOf(
      PropTypes.oneOf(['fastForward', 'pause', 'play', 'rewind']).isRequired,
    ).isRequired,
    disabled: PropTypes.bool.isRequired,
    setControls: PropTypes.func.isRequired,
    versions: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        key: PropTypes.string.isRequired,
        version: PropTypes.number.isRequired,
      }),
    ).isRequired,
  } as any;