import * as React from 'react';
import PropTypes from 'prop-types';
import { styled } from '@mui/material/styles';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import FastRewindIcon from '@mui/icons-material/FastRewind';
import FastForwardIcon from '@mui/icons-material/FastForward';
import IconButton from '@mui/material/IconButton';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { TimelineState } from '../Timeline/TimelineState';
import { TimelineTrack } from '../interface/TimelineAction';

export const Rates = [0.2, 0.5, 1.0, 1.5, 2.0];

const PlayerRoot = styled('div')(({ theme }) => ({
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
  const handleSlowDown = () => {
    const currRate = timelineState?.current?.getPlayRate();
    const rateIndex = Rates.indexOf(currRate);
    if (rateIndex > 0) {
      timelineState?.current?.setPlayRate(Rates[rateIndex - 1]);
    }
  };
  const handleSpeedUp = () => {
    const currRate = timelineState?.current?.getPlayRate();
    const rateIndex = Rates.indexOf(currRate);
    if (rateIndex < Rates.length - 1) {
      timelineState?.current?.setPlayRate(Rates[rateIndex + 1]);
    }
  };
  return (
    <PlayerRoot className="timeline-player">
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

/*
import * as React from 'react';

import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import Button from '@mui/material/Button';
import { styled }  from '@mui/system';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';

import { TimelineState } from '../Timeline/TimelineState';

export const Rates = [0.2, 0.5, 1.0, 1.5, 2.0];

const PlayerRoot = styled('div')(({ theme }) => ({
  height: '32px',
  width: '100%',
  padding: '0 10px',
  display: 'flex',
  flexDirection: 'track',
  alignItems: 'center',
  backgroundColor: theme.palette.action.hover,
}));

const PlayerControlRoot = styled(Button)(({ theme }) => ({
  width: '24px',
  height: '24px',
  borderRadius: '4px',
  display: 'flex',
  backgroundColor: theme.palette.background.default,
  justifyContent: 'center',
  alignItems: 'center',
}));

const TimeRoot = styled('div')({
  fontSize: '12px',
  margin: '0 20px',
  width: '70px',
})

const RateControlRoot = styled('div')({
  justifySelf: 'flex-end',
  fontSize: '12px',
});


/!*
.timeline-player {
    .rate-control {
      justify-self: flex-end;

      .ant-select {
        width: 90px !important;

        .ant-select-selector {
          border: none;
          box-shadow: none !important;
          background-color: transparent;
          color: #ddd;

          .ant-select-selection-item {
            font-size: 12px;
            display: flex;
            justify-content: center;
          }
        }

        &-arrow {
          color: #ddd;
        }

      }
    }
  }
 *!/

function PlayControl({ state, isPlaying }: { state?: TimelineState, isPlaying: boolean}) {
  // Start or pause
  const handlePlayOrPause = () => {
    console.log('play or pause')
    if (!state) {
      return;
    }
    if (state.isPlaying) {
      state.pause();
    } else {
      state.play({ autoEnd: true });
    }
  };

  return (
    <PlayerControlRoot className="play-control" onClick={handlePlayOrPause}>
      {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
    </PlayerControlRoot>
  )
}

function Time ({ time }: { time: number }) {
  // Time display
  const float = (`${parseInt(`${(time % 1) * 100}`)}`).padStart(2, '0');
  const min = (`${parseInt(`${time / 60}`)}`).padStart(2, '0');
  const second = (`${parseInt(`${time % 60}`)}`).padStart(2, '0');
  return (
    <TimeRoot>
      {`${min}:${second}.${float.replace('0.', '')}`}
    </TimeRoot>
  );
}

export function TimelinePlayer({ timelineState, autoScrollWhenPlay, scale = 1, scaleWidth = 160, startLeft = 20 }: {
  timelineState: TimelineState | null;
  autoScrollWhenPlay: boolean;
  scale: number;
  scaleWidth: number;
  startLeft: number;
}) {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [time, setTime] = React.useState(0);

  React.useEffect(() => {
    if (!timelineState) {
      return undefined;
    }
    const engine = timelineState;
    engine.listener.on('play', () => setIsPlaying(true));
    engine.listener.on('paused', () => setIsPlaying(false));
    engine.listener.on('afterSetTime', ({ time: afterSetTime }) => setTime(afterSetTime));
    engine.listener.on('setTimeByTick', ({ time: setTimeByTick }) => {
      setTime(setTimeByTick);

      if (autoScrollWhenPlay) {
        const autoScrollFrom = 500;
        const left = setTimeByTick * (scaleWidth / scale) + startLeft - autoScrollFrom;
        timelineState.setScrollLeft(left)
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

  // Set playback rate
  const handleRateChange = (event: SelectChangeEvent<number>) => {
    if (!timelineState) {
      return;
    }
    timelineState.setPlayRate(event.target.value as number);
  };
  return (
    <PlayerRoot >
      <PlayControl state={timelineState} isPlaying={isPlaying} />
      <Time time={time} />
      <RateControlRoot >
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
};
*/

TimelinePlayer.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  autoScrollWhenPlay: PropTypes.bool.isRequired,
  scale: PropTypes.number.isRequired,
  scaleWidth: PropTypes.number.isRequired,
  startLeft: PropTypes.number.isRequired,
  timelineState: PropTypes.shape({
    current: PropTypes.shape({
      getPlayRate: PropTypes.func.isRequired,
      getTime: PropTypes.func.isRequired,
      isPaused: PropTypes.bool.isRequired,
      isPlaying: PropTypes.bool.isRequired,
      listener: PropTypes.shape({
        bind: PropTypes.func.isRequired,
        events: PropTypes.object.isRequired,
        exist: PropTypes.func.isRequired,
        off: PropTypes.func.isRequired,
        offAll: PropTypes.func.isRequired,
        on: PropTypes.func.isRequired,
        trigger: PropTypes.func.isRequired,
      }).isRequired,
      pause: PropTypes.func.isRequired,
      play: PropTypes.func.isRequired,
      reRender: PropTypes.func.isRequired,
      setPlayRate: PropTypes.func.isRequired,
      setScrollLeft: PropTypes.func.isRequired,
      setScrollTop: PropTypes.func.isRequired,
      setTime: PropTypes.func.isRequired,
      target: function (props, propName) {
        if (props[propName] == null) {
          return new Error("Prop '" + propName + "' is required but wasn't specified");
        } else if (typeof props[propName] !== 'object' || props[propName].nodeType !== 1) {
          return new Error("Expected prop '" + propName + "' to be of type Element");
        }
      },
    }).isRequired,
  }).isRequired,
  tracks: PropTypes.arrayOf(
    PropTypes.shape({
      actions: PropTypes.arrayOf(
        PropTypes.shape({
          data: PropTypes.any,
          disable: PropTypes.bool.isRequired,
          effectId: PropTypes.string.isRequired,
          end: PropTypes.number.isRequired,
          flexible: PropTypes.bool.isRequired,
          id: PropTypes.string.isRequired,
          maxEnd: PropTypes.number.isRequired,
          minStart: PropTypes.number.isRequired,
          movable: PropTypes.bool.isRequired,
          selected: PropTypes.bool.isRequired,
          start: PropTypes.number.isRequired,
        }),
      ).isRequired,
      classNames: PropTypes.arrayOf(PropTypes.string).isRequired,
      id: PropTypes.string.isRequired,
      rowHeight: PropTypes.number.isRequired,
      selected: PropTypes.bool.isRequired,
    }),
  ).isRequired,
} as any;

export { TimelinePlayer };
