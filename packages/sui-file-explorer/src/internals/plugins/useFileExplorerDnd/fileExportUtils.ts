/**
 * Work Item 3.2: External File Export Utilities
 *
 * Helper functions for exporting files from FileExplorer to the OS desktop
 * Handles conversion of FileBase items to File objects for drag-and-drop export
 */

import { FileBase } from '../../../models';

/**
 * Convert FileBase media content to Blob
 * Supports various media types: text, images, PDFs, videos, audio
 */
export function fileBaseToBlob(item: FileBase): Blob | null {
  if (!item.media) {
    return null;
  }

  // Handle different media content types
  if (item.media instanceof Blob) {
    return item.media;
  }

  if (item.media instanceof File) {
    return item.media;
  }

  // Handle base64 encoded data
  if (typeof item.media === 'string') {
    // Check if it's a data URL
    if (item.media.startsWith('data:')) {
      const parts = item.media.split(',');
      if (parts.length === 2) {
        const mimeMatch = parts[0].match(/:(.*?);/);
        const mime = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
        const bstr = atob(parts[1]);
        const n = bstr.length;
        const u8arr = new Uint8Array(n);
        for (let i = 0; i < n; i++) {
          u8arr[i] = bstr.charCodeAt(i);
        }
        return new Blob([u8arr], { type: mime });
      }
    }

    // Plain text content
    const mimeType = getMimeTypeFromMediaType(item.mediaType);
    return new Blob([item.media], { type: mimeType });
  }

  // Handle ArrayBuffer or typed arrays
  if (item.media instanceof ArrayBuffer) {
    const mimeType = getMimeTypeFromMediaType(item.mediaType);
    return new Blob([item.media], { type: mimeType });
  }

  if (ArrayBuffer.isView(item.media)) {
    const mimeType = getMimeTypeFromMediaType(item.mediaType);
    // Create a copy to ensure compatibility with both ArrayBuffer and SharedArrayBuffer
    // We need to create a new Uint8Array with an ArrayBuffer, not a view of the original
    const bytes = new Uint8Array(item.media.byteLength);
    const source = new Uint8Array(item.media.buffer as ArrayBuffer, item.media.byteOffset, item.media.byteLength);
    bytes.set(source);
    return new Blob([bytes], { type: mimeType });
  }

  // Handle object/JSON content
  if (typeof item.media === 'object') {
    const jsonString = JSON.stringify(item.media);
    return new Blob([jsonString], { type: 'application/json' });
  }

  return null;
}

/**
 * Get MIME type from MediaType
 */
function getMimeTypeFromMediaType(mediaType?: string): string {
  if (!mediaType) {
    return 'application/octet-stream';
  }

  const mimeMap: Record<string, string> = {
    'image': 'image/png',
    'video': 'video/mp4',
    'audio': 'audio/mpeg',
    'pdf': 'application/pdf',
    'doc': 'text/plain',
    'lottie': 'application/json',
    'text': 'text/plain',
    'json': 'application/json',
    'html': 'text/html',
    'css': 'text/css',
    'js': 'application/javascript',
    'xml': 'application/xml',
  };

  return mimeMap[mediaType] || 'application/octet-stream';
}

/**
 * Convert FileBase to File object for OS export
 */
export function fileBaseToFile(item: FileBase): File | null {
  const blob = fileBaseToBlob(item);
  if (!blob) {
    return null;
  }

  const fileName = item.name || 'untitled';
  const options: FilePropertyBag = {
    type: blob.type,
  };

  if (item.lastModified) {
    options.lastModified = item.lastModified;
  }

  return new File([blob], fileName, options);
}

/**
 * Check if FileBase item has exportable content
 */
export function isExportable(item: FileBase): boolean {
  // Folders cannot be exported as files
  if (item.type === 'folder' || item.type === 'trash' || item.type === 'project') {
    return false;
  }

  // Must have media content
  return !!item.media;
}

/**
 * Create download URL for file
 * Useful for fallback download mechanisms
 */
export function createDownloadUrl(item: FileBase): string | null {
  const blob = fileBaseToBlob(item);
  if (!blob) {
    return null;
  }

  return URL.createObjectURL(blob);
}

/**
 * Trigger browser download for FileBase item
 * Fallback for browsers that don't support drag-to-desktop
 */
export function triggerDownload(item: FileBase): boolean {
  const downloadUrl = createDownloadUrl(item);
  if (!downloadUrl) {
    return false;
  }

  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = item.name || 'untitled';
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up object URL after download
  setTimeout(() => URL.revokeObjectURL(downloadUrl), 100);

  return true;
}
