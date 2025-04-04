/**
 * Exports file dropzone components and types.
 */
export * from './FileDropzone';
export * from './fileDropzoneClasses';

/**
 * Type definitions for the FileDropzone component.
 *
 * @namespace FileDropzone
 * @description Provides a customizable file dropzone component.
 * @property {object} props - Props for the FileDropzone component.
 * @property {object} slots - Slots for the FileDropzone component.
 * @property {object} slotProps - Props for the FileDropzone slot components.
 */
export type {
  FileDropzoneProps,
  FileDropzoneSlots,
  FileDropzoneSlotProps,
} from './FileDropzone.types';