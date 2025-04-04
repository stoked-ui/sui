/**
 * @interface ImportStatement
 * @description Allows importing of modules and types.
 */
import TimelineFile from './TimelineFile';

/**
 * @class TimelineFile
 * @description Represents a timeline file.
 * 
 * @property {Object} [props] - Props for the TimelineFile component.
 * @param {string} [props.type] - Type of timeline (e.g. 'events', 'notes').
 * @param {string[]} [props.categories] - Categories for filtering.
 * 
 * @method show - Displays the timeline file.
 * @async
 * @param {Object} [options] - Options for displaying the timeline.
 * @param {boolean} [options.showLoadingIndicator] - Shows a loading indicator.
 * @returns {Promise<void>}
 */
export default TimelineFile;
export * from './TimelineFile.types';
export * from './Commands';