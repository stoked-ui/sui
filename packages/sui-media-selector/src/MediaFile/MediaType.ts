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
  ['folder',                                                                 'folder'],
  ['*',                                                                       'file'],
]);

export { MimeMediaWildcardMap };
const MimeTypeWildcards = Object.keys(MimeMediaWildcardMap);

export type MimeMediaWildcardType = typeof MimeMediaWildcardMap;
export type MimeTypeWildcard = MimeMediaWildcardType extends Map<infer K, unknown> ? K : never;
export type MediaType = MimeMediaWildcardType extends Map<MimeTypeExtension, infer V> ? V : never;

export function getMediaType(value?: string): MediaType {
  let mediaType: MediaType = 'file';
  if (!value) {
    return mediaType;
  }
  for (let i = 0; i < MimeTypeWildcards.length; i += 1){
    const allowedValue = MimeTypeWildcards[i];
    if (value.startsWith(allowedValue.slice(0, -1)) || value === allowedValue) {
      mediaType = MimeMediaWildcardMap[allowedValue];
      break;
    }
  }
  return mediaType;
}
