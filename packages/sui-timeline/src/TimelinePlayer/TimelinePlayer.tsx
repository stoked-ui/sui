import * as React from 'react';
import PropTypes from 'prop-types';
import { styled } from '@mui/material/styles';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import IconButton from '@mui/material/IconButton';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { TimelineState } from '../Timeline/TimelineState';
import { TimelineTrack } from '../interface/TimelineAction';

export const Rates = [0.2, 0.5, 1.0, 1.5, 2.0];

const PlayerRoot = styled('div')(() => ({
  height: '32px',
  width: '100%',
  padding: '0 10px',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
}));

const IconButtonControlRoot = styled(IconButton)({
  width: '24px',
  height: '24px',
  borderRadius: '4px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
});

const TimeRoot = styled('div')({
  fontSize: '12px',
  margin: '0 20px',
  width: '70px',
});

const RateControlRoot = styled('div')({
  justifySelf: 'flex-end',
  fontSize: '12px',
});

function TimelinePlayer({
  timelineState,
  tracks,
  autoScrollWhenPlay,
  scale = 1,
  scaleWidth = 160,
  startLeft = 20,
}: {
  timelineState?: React.RefObject<TimelineState>;
  tracks?: TimelineTrack[];
  autoScrollWhenPlay: boolean;
  scale?: number;
  scaleWidth?: number;
  startLeft?: number;
}) {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [time, setTime] = React.useState(0);

  React.useEffect(() => {
    if (!timelineState || !timelineState.current) {
      return undefined;
    }
    const engine = timelineState.current;
    engine.listener?.on('play', () => setIsPlaying(true));
    engine.listener?.on('paused', () => setIsPlaying(false));
    engine.listener?.on('afterSetTime', ({ time: afterSetTime }) => setTime(afterSetTime));
    engine.listener?.on('setTimeByTick', ({ time: setTimeByTickTime }) => {
      setTime(setTimeByTickTime);

      if (autoScrollWhenPlay) {
        const autoScrollFrom = 500;
        const left = setTimeByTickTime * (scaleWidth / scale) + startLeft - autoScrollFrom;
        timelineState.current?.setScrollLeft(left);
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
    const float = `${parseInt(`${(renderTime % 1) * 100}`, 10)}`.padStart(2, '0');
    const min = `${parseInt(`${renderTime / 60}`, 10)}`.padStart(2, '0');
    const second = `${parseInt(`${renderTime % 60}`, 10)}`.padStart(2, '0');
    return <React.Fragment>{`${min}:${second}.${float.replace('0.', '')}`}</React.Fragment>;
  };

  const handleStart = () => {
    timelineState?.current?.setTime(0);
  };

  const handleEnd = () => {
    if (tracks) {
      let furthest = 0;
      tracks.forEach((track) => {
        track.actions.forEach((action) => {
          if (action.end > furthest) {
            furthest = action.end;
          }
        });
      });
      timelineState?.current?.setTime(furthest);
    }
  };

  return (
    <PlayerRoot className="timeline-player">
      <IconButtonControlRoot size={'small'} className="play-control" onClick={handleStart}>
        <SkipPreviousIcon />
      </IconButtonControlRoot>

      <IconButtonControlRoot size={'small'} className="play-control" onClick={handlePlayOrPause}>
        {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
      </IconButtonControlRoot>

      <IconButtonControlRoot size={'small'} className="play-control" onClick={handleEnd}>
        <SkipNextIcon />
      </IconButtonControlRoot>

      <TimeRoot className="time">{timeRender(time)}</TimeRoot>
      <RateControlRoot className="rate-control">
        <Select
          size="small"
          labelId="speed-label"
          defaultValue={1}
          label="Speed"
          variant="standard"
          onChange={handleRateChange}
          sx={{ height: '28px', fontSize: '12px' }}
          renderValue={(selected) => {
            return selected;
          }}
        >
          {Rates.map((rate) => (
            <MenuItem sx={{ height: '28px', fontSize: '12px' }} key={rate} value={rate}>
              {`${rate.toFixed(1)}x`}
            </MenuItem>
          ))}
        </Select>
      </RateControlRoot>
    </PlayerRoot>
  );
}

TimelinePlayer.propTypes = {

};

export default TimelinePlayer;
