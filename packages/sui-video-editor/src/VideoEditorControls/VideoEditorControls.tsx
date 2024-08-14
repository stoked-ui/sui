
import * as React from 'react';
import composeClasses from "@mui/utils/composeClasses";
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import FastRewindIcon from '@mui/icons-material/FastRewind';
import FastForwardIcon from '@mui/icons-material/FastForward';
import IconButton from '@mui/material/IconButton';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { FileBase } from '@stoked-ui/file-explorer';
import { TimelineState } from '@stoked-ui/timeline';
import { styled, createUseThemeProps } from '../internals/zero-styled';

import { VideoEditorControlsProps } from './VideoEditorControls.types';
import { getVideoEditorControlsUtilityClass } from "./videoEditorControlsClasses";

export const Rates = [0.2, 0.5, 1.0, 1.5, 2.0];

const useThemeProps = createUseThemeProps('MuiVideoEditorControls');

const useUtilityClasses = <R extends FileBase, Multiple extends boolean | undefined>(
  ownerState: VideoEditorControlsProps<R, Multiple>,
) => {
  const { classes } = ownerState;

  const slots = {
    root: ['root'],
  };

  return composeClasses(slots, getVideoEditorControlsUtilityClass, classes);
};

const PlayerRoot = styled('div')(({ theme }) => ({
  height: '32px',
  width: '100%',
  padding: '0 10px',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: theme.palette.action.hover,
}));

const IconButtonControlRoot = styled(IconButton)(({ theme }) => ({
  width: '24px',
  height: '24px',
  borderRadius: '4px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
}));

const TimeRoot = styled('div')({
  fontSize: '16px',
  margin: '0 20px',
  width: '70px',
  alignContent: 'center'
})

const RateControlRoot = styled('div')({
  justifySelf: 'flex-end',
  fontSize: '12px',
});

/**
 *
 * Demos:
 *
 * - [VideoEditorControls](https://stoked-ui.github.io/video-editor/docs/)
 *
 * API:
 *
 * - [VideoEditorControls API](https://stoked-ui.github.io/video-editor/api/)
 */
export const VideoEditorControls = React.forwardRef(function VideoEditorControls<
  R extends FileBase = FileBase,
  Multiple extends boolean | undefined = undefined,
>({ scale = 1, scaleWidth = 160, startLeft = 20, ...inProps }: VideoEditorControlsProps<R, Multiple>, ref: React.Ref<HTMLDivElement>): React.JSX.Element {
  const props = useThemeProps({ props: inProps, name: 'MuiVideoEditorControls' });
  const { timelineState, editorData, autoScrollWhenPlay } = inProps;
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [time, setTime] = React.useState(0);
  const test = React.useRef<TimelineState>(null);

  React.useEffect(() => {
    if (!timelineState || !timelineState.current) {
      return undefined;
    }
    const engine = timelineState.current;
    engine.listener?.on('play', () => setIsPlaying(true));
    engine.listener?.on('paused', () => setIsPlaying(false));
    engine.listener?.on('afterSetTime', ({ time }) => setTime(time));
    engine.listener?.on('setTimeByTick', ({ time }) => {
      setTime(time);

      if (autoScrollWhenPlay) {
        const autoScrollFrom = 500;
        const left = time * (scaleWidth / scale) + startLeft - autoScrollFrom;
        timelineState.current?.setScrollLeft(left)
      }
    });

    return () => {
      if (engine) {
        engine.pause();
        engine.listener.offAll();
      }
      return undefined;
    };
  }, []);

  // Start or pause
  const handlePlayOrPause = () => {
    console.log('play', timelineState?.current)
    if (!timelineState || !timelineState.current) {
      return;
    }
    if (timelineState.current.isPlaying) {
      timelineState.current.pause();
    } else {
      timelineState.current.play({ autoEnd: true });
    }
  };

  // Set playback rate
  const handleRateChange = (event: SelectChangeEvent<number>) => {
    if (!timelineState || !timelineState.current) {
      return;
    }
    timelineState.current.setPlayRate(event.target.value as number);
  };

  // Time display
  const timeRender = (renderTime: number) => {
    const float = (`${parseInt(`${(renderTime % 1) * 100}`, 10)}`).padStart(2, '0');
    const min = (`${parseInt(`${renderTime / 60}`, 10)}`).padStart(2, '0');
    const second = (`${parseInt(`${renderTime % 60}`, 10)}`).padStart(2, '0');
    return <React.Fragment>{`${min}:${second}.${float.replace('0.', '')}`}</React.Fragment>;
  };

  const handleStart = () => {
    timelineState?.current?.setTime(0);
  }

  const handleEnd = () => {
    if (editorData) {
      let furthest = 0;
      editorData.forEach((row) => {
        row.actions.forEach((action) => {
          if (action.end > furthest) {
            furthest = action.end;
          }
        })
      });
      console.log('end', furthest)
      timelineState?.current?.setTime(furthest);
    }
  }

  const handleSlowDown = () => {
    const currRate: number = timelineState?.current?.getPlayRate() || 1;
    const rateIndex = Rates.indexOf(currRate);
    if (rateIndex > 0) {
      timelineState?.current?.setPlayRate(Rates[rateIndex - 1]);
    }
  }

  const handleSpeedUp = () => {
    const currRate: number = timelineState?.current?.getPlayRate() ?? 1;
    const rateIndex = Rates.indexOf(currRate);
    if (rateIndex < Rates.length - 1) {
      timelineState?.current?.setPlayRate(Rates[rateIndex + 1]);
    }
  }

  return (
    <PlayerRoot className="timeline-player">
      <div style={{ justifyContent: 'space-between', display: 'flex', flexDirection: 'row', alignContent: 'center', width: '100%'}}>
        <div style={{ display: 'flex', flexDirection: 'row', flexGrow: 1, alignSelf: 'center',  }}>
          <IconButtonControlRoot size={'small'} className="play-control" onClick={handleStart}>
            <SkipPreviousIcon />
          </IconButtonControlRoot>
          {/*
          <IconButtonControlRoot size={'small'} className="play-control" onClick={handleSlowDown}>
            <FastRewindIcon />
          </IconButtonControlRoot>
          */}
          <IconButtonControlRoot size={'small'} className="play-control" onClick={handlePlayOrPause}>
            {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
          </IconButtonControlRoot>
          {/*
          <IconButtonControlRoot size={'small'} className="play-control" onClick={handleSpeedUp}>
             <FastForwardIcon />
          </IconButtonControlRoot>
          */}
          <IconButtonControlRoot size={'small'} className="play-control" onClick={handleEnd}>
            <SkipNextIcon />
          </IconButtonControlRoot>

        </div>
      </div>
      <TimeRoot>{timeRender(time)}</TimeRoot>
      <RateControlRoot className="rate-control">
        <Select
          size="small"
          labelId="speed-label"
          defaultValue={1}
          label="Speed"
          variant="standard"
          onChange={handleRateChange}
          sx={{ height: '28px', fontSize: '12px'}}
          renderValue={(selected) => {

            return selected;
          }}
        >
          {Rates.map((rate) => (
            <MenuItem sx={{ height: '28px', fontSize: '12px'}} key={rate} value={rate}>{`${rate.toFixed(1)}x`}</MenuItem>
          ))}
        </Select>
      </RateControlRoot>
    </PlayerRoot>
  );
});
