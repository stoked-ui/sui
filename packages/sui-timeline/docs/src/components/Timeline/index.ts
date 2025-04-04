/**
 * Import and export timelines for use in the application
 */

/**
 * Timeline components
 */
export { 
  /**
   * A basic timeline component
   *
   * @description A simple timeline that displays events on a timeline
   * @see {@link BasicTimeline}
   */
  default as BasicTimeline 
} from './BasicTimeline';

/**
 * Timeline components (continued)
 */
export { 
  /**
   * A multi-track timeline component
   *
   * @description A timeline that allows multiple tracks to be displayed simultaneously
   * @see {@link MultiTrackTimeline}
   */
  default as MultiTrackTimeline 
} from './MultiTrackTimeline';

/**
 * Timeline components (continued)
 */
export { 
  /**
   * A custom controls timeline component
   *
   * @description A timeline with customizable controls for navigating and interacting with the timeline
   * @see {@link CustomControlsTimeline}
   */
  default as CustomControlsTimeline 
} from './CustomControlsTimeline';

/**
 * Timeline components (continued)
 */
export { 
  /**
   * A collapsed timeline component
   *
   * @description A timeline that can be collapsed to display only essential information
   * @see {@link CollapsedTimeline}
   */
  default as CollapsedTimeline 
} from './CollapsedTimeline';