/**
 * Mapping of MIME types to corresponding media types
 */
const MimeMediaWildcardMap: Map<MimeType | `${string}*` | '*' | 'folder', string> = new Map([
  ['application/msword', 'doc'],
  ['application/vnd.ms-word.template.macroEnabled.12', 'doc'],
  ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'doc'],
  ['application/msword', 'doc'],
  ['application/vnd.ms-word.template.macroEnabled.12', 'doc'],
  ['application/vnd.openxmlformats-officedocument.wordprocessingml.template', 'doc'],
  ['application/pdf', 'pdf'],
  ['video/*', 'video'],
  ['audio/*', 'audio'],
  ['image/*', 'image'],
  ['folder', 'folder'],
  ['application/json', 'json'],
  ['text/*', 'text'],
  ['application/vnd.lottie+json', 'lottie'],
  ['*', 'file'],
]);

export { MimeMediaWildcardMap };

/**
 * Type representing the mapping of MIME types to media types
 */
export type MimeMediaWildcardType = typeof MimeMediaWildcardMap;

/**
 * Type representing different media types
 */
export type MimeTypeWildcard = MimeMediaWildcardType extends Map<infer K, unknown> ? K : never;

/**
 * Type representing a specific media type
 */
export type MediaType = 'doc' | 'file' | 'folder' | 'image' | 'pdf' | 'trash' | 'video' | 'lottie' | 'audio' | string;

/**
 * Get the media type based on the MIME type
 * @param {string} mimeType - The MIME type of the media
 * @returns {MediaType} The corresponding media type
 */
export function getMediaType(mimeType?: string): MediaType {
  let mediaType: MediaType = 'file';
  if (!mimeType) {
    return mediaType;
  }

  for (const [wildcard, wildcardMediaType] of MimeMediaWildcardMap) {
    let mimeTypeCurrent = mimeType;
    const wildcardIndex = wildcard.indexOf('*');
    if (wildcardIndex !== -1) {
      mimeTypeCurrent = mimeType.slice(0, wildcardIndex);
    }
    if (wildcard.replace('*', '') === mimeTypeCurrent) {
      mediaType = wildcardMediaType as MediaType;
      break;
    }
  }

  return mediaType;
}