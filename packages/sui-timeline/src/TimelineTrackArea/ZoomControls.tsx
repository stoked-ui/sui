import * as React from "react";
import {Tooltip} from "@mui/material";
import ToggleButton from "@mui/material/ToggleButton";
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import PropTypes from "prop-types";
import {useTimeline} from "../TimelineProvider";
import ToggleButtonGroupEx from "../components/ToggleButtonGroupEx";

export default function ZoomControls({ style }: { style?: React.CSSProperties }) {
  const { dispatch, state} = useTimeline();
  const { flags, settings} = state;
  const { scaleWidth, rawScaleWidth, scale } = settings;

  const [disabled, setDisabled] = React.useState(!!settings.disabled)
  React.useEffect(() => {
    if (settings.disabled !== disabled) {
      setDisabled(!!settings.disabled)
    }
  }, [settings.disabled]);

  if (flags.noZoomControls) {
    return undefined;
  }

  const zoomInHandler = () => {
    dispatch({ type: 'SET_SETTING', payload: { key: 'scaleWidth', value: scaleWidth + 1 }})
  }

  const zoomOutHandler = () => {
    dispatch({ type: 'SET_SETTING', payload: { key: 'scaleWidth', value: scaleWidth - 1 }})
  }

  const zoomIn = () => {
    const timer = setInterval(() => {
      zoomInHandler();
    }, 100);
    document.addEventListener('mouseup', () => {
      clearInterval(timer);
    });
  }

  const zoomOut = () => {
    const timer = setInterval(() => {
      zoomOutHandler();
    }, 100);
    document.addEventListener('mouseup', () => {
      clearInterval(timer);
    });
  }

  const zoomOutDisabled = disabled || (scaleWidth / scale  < rawScaleWidth);
  return (
    <div style={{ right: 0, justifySelf: 'end', alignSelf: 'center', position: 'absolute', zIndex: 300 }}>
      <ToggleButtonGroupEx
        id={'zoom-controls'}
        value={[]}
        size={'small'}
        aria-label="text alignment"
        maxWidth={30}
        maxHeight={22}
        style={{position: 'absolute'}}
        disabled={disabled}
      >
        <Tooltip enterDelay={1000} title={'Zoom In'} key={'zoomIn'}>
          <span>
            <ToggleButton value="zoomIn" aria-label="zoom in" key={'zoomIn-key'} onClick={zoomInHandler} onMouseDown={zoomIn} >
              <ZoomInIcon />
            </ToggleButton>
          </span>
        </Tooltip>
        <Tooltip enterDelay={1000} title={'Zoom Out'} key={'zoomOut'}>
          <span>
            <ToggleButton disabled={zoomOutDisabled} value="zoomOut" aria-label="zoom out" key={'zoomOut-key'} onClick={zoomOutHandler} onMouseDown={zoomOut}>
              <ZoomOutIcon />
            </ToggleButton>
          </span>
        </Tooltip>
      </ToggleButtonGroupEx>
  </div>
  );
}

/**
 *
 * Demos:
 *
 * - [TimelineLabels](https://stoked-ui.github.io/timeline/docs/)
 *
 * API:
 *
 * - [TimelineLabels](https://stoked-ui.github.io/timeline/api/)
 */

ZoomControls.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  style: PropTypes.object,
} as any;

