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

/**
 * Array of playback rates for the player.
 */
export const Rates = [0.2, 0.5, 1.0, 1.5, 2.0];

/**
 * Root styled component for the player.
 */
const PlayerRoot = styled('div')(() => ({
  height: '32px',
  width: '100%',
  padding: '0 10px',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
}));

/**
 * Styled component for IconButton control.
 */
const IconButtonControlRoot = styled(IconButton)({
  width: '24px',
  height: '24px',
  borderRadius: '4px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
});

/**
 * Styled component for displaying time.
 */
const TimeRoot = styled('div')({
  fontSize: '12px',
  margin: '0 20px',
  width: '70px',
});

/**
 * Styled component for rate control.
 */
const RateControlRoot = styled('div')({
  justifySelf: 'flex-end',
  fontSize: '12px',
});

/**
 * Functional component for the Timeline Player.
 * @param {Object} props - Props for the Timeline Player.
 * @param {ITimelineTrack[]} props.tracks - Timeline tracks.
 * @param {boolean} props.autoScrollWhenPlay - Auto scroll flag.
 * @param {number} [props.scale=1] - Scale factor.
 * @param {number} [props.scaleWidth=160] - Scale width.
 * @param {number} [props.startLeft=20] - Start left position.
 * @returns {JSX.Element} React component representing the Timeline Player.
 */
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
  const {
    state: { engine },
  } = useTimeline();

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

  /**
   * Handler for play/pause functionality.
   */
  const handlePlayOrPause = () => {
    if (engine.isPlaying) {
      engine.pause();
    } else {
      engine.play({ autoEnd: true });
    }
  };

  /**
   * Handler for changing playback rate.
   * @param {SelectChangeEvent<number>} event - Select change event.
   */
  const handleRateChange = (event: SelectChangeEvent<number>) => {
    engine.setPlayRate(event.target.value as number);
  };

  /**
   * Render the time in the format 'mm:ss.ms'.
   * @param {number} renderTime - Time to render.
   * @returns {React.ReactNode} Rendered time element.
   */
  const timeRender = (renderTime: number) => {
    const float = `${parseInt(`${(renderTime % 1) * 100}`, 10)}`.padStart(2, '0');
    const min = `${parseInt(`${renderTime / 60}`, 10)}`.padStart(2, '0');
    const second = `${parseInt(`${renderTime % 60}`, 10)}`.padStart(2, '0');
    return <React.Fragment>{`${min}:${second}.${float.replace('0.', '')}`}</React.Fragment>;
  };

  /**
   * Handler for setting the time to the beginning.
   */
  const handleStart = () => {
    engine.setTime(0);
  };

  /**
   * Handler for setting the time to the end based on tracks.
   */
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
  autoScrollWhenPlay: PropTypes.bool,
  scale: PropTypes.number,
  scaleWidth: PropTypes.number,
  startLeft: PropTypes.number,
  tracks: PropTypes.arrayOf(
    PropTypes.shape({
      actions: PropTypes.arrayOf(
        PropTypes.shape({
          backgroundImage: PropTypes.string,
          backgroundImageStyle: PropTypes.oneOfType([
            PropTypes.object,
            PropTypes.shape({
              backgroundImage: PropTypes.string,
              backgroundPosition: PropTypes.string,
              backgroundSize: PropTypes.string,
            }),
          ]),
          disabled: PropTypes.bool,
          duration: PropTypes.number,
          end: PropTypes.number,
          flexible: PropTypes.bool,
          frameSyncId: PropTypes.number,
          freeze: PropTypes.number,
          muted: PropTypes.bool,
          id: PropTypes.string,
          locked: PropTypes.bool,
          loop: PropTypes.oneOfType([PropTypes.number, PropTypes.bool]),
          maxEnd: PropTypes.number,
          minStart: PropTypes.number,
          movable: PropTypes.bool,
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
      ),
      classNames: PropTypes.arrayOf(PropTypes.string),
      controller: PropTypes.shape({
        color: PropTypes.string,
        colorSecondary: PropTypes.string,
        destroy: PropTypes.func,
        enter: PropTypes.func,
        getActionStyle: PropTypes.func,
        getBackgroundImage: PropTypes.func,
        leave: PropTypes.func,
        logging: PropTypes.bool,
        start: PropTypes.func,
        stop: PropTypes.func,
        update: PropTypes.func,
        viewerUpdate: PropTypes.func,
      }),
      controllerName: PropTypes.string,
      file: PropTypes.shape({
        _url: PropTypes.string,
        arrayBuffer: PropTypes.func,
        aspectRatio: PropTypes.number,
        blob: PropTypes.shape({
          arrayBuffer: PropTypes.func,
          size: PropTypes.number,
          slice: PropTypes.func,
          stream: PropTypes.func,
          text: PropTypes.func,
          type: PropTypes.string,
        }),
        children: PropTypes.arrayOf(PropTypes.object),
        created: PropTypes.number,
        duration: PropTypes.number,
        element: PropTypes.any,
        expanded: PropTypes.bool,
        height: PropTypes.number,
        icon: PropTypes.string,
        id: PropTypes.string,
        itemId: PropTypes.string,
        lastModified: PropTypes.number,
        mediaFileSize: PropTypes.number,
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
        ]),
        name: PropTypes.string,
        path: PropTypes.string,
        selected: PropTypes.bool,
        size: PropTypes.number,
        slice: PropTypes.func,
        stream: PropTypes.func,
        text: PropTypes.func,
        thumbnail: PropTypes.string,
        type: PropTypes.string,
        url: PropTypes.string,
        version: PropTypes.number,
        visibleIndex: PropTypes.number,
        webkitRelativePath: PropTypes.string,
        width: PropTypes.number,
      }),
      muted: PropTypes.bool,
      id: PropTypes.string,
      image: PropTypes.string,
      locked: PropTypes.bool,
      name: PropTypes.string,
    }),
  ),
} as any;

export default TimelinePlayer;