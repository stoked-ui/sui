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
import { ITimelineTrack } from '../TimelineTrack/TimelineTrack.types';
import { useTimeline } from '../TimelineProvider';

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
  tracks,
  autoScrollWhenPlay,
  scale = 1,
  scaleWidth = 160,
  startLeft = 20,
}: {
  tracks?: ITimelineTrack[];
  autoScrollWhenPlay: boolean;
  scale?: number;
  scaleWidth?: number;
  startLeft?: number;
}) {
  const { engine } = useTimeline();

  const [time, setTime] = React.useState(0);

  React.useEffect(() => {
    engine?.on('afterSetTime', ({ time: afterSetTime }) => setTime(afterSetTime));
    engine?.on('setTimeByTick', ({ time: setTimeByTickTime }) => {
      setTime(setTimeByTickTime);

      if (autoScrollWhenPlay) {
        const autoScrollFrom = 500;
        const left = setTimeByTickTime * (scaleWidth / scale) + startLeft - autoScrollFrom;
        engine.setScrollLeft(left);
      }
    });

    return () => {
      if (engine) {
        engine.pause();
        engine.offAll();
      }
      return undefined;
    };
  }, []);

  // Start or pause
  const handlePlayOrPause = () => {
    if (engine.isPlaying) {
      engine.pause();
    } else {
      engine.play({ autoEnd: true });
    }
  };

  // Set playback rate
  const handleRateChange = (event: SelectChangeEvent<number>) => {
    engine.setPlayRate(event.target.value as number);
  };

  // Time display
  const timeRender = (renderTime: number) => {
    const float = `${parseInt(`${(renderTime % 1) * 100}`, 10)}`.padStart(2, '0');
    const min = `${parseInt(`${renderTime / 60}`, 10)}`.padStart(2, '0');
    const second = `${parseInt(`${renderTime % 60}`, 10)}`.padStart(2, '0');
    return <React.Fragment>{`${min}:${second}.${float.replace('0.', '')}`}</React.Fragment>;
  };

  const handleStart = () => {
    engine.setTime(0);
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
      engine.setTime(furthest);
    }
  };

  return (
    <PlayerRoot className="timeline-player">
      <IconButtonControlRoot size={'small'} className="play-control" onClick={handleStart}>
        <SkipPreviousIcon />
      </IconButtonControlRoot>

      <IconButtonControlRoot size={'small'} className="play-control" onClick={handlePlayOrPause}>
        {engine.isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
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
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  autoScrollWhenPlay: PropTypes.bool.isRequired,
  scale: PropTypes.number.isRequired,
  scaleWidth: PropTypes.number.isRequired,
  startLeft: PropTypes.number.isRequired,
  tracks: PropTypes.arrayOf(
    PropTypes.shape({
      actions: PropTypes.arrayOf(
        PropTypes.shape({
          backgroundImage: PropTypes.string.isRequired,
          backgroundImageStyle: PropTypes.oneOfType([
            PropTypes.object,
            PropTypes.shape({
              backgroundImage: PropTypes.string.isRequired,
              backgroundPosition: PropTypes.string.isRequired,
              backgroundSize: PropTypes.string.isRequired,
            }),
          ]).isRequired,
          disable: PropTypes.bool.isRequired,
          duration: PropTypes.number.isRequired,
          end: PropTypes.number.isRequired,
          flexible: PropTypes.bool.isRequired,
          frameSyncId: PropTypes.number.isRequired,
          freeze: PropTypes.number.isRequired,
          hidden: PropTypes.bool.isRequired,
          id: PropTypes.string.isRequired,
          locked: PropTypes.bool.isRequired,
          loop: PropTypes.oneOfType([PropTypes.number, PropTypes.bool]).isRequired,
          maxEnd: PropTypes.number.isRequired,
          minStart: PropTypes.number.isRequired,
          movable: PropTypes.bool.isRequired,
          name: PropTypes.string.isRequired,
          onKeyDown: PropTypes.func.isRequired,
          playbackRate: PropTypes.number.isRequired,
          playCount: PropTypes.number.isRequired,
          selected: PropTypes.bool.isRequired,
          start: PropTypes.number.isRequired,
          style: PropTypes.object.isRequired,
          trimEnd: PropTypes.number.isRequired,
          trimStart: PropTypes.number.isRequired,
          volume: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number.isRequired)).isRequired,
          volumeIndex: PropTypes.number.isRequired,
        }),
      ).isRequired,
      classNames: PropTypes.arrayOf(PropTypes.string).isRequired,
      controller: PropTypes.shape({
        color: PropTypes.string.isRequired,
        colorSecondary: PropTypes.string.isRequired,
        destroy: PropTypes.func.isRequired,
        enter: PropTypes.func.isRequired,
        getActionStyle: PropTypes.func.isRequired,
        getBackgroundImage: PropTypes.func.isRequired,
        leave: PropTypes.func.isRequired,
        logging: PropTypes.bool.isRequired,
        preload: PropTypes.func.isRequired,
        start: PropTypes.func.isRequired,
        stop: PropTypes.func.isRequired,
        update: PropTypes.func.isRequired,
        viewerUpdate: PropTypes.func.isRequired,
      }).isRequired,
      controllerName: PropTypes.string.isRequired,
      file: PropTypes.shape({
        _url: PropTypes.string.isRequired,
        arrayBuffer: PropTypes.func.isRequired,
        aspectRatio: PropTypes.number.isRequired,
        blob: PropTypes.shape({
          arrayBuffer: PropTypes.func.isRequired,
          size: PropTypes.number.isRequired,
          slice: PropTypes.func.isRequired,
          stream: PropTypes.func.isRequired,
          text: PropTypes.func.isRequired,
          type: PropTypes.string.isRequired,
        }).isRequired,
        children: PropTypes.arrayOf(PropTypes.object).isRequired,
        created: PropTypes.number.isRequired,
        duration: PropTypes.number.isRequired,
        element: PropTypes.any,
        expanded: PropTypes.bool.isRequired,
        height: PropTypes.number.isRequired,
        icon: PropTypes.string.isRequired,
        id: PropTypes.string.isRequired,
        itemId: PropTypes.string.isRequired,
        lastModified: PropTypes.number.isRequired,
        mediaFileSize: PropTypes.number.isRequired,
        mediaType: PropTypes.oneOf([
          'audio',
          'doc',
          'file',
          'folder',
          'image',
          'lottie',
          'pdf',
          'trash',
          'video',
        ]).isRequired,
        name: PropTypes.string.isRequired,
        path: PropTypes.string.isRequired,
        selected: PropTypes.bool.isRequired,
        size: PropTypes.number.isRequired,
        slice: PropTypes.func.isRequired,
        stream: PropTypes.func.isRequired,
        text: PropTypes.func.isRequired,
        thumbnail: PropTypes.string.isRequired,
        type: PropTypes.string.isRequired,
        url: PropTypes.string.isRequired,
        version: PropTypes.number.isRequired,
        visibleIndex: PropTypes.number.isRequired,
        webkitRelativePath: PropTypes.string.isRequired,
        width: PropTypes.number.isRequired,
      }).isRequired,
      hidden: PropTypes.bool.isRequired,
      id: PropTypes.string.isRequired,
      image: PropTypes.string.isRequired,
      lock: PropTypes.bool.isRequired,
      name: PropTypes.string.isRequired,
    }),
  ).isRequired,
} as any;

export default TimelinePlayer;
