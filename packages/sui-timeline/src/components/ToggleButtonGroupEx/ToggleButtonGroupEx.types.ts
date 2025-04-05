/**
 * Extended ToggleButtonGroup props interface.
 * @typedef {Object} ToggleButtonGroupExProps
 * @property {number} [minWidth] - The minimum width of the toggle button group.
 * @property {number} [minHeight] - The minimum height of the toggle button group.
 * @property {number} [maxWidth] - The maximum width of the toggle button group.
 * @property {number} [maxHeight] - The maximum height of the toggle button group.
 * @property {number} [width] - The width of the toggle button group.
 * @property {number} [height] - The height of the toggle button group.
 * @property {React.ReactNode[]} [children] - The child elements of the toggle button group.
 * @property {SxProps<Theme>} [sx] - The style props of the toggle button group.
 */

import * as React from 'react';
import {ToggleButtonGroupProps} from "@mui/material";
import {SxProps} from "@mui/system";
import {Theme} from "@mui/material/styles";

/**
 * Extended ToggleButtonGroup component with additional props.
 * @description Component that extends the ToggleButtonGroup component with extra styling properties.
 * @param {ToggleButtonGroupExProps} props - The props for the ToggleButtonGroupEx component.
 * @returns {JSX.Element} React component
 * @example
 * <ToggleButtonGroupEx
 *   value={value}
 *   onChange={handleChange}
 *   minWidth={100}
 *   height={50}
 * >
 *   <ToggleButton value="left">Left</ToggleButton>
 *   <ToggleButton value="center">Center</ToggleButton>
 *   <ToggleButton value="right">Right</ToggleButton>
 * </ToggleButtonGroupEx>
 * @fires onChange
 * @see ToggleButton
 */
export const ToggleButtonGroupEx: React.FC<ToggleButtonGroupExProps> = (props) => {
  // Component logic here
};