/**
 * Represents a timeline file component.
 * @description A component that displays a timeline file.
 * @param {object} props - The properties for the timeline file component.
 * @property {string} fileUrl - The URL of the timeline file.
 * @property {string} fileType - The type of the timeline file.
 * @property {string} fileName - The name of the timeline file.
 * @property {string} fileSize - The size of the timeline file.
 * @returns {JSX.Element} React component
 * @example
 * <TimelineFile
 *    fileUrl="https://example.com/file.pdf"
 *    fileType="pdf"
 *    fileName="example.pdf"
 *    fileSize="2MB"
 * />
 * @fires FileDeleted
 * @see Commands
 */
import TimelineFile from './TimelineFile';

export default TimelineFile;
export * from './TimelineFile.types';
export * from './Commands';
