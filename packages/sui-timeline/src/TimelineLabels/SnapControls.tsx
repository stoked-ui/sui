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

/**
 * ToolbarToggle component
 *
 * @description styled toggle button for snap controls
 */
const ToolbarToggle = styled(ToggleButton)(() => ({
  background: 'unset',
  backgroundColor: 'unset',
}));

/**
 * Props type for SnapControls component
 *
 * @description object containing sx, size, and hover properties
 */
export default function SnapControls({
  /**
   * styles to be applied to the component
   */
  sx?: SxProps,
  /**
   * size of the toggle button (large, medium, or small)
   */
  size?: 'large' | 'medium' | 'small',
  /**
   * whether the control is disabled
   */
  hover?: boolean
}: { sx?: SxProps, size?: 'large' | 'medium' | 'small', hover?: boolean }) {
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

  /**
   * check if snap controls should be shown
   */
  const onControls = flags.noLabels && !flags.noSnapControls;
  /**
   * determine the size of the toggle button based on onControls flag
   */
  const cntrlSize = size || (onControls ? 'large' : 'medium');
  /**
   * object containing control sizes for different toggle button sizes
   */
  const cntrlSizes = { large: { width: 52, height: 40}, medium: { width: 40, height: 32 }, small: { width: 30, height: 22 }};
  /**
   * state variable to store the current size of the toggle button
   */
  const [currentSize, setCurrentSize] = React.useState(cntrlSize);
  React.useEffect(() => {
    if (currentSize !== cntrlSize) {
      setCurrentSize(cntrlSize);
    }
  }, [cntrlSize]);

  /**
   * check if snap controls should be shown
   */
  if (flags.noSnapControls) {
    return undefined;
  }

  /**
   * handle change event for snap options
   *
   * @param {React.MouseEvent<HTMLElement>} event
   * @param {string[]} newOptions
   */
  const handleSnapOptions = (event: React.MouseEvent<HTMLElement>, newOptions: string[]) => {
    /**
     * array of strings to add or remove from flags
     */
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

  /**
   * calculate the width and height of the toggle button based on its size
   */
  const width = cntrlSizes[cntrlSize].width;
  const height = cntrlSizes[cntrlSize].height;
  /**
   * array of flags to be used for snap controls
   */
  const controlFlags: string[] = [];
  if (flags.edgeSnap) {
    controlFlags.push('edgeSnap');
  }
  if (flags.gridSnap) {
    controlFlags.push('gridSnap');
  }

  /**
   * styles for the toggle button based on hover state
   */
  const sxButton = hover ? { opacity: .4, '&:hover': { opacity: 1 }} : {};

  return (
    <ToggleButtonGroupEx>
      <Tooltip title="Grid Snap" placement="right">
        <ToolbarToggle size={cntrlSize} style={sx}>
          <GridSnap />
        </ToolbarToggle>
      </Tooltip>
      <Tooltip title="Edge Snap" placement="left">
        <ToolbarToggle size={cntrlSize} style={sx}>
          <EdgeSnap />
        </ToolbarToggle>
      </Tooltip>
    </ToggleButtonGroupEx>
  );
}

/**
 * propTypes for SnapControls component
 */
SnapControls.propTypes = {
  /**
   * styles to be applied to the component (deprecated)
   */
  style: PropTypes.object,
} as any;