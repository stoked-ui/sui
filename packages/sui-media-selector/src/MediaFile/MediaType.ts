import {MimeType, MimeTypeExtension} from "./MimeType";

const  MimeMediaWildcardMap: Map<MimeType | `${string}*` | '*' | 'folder', string> = new Map([
  ['application/msword',                                                      'doc'],
  ['application/vnd.ms-word.template.macroEnabled.12',                        'doc'],
  ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'doc'],
  ['application/msword',                                                      'doc'],
  ['application/vnd.ms-word.template.macroEnabled.12',                        'doc'],
  ['application/vnd.openxmlformats-officedocument.wordprocessingml.template', 'doc'],
  ['application/pdf',                                                         'pdf'],
  ['video/*',                                                                 'video'],
  ['image/*',                                                                 'image'],
  ['folder',                                                                  'folder'],
  ['application/json',                                                        'json'],
  ['text/*',                                                                  'text'],
  ['*',                                                                       'file'],
]);

export { MimeMediaWildcardMap };
export type MimeMediaWildcardType = typeof MimeMediaWildcardMap;
export type MimeTypeWildcard = MimeMediaWildcardType extends Map<infer K, unknown> ? K : never;
export type MediaType = MimeMediaWildcardType extends Map<MimeTypeExtension, infer V> ? V : never;

export function getMediaType(mimeType?: string): MediaType {
  let mediaType: MediaType = 'file';
  if (!mimeType) {
    return mediaType;
  }

  for (const [wildcard, wildcardMediaType] of MimeMediaWildcardMap) {
    let mimeTypeCurrent = mimeType;
    const wildcardIndex = wildcard.indexOf('*')
    if (wildcardIndex !== -1) {
      mimeTypeCurrent = mimeType.slice(0,wildcardIndex);
    }
    if (wildcard.replace('*', '') === mimeTypeCurrent) {
      mediaType = wildcardMediaType;
      break;
    }
  }

  return mediaType;
}

