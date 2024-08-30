import * as React from 'react';
import composeClasses from "@mui/utils/composeClasses";
import FormControl from '@mui/material/FormControl';
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

import { EditorControlsProps } from './EditorControls.types';
import { getEditorControlsUtilityClass } from "./editorControlsClasses";
import TextField from '@mui/material/TextField';
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import { alpha, emphasize } from '@mui/material/styles';

export const Rates = [0.2, 0.5, 1.0, 1.5, 2.0];
const useThemeProps = createUseThemeProps('MuiEditor');


const useUtilityClasses = <R extends FileBase, Multiple extends boolean | undefined>(
  ownerState: EditorControlsProps<R, Multiple>,
) => {
  const { classes } = ownerState;

  const slots = {
    root: ['root'],
  };

  return composeClasses(slots, getEditorControlsUtilityClass, classes);
};

const ToggleButtonGroupStyled = styled(ToggleButtonGroup)(({theme})=> {
  return ({
      background: theme.palette.background.default,
      '& .MuiButtonBase-root': {
        color: theme.palette.text.primary,
        '&:hover': {
          color: theme.palette.primary.main,
          background: theme.palette.background.default,
          border: `1px solid ${theme.palette.text.primary}`,
      },
    }
  })
});

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

  "& .MuiInputBase-input": {
    fontSize: 16,
    height: 40,
    padding: '0 4px',
    borderRadius: '12px',
    background: theme.palette.background.default,

    textAlign: 'end',
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
    py: '4px',
    fontSize: 16,
  },

}));

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
  const { timelineState, editorData, autoScrollWhenPlay } = inProps;
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [time, setTime] = React.useState(0);
  const [showRate, setShowRate] = React.useState(false);

  React.useEffect(() => {
    if (timelineState.current) {
      setShowRate(true);
    }
  }, [timelineState.current])

  React.useEffect(() => {
    if (!timelineState || !timelineState.current) {
      return undefined;
    }
    const engine = timelineState.current;
    engine.listener?.on('play', () => setIsPlaying(true));
    engine.listener?.on('paused', () => setIsPlaying(false));
    engine.listener?.on('afterSetTime', (params) => setTime(params.time));
    engine.listener?.on('setTimeByTick', (params) => {
      setTime(params.time);

      if (autoScrollWhenPlay) {
        const autoScrollFrom = 500;
        const left = params.time * (scaleWidth / scale) + startLeft - autoScrollFrom;
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
    if (!timelineState || !timelineState.current) {
      return;
    }
    if (timelineState.current.isPlaying) {
      timelineState.current.pause();
      //setIsPlaying(false)
    } else {
      timelineState.current.play({ autoEnd: true });
      //setIsPlaying(true)
    }
  };

  // Set playback rate
  const handleRateChange = (event: SelectChangeEvent<unknown>) => {
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
    return `${min}:${second}.${float.replace('0.', '')}`;
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
  const setScaleWidth = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('setScaleWidth via text', event, event.currentTarget.value);
    const scaleWidth = parseInt(event.currentTarget.value, 10);
    if (scaleWidth && scaleWidth > 1) {
      inProps.setScaleWidth(scaleWidth);
    }
  }
  const controlsInput: string[] = [];
  const [controls, setControls] = React.useState(controlsInput);
  return (
    <PlayerRoot className="timeline-player">

      <div style={{display: 'flex', flexDirection: 'row', alignContent: 'center', width: '100%'}}>
          <ToggleButtonGroupStyled
            value={controls}
            exclusive
            onChange={(event, value) => {

            }}
            size={'small'}
            aria-label="text alignment"
          >
            <ToggleButton onClick={handleStart}  value="previous" aria-label="hidden">
              <SkipPreviousIcon fontSize={'small'}/>
            </ToggleButton>
            <ToggleButton value="playPause" onClick={handlePlayOrPause}>
              {isPlaying ? <PauseIcon /> : <PlayArrowIcon/>}
            </ToggleButton>
            <ToggleButton onClick={handleEnd} value="next" aria-label="lock">
              <SkipNextIcon />
            </ToggleButton>
          </ToggleButtonGroupStyled>

      </div>
      <div style={{display: 'flex', flexDirection: 'row'}}>
        <TimeRoot
          variant={'outlined'}
          size={'small'}
          helperText={false}
          value={timeRender(time)}
        />
        <RateControlRoot sx={{ minWidth: '80px' }} className="rate-control">
          <RateControlSelect
            value={timelineState.current?.getPlayRate() ?? 1}
            onChange={handleRateChange}
            displayEmpty
            inputProps={{ 'aria-label': 'Play Rate' }}
            defaultValue={1}
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
