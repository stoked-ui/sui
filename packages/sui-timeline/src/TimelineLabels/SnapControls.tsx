import * as React from 'react';
import ToggleButton from '@mui/material/ToggleButton';
import Tooltip from '@mui/material/Tooltip';
import { styled } from '@mui/material/styles';
import {useTimeline} from "../TimelineProvider";
import ToggleButtonGroupEx from "../components/ToggleButtonGroupEx";
import EdgeSnap from "../icons/EdgeSnap";
import GridSnap from "../icons/GridSnap";
import PropTypes from "prop-types";
import {SxProps} from "@mui/system";

const ToolbarToggle = styled(ToggleButton)(() => ({
  background: 'unset',
  backgroundColor: 'unset',
}));
export default function SnapControls({ sx, size, hover }: { sx?: SxProps, size?: 'large' | 'medium' | 'small', hover?: boolean }) {
  const {
    dispatch,
    state: { flags, settings },
  } = useTimeline();

  const [disabled, setDisabled] = React.useState(!!settings.disabled);
  React.useEffect(() => {
    if (settings.disabled !== disabled) {
      setDisabled(!!settings.disabled);
    }
  }, [settings.disabled]);

  const onControls = flags.noLabels && !flags.noSnapControls;
  const cntrlSize = size || (onControls ? 'large' : 'medium');
  const cntrlSizes = { large: { width: 52, height: 40}, medium: { width: 40, height: 32 }, small: { width: 30, height: 22 }};
  const [currentSize, setCurrentSize] = React.useState(cntrlSize);
  React.useEffect(() => {
    if (currentSize !== cntrlSize) {
      setCurrentSize(cntrlSize);
    }
  }, [cntrlSize]);

  if (flags.noSnapControls) {
    return undefined;
  }
  const handleSnapOptions = (event: React.MouseEvent<HTMLElement>, newOptions: string[]) => {
    const add: string[] = [];
    const remove: string[] = [];
    if (newOptions.includes('gridSnap')) {
      add.push('gridSnap');
    } else {
      remove.push('gridSnap');
    }
    if (newOptions.includes('edgeSnap')) {
      add.push('edgeSnap');
    } else {
      remove.push('edgeSnap');
    }
    dispatch({ type: 'SET_FLAGS', payload: { add, remove } });
  };

  const width = cntrlSizes[cntrlSize].width;
  const height = cntrlSizes[cntrlSize].height;
  const controlFlags: string[] = [];
  if (flags.edgeSnap) {
    controlFlags.push('edgeSnap');
  }
  if (flags.gridSnap) {
    controlFlags.push('gridSnap');
  }
  const sxButton = hover ? { opacity: .4, '&:hover': { opacity: 1 }} : {};
  return (
    <ToggleButtonGroupEx
      onChange={handleSnapOptions}
      value={controlFlags}
      size={'small'}
      aria-label="text alignment"
      maxWidth={width}
      maxHeight={height}
      sx={sx}
      disabled={disabled}
    >
      <Tooltip enterDelay={1000} title={'Edge Snap'} key={'edgeSnap'}>
        <span>
          <ToggleButton value="edgeSnap" aria-label="edge snap" key={'edgeSnap-tooltip'} sx={sxButton}>
            <EdgeSnap />
          </ToggleButton>
        </span>
      </Tooltip>
      <Tooltip enterDelay={1000} title={'Grid Snap'} key={'gridSnap'}>
        <span>
          <ToolbarToggle value="gridSnap" aria-label="grid snap" key={'gridSnap-tooltip'} sx={sxButton}>
            <GridSnap />
          </ToolbarToggle>
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

SnapControls.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  style: PropTypes.object,
} as any;

