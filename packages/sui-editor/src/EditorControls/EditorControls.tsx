import * as React from 'react';
import FormControl from '@mui/material/FormControl';
import StopIcon from '@mui/icons-material/Stop';
import PauseIcon from '@mui/icons-material/Pause';
import RecordIcon from '@mui/icons-material/FiberManualRecord';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import Select, {SelectChangeEvent} from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import {emphasize} from '@mui/material/styles';
import {FileBase} from '@stoked-ui/file-explorer';
import {Button} from "@mui/material";
import {createUseThemeProps, styled} from '../internals/zero-styled';
import {EditorControlsProps} from './EditorControls.types';

export const Rates = [0.2, 0.5, 1.0, 1.5, 2.0];
const useThemeProps = createUseThemeProps('MuiEditor');

/*

const useUtilityClasses = <R extends FileBase, Multiple extends boolean | undefined>(
  ownerState: EditorControlsProps<R, Multiple>,
) => {
  const { classes } = ownerState;

  const slots = {
    root: ['root'],
  };

  return composeClasses(slots, getEditorControlsUtilityClass, classes);
};
*/


const PlayerRoot = styled('div')(({ theme }) => ({
  height: '42px',
  width: '100%',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: emphasize(theme.palette.background.default, 0.2),
}));

const TimeRoot = styled(TextField)(({ theme }) => ({
  fontSize: '1px',
  fontFamily: "'Roboto Condensed', sans-serif",
  margin: '0 2px',
  py: '4px',
  width: '120px',
  alignSelf: 'center',
  borderRadius: '12px',

  "& .MuiInputBase-input": {
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

function Controls(inProps) {
  const controlsInput: string = '';
  const [controls, setControlsBase] = React.useState(controlsInput);

  const props = useThemeProps({ props: inProps, name: 'MuiControls' });
  const { engineRef, setVideoURLs, isPlaying, setIsPlaying } = props;
  const [mediaRecorder, setMediaRecorder] = React.useState<MediaRecorder | null>(null);
  const [recordedChunks, setRecordedChunks] = React.useState<Blob[]>([]);

  const setControls = (toggleValue: string) => {
    if (['end', 'start'].indexOf(toggleValue) === -1) {
      setControlsBase(toggleValue)
    }
  }

  React.useEffect(() => {
    if (controls === 'play' && !isPlaying) {
      setControlsBase('');
    }
  }, [isPlaying])

  const handlePlay = () => {
    if (!engineRef || !engineRef.current) {
      return;
    }
    if (!engineRef.current.isPlaying) {
      engineRef.current.play({ autoEnd: true });
      setIsPlaying(true)
    }
  }

  // Start or pause
  const handlePause = () => {
    if (!engineRef || !engineRef.current) {
      return;
    }
    if (engineRef.current.isPlaying) {
      engineRef.current.pause();
    }
    setIsPlaying(false)
  }

  const handleStart = () => {
    engineRef?.current?.setTime(0, true);
  }

  const handleEnd = () => {
    engineRef?.current?.setTime(engineRef.current?.duration, true);
  }

  const handleStop = () => {
    const engine = engineRef.current?.engine;
    if (engine) {
      engine.pause();
      handleStart();
    }

    if (mediaRecorder) {
      mediaRecorder.stop();
    }
  }

  const stateFunc = (value: string, upFunc: () => void, downFunc: () => void) => {
    if (!controls || controls.indexOf(value) === -1) {
      return upFunc();
    }
    return downFunc();
  }

  const finalizeVideo = () => {
    const engine = engineRef.current;
    if (!engine || !engine?.renderer || !engine?.screener || !engine?.stage) {
      return;
    }
    const blob = new Blob(recordedChunks, {
      type: "video/webm"
    });
    const url = URL.createObjectURL(blob);
    // URL.revokeObjectURL(url);
    engine.screener!.src = url;
    setVideoURLs((prev) => [url, ...prev]);
    setRecordedChunks([]);
    handlePause();
    engine.renderer.style.display = 'none';
    engine.stage.style.display = 'none';
    engine.screener.src = url;
    engine.screener.style.display = 'flex';
    setMediaRecorder(null)
    console.info('recording finalized', url);
  }

  const handleRecord = () => {
    const engine = engineRef.current;
    if (engine && engine.renderer) {
      const stream = engine.renderer.captureStream();
      const recorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9',
      });
      setMediaRecorder(recorder);
      setRecordedChunks([]);
      recorder.ondataavailable = e => {
        if (e.data.size > 0) {
          recordedChunks.push(e.data)
          setRecordedChunks([...recordedChunks])
        }
      };

      recorder.onstop = () => {
        if (!engine || !engine?.screener ||  !engine.renderer ||  !engine.stage) {
          console.warn('recording couldn\'t stop')
          return;
        }
        handlePause();
        console.info('recording stopped');
        finalizeVideo();
      };

      recorder.start(100);
      handlePlay();
    }
  }

  const handleRecordStop = () => {
    const engine = engineRef.current;
    if (mediaRecorder && engine && engine.screener) {
      // recordBtn.textContent = "Record";
      mediaRecorder.stop();
      handlePause();
    }
  }


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
          setControls(changeControls)
        }}
        size={'small'}
        aria-label="text alignment"
      >
        <ToggleButton onClick={handleStart} value="start" aria-label="hidden">
          <SkipPreviousIcon fontSize={'small'}/>
        </ToggleButton>
        <ToggleButton value="play" onClick={() => {
          stateFunc('play', handlePlay, handlePause)
        }}>
          {isPlaying ? <PauseIcon/> : <PlayArrowIcon/>}
        </ToggleButton>
        <ToggleButton onClick={handleEnd} value="end" aria-label="lock">
          <SkipNextIcon/>
        </ToggleButton>
        <ToggleButton value="record" onClick={() => {
          stateFunc('record', handleRecord, handleRecordStop)
        }}>
          <RecordIcon/>
        </ToggleButton>
      </ToggleButtonGroup>
    </div>)
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
export const EditorControls = React.forwardRef(function EditorControls<
  R extends FileBase = FileBase,
  Multiple extends boolean | undefined = undefined,
>({ scale = 1, scaleWidth = 160, startLeft = 20, ...inProps }: EditorControlsProps<R, Multiple>, ref: React.Ref<HTMLDivElement>): React.JSX.Element {

  const props = useThemeProps({ props: inProps, name: 'MuiEditorControls' });
  const { engineRef, autoScroll = true } = props;
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [time, setTime] = React.useState(0);
  const [showRate, setShowRate] = React.useState(true);
  const [videoURLs, setVideoURLs] = React.useState<string[]>([]);

  // Set playback rate
  const handleRateChange = (event: SelectChangeEvent<unknown>) => {
    if (!engineRef || !engineRef.current) {
      return;
    }
    engineRef.current.setPlayRate(event.target.value as number);
  };

  // Time display
  const timeRender = (renderTime: number) => {
    const float = (`${parseInt(`${(renderTime % 1) * 100}`, 10)}`).padStart(2, '0');
    const min = (`${parseInt(`${renderTime / 60}`, 10)}`).padStart(2, '0');
    const second = (`${parseInt(`${renderTime % 60}`, 10)}`).padStart(2, '0');
    return `${min}:${second}.${float.replace('0.', '')}`;
  };

  React.useEffect(() => {
    if (engineRef.current) {
      setShowRate(true);
    }
  }, [engineRef?.current])

  React.useEffect(() => {
    if (!engineRef || !engineRef.current) {
      return undefined;
    }
    const engine = engineRef.current;
    engine?.on('play', () => setIsPlaying(true));
    engine?.on('paused', () => setIsPlaying(false));
    engine.on('afterSetTime', (afterTimeProps) => setTime(afterTimeProps.time));
    engine.on('ended', () => engine.pause());
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

  const download = () => {
    if (videoURLs) {
      const a = document.createElement("a");
      a.href = videoURLs[0];
      a.download = "recording.webm";
      a.click();
    }
  }

  const hasDownload = () => {
    return (videoURLs?.length || 0) > 0
  }

  const controlProps = { engineRef, setVideoURLs, isPlaying, setIsPlaying };
  return (
    <PlayerRoot className="timeline-player" ref={ref}>
      <div style={{display: 'flex', flexDirection: 'row', alignContent: 'center', width: '100%'}}>
        <Controls {...controlProps} />
        {hasDownload() && <Button onClick={() => download()} variant={'text'}>Download</Button>}
      </div>
      <div style={{display: 'flex', flexDirection: 'row'}}>
        <TimeRoot
          variant={'outlined'}
          disabled
          size={'small'}
          helperText={false}
          value={timeRender(time)}
        />
        {showRate && <RateControlRoot sx={{minWidth: '80px', marginRight: '6px'}} className="rate-control">
          <RateControlSelect
            value={engineRef.current?.getPlayRate() ?? 1}
            onChange={handleRateChange}
            displayEmpty
            inputProps={{'aria-label': 'Play Rate'}}
            defaultValue={1}
          >
            <MenuItem key={-1} value={-1}>
              <em>Rate</em>
            </MenuItem>
            {Rates.map((rate, index) => (<MenuItem key={index} value={rate}>
                {`${rate.toFixed(1)}x`}
              </MenuItem>))}
          </RateControlSelect>
        </RateControlRoot>}
      </div>
    </PlayerRoot>);
});
