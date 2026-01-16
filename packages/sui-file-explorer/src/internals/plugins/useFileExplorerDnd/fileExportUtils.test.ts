/**
 * Work Item 3.2: Tests for External File Export Utilities
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { FileBase } from '../../../models';
import {
  fileBaseToBlob,
  fileBaseToFile,
  isExportable,
  createDownloadUrl,
} from './fileExportUtils';

describe('fileExportUtils', () => {
  describe('isExportable', () => {
    it('should return false for folders', () => {
      const folder: FileBase = {
        id: 'folder1',
        name: 'My Folder',
        type: 'folder',
        mediaType: 'folder',
      };
      expect(isExportable(folder)).toBe(false);
    });

    it('should return false for trash', () => {
      const trash: FileBase = {
        id: 'trash',
        name: 'Trash',
        type: 'trash',
        mediaType: 'folder',
      };
      expect(isExportable(trash)).toBe(false);
    });

    it('should return false for items without media', () => {
      const file: FileBase = {
        id: 'file1',
        name: 'document.txt',
        type: 'file',
        mediaType: 'doc',
      };
      expect(isExportable(file)).toBe(false);
    });

    it('should return true for files with media content', () => {
      const file: FileBase = {
        id: 'file1',
        name: 'document.txt',
        type: 'file',
        mediaType: 'doc',
        media: 'Hello world',
      };
      expect(isExportable(file)).toBe(true);
    });
  });

  describe('fileBaseToBlob', () => {
    it('should return null for items without media', () => {
      const file: FileBase = {
        id: 'file1',
        name: 'document.txt',
        type: 'file',
        mediaType: 'doc',
      };
      expect(fileBaseToBlob(file)).toBeNull();
    });

    it('should handle Blob media', () => {
      const blob = new Blob(['test content'], { type: 'text/plain' });
      const file: FileBase = {
        id: 'file1',
        name: 'document.txt',
        type: 'file',
        mediaType: 'doc',
        media: blob,
      };
      const result = fileBaseToBlob(file);
      expect(result).toBe(blob);
    });

    it('should handle string media', () => {
      const file: FileBase = {
        id: 'file1',
        name: 'document.txt',
        type: 'file',
        mediaType: 'doc',
        media: 'Hello world',
      };
      const result = fileBaseToBlob(file);
      expect(result).toBeInstanceOf(Blob);
      expect(result?.type).toBe('text/plain');
    });

    it('should handle base64 data URL', () => {
      const file: FileBase = {
        id: 'file1',
        name: 'image.png',
        type: 'file',
        mediaType: 'image',
        media: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      };
      const result = fileBaseToBlob(file);
      expect(result).toBeInstanceOf(Blob);
      expect(result?.type).toBe('image/png');
    });

    it('should handle JSON object media', () => {
      const file: FileBase = {
        id: 'file1',
        name: 'data.json',
        type: 'file',
        mediaType: 'json',
        media: { key: 'value' },
      };
      const result = fileBaseToBlob(file);
      expect(result).toBeInstanceOf(Blob);
      expect(result?.type).toBe('application/json');
    });
  });

  describe('fileBaseToFile', () => {
    it('should return null for items without media', () => {
      const file: FileBase = {
        id: 'file1',
        name: 'document.txt',
        type: 'file',
        mediaType: 'doc',
      };
      expect(fileBaseToFile(file)).toBeNull();
    });

    it('should create File with correct name', () => {
      const fileBase: FileBase = {
        id: 'file1',
        name: 'document.txt',
        type: 'file',
        mediaType: 'doc',
        media: 'Hello world',
      };
      const result = fileBaseToFile(fileBase);
      expect(result).toBeInstanceOf(File);
      expect(result?.name).toBe('document.txt');
    });

    it('should preserve lastModified timestamp', () => {
      const timestamp = Date.now();
      const fileBase: FileBase = {
        id: 'file1',
        name: 'document.txt',
        type: 'file',
        mediaType: 'doc',
        media: 'Hello world',
        lastModified: timestamp,
      };
      const result = fileBaseToFile(fileBase);
      expect(result?.lastModified).toBe(timestamp);
    });

    it('should handle missing name gracefully', () => {
      const fileBase: FileBase = {
        id: 'file1',
        name: '',
        type: 'file',
        mediaType: 'doc',
        media: 'Hello world',
      };
      const result = fileBaseToFile(fileBase);
      expect(result?.name).toBe('untitled');
    });
  });

  describe('createDownloadUrl', () => {
    let createdUrls: string[] = [];

    afterEach(() => {
      // Clean up created URLs
      createdUrls.forEach(url => URL.revokeObjectURL(url));
      createdUrls = [];
    });

    it('should return null for items without media', () => {
      const file: FileBase = {
        id: 'file1',
        name: 'document.txt',
        type: 'file',
        mediaType: 'doc',
      };
      expect(createDownloadUrl(file)).toBeNull();
    });

    it('should create blob URL', () => {
      const file: FileBase = {
        id: 'file1',
        name: 'document.txt',
        type: 'file',
        mediaType: 'doc',
        media: 'Hello world',
      };
      const url = createDownloadUrl(file);
      expect(url).toBeTruthy();
      expect(url?.startsWith('blob:')).toBe(true);
      if (url) {
        createdUrls.push(url);
      }
    });
  });

  describe('Integration: Full export flow', () => {
    it('should successfully export a text file', () => {
      const file: FileBase = {
        id: 'file1',
        name: 'document.txt',
        type: 'file',
        mediaType: 'doc',
        media: 'Hello world content',
        lastModified: Date.now(),
      };

      // Check exportable
      expect(isExportable(file)).toBe(true);

      // Convert to File
      const exportedFile = fileBaseToFile(file);
      expect(exportedFile).toBeInstanceOf(File);
      expect(exportedFile?.name).toBe('document.txt');
      expect(exportedFile?.type).toBe('text/plain');
    });

    it('should successfully export an image file', async () => {
      const file: FileBase = {
        id: 'file1',
        name: 'image.png',
        type: 'file',
        mediaType: 'image',
        media: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      };

      expect(isExportable(file)).toBe(true);
      const exportedFile = fileBaseToFile(file);
      expect(exportedFile?.name).toBe('image.png');
      expect(exportedFile?.type).toBe('image/png');
    });

    it('should not export folders', () => {
      const folder: FileBase = {
        id: 'folder1',
        name: 'My Folder',
        type: 'folder',
        mediaType: 'folder',
        children: [],
      };

      expect(isExportable(folder)).toBe(false);
      expect(fileBaseToFile(folder)).toBeNull();
    });
  });
});
