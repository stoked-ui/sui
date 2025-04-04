import * as React from "react";
import { Tooltip } from "@mui/material";
import ToggleButton from "@mui/material/ToggleButton";
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import PropTypes from "prop-types";
import { useTimeline } from "../TimelineProvider";
import ToggleButtonGroupEx from "../components/ToggleButtonGroupEx";

/**
 * ZoomControls component
 *
 * This component renders the zoom controls for a timeline.
 * It handles zoom in and out functionality and disables the controls when disabled is true.
 *
 * @param {object} props - The component properties
 * @param {React.CSSProperties} props.style - The styles to apply to the component
 */
export default function ZoomControls({ style }: { style?: React.CSSProperties }) {
  const { dispatch, state } = useTimeline();
  const { flags, settings } = state;
  const { scaleWidth, rawScaleWidth, scale } = settings;

  /**
   * State for the disabled property
   *
   * @type {boolean}
   */
  const [disabled, setDisabled] = React.useState(!!settings.disabled);

  /**
   * Effect hook to update the disabled state when settings.disabled changes
   *
   * @returns {void}
   */
  React.useEffect(() => {
    if (settings.disabled !== disabled) {
      setDisabled(!!settings.disabled);
    }
  }, [settings.disabled]);

  if (flags.noZoomControls) {
    return undefined;
  }

  /**
   * Zoom in handler function
   *
   * Dispatches a setting change event to increase the scale width by 1
   */
  const zoomInHandler = () => {
    dispatch({ type: 'SET_SETTING', payload: { key: 'scaleWidth', value: scaleWidth + 1 } });
  };

  /**
   * Zoom out handler function
   *
   * Dispatches a setting change event to decrease the scale width by 1
   */
  const zoomOutHandler = () => {
    dispatch({ type: 'SET_SETTING', payload: { key: 'scaleWidth', value: scaleWidth - 1 } });
  };

  /**
   * Zoom in function
   *
   * Intervals for zoom in animation and clears the interval on mouse up event
   */
  const zoomIn = () => {
    const timer = setInterval(() => {
      zoomInHandler();
    }, 100);
    document.addEventListener('mouseup', () => {
      clearInterval(timer);
    });
  };

  /**
   * Zoom out function
   *
   * Intervals for zoom out animation and clears the interval on mouse up event
   */
  const zoomOut = () => {
    const timer = setInterval(() => {
      zoomOutHandler();
    }, 100);
    document.addEventListener('mouseup', () => {
      clearInterval(timer);
    });
  };

  /**
   * Zoom out disabled state
   *
   * @type {boolean}
   */
  const zoomOutDisabled = disabled || (scaleWidth / scale < rawScaleWidth);

  return (
    <ToggleButtonGroupEx
      id={'zoom-controls'}
      value={[]}
      size={'small'}
      aria-label="text alignment"
      maxWidth={30}
      maxHeight={22}
      style={{ position: 'absolute' }}
      disabled={disabled}
    >
      <Tooltip enterDelay={1000} title={'Zoom In'} key={'zoomIn'}>
        <span>
          <ToggleButton value="zoomIn" aria-label="zoom in" key={'zoomIn-key'} onClick={zoomInHandler} onMouseDown={zoomIn} sx={{ opacity: 0.4, '&:hover': { opacity: 1 } }}>
            <ZoomInIcon />
          </ToggleButton>
        </span>
      </Tooltip>
      <Tooltip enterDelay={1000} title={'Zoom Out'} key={'zoomOut'}>
        <span>
          <ToggleButton disabled={zoomOutDisabled} value="zoomOut" aria-label="zoom out" key={'zoomOut-key'} onClick={zoomOutHandler} onMouseDown={zoomOut} sx={{ opacity: 0.4, '&:hover': { opacity: 1 } }}>
            <ZoomOutIcon />
          </ToggleButton>
        </span>
      </Tooltip>
    </ToggleButtonGroupEx>
  );
}

/**
 * PropTypes for ZoomControls component
 */
ZoomControls.propTypes = {
  /**
   * Styles to apply to the component
   *
   * @type {React.CSSProperties}
   */
  style: PropTypes.object,
} as any;