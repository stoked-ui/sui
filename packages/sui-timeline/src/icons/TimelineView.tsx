/**
 * Import necessary modules
 */
import * as React from 'react';
import {createSvgIcon} from "@mui/material/utils";

/**
 * Interface for TimelineView component
 *
 * @interface TimelineViewProps
 * @property {React.Fragment} children - The SVG path elements to be used in the TimelineView.
 * @property {string} name - The name of the icon.
 */
const TimelineView = createSvgIcon(<React.Fragment>
  <path d="M3 23a1 1 0 0 1-1-1V2A1 1 0 0 1 4 2V3H8A1 1 0 0 1 8 5H4v6h8a1 1 0 0 1 0 2H4v6H6a1 1 0 0 1 0 2H4v1A1 1 0 0 1 3 23ZM21 3H13V2a1 1 0 0 0-2 0V4h0V6a1 1 0 0 0 2 0V5h8a1 1 0 0 0 0-2Zm0 8H17V10a1 1 0 0 0-2 0v2h0v2a1 1 0 0 0 2 0V13h4a1 1 0 0 0 0-2Zm0 8H11V18a1 1 0 0 0-2 0v2H9v2a1 1 0 0 0 2 0V21H21a1 1 0 0 0 0-2Z" />
</React.Fragment>,  'FeatureSnapIcon' );

/**
 * TimelineView component
 *
 * @description The FeatureSnapIcon is a custom SVG icon created using the createSvgIcon function.
 *              It displays a timeline view with various paths and lines.
 *
 * @class TimelineView
 * @extends {createSvgIcon}
 */
export default TimelineView;