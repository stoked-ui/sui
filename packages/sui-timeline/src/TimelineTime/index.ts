/**
 * TimelineTime component is used to display a specific time within a timeline.
 * @description Displays a specific time within a timeline.
 * @param {Object} props - The props for the TimelineTime component.
 * @property {string} time - The specific time to display.
 * @property {string} className - Additional CSS class for styling.
 * @returns {JSX.Element} React component representing the TimelineTime.
 * @example
 * <TimelineTime time="10:00 AM" />
 * @example
 * <TimelineTime time="3:30 PM" className="highlighted" />
 */
import TimelineTime from './TimelineTime';

export default TimelineTime;
export * from './TimelineTime.types';
export * from './timelineTimeClasses';