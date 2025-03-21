import * as React from 'react';
import PropTypes from 'prop-types';
import {
  FastForward,
  FastRewind,
} from '@mui/icons-material';
import FormControl from '@mui/material/FormControl';
import StopIcon from '@mui/icons-material/Stop';
import SvgIcon from '@mui/material/SvgIcon';
import RecordIcon from '@mui/icons-material/FiberManualRecord';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import ToggleButton from '@mui/material/ToggleButton';
import Box from '@mui/material/Box';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { alpha, emphasize, Theme } from '@mui/material/styles';
import { Slider, Stack, Tooltip } from '@mui/material';
import { MediaFile } from '@stoked-ui/media-selector';
import {
  OutputBlob, Version, ToggleButtonGroupEx, FileState, SnapControls, EngineState, PlaybackMode,
} from '@stoked-ui/timeline';
import { VideoSaveRequest, LocalDb } from '@stoked-ui/common';
import { useEditorContext } from '../EditorProvider/EditorContext';
import { IEditorEngine } from '../EditorEngine/EditorEngine.types';
import { createUseThemeProps, styled } from '../internals/zero-styled';
import { EditorControlState, EditorControlsProps } from './EditorControls.types';
import TimelineView from '../icons/TimelineView';
import Volume from './Volume';

export const Rates = [-10, -9.5, -9, -8.5, -8, -7.5, 7, -6.5, -6, -6.5, -6, -5.5, -5, -4.5, -4, -3.5, -3, -2.5, -2.0, -1.5, -1.0, -0.5, -0.2, 0.2, 0.5, 1.0, 1.5, 2.0, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10];
const useThemeProps = createUseThemeProps('MuiEditor');

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

const PlayerRoot = styled('div', {
  shouldForwardProp: (prop) => prop !== 'loading' && prop !== 'viewMode',
})<{ loading: boolean }>(({ theme, loading }) => ({
  width: '100%',
  display: loading ? 'none' : 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  gridArea: 'controls',
  backgroundColor: emphasize(theme.palette.background.default, 0.2),
  justifyContent: 'center',
  "@container (max-width: 674px)": {
    "& .rate-control": {
      display: 'none',
    }
  },
  "@container (max-width: 581px)": {
    height: '84px',
    flexWrap: 'wrap',
    '& .controls-container': {
      justifyContent: 'center'
    }
  },
  "@container (min-width: 582px)": {
    height: '42px',
    flexWrap: 'none',
  }
}));

const TimeRoot = styled(
  'div',
  {},
)<{ disabled: boolean }>(({ theme, disabled }) => {
  let enabledStyle = {};
  if (!disabled) {
    enabledStyle = {
      '&:hover': {
        color: `${theme.palette.primary.main}!important`,
        backgroundColor: theme.palette.background.paper,
        border: `2px solid ${theme.palette.primary[500]}!important`,
      },
    };
  }
  return {
    fontSize: '1px',
    fontFamily: "'Roboto Condensed', sans-serif",
    margin: '0 2px',
    padding: '0px 4px',
    width: '120px!important',
    alignSelf: 'center',
    borderRadius: '12px!important',
    userSelect: 'none',
    '& .MuiInputBase-input': {
      userSelect: 'none',
      boxSizing: 'border-box!important',
      width: '112px!important',
      fontSize: 16,
      fontFamily: 'monospace',
      fontWeight: 600,
      height: '40px!important',
      padding: '0 4px',
      borderRadius: '12px!important',
      background: `${theme.palette.background.paper}!important`,
      WebkitTextFillColor: 'unset!important',
      textAlign: 'center',
      webkitUserSelect: 'none',
      webkitTouchCallout: 'none',
      mozUserSelect: 'none',
      msUserSelect: 'none',
      alignContent: 'center',
      ...enabledStyle,
    },
    minWidth: '120px',
  };
});

const RateControlRoot = styled(FormControl)<{ disabled?: boolean }>(({ theme, disabled }) => {
  let enabledStyled = {};
  if (!disabled) {
    enabledStyled = {
      '& .MuiInputBase-root': {
        backgroundColor: `${theme.palette.background.paper}!important`,
        borderRadius: '12px!important',
      },
      '& .MuiSelect-select': {
        padding: '8px 32px 7px 14px',
      },
      '& fieldset': {
        display: 'none',
      },
      '& .MuiInputBase-root svg': {
        fill: `${theme.palette.text.primary}!important`,
      },
      '&  .MuiInputBase-root:hover fieldset': {
        border: `2px solid ${theme.palette.primary[500]}!important`,
      },
      '&:hover': {
        '& div.MuiSelect-select.MuiSelect-outlined': {
          color: theme.palette.primary[500],
        },
        '& .MuiSelect-select': {
          border: `2px solid ${theme.palette.primary[500]}!important`,
          padding: '8px 32px 7px 13px',
        },
        '& .MuiInputBase-root svg': {
          fill: `${theme.palette.primary[500]}!important`,
        },
      },
    };
  }
  return {
    justifySelf: 'flex-end',
    alignContent: 'center',
    marginRight: '2px',
    ...enabledStyled,
  };
});

const RateControlSelect = styled(Select)<{ disabled?: boolean }>(({ theme, disabled }) => ({
  height: disabled ? 42 : 40,
  background: theme.palette.background.default,
  '& .MuiSelect-select': {
    fontFamily: "'Roboto Condensed', sans-serif",
    fontWeight: 600,
    py: '4px',
    fontSize: 16,
  },
}));

type ControlProps = {
  setVideoURLs: React.Dispatch<React.SetStateAction<string[]>>;
  controls: EditorControlState[];
  setControls: React.Dispatch<React.SetStateAction<EditorControlState[]>>;
  versions: Version[];
  setVersions: React.Dispatch<React.SetStateAction<Version[]>>;
  disabled?: boolean;
};

function Controls(inProps: ControlProps) {
  const { dispatch, state: { app, settings, engine, file} } = useEditorContext();
  const editorEngine = engine as IEditorEngine;
  const controlsInput: string = '';

  useThemeProps({ props: inProps, name: 'MuiControls' });
  const { setVideoURLs, controls, versions, setVersions, setControls } = inProps;
  // const [mediaRecorder, setMediaRecorder] = React.useState<MediaRecorder | null>(null);
  // const [recordedChunks, setRecordedChunks] = React.useState<Blob[]>([]);
const [lastRecording, setLastRecording] = React.useState<Blob | null>(null);
  React.useEffect(() => {
    engine?.on('finishedRecording', ({blob}) => {
        console.info('recording blob', blob)
        setLastRecording(blob);
    });
  }, []);

  React.useEffect(() => {
    if (!lastRecording || !file) {
      return;
    }
    const recording = new MediaFile([lastRecording], `${file.name}.mp4`, { type: 'video/mp4' });

    recording?.extractMetadata().then(()=> {
      if (!file) {
        return;
      }
      console.info('lastRecording', recording)
      dispatch({ type: 'VIDEO_CREATED', payload: recording });
      const videoRequest: VideoSaveRequest = { storeName: app.defaultInputFileType.name, projectName: file.fullName, name: recording.name, duration: recording.media.duration, created: recording.created, blob: lastRecording, version: file.version, size: recording.size };
      LocalDb.saveVideo(videoRequest).catch((error) => {
        console.error('Error saving video', error);
      });
    })
  }, [lastRecording])

  const handlePlay = () => {
    if (!engine.isPlaying) {
      engine.play({autoEnd: true});
    }
  };

  // Start or pause
  const handlePause = () => {
    if (engine.isPlaying || editorEngine.isRecording) {
      engine.pause();
    }
  };

  const handleVariableDelta = (event: React.MouseEvent) => {
    let delta = 1;

    if (event.shiftKey) {
      delta = .5;
    }
    if (event.ctrlKey) {
      delta = 2;
    }
    return delta;
  }

  const handleRewind = (event: React.MouseEvent) => {
    const delta = handleVariableDelta(event);
    engine.rewind(delta);
  }

  const handleFastForward = (event: React.MouseEvent) => {
    const delta = handleVariableDelta(event);
    engine.fastForward(delta);
  }

  const handleStart = () => {
    engine.setStart();
  }

  const handleEnd = () => {
    engine.setEnd();
  }

  const stateFunc = (value: EditorControlState, upFunc: () => void, downFunc: () => void) => {
    if (!controls || controls.indexOf(value) === -1) {
      return upFunc();
    }
    return downFunc();
  };

  const handleRecord = () => {
    if (editorEngine && editorEngine.renderer) {
      editorEngine.record({ autoEnd: true, name: file?.name });
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        marginLeft: '6px',
        alignContent: 'center',
        width: '100%',
        justifyContent: 'center'
      }}
    >
      <ToggleButtonGroupEx
        width={52}
        height={40}
        value={controls}
        exclusive
        onChange={(event, changeControls) => {
          // if (['start', 'end', 'rewind', 'fastForward'].indexOf(changeControls) !== -1) {
          //  return;
          // }
          // console.info('changeControls', changeControls);
          // setControls(changeControls);
        }}
        aria-label="text alignment"
        disabled={settings.disabled}
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
          {controls.includes('play') ? <StopIcon /> : <PlayArrowIcon />}
        </ToggleButton>
        <ToggleButton onClick={handleFastForward} value="fastForward" aria-label="hidden">
          <FastForward fontSize={'small'} />
        </ToggleButton>
        <ToggleButton onClick={handleEnd} value="end" aria-label="lock">
          <SkipNextIcon />
        </ToggleButton>
        {engine.playbackMode === PlaybackMode.CANVAS ? (
          <ToggleButton
            sx={(theme) => ({
              '&.MuiButtonBase-root.MuiToggleButtonGroup-grouped.MuiToggleButtonGroup-groupedHorizontal.MuiToggleButton-root.MuiToggleButton-sizeMedium.MuiToggleButton-standard.MuiToggleButtonGroup-grouped:hover':{
                outline: `0px solid transparent!important`,
                border: '0px solid transparent!important',
                color: 'white',
                background: 'red!important',
                '&:hover': {
                  border: '0px solid transparent!important',
                  outline: '0px solid transparent!important',
                  color: 'white',
                  background: 'red!important',
                  '& svg': {
                    fill: 'white'
                    }
                }
              },
              ...(controls.includes('record') ? {
                '&.MuiButtonBase-root': {
                  color: 'white',
                  background: 'red!important',
                  outline: `0px solid transparent!important`,
                  border: '0px solid transparent!important',
                  '& svg': {
                    fill: 'white'
                  }
                }
              } : {})
            })}
            value="record"
            onClick={() => {
              stateFunc('record', handleRecord, handlePause);
            }}
          >
            <RecordIcon />
          </ToggleButton>
        ) : null}
      </ToggleButtonGroupEx>
    </div>
  );
}

Controls.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  controls: PropTypes.arrayOf(PropTypes.string).isRequired,
  disabled: PropTypes.bool,
  setControls: PropTypes.func.isRequired,
  setVersions: PropTypes.func,
  setVideoURLs: PropTypes.func.isRequired,
  versions: PropTypes.array.isRequired,
} as any;

function ViewToggle() {
  const { state: { flags, settings }, dispatch } = useEditorContext();
  const set = ['timelineView', 'fileView'];

  const handleOptions = (event: React.MouseEvent<HTMLElement>, newOptions: string[]) => {
    dispatch({ type: 'SET_FLAGS', payload: { add: newOptions, remove: [] } });
  };

  React.useEffect(() => {
    dispatch({ type: 'SET_FLAGS', payload: { add: ['timelineView'], remove: [] } });
  }, []);

  const isTimelineView = flags.timelineView;
  let viewFinal;
  if (isTimelineView) {
    viewFinal = (
      <ViewButton value="filesView" aria-label="lock" disabled={settings.disabled}>
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
    );

    if (!settings.disabled) {
      viewFinal = (
        <Tooltip enterDelay={1000} title={'Switch to Files View'}>
          {viewFinal}
        </Tooltip>
      );
    }
  } else {
    viewFinal = (
      <ViewButton value="timelineView">
        <TimelineView fontSize={'small'} />
      </ViewButton>
    );

    if (!settings.disabled) {
      viewFinal = (
        <Tooltip enterDelay={1000} title={'Switch to Timeline View'} sx={{ position: 'absolute' }}>
          {viewFinal}
        </Tooltip>
      );
    }
  }
  const controlFlags: string[] = [];
  if (flags.timelineView) {
    controlFlags.push('timelineView');
  }
  if (flags.filesView) {
    controlFlags.push('fileView');
  }
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
      value={controlFlags}
      exclusive
      onChange={handleOptions}
      size={'small'}
      aria-label="text alignment"
    >
      {viewFinal}
    </ViewGroup>
  );
}

ViewToggle.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  disabled: PropTypes.bool,
} as any;

export { ViewToggle };

/**
 *
 * Demos:
 *
 * - [EditorControls](https://editor.stoked-ui.com/docs/)
 *
 * API:
 *
 * - [EditorControls API](https://editor.stoked-ui.com/api/)
 */


const EditorControls = React.forwardRef(function EditorControls(
  inProps: EditorControlsProps,
  ref: React.Ref<HTMLDivElement>,
): React.JSX.Element {
  const [controls, setControls] = React.useState<EditorControlState[]>(['pause']);
  const { state: { engine, settings, flags, file, getState } } = useEditorContext();
  const props = useThemeProps({ props: inProps, name: 'MuiEditorControls' });

  const { versions, setVersions, currentVersion, setCurrentVersion } = props;
  const [time, setTime] = React.useState(0);
  const [videoURLs, setVideoURLs] = React.useState<string[]>([]);

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

  const containerRef = React.useRef<HTMLElement>();

  const [displayRate, setDisplayRate] = React.useState(true);

/*
  const [disabled, setDisabled] = React.useState(settings.disabled);
  React.useEffect(() => {
    if (settings.disabled !== disabled) {
      setDisabled(settings.disabled);
    }
  }, [settings.disabled]); */

  React.useEffect(() => {
    engine?.on('rewind', () => setControls(['play', 'rewind']));
    engine?.on('fastForward', () => setControls(['play', 'fastForward']));
    engine?.on('play', () => setControls(['play']));
    engine?.on('record', () => setControls(['record', 'play']));
    engine?.on('pause', () => setControls([]));
    engine?.on('afterSetTime', (afterTimeProps) => setTime(afterTimeProps.time));
    engine?.on('setTimeByTick', (setTimeProps) => {
      setTime(setTimeProps.time);
    });

    const editor = document.getElementById(settings.editorId);
    if (editor && editor.parentElement) {
      containerRef.current = editor.parentElement;
    }
    return () => {
      if (engine) {
        engine.pause();
        engine.offAll();
      }
      return undefined;
    };
  }, []);


  React.useEffect(() => {
    const observer = new ResizeObserver(() => {
      if (!containerRef.current) {
        return;
      }
      // const width = baseRef.current?.clientWidth;
      if (containerRef.current?.clientWidth < 616 && displayRate) {
        setDisplayRate(false);
      } else if (containerRef.current?.clientWidth >= 616 && !displayRate) {
        setDisplayRate(true);
      }
    });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, [containerRef?.current])

  const controlProps = { setVideoURLs, controls, setControls, versions, setVersions };

  const showVersions = !!versions && !!currentVersion && !!setCurrentVersion && !!setVersions;
  const versionProps = { versions, setVersions, currentVersion, setCurrentVersion };

  return (
    <PlayerRoot
      id={`controls-${settings?.editorId}`}
      className="timeline-player"
      ref={ref}
      loading={getState && getState() === EngineState.LOADING}
    >
      <div className={'controls-container'} style={{ display: 'flex', flexDirection: 'row', alignContent: 'center', width: '100%' }}>
        <div
          style={{ display: 'flex', flexDirection: 'row', alignContent: 'center', height: '100%' }}
        >
          <Controls
            {...controlProps}
            controls={controls}
            setControls={setControls}
            versions={versions!}
            setVersions={setVersions!}
            disabled={settings.disabled}
          />
        </div>
      </div>
      <Box
        sx={(theme) => ({
          display: 'flex',
          flexDirection: 'row',
        })}
      >
        <Volume disabled={settings.disabled} />
        {/* {hasDownload() && <Button onClick={() => download()} variant={'text'}>Download</Button>} */}
        <TimeRoot
          disabled={!!settings.disabled}
          className={`MuiFormControl-root MuiTextField-root ${settings.disabled ? 'Mui-disabled' : ''}`}
        >
          <div
            style={{ borderRadius: '12px!important' }}
            className={`MuiInputBase-root MuiOutlinedInput-root MuiInputBase-colorPrimary ${settings.disabled ? 'Mui-disabled' : ''} MuiInputBase-formControl MuiInputBase-sizeSmall css-qp45lg-MuiInputBase-root-MuiOutlinedInput-root`}
          >
            <Box
              aria-invalid="false"
              id={`time-${settings && settings.editorId}`}
              sx={(theme) => ({
                color: `${settings.disabled ? theme.palette.text.disabled : theme.palette.text.primary}!important`,
              })}
              className={`MuiInputBase-input MuiOutlinedInput-input ${settings.disabled ? 'Mui-disabled' : ''} MuiInputBase-inputSizeSmall css-r07wst-MuiInputBase-input-MuiOutlinedInput-input`}
            >
              {timeRender(time)}
            </Box>
          </div>
        </TimeRoot>
        <RateControlRoot
          sx={{
            minWidth: '84px',
            marginRight: '6px',
            display: displayRate ? 'flex' : 'none',
          }}
          disabled={settings.disabled}
          className="rate-control"
        >
          <RateControlSelect
            value={engine?.getPlayRate() ?? 1}
            onChange={handleRateChange}
            displayEmpty
            inputProps={{ 'aria-label': 'Play Rate' }}
            defaultValue={1}
            id={`rate-select-${settings?.editorId}`}
            disabled={settings.disabled}
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
      </Box>
    </PlayerRoot>
  );
});

EditorControls.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  /**
   * Override or extend the styles applied to the component.
   */
  classes: PropTypes.object,
  className: PropTypes.string,
  currentVersion: PropTypes.string,
  disabled: PropTypes.bool,
  scale: PropTypes.number,
  scaleWidth: PropTypes.number,
  setCurrentVersion: PropTypes.func,
  setVersions: PropTypes.func,
  /**
   * The props used for each component slot.
   * @default {}
   */
  slotProps: PropTypes.object,
  /**
   * Overridable component slots.
   * @default {}
   */
  slots: PropTypes.object,
  startLeft: PropTypes.number,
  switchView: PropTypes.bool,
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool])),
    PropTypes.func,
    PropTypes.object,
  ]),
  timeline: PropTypes.bool,
  versions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      key: PropTypes.string.isRequired,
      version: PropTypes.number.isRequired,
    }),
  ),
} as any;

export { EditorControls };
