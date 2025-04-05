import MediaFile from './MediaFile'

export default MediaFile;
export { default as IMediaFile } from './MediaFile';
export * from './Metadata';

/** 
 * Represents a Media File.
 * @typedef {Object} MediaFile
 * @property {string} url - The URL of the media file.
 * @property {string} type - The type of media file.
 */

/** 
 * Represents metadata related to a media file.
 * @typedef {Object} Metadata
 * @property {string} title - The title of the media file.
 * @property {string} description - The description of the media file.
 */

/** 
 * Exported MediaFile component.
 * @description This component displays a media file.
 * @param {MediaFile} props.media - The media file to display.
 * @returns {JSX.Element} MediaFile component.
 * @example
 * <MediaFile media={mediaData} />
 * @fires MediaFile#onPlay
 * @see IMediaFile
 */
const MediaFile = (props) => {
    // Component logic here
};

export default MediaFile;