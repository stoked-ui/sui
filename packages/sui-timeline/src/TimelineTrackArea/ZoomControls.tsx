import * as React from "react";
import {useTimeline} from "../TimelineProvider";
import ToggleButtonGroupEx from "../components/ToggleButtonGroupEx";
import {Tooltip} from "@mui/material";
import ToggleButton from "@mui/material/ToggleButton";
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import PropTypes from "prop-types";

function ZoomControls({ style }: { style?: React.CSSProperties }) {
  const { dispatch, state: { flags, settings} } = useTimeline();
  const { scaleWidth } = settings;

  const [disabled, setDisabled] = React.useState(!!settings.disabled)
  React.useEffect(() => {
    if (settings.disabled !== disabled) {
      setDisabled(!!settings.disabled)
    }
  }, [settings.disabled]);

  if (flags.noZoomControls) {
    return undefined;
  }

  const handleZoomOptions = (event: React.MouseEvent<HTMLElement>, newOptions: string[]) => {
    const add: string[] = [];
    const remove: string[] = [];

    if (newOptions.includes('zoomIn')) {
      add.push('edgeSnap');
    }

    dispatch({ type: 'SET_FLAGS', payload: { add, remove } });
  };

  const zoomInHandler = () => {
    dispatch({ type: 'SET_SETTING', payload: { key: 'scaleWidth', value: scaleWidth + 1 }})
  }

  const zoomOutHandler = () => {
    dispatch({ type: 'SET_SETTING', payload: { key: 'scaleWidth', value: scaleWidth - 1 }})
  }
  const onControls = flags.noLabels && !flags.noZoomControls;
  const width = onControls ? 52 : 40;
  const height = onControls ? 40 : 32;

  return (
    <ToggleButtonGroupEx
      onChange={handleZoomOptions}
      value={[]}
      size={'small'}
      aria-label="text alignment"
      maxWidth={width}
      maxHeight={height}
      style={style}
      disabled={disabled}
    >
      <Tooltip enterDelay={1000} title={'Zoom In'} key={'zoomIn'}>
        <span>
          <ToggleButton value="zoomIn" aria-label="zoom in" key={'zoomIn-key'} onClick={zoomInHandler}>
            <ZoomInIcon />
          </ToggleButton>
        </span>
      </Tooltip>
      <Tooltip enterDelay={1000} title={'Zoom Out'} key={'zoomOut'}>
        <span>
          <ToggleButton value="zoomOut" aria-label="zoom out" key={'zoomOut-key'} onClick={zoomOutHandler}>
            <ZoomOutIcon />
          </ToggleButton>
        </span>
      </Tooltip>
    </ToggleButtonGroupEx>
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

export { ZoomControls };
