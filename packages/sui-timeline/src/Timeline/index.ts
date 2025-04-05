import Timeline from "./Timeline";
import StokedUiTimelineApp from './StokedUiTimelineApp';
import KeyDownControls from "./KeyDownControls";

/**
 * Exported components for timeline functionality.
 * @module TimelineComponents
 */

/**
 * Default export for the Timeline component.
 * @returns {JSX.Element} Rendered Timeline component
 */
export default Timeline;

export { StokedUiTimelineApp, KeyDownControls };

export * from './Timeline.types';
export * from './timelineClasses';
export * from './TimelineControlProps';