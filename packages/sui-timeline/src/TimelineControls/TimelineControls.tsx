import * as React from 'react';
import PropTypes from 'prop-types';
import { Howler } from 'howler';
import {
  FastForward,
  FastRewind,
  VolumeDown,
  VolumeUp,
  VolumeMute,
  VolumeOff,
} from '@mui/icons-material';
import FormControl from '@mui/material/FormControl';
import SvgIcon from '@mui/material/SvgIcon';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { emphasize } from '@mui/material/styles';
import { Slider, Stack, Tooltip } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import styled from '@mui/system/styled';
import { createUseThemeProps } from '@mui/material/zero-styled';
import { Version } from '../Engine/Engine.types';
import { useTimeline } from '../TimelineProvider';
import { TimelineControlsProps } from './TimelineControls.types';
import { ControlState } from '.';
import TimelineView from '../icons/TimelineView';
import ToggleButtonGroupEx from '../components/ToggleButtonGroupEx/ToggleButtonGroupEx';

export const Rates = [-3, -2.5, -2.0, -1.5, -1.0, -0.5, -0.2, 0.2, 0.5, 1.0, 1.5, 2.0, 2.5, 3];
const useThemeProps = createUseThemeProps('MuiTimeline');

const ViewGroup = styled(ToggleButtonGroup)(() => ({
  background: 'unset!important',
  backgroundColor: 'unset!important',
  border: 'unset!important',
  '&:hover': {
    background: 'unset!important',
    backgroundColor: 'unset!important',
    border: 'unset!important',
    '& svg': {
      strokeWidth: '20px',
      '&:hover': {
        strokeWidth: '40px',
      },
    },
  },
  '& button': {
    background: 'unset!important',
    backgroundColor: 'unset!important',
    border: 'unset!important',
    '&:hover': {
      background: 'unset!important',
      backgroundColor: 'unset!important',
      border: 'unset!important',
    },
  },
}));

const ViewButton = styled(ToggleButton)(() => ({
  background: 'unset',
  backgroundColor: 'unset',
}));

const PlayerRoot = styled('div')(({ theme }) => ({
  height: '42px',
  width: '100%',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: emphasize(theme.palette.background.default, 0.2),
}));

const TimeRoot = styled('div')<{ disabled: boolean }>(({ theme }) => ({
  fontSize: '1px',
  fontFamily: "'Roboto Condensed', sans-serif",
  margin: '0 2px',
  padding: '0px 4px',
  width: '120px',
  alignSelf: 'center',
  borderRadius: '12px',
  userSelect: 'none',
  '& .MuiInputBase-input': {
    userSelect: 'none',
    fontSize: 16,
    fontFamily: 'monospace',
    fontWeight: 600,
    height: 40,
    padding: '0 4px',
    borderRadius: '12px',
    border: `1px solid ${theme.palette.text.primary}!important`,
    WebkitTextFillColor: 'unset!important',
    textAlign: 'center',
    webkitUserSelect: 'none',
    webkitTouchCallout: 'none',
    mozUserSelect: 'none',
    msUserSelect: 'none',
    alignContent: 'center',
    '&:hover': {
      color: theme.palette.primary.main,
      backgroundColor: theme.palette.background.default,
      border: `2px solid ${theme.palette.primary[500]}`,
    },
  },
  minWidth: '120px',
  variants: [
    {
      props: {
        disabled: true,
      },
      style: {},
    },
  ],
}));

const RateControlRoot = styled(FormControl)({
  justifySelf: 'flex-end',
  alignContent: 'center',
  marginRight: '2px',
});

const RateControlSelect = styled(Select)(({ theme }) => ({
  height: 40,
  border: '1px solid black',
  background: theme.palette.background.default,
  '& .MuiSelect-select': {
    fontFamily: "'Roboto Condensed', sans-serif",
    fontWeight: 600,
    py: '4px',
    fontSize: 16,
  },
}));

type ControlProps = {
  controls: ControlState[];
  setControls: React.Dispatch<React.SetStateAction<ControlState[]>>;
  versions: Version[];
  disabled?: boolean;
};

function Controls(inProps: ControlProps) {
  const {
    state: { engine },
  } = useTimeline();
  // const editorEngine = engine as IEditorEngine;
  const controlsInput: string = '';
  const [controls, setControls] = React.useState<string>(controlsInput);

  useThemeProps({ props: inProps, name: 'MuiControls' });
  const { disabled } = inProps;
  // const [mediaRecorder, setMediaRecorder] = React.useState<MediaRecorder | null>(null);
  // const [recordedChunks, setRecordedChunks] = React.useState<Blob[]>([]);

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
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
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

function ViewToggle({
  view,
  setView,
  disabled = false,
}: {
  view: 'timeline' | 'files';
  setView: (newView: 'timeline' | 'files') => void;
  disabled?: boolean;
}) {
  const sxButton = () => {
    return {
      borderRadius: '0px!important',
      // border: `2px solid ${selectedColor(theme)}!important`,
    };
  };

  return (
    <ViewGroup
      sx={(theme) => ({
        backgroundColor: theme.palette.text.primary,
        alignItems: 'center',
        margin: '0px 6px',
        '& .MuiButtonBase-root': {
          backgroundColor: 'transparent',
          color: theme.palette.text.primary,
          // border: `2px solid ${selectedColor(theme)}!important`,
          '&:hover': {
            color: theme.palette.primary.main,
            backgroundColor: theme.palette.background.default,
            // border: `2px solid ${alpha(selectedColor(theme), .5)}!important`,
          },
        },
        '& MuiButtonBase-root.MuiToggleButtonGroup-grouped.MuiToggleButtonGroup-groupedHorizontal.MuiToggleButton-root.Mui-selectedMuiToggleButton-sizeSmall.MuiToggleButton-standard':
          {
            // border: `2px solid ${selectedColor(theme)}!important`,
            '&:hover': {
              // border: `2px solid ${alpha(selectedColor(theme), .5)}!important`,
            },
          },
      })}
      value={view}
      exclusive
      onChange={(event, newView) => {
        if (!newView) {
          newView = view === 'timeline' ? 'files' : 'timeline';
        }
        setView(newView);
      }}
      size={'small'}
      aria-label="text alignment"
    >
      {view === 'timeline' && (
        <Tooltip enterDelay={1000} title={'Switch to Files View'}>
          <ViewButton sx={sxButton} value="files" aria-label="lock" disabled={disabled}>
            <SvgIcon fontSize={'small'}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="46.057 64.188 404.091 497.187"
                width="404.091"
                height="497.187"
              >
                <path
                  d="M 409.103 64.188 L 197.159 64.188 C 174.513 64.188 156.111 82.603 156.111 105.232 L 156.111 119.2 L 142.132 119.2 C 119.502 119.2 101.068 137.598 101.068 160.243 L 101.068 174.259 L 87.121 174.259 C 64.491 174.259 46.057 192.677 46.057 215.304 L 46.057 520.326 C 46.057 542.955 64.492 561.375 87.121 561.375 L 299.05 561.375 C 321.696 561.375 340.11 542.955 340.11 520.326 L 340.11 506.347 L 354.078 506.347 C 376.708 506.347 395.137 487.93 395.137 465.284 L 395.137 451.323 L 409.105 451.323 C 431.735 451.323 450.148 432.904 450.148 410.274 L 450.148 105.232 C 450.146 82.603 431.733 64.188 409.103 64.188 Z M 307.34 520.326 C 307.34 524.895 303.613 528.604 299.05 528.604 L 87.121 528.604 C 82.554 528.604 78.827 524.895 78.827 520.326 L 78.827 215.303 C 78.827 210.739 82.554 207.028 87.121 207.028 L 299.05 207.028 C 303.614 207.028 307.34 210.739 307.34 215.303 L 307.34 520.326 Z M 362.35 465.284 C 362.35 469.868 358.645 473.579 354.077 473.579 L 340.109 473.579 L 340.109 215.303 C 340.109 192.676 321.696 174.258 299.049 174.258 L 133.837 174.258 L 133.837 160.243 C 133.837 155.659 137.564 151.954 142.132 151.954 L 354.077 151.954 C 358.645 151.954 362.35 155.659 362.35 160.243 L 362.35 465.284 Z M 417.377 410.274 C 417.377 414.841 413.672 418.547 409.104 418.547 L 395.136 418.547 L 395.136 160.243 C 395.136 137.597 376.707 119.2 354.077 119.2 L 188.863 119.2 L 188.863 105.232 C 188.863 100.665 192.59 96.96 197.159 96.96 L 409.103 96.96 C 413.671 96.96 417.376 100.665 417.376 105.232 L 417.376 410.274 L 417.377 410.274 Z M 137.35 292.584 L 222.587 292.584 C 231.629 292.584 238.985 285.25 238.985 276.191 C 238.985 267.14 231.629 259.815 222.587 259.815 L 137.35 259.815 C 128.314 259.815 120.956 267.14 120.956 276.191 C 120.957 285.251 128.314 292.584 137.35 292.584 Z M 248.816 325.393 L 137.35 325.393 C 128.314 325.393 120.956 332.729 120.956 341.784 C 120.956 350.838 128.313 358.163 137.35 358.163 L 248.816 358.163 C 257.874 358.163 265.193 350.838 265.193 341.784 C 265.193 332.729 257.874 325.393 248.816 325.393 Z M 248.816 390.963 L 137.35 390.963 C 128.314 390.963 120.956 398.282 120.956 407.34 C 120.956 416.393 128.313 423.717 137.35 423.717 L 248.81 423.717 C 257.868 423.717 265.187 416.393 265.187 407.34 C 265.193 398.283 257.874 390.963 248.816 390.963 Z M 248.816 456.52 L 137.35 456.52 C 128.314 456.52 120.956 463.838 120.956 472.895 C 120.956 481.949 128.313 489.289 137.35 489.289 L 248.816 489.289 C 257.874 489.289 265.193 481.949 265.193 472.895 C 265.193 463.838 257.874 456.52 248.816 456.52 Z"
                  fill="currentColor"
                />
              </svg>
            </SvgIcon>
          </ViewButton>
        </Tooltip>
      )}
      {view === 'files' && (
        <Tooltip enterDelay={1000} title={'Switch to Timeline View'} sx={{ position: 'absolute' }}>
          <ViewButton sx={sxButton} value="timeline">
            <TimelineView fontSize={'small'} />
          </ViewButton>
        </Tooltip>
      )}
    </ViewGroup>
  );
}

ViewToggle.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  disabled: PropTypes.bool.isRequired,
  setView: PropTypes.func.isRequired,
  view: PropTypes.oneOf(['files', 'timeline']).isRequired,
} as any;

export { ViewToggle };

function Volume({ disabled }) {
  const [value, setValue] = React.useState<number>(100);
  const [mute, setMute] = React.useState<boolean>(false);

  const handleChange = (event: Event, newValue: number | number[]) => {
    setValue(newValue as number);
    Howler.volume((newValue as number) / 100);
    if (mute) {
      setMute(false);
    }
  };

  const toggleMute = () => {
    Howler.mute(!mute);
    setMute(!mute);
  };

  const cursor = { cursor: 'pointer' };
  const getIcon = (isMute: boolean, volume: number) => {
    let icon = <VolumeUp onClick={toggleMute} sx={{ mr: '4px!important', ...cursor }} />;
    if (isMute) {
      icon = <VolumeOff onClick={toggleMute} sx={{ mr: '4px!important', ...cursor }} />;
    } else if (volume === 0) {
      icon = (
        <VolumeMute
          onClick={toggleMute}
          sx={{ left: '-4px', position: 'relative', mr: '4px!important', ...cursor }}
        />
      );
    } else if (volume < 70) {
      icon = (
        <VolumeDown
          sx={{ left: '-2px', position: 'relative', mr: '4px!important', ...cursor }}
          onClick={toggleMute}
        />
      );
    }
    return icon;
  };

  return (
    <Stack
      spacing={1}
      direction="row"
      sx={{
        alignItems: 'center',
        width: '120px',
        mr: 2,
      }}
    >
      <IconButton>{getIcon(mute, value)}</IconButton>
      <Slider
        aria-label="Volume"
        size="small"
        disabled={disabled}
        sx={{
          '& .MuiSlider-thumb::after': {
            position: 'absolute',
            content: '""',
            borderRadius: '50%', // 42px is the hit target
            width: '10px!important',
            height: '10px!important',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          },
          '& .MuiSlider-thumb:has(> input:focus-visible)': {
            boxShadow:
              '0px 0px 0px 4px rgba(var(--muidocs-palette-primary-mainChannel) /' +
              ' 0.16)!important',
          },
        }}
        value={mute ? 0 : value}
        onChange={handleChange}
        min={0}
        max={100}
      />
    </Stack>
  );
}
/**
 *
 * Demos:
 *
 * - [EditorControls](https://stoked-ui.github.io/editor/docs/)
 *
 * API:
 *
 * - [EditorControls API](https://stoked-ui.github.io/editor/api/)
 */

const TimelineControls = React.forwardRef(function TimelineControls(
  inProps: TimelineControlsProps,
  ref: React.Ref<HTMLDivElement>,
): React.JSX.Element {
  const [controls, setControls] = React.useState<ControlState[]>(['pause']);
  const {
    state: { engine },
  } = useTimeline();
  const props = useThemeProps({ props: inProps, name: 'MuiTimelineControls' });
  const { disabled } = inProps;
  const { versions } = props;
  const [time, setTime] = React.useState(0);

  // Set playback rate
  const handleRateChange = (event: SelectChangeEvent<unknown>) => {
    engine.setPlayRate(event.target.value as number);
  };

  // Time display
  const timeRender = (renderTime: number) => {
    const float = `${parseInt(`${(renderTime % 1) * 100}`, 10)}`.padStart(2, '0');
    const min = `${parseInt(`${renderTime / 60}`, 10)}`.padStart(2, '0');
    const second = `${parseInt(`${renderTime % 60}`, 10)}`.padStart(2, '0');
    return `${min}:${second}.${float.replace('0.', '')}`;
  };

  React.useEffect(() => {
    engine?.on('rewind', () => setControls(['play', 'rewind']));
    engine?.on('fastForward', () => setControls(['play', 'fastForward']));
    engine?.on('play', () => setControls(['play']));
    engine.on('afterSetTime', (afterTimeProps) => setTime(afterTimeProps.time));
    engine.on('setTimeByTick', (setTimeProps) => {
      setTime(setTimeProps.time);
    });

    return () => {
      if (engine) {
        engine.pause();
        engine.offAll();
      }
      return undefined;
    };
  }, []);

  const controlProps = { setControls, versions };

  return (
    <PlayerRoot id={'timeline-controls'} className="timeline-player" ref={ref}>
      <div style={{ display: 'flex', flexDirection: 'row', alignContent: 'center', width: '100%' }}>
        <div
          style={{ display: 'flex', flexDirection: 'row', alignContent: 'center', height: '100%' }}
        >
          <Controls
            {...controlProps}
            controls={controls}
            setControls={setControls}
            versions={versions!}
            disabled={disabled}
          />
          {/* {(switchView) && <ViewToggle view={view} setView={setView} disabled={disabled} /> } */}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <Volume disabled={disabled} />
        {/* {hasDownload() && <Button onClick={() => download()} variant={'text'}>Download</Button>} */}
        <TimeRoot
          disabled={!!disabled}
          className={`MuiFormControl-root MuiTextField-root ${disabled ? 'Mui-disabled' : ''}`}
        >
          <div
            className={`MuiInputBase-root MuiOutlinedInput-root MuiInputBase-colorPrimary ${disabled ? 'Mui-disabled' : ''} MuiInputBase-formControl MuiInputBase-sizeSmall css-qp45lg-MuiInputBase-root-MuiOutlinedInput-root`}
          >
            <Box
              aria-invalid="false"
              id="time"
              sx={(theme) => ({
                color: `${disabled ? theme.palette.text.disabled : theme.palette.text.primary}!important`,
              })}
              className={`MuiInputBase-input MuiOutlinedInput-input ${disabled ? 'Mui-disabled' : ''} MuiInputBase-inputSizeSmall css-r07wst-MuiInputBase-input-MuiOutlinedInput-input`}
            >
              {timeRender(time)}
            </Box>
          </div>
        </TimeRoot>
        <RateControlRoot sx={{ minWidth: '80px', marginRight: '6px' }} className="rate-control">
          <RateControlSelect
            value={engine.getPlayRate() ?? 1}
            onChange={handleRateChange}
            displayEmpty
            inputProps={{ 'aria-label': 'Play Rate' }}
            defaultValue={1}
            disabled={disabled}
          >
            <MenuItem key={-1} value={-1}>
              <em>Rate</em>
            </MenuItem>
            {Rates.map((rate, index) => (
              <MenuItem key={index} value={rate}>
                {`${rate.toFixed(1)}x`}
              </MenuItem>
            ))}
          </RateControlSelect>
        </RateControlRoot>
      </div>
    </PlayerRoot>
  );
});
