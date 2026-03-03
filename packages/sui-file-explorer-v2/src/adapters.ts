import type { FileItem, FileType } from './types';

/**
 * Minimal interface that mirrors the relevant fields of v1's `FileBase`
 * without importing from `@stoked-ui/file-explorer`.
 *
 * This allows v2 consumers to convert v1 data structures into v2's `FileItem`
 * (and back) without taking a hard dependency on the v1 package.
 */
export interface FileBaseCompat {
  id: string;
  name: string;
  mediaType: string;
  type: string;
  children?: FileBaseCompat[];
  size?: number;
  lastModified?: number;
  path?: string;
  url?: string;
}

// ---------------------------------------------------------------------------
// mediaType --> FileType
// ---------------------------------------------------------------------------

/**
 * Resolve a v1 `mediaType` string to a v2 `FileType`.
 *
 * Matching rules (evaluated in order):
 *  - `'image'` or starts with `'image/'`  --> `'image'`
 *  - `'video'` or starts with `'video/'`  --> `'video'`
 *  - `'application/pdf'`                  --> `'pdf'`
 *  - `'project'` or `'directory'`         --> `'folder'`
 *  - everything else                      --> `'doc'`
 */
function mediaTypeToFileType(mediaType: string): FileType {
  if (mediaType === 'image' || mediaType.startsWith('image/')) {
    return 'image';
  }
  if (mediaType === 'video' || mediaType.startsWith('video/')) {
    return 'video';
  }
  if (mediaType === 'application/pdf') {
    return 'pdf';
  }
  if (mediaType === 'project' || mediaType === 'directory') {
    return 'folder';
  }
  return 'doc';
}

// ---------------------------------------------------------------------------
// FileType --> mediaType
// ---------------------------------------------------------------------------

const fileTypeToMediaTypeMap: Record<FileType, string> = {
  image: 'image',
  video: 'video',
  pdf: 'application/pdf',
  folder: 'project',
  pinned: 'project',
  trash: 'project',
  doc: 'text/plain',
};

// ---------------------------------------------------------------------------
// Public adapters
// ---------------------------------------------------------------------------

/**
 * Convert a v1-shaped `FileBaseCompat` item into a v2 `FileItem`.
 *
 * Children are converted recursively.
 */
export function fileBaseToFileItem(item: FileBaseCompat): FileItem {
  const result: FileItem = {
    id: item.id,
    label: item.name,
    fileType: mediaTypeToFileType(item.mediaType),
  };

  if (item.children && item.children.length > 0) {
    result.children = item.children.map(fileBaseToFileItem);
  }

  return result;
}

/**
 * Convert a v2 `FileItem` into a v1-shaped `FileBaseCompat` object.
 *
 * Children are converted recursively.
 */
export function fileItemToFileBase(item: FileItem): FileBaseCompat {
  const result: FileBaseCompat = {
    id: item.id,
    name: item.label,
    mediaType: fileTypeToMediaTypeMap[item.fileType],
    type: item.fileType,
  };

  if (item.children && item.children.length > 0) {
    result.children = item.children.map(fileItemToFileBase);
  }

  return result;
}
