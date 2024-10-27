import * as React from 'react';
import {FastForward, FastRewind, VolumeDown, VolumeUp, VolumeMute, VolumeOff} from "@mui/icons-material";
import FormControl from '@mui/material/FormControl';
import StopIcon from '@mui/icons-material/Stop';
import SvgIcon from "@mui/material/SvgIcon";
import PauseIcon from '@mui/icons-material/Pause';
import RecordIcon from '@mui/icons-material/FiberManualRecord';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import Select, {SelectChangeEvent} from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import {alpha, emphasize, Theme} from '@mui/material/styles';
import { Slider, Stack, Tooltip } from "@mui/material";
import { namedId } from '@stoked-ui/media-selector';
import {ScreenerBlob, ViewMode, useTimeline, Version } from '@stoked-ui/timeline';
import EditorEngine from '../EditorEngine/EditorEngine';
import {IEditorEngine, ScreenVideoBlob} from '../EditorEngine/EditorEngine.types';
import {createUseThemeProps, styled} from '../internals/zero-styled';
import {ControlState, EditorControlsProps, VideoVersionFromKey} from './EditorControls.types';
import TimelineView from '../icons/TimelineView';

export const Rates = [-3, -2.5, -2.0, -1.5, -1.0, -0.5, -0.2, 0.2, 0.5, 1.0, 1.5, 2.0, 2.5, 3];
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
        strokeWidth: '40px'
      }
    }
  },
  '& button': {
    background: 'unset!important',
    backgroundColor: 'unset!important',
    border: 'unset!important',
    '&:hover': {
      background: 'unset!important',
      backgroundColor: 'unset!important',
      border: 'unset!important',
    }
  }
}))

const ViewButton = styled(ToggleButton)(() => ({
  background: 'unset',
  backgroundColor: 'unset',
}))

const PlayerRoot = styled('div')(({ theme }) => ({
  height: '42px',
  width: '100%',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: emphasize(theme.palette.background.default, 0.2),
}));

const TimeRoot = styled('div')(({ theme }) => ({
  fontSize: '1px',
  fontFamily: "'Roboto Condensed', sans-serif",
  margin: '0 2px',
  padding: '0px 4px',
  width: '120px',
  alignSelf: 'center',
  borderRadius: '12px',
  userSelect: 'none',
  '& #time': {
    border: `1px solid ${alpha(theme.palette.text.primary, .2)}`,
    '&:hover': {
      border: `1px solid ${theme.palette.text.primary}`
    },
  },
  "& .MuiInputBase-input": {
    userSelect: 'none',
    fontSize: 16,
    fontFamily: "monospace",
    fontWeight: 600,
    height: 40,
    padding: '0 4px',
    borderRadius: '12px',
    background: theme.palette.background.default,
    color: `${theme.palette.text.primary}!important`,
    WebkitTextFillColor: 'unset!important',
    textAlign: 'center',
    webkitUserSelect: 'none',
    webkitTouchCallout: 'none',
    mozUserSelect: 'none',
    msUserSelect: 'none',
    alignContent: 'center'
  },
  "& input": {

  },
  minWidth: '120px',
}));

const RateControlRoot = styled(FormControl)({
  justifySelf: 'flex-end',
  alignContent: 'center',
  marginRight: '2px',
});

const RateControlSelect = styled(Select)(({ theme }) => ({
  height: 40,
  background: theme.palette.background.default,
  '& .MuiSelect-select': {
    fontFamily: "'Roboto Condensed', sans-serif",
    fontWeight: 600,
    py: '4px',
    fontSize: 16,
  },
}));

const VersionRoot = styled(FormControl)({
  justifySelf: 'flex-end',
  alignContent: 'center',
  marginRight: '2px',
});

const VersionSelect = styled(Select)(({ theme }) => ({
  height: 40,
  background: theme.palette.background.default,
  '& .MuiSelect-select': {
    fontFamily: "'Roboto Condensed', sans-serif",
    fontWeight: 600,
    py: '4px',
    fontSize: 16,
  },
}));

type ControlProps =  {
  setVideoURLs: React.Dispatch<React.SetStateAction<string[]>>;
  controlState: ControlState;
  setControlState: React.Dispatch<React.SetStateAction<ControlState>>;
  versions: Version[];
  setVersions: React.Dispatch<React.SetStateAction<Version[]>>;
  viewMode: ViewMode;
}

function Controls(inProps: ControlProps) {
  const { engine: engineInput, id } = useTimeline();
  const engine = engineInput as IEditorEngine;
  const controlsInput: string = '';
  const [controls, setControls] = React.useState<string>(controlsInput);

  useThemeProps({ props: inProps, name: 'MuiControls' });
  const { setVideoURLs, controlState, versions, setVersions, viewMode, setControlState } = inProps;
  const [mediaRecorder, setMediaRecorder] = React.useState<MediaRecorder | null>(null);
  const [recordedChunks, setRecordedChunks] = React.useState<Blob[]>([]);
/*

  React.useEffect(() => {
    if (controls === 'play' && controlState === 'paused') {
    } else if (controls === 'record' && controlState === 'paused') {
      // setControlsBase('recording');
    }
  }, [controlState])
*/

  const handlePlay = () => {
    if (!engine.isPlaying) {
      engine.setPlayRate(1);
      engine.play({ autoEnd: true });
    }
  }

  // Start or pause
  const handlePause = () => {
    setControls('');
    if (engine.isPlaying || engine.isRecording) {
      engine.pause();
    }
  };

  const handleRewind = () => {
    const playRate = engine.getPlayRate?.() ?? 1;
    if (playRate > 0 || playRate <= -3) {
      engine.setPlayRate?.(-1);
    } else if (playRate > -3) {
      engine.setPlayRate?.(playRate - .5);
    }
    handlePlay();
  };

  const handleFastForward = () => {
    const playRate = engine.getPlayRate?.() ?? 1;
    if (playRate < 0 || playRate >= 3) {
      engine.setPlayRate?.(1.5);
    } else if (playRate < 3) {
      engine.setPlayRate?.(playRate + .5);
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


  const finalizeVideo = () => {
    if (!engine || !engine?.renderer || !engine?.screener || !engine?.stage) {
      return;
    }
    const blob = new Blob(recordedChunks, {
      type: "video/mp4",
    });

    const dbKey = `${id}|${versions.length + 1}`;
    const version = VideoVersionFromKey(dbKey);
    const created = Date.now();
    const screenerBlob: ScreenerBlob = {
      blob,
      key: dbKey,
      version: version.version,
      name: version.id,
      created,
      size: blob.size,
      id: namedId('screener'),
      lastModified: created
    };
    engine.saveVersion(screenerBlob).then(() => {
      setVersions([...versions, version]);
    });

    const url = ScreenVideoBlob(screenerBlob, engine);
    setVideoURLs((prev) => [url, ...prev]);
    setRecordedChunks([]);
    handlePause();
    setMediaRecorder(null);
  };

  const handleRecord = () => {
    if (engine && engine.renderer) {
      engine.record({ autoEnd: true });

      // Get the video stream from the canvas renderer
      const videoStream = engine.renderer.captureStream();

      // Get the Howler audio stream
      const audioContext = Howler.ctx;
      const destination = audioContext.createMediaStreamDestination();
      Howler.masterGain.connect(destination);
      const audioStream = destination.stream;

      // Get audio tracks from video elements
      const videoElements = document.querySelectorAll('video');
      const videoAudioStreams: MediaStreamTrack[] = [];
      videoElements.forEach((video) => {
        const videoElement = video as HTMLVideoElement & { captureStream?: () => MediaStream };
        console.log('videoElement', videoElement);
        if (videoElement.captureStream) {
          const videoStream = videoElement.captureStream();
          videoStream.getAudioTracks().forEach((track) => {
            videoAudioStreams.push(track);
          });
        }
      });

      // Combine Howler and video audio streams
      const combinedAudioStream = new MediaStream([
        ...audioStream.getAudioTracks(),
        ...videoAudioStreams,
      ]);

      // Combine the video and audio streams
      const combinedStream = new MediaStream([
        ...videoStream.getVideoTracks(),
        ...combinedAudioStream.getAudioTracks(),
      ]);

      // Create the MediaRecorder with the combined stream
      const recorder = new MediaRecorder(combinedStream, {
        mimeType: 'video/mp4',
      });
      setMediaRecorder(recorder);
      setRecordedChunks([]);
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          recordedChunks.push(e.data);
          setRecordedChunks([...recordedChunks]);
        }
      };

      recorder.onstop = () => {
        if (!engine || !engine.screener || !engine.renderer || !engine.stage) {
          console.warn("recording couldn't stop");
          return;
        }
        handlePause();
        finalizeVideo();
      };

      recorder.start(100); // Start recording
    }
  };

  const handleRecordStop = () => {
    if (mediaRecorder) {
      handlePause();
      mediaRecorder.stop();
    }
  };

  React.useEffect(() => {
    engine?.on('paused', () => {
      setControlState('paused')
      setControls('')
    });
    engine.on('ended', () => {});

  }, []);

  React.useEffect(() => {
    if (mediaRecorder && controlState === 'paused') {
      handleRecordStop();
      setControls('');
    }
  }, [controlState]);

  return (
    <div style={{display: 'flex', flexDirection: 'row', marginLeft: '6px', alignContent: 'center', width: '100%'}}>
      <ToggleButtonGroup
        sx={(theme) => ({
          backgroundColor: theme.palette.mode === 'light' ? '#FFF' : '#000',
          '& .MuiButtonBase-root': {
            backgroundColor: 'transparent',
            color: theme.palette.text.primary,
            '&:hover': {
              color: theme.palette.primary.main,
              backgroundColor: theme.palette.background.default,
              border: `1px solid ${theme.palette.text.primary}`,
            },
          }
        })}
        value={controls}
        exclusive
        onChange={(event, changeControls) => {
          if (['start','end', 'rewind', 'fast-forward'].indexOf(changeControls) !== -1) {
            return;
          }
          setControls(changeControls)
        }}
        size={'small'}
        aria-label="text alignment"
      >
        <ToggleButton onClick={handleStart} value="start" aria-label="hidden">
          <SkipPreviousIcon fontSize={'small'}/>
        </ToggleButton>
        <ToggleButton onClick={handleRewind} value="rewind" aria-label="hidden">
          <FastRewind fontSize={'small'}/>
        </ToggleButton>
        <ToggleButton value="play" onClick={() => {
          stateFunc('play', handlePlay, handlePause)
        }}>
          {controlState === 'playing' ? <PauseIcon/> : <PlayArrowIcon/>}
        </ToggleButton>
        <ToggleButton onClick={handleFastForward} value="fast-forward" aria-label="hidden">
          <FastForward fontSize={'small'}/>
        </ToggleButton>
        <ToggleButton onClick={handleEnd} value="end" aria-label="lock">
          <SkipNextIcon/>
        </ToggleButton>
        {
          viewMode === 'Renderer' && <ToggleButton value="record" onClick={() => {
           stateFunc('record', handleRecord, handleRecordStop)
          }}>
            {controlState === 'recording' ? <StopIcon/> : <RecordIcon/>}
          </ToggleButton>
        }
      </ToggleButtonGroup>
    </div>)
}

export function ViewToggle({view, setView}: {view: 'timeline' | 'files', setView: (newView: 'timeline' | 'files') => void }) {
  const selectedColor = (theme: Theme) => theme.palette.mode === 'light' ? '#FFF' : '#000';
  const sxButton = (theme: Theme) => {
    return {
      borderRadius: '0px!important',
      // border: `2px solid ${selectedColor(theme)}!important`,

  }};

  return <ViewGroup
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
      '& MuiButtonBase-root.MuiToggleButtonGroup-grouped.MuiToggleButtonGroup-groupedHorizontal.MuiToggleButton-root.Mui-selectedMuiToggleButton-sizeSmall.MuiToggleButton-standard':{
        // border: `2px solid ${selectedColor(theme)}!important`,
        '&:hover': {
          // border: `2px solid ${alpha(selectedColor(theme), .5)}!important`,
        },
      }
    })}
    value={view}
    exclusive
    onChange={(event, newView) => {
      if (!newView) {
        newView = view === 'timeline' ? 'files' : 'timeline';
      }
      setView(newView)
    }}
    size={'small'}
    aria-label="text alignment"
  >

    {view === 'timeline' &&
     <Tooltip title={"Switch to Files View"}>
       <ViewButton sx={sxButton} value="files" aria-label="lock">
         <SvgIcon  fontSize={'small'}>
           <svg xmlns="http://www.w3.org/2000/svg" viewBox="46.057 64.188 404.091 497.187" width="404.091" height="497.187">
             <path d="M 409.103 64.188 L 197.159 64.188 C 174.513 64.188 156.111 82.603 156.111 105.232 L 156.111 119.2 L 142.132 119.2 C 119.502 119.2 101.068 137.598 101.068 160.243 L 101.068 174.259 L 87.121 174.259 C 64.491 174.259 46.057 192.677 46.057 215.304 L 46.057 520.326 C 46.057 542.955 64.492 561.375 87.121 561.375 L 299.05 561.375 C 321.696 561.375 340.11 542.955 340.11 520.326 L 340.11 506.347 L 354.078 506.347 C 376.708 506.347 395.137 487.93 395.137 465.284 L 395.137 451.323 L 409.105 451.323 C 431.735 451.323 450.148 432.904 450.148 410.274 L 450.148 105.232 C 450.146 82.603 431.733 64.188 409.103 64.188 Z M 307.34 520.326 C 307.34 524.895 303.613 528.604 299.05 528.604 L 87.121 528.604 C 82.554 528.604 78.827 524.895 78.827 520.326 L 78.827 215.303 C 78.827 210.739 82.554 207.028 87.121 207.028 L 299.05 207.028 C 303.614 207.028 307.34 210.739 307.34 215.303 L 307.34 520.326 Z M 362.35 465.284 C 362.35 469.868 358.645 473.579 354.077 473.579 L 340.109 473.579 L 340.109 215.303 C 340.109 192.676 321.696 174.258 299.049 174.258 L 133.837 174.258 L 133.837 160.243 C 133.837 155.659 137.564 151.954 142.132 151.954 L 354.077 151.954 C 358.645 151.954 362.35 155.659 362.35 160.243 L 362.35 465.284 Z M 417.377 410.274 C 417.377 414.841 413.672 418.547 409.104 418.547 L 395.136 418.547 L 395.136 160.243 C 395.136 137.597 376.707 119.2 354.077 119.2 L 188.863 119.2 L 188.863 105.232 C 188.863 100.665 192.59 96.96 197.159 96.96 L 409.103 96.96 C 413.671 96.96 417.376 100.665 417.376 105.232 L 417.376 410.274 L 417.377 410.274 Z M 137.35 292.584 L 222.587 292.584 C 231.629 292.584 238.985 285.25 238.985 276.191 C 238.985 267.14 231.629 259.815 222.587 259.815 L 137.35 259.815 C 128.314 259.815 120.956 267.14 120.956 276.191 C 120.957 285.251 128.314 292.584 137.35 292.584 Z M 248.816 325.393 L 137.35 325.393 C 128.314 325.393 120.956 332.729 120.956 341.784 C 120.956 350.838 128.313 358.163 137.35 358.163 L 248.816 358.163 C 257.874 358.163 265.193 350.838 265.193 341.784 C 265.193 332.729 257.874 325.393 248.816 325.393 Z M 248.816 390.963 L 137.35 390.963 C 128.314 390.963 120.956 398.282 120.956 407.34 C 120.956 416.393 128.313 423.717 137.35 423.717 L 248.81 423.717 C 257.868 423.717 265.187 416.393 265.187 407.34 C 265.193 398.283 257.874 390.963 248.816 390.963 Z M 248.816 456.52 L 137.35 456.52 C 128.314 456.52 120.956 463.838 120.956 472.895 C 120.956 481.949 128.313 489.289 137.35 489.289 L 248.816 489.289 C 257.874 489.289 265.193 481.949 265.193 472.895 C 265.193 463.838 257.874 456.52 248.816 456.52 Z" fill="currentColor"/>
           </svg>
         </SvgIcon>
       </ViewButton>
     </Tooltip>
    }
    {view === 'files' &&
     <Tooltip title={"Switch to Timeline View"} sx={{position: 'absolute'}}>
       <ViewButton sx={sxButton} value="timeline">
         <TimelineView fontSize={'small'}/>
       </ViewButton>
     </Tooltip>
    }

  </ViewGroup>
}

type VersionProps =  {
  versions: Version[];
  setVersions: React.Dispatch<React.SetStateAction<Version[]>>;
  viewMode: ViewMode;
  currentVersion: string | undefined;
  setCurrentVersion: React.Dispatch<React.SetStateAction<string | undefined>>;
}

function Versions ({setVersions, versions, viewMode, currentVersion, setCurrentVersion }: VersionProps) {
  const { id, engine } = useTimeline();
  const handleVersionChange = async (event: SelectChangeEvent<unknown>) => {
    const screenerBlob = await EditorEngine.loadVersion(event.target.value as string)
    engine.screenerBlob = screenerBlob;
    setCurrentVersion(screenerBlob.key);
  }

  React.useEffect(() => {

    engine.getVersionKeys(id)
      .then((idbVersions) => setVersions(idbVersions))
  }, [])

  React.useEffect(() => {
    if (versions.length && engine) {
      const previousVersion = versions[versions.length - 1];
      if (!engine.screenerBlob || engine.screenerBlob.key !== previousVersion.key) {
        EditorEngine.loadVersion(previousVersion.key)
          .then((blob) => {
            engine.screenerBlob = blob
          })
          .catch((err) => {
            console.error(`Error loading previous version: ${previousVersion.id} v${previousVersion.version} - ${err}`)
          })
      }
    }
  }, [versions])

  if (!versions.length || viewMode !== 'Screener') {
    return undefined;
  }
  return  <VersionRoot sx={{minWidth: '200px', marginRight: '6px'}} className="rate-control">
    <VersionSelect
      value={currentVersion}
      onChange={handleVersionChange}
      inputProps={{'aria-label': 'Play Rate'}}
      defaultValue={versions[versions.length - 1].key}
    >
      <MenuItem key={-1} value={-1}>
        <em>Version</em>
      </MenuItem>
      {versions.map((version: Version, index: number) => (<MenuItem key={index} value={version.key}>
        {version.id} v{version.version}
      </MenuItem>))}
    </VersionSelect>
  </VersionRoot>
}

function Volume() {
  const [value, setValue] = React.useState<number>(100);
  const [mute, setMute] = React.useState<boolean>(false);

  const handleChange = (event: Event, newValue: number | number[]) => {
    setValue(newValue as number);
    Howler.volume(newValue as number / 100);
    if (mute) {
      setMute(false);
    }
  };

  const toggleMute = () => {
    Howler.mute(!mute);
    setMute(!mute);
  }

  const getIcon = (isMute: boolean, volume: number) => {
    let icon = <VolumeUp onClick={toggleMute} sx={{ mr: '4px!important' }} />;
    if (isMute) {
      icon = <VolumeOff onClick={toggleMute} sx={{ mr: '4px!important' }} />;
    } else if (volume === 0) {
      icon = <VolumeMute onClick={toggleMute} sx={{ left: '-4px', position: 'relative', mr: '4px!important' }} />;
    } else if (volume < 70) {
      icon = <VolumeDown sx={{ left: '-2px', position: 'relative', mr: '4px!important' }} onClick={toggleMute} />;
    }
    return icon;
  }

  return <Stack spacing={1} direction="row" sx={{
    alignItems: 'center',
    width: '120px',
    mr: 2,
  }}>
    {getIcon(mute, value)}
    <Slider
      aria-label="Volume"
      size="small"
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
          boxShadow: '0px 0px 0px 4px rgba(var(--muidocs-palette-primary-mainChannel) /' +
                     ' 0.16)!important',
        }
      }}
      value={mute ? 0 : value}
      onChange={handleChange}
      min={0}
      max={100}
    />
  </Stack>
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
export const EditorControls = React.forwardRef(
  function EditorControls(inProps : EditorControlsProps, ref: React.Ref<HTMLDivElement>): React.JSX.Element {
  const [controlState, setControlState] = React.useState<ControlState>('paused');
  const { engine: engineInput } = useTimeline();
  const engine: IEditorEngine = engineInput as IEditorEngine;
  const props = useThemeProps({ props: inProps, name: 'MuiEditorControls' });
  const { timeline, switchView = true } = inProps;
  const { view = timeline ? 'timeline' : 'files', setView, versions, setVersions, mode, currentVersion, setCurrentVersion } = props;
  const [time, setTime] = React.useState(0);
  const [videoURLs, setVideoURLs] = React.useState<string[]>([]);

  // Set playback rate
  const handleRateChange = (event: SelectChangeEvent<unknown>) => {
    engine.setPlayRate(event.target.value as number);
  };

  // Time display
  const timeRender = (renderTime: number) => {
    const float = (`${parseInt(`${(renderTime % 1) * 100}`, 10)}`).padStart(2, '0');
    const min = (`${parseInt(`${renderTime / 60}`, 10)}`).padStart(2, '0');
    const second = (`${parseInt(`${renderTime % 60}`, 10)}`).padStart(2, '0');
    return `${min}:${second}.${float.replace('0.', '')}`;
  };

  React.useEffect(() => {
    engine?.on('play', () => setControlState('playing'));
    engine?.on('record', () => setControlState('recording'));
    engine.on('afterSetTime', (afterTimeProps) => setTime(afterTimeProps.time));
    engine.on('setTimeByTick', (setTimeProps) => {
      setTime(setTimeProps.time);

      /* if (autoScroll) {
        const autoScrollFrom = 500;
        const left = setTimeProps.time * (scaleWidth / scale) + startLeft - autoScrollFrom;
        engineRef.current?.setScrollLeft(left);
      } */
    });


    return () => {
      if (engine) {
        engine.pause();
        engine.offAll();
      }
      return undefined;
    };
  }, []);
/*

  const download = () => {
    if (videoURLs) {
      const a = document.createElement("a");
      a.href = videoURLs[0];
      a.download = "recording.webm";
      a.click();
    }
  }
*/
/*

  const hasDownload = () => {
    return (videoURLs?.length || 0) > 0
  }
*/


  const controlProps = { setVideoURLs, setControlState, versions, setVersions, viewMode: mode };

  const showVersions = !!versions && !!currentVersion && !!setCurrentVersion && !!setVersions;
  const versionProps = { versions, setVersions, viewMode: mode, currentVersion, setCurrentVersion };
  return (
    <PlayerRoot id={'timeline-controls'} className="timeline-player" ref={ref}>
      <div style={{display: 'flex', flexDirection: 'row', alignContent: 'center', width: '100%'}}>
        <div style={{display: 'flex', flexDirection: 'row', alignContent: 'center', height: '100%'}}>
          <Controls {...controlProps} controlState={controlState} setControlState={setControlState} versions={versions!} setVersions={setVersions!} />
          {(switchView) && <ViewToggle view={view} setView={setView} />}
        </div>
      </div>
      <div style={{display: 'flex', flexDirection: 'row'}}>
        <Volume/>
        {/* {hasDownload() && <Button onClick={() => download()} variant={'text'}>Download</Button>} */}
        {showVersions && <Versions {...versionProps} setVersions={setVersions!} versions={versions!} setCurrentVersion={setCurrentVersion}/>}
        <TimeRoot
          className="MuiFormControl-root MuiTextField-root css-a9j8fb-MuiFormControl-root-MuiTextField-root">
          <div
            className="MuiInputBase-root MuiOutlinedInput-root MuiInputBase-colorPrimary Mui-disabled MuiInputBase-formControl MuiInputBase-sizeSmall css-qp45lg-MuiInputBase-root-MuiOutlinedInput-root">
            <div aria-invalid="false" id="time"
                   className="MuiInputBase-input MuiOutlinedInput-input Mui-disabled MuiInputBase-inputSizeSmall css-r07wst-MuiInputBase-input-MuiOutlinedInput-input"
                 >
              {timeRender(time)}
            </div>
          </div>
        </TimeRoot>
        <RateControlRoot sx={{minWidth: '80px', marginRight: '6px'}} className="rate-control">
          <RateControlSelect
            value={engine.getPlayRate() ?? 1}
            onChange={handleRateChange}
            displayEmpty
            inputProps={{'aria-label': 'Play Rate'}}
            defaultValue={1}
          >
            <MenuItem key={-1} value={-1}>
              <em>Version</em>
            </MenuItem>
            {Rates.map((rate, index) => (
              <MenuItem key={index} value={rate}>
                {`${rate.toFixed(1)}x`}
              </MenuItem>)
            )}
          </RateControlSelect>
        </RateControlRoot>
      </div>
    </PlayerRoot>);
  });
