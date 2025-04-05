/**
 * React component for displaying a timeline view icon.
 *
 * @description Displays a custom timeline view icon using Material-UI SVG icon component.
 *
 * @param {object} props - The props for the TimelineView component.
 * @property {string} props.children - The SVG path data for the icon.
 * @property {string} props.name - The name of the icon.
 *
 * @returns {JSX.Element} JSX element representing the TimelineView icon.
 *
 * @example
 * <TimelineView name="FeatureSnapIcon">
 *   <path d="M3 23a1 1 0 0 1-1-1V2A1 1 0 0 1 4 2V3H8A1 1 0 0 1 8 5H4v6h8a1 1 0 0 1 0 2H4v6H6a1 1 0 0 1 0 2H4v1A1 1 0 0 1 3 23ZM21 3H13V2a1 1 0 0 0-2 0V4h0V6a1 1 0 0 0 2 0V5h8a1 1 0 0 0 0-2Zm0 8H17V10a1 1 0 0 0-2 0v2h0v2a1 1 0 0 0 2 0V13h4a1 1 0 0 0 0-2Zm0 8H11V18a1 1 0 0 0-2 0v2H9v2a1 1 0 0 0 2 0V21H21a1 1 0 0 0 0-2Z" />
 * </TimelineView>
 */
const TimelineView = createSvgIcon(
  <React.Fragment>
    <path d="M3 23a1 1 0 0 1-1-1V2A1 1 0 0 1 4 2V3H8A1 1 0 0 1 8 5H4v6h8a1 1 0 0 1 0 2H4v6H6a1 1 0 0 1 0 2H4v1A1 1 0 0 1 3 23ZM21 3H13V2a1 1 0 0 0-2 0V4h0V6a1 1 0 0 0 2 0V5h8a1 1 0 0 0 0-2Zm0 8H17V10a1 1 0 0 0-2 0v2h0v2a1 1 0 0 0 2 0V13h4a1 1 0 0 0 0-2Zm0 8H11V18a1 1 0 0 0-2 0v2H9v2a1 1 0 0 0 2 0V21H21a1 1 0 0 0 0-2Z" />
  </React.Fragment>, 'FeatureSnapIcon'
);

export default TimelineView;