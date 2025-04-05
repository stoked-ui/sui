/** 
 * Export components related to file dropzone functionality
 */
export * from './FileDropzone';

/** 
 * Export classes related to file dropzone styling
 */
export * from './fileDropzoneClasses';

/** 
 * Define types related to file dropzone component
 * @typedef {import('./FileDropzone.types').FileDropzoneProps} FileDropzoneProps
 * @typedef {import('./FileDropzone.types').FileDropzoneSlots} FileDropzoneSlots
 * @typedef {import('./FileDropzone.types').FileDropzoneSlotProps} FileDropzoneSlotProps
 */
export type {
  FileDropzoneProps,
  FileDropzoneSlots,
  FileDropzoneSlotProps,
} from './FileDropzone.types';