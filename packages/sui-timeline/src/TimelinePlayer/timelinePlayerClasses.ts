/**
 * Interface for defining classes of a TimelinePlayer component.
 * @typedef {Object} TimelinePlayerClasses
 * @property {string} root - The class for the root element of the TimelinePlayer.
 * @property {string} skipPrevious - The class for the skip previous button.
 * @property {string} pausePlaying - The class for the pause playing button.
 * @property {string} skipNext - The class for the skip next button.
 * @property {string} time - The class for the time display.
 * @property {string} rate - The class for the playback rate display.
 */

/**
 * Key of TimelinePlayerClasses.
 * @typedef {keyof TimelinePlayerClasses} TimelinePlayerClassKey
 */

/**
 * Generates a utility class for a specific slot of the TimelinePlayer component.
 * @param {string} slot - The slot for which to generate the utility class.
 * @returns {string} The generated utility class.
 */
export function getTimelinePlayerUtilityClass(slot: string): string {
  return generateUtilityClass('MuiTimelinePlayer', slot);
}

/**
 * Utility classes for the TimelinePlayer component.
 * @const {TimelinePlayerClasses}
 */
export const timelinePlayerClasses: TimelinePlayerClasses = generateUtilityClasses('MuiTimelinePlayer', [
  'root',
  'skipPrevious',
  'pausePlaying',
  'skipNext',
  'time',
  'rate',
]);
