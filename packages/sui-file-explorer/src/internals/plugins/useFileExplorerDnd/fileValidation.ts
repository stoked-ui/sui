/**
 * File Validation and Security Module
 *
 * Work Item 3.4: File Type Filtering for External Imports
 *
 * This module provides MIME type validation, file extension checking,
 * and size enforcement for external file drops.
 *
 * Security approach:
 * - AC-3.4.a: Only whitelisted file types accepted
 * - AC-3.4.b: Executable files rejected (double validation)
 * - AC-3.4.c: Size limits enforced
 */

/**
 * Dangerous file extensions that should never be allowed
 * Covers common executable and script formats across platforms
 */
const DANGEROUS_EXTENSIONS = new Set<string>([
  // Windows executables
  'exe', 'dll', 'msi', 'scr', 'vbs', 'js', 'bat', 'cmd', 'com', 'pif', 'reg',
  // Unix/Linux executables
  'sh', 'bash', 'bin', 'out', 'o',
  // macOS executables
  'app', 'deb', 'rpm',
  // Script interpreters
  'py', 'pl', 'rb', 'php', 'asp', 'jsp', 'cgi',
  // Archives that might contain executables
  'zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz',
  // Office macro-enabled formats
  'xlsm', 'docm', 'pptm',
]);

/**
 * Default allowed MIME types for file drops
 * Can be overridden via dndFileTypes parameter
 */
const DEFAULT_ALLOWED_MIME_TYPES = new Set<string>([
  // Text formats
  'text/plain',
  'text/csv',
  'text/markdown',
  'text/xml',
  'text/html',

  // Documents
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx

  // Images
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',

  // JSON and data formats
  'application/json',
  'application/yaml',
  'application/toml',
]);

/**
 * Maximum file size for external drops (10 MB default)
 */
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

/**
 * Extracted file extension from filename
 * Returns lowercase extension without dot
 */
function getFileExtension(filename: string): string {
  const lastDotIndex = filename.lastIndexOf('.');
  if (lastDotIndex === -1) {
    return '';
  }
  return filename.substring(lastDotIndex + 1).toLowerCase();
}

/**
 * Checks if file extension is dangerous
 *
 * Security validation ensures executable files cannot be imported
 * even if renamed or mime-type spoofed
 *
 * @param filename - The file name to check
 * @returns true if extension is in dangerous list
 */
export function isDangerousExtension(filename: string): boolean {
  const ext = getFileExtension(filename);
  return ext.length > 0 && DANGEROUS_EXTENSIONS.has(ext);
}

/**
 * Checks if MIME type is in the whitelist
 *
 * @param mimeType - MIME type to validate
 * @param allowedTypes - Custom whitelist (uses default if not provided)
 * @returns true if MIME type is allowed
 */
export function isAllowedMimeType(
  mimeType: string,
  allowedTypes?: string[]
): boolean {
  // If custom allowed types provided, use those
  if (allowedTypes && allowedTypes.length > 0) {
    const allowedSet = new Set(allowedTypes);
    return allowedSet.has(mimeType);
  }

  // Otherwise use default allowed types
  return DEFAULT_ALLOWED_MIME_TYPES.has(mimeType);
}

/**
 * Checks if file size is within acceptable limits
 *
 * @param fileSize - File size in bytes
 * @param maxSize - Maximum allowed size (uses default if not provided)
 * @returns true if size is acceptable
 */
export function isAcceptableFileSize(
  fileSize: number,
  maxSize: number = MAX_FILE_SIZE_BYTES
): boolean {
  return fileSize > 0 && fileSize <= maxSize;
}

/**
 * Validation result providing detailed feedback
 */
export interface FileValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Comprehensive file validation combining all security checks
 *
 * Validation order (fail-fast):
 * 1. Extension check (highest priority - prevents spoofing)
 * 2. Size check (prevents resource exhaustion)
 * 3. MIME type check (allows custom whitelisting)
 *
 * AC-3.4.a: Only whitelisted file types accepted
 * AC-3.4.b: Executable files rejected
 * AC-3.4.c: Size limits enforced
 *
 * @param filename - File name to validate
 * @param mimeType - MIME type of the file
 * @param fileSize - File size in bytes
 * @param options - Validation options
 * @returns Validation result with details
 */
export function validateFile(
  filename: string,
  mimeType: string,
  fileSize: number,
  options?: {
    allowedMimeTypes?: string[];
    maxFileSize?: number;
  }
): FileValidationResult {
  const errors: string[] = [];

  // Check 1: Extension validation (highest priority)
  if (isDangerousExtension(filename)) {
    errors.push(`File extension is not allowed: ${getFileExtension(filename)}`);
  }

  // Check 2: File size validation
  if (!isAcceptableFileSize(fileSize, options?.maxFileSize)) {
    const maxMB = (options?.maxFileSize || MAX_FILE_SIZE_BYTES) / (1024 * 1024);
    errors.push(`File size exceeds maximum of ${maxMB}MB`);
  }

  // Check 3: MIME type validation
  if (!isAllowedMimeType(mimeType, options?.allowedMimeTypes)) {
    errors.push(`MIME type not allowed: ${mimeType}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates multiple files and returns only valid ones
 *
 * @param files - Array of files to validate
 * @param options - Validation options
 * @returns Object with valid files and rejected file details
 */
export interface FileValidationBatchResult {
  validFiles: Array<{filename: string; mimeType: string; size: number}>;
  rejectedFiles: Array<{filename: string; errors: string[]}>;
}

export function validateFiles(
  files: Array<{filename: string; mimeType: string; size: number}>,
  options?: {
    allowedMimeTypes?: string[];
    maxFileSize?: number;
  }
): FileValidationBatchResult {
  const validFiles: typeof files = [];
  const rejectedFiles: Array<{filename: string; errors: string[]}> = [];

  for (const file of files) {
    const result = validateFile(
      file.filename,
      file.mimeType,
      file.size,
      options
    );

    if (result.isValid) {
      validFiles.push(file);
    } else {
      rejectedFiles.push({
        filename: file.filename,
        errors: result.errors,
      });
    }
  }

  return { validFiles, rejectedFiles };
}

/**
 * Gets user-friendly rejection reason from validation errors
 *
 * @param errors - Array of validation error messages
 * @returns Human-readable error message
 */
export function getRejectionReason(errors: string[]): string {
  if (errors.length === 0) {
    return 'File validation failed';
  }

  if (errors.length === 1) {
    return errors[0];
  }

  return errors.join('; ');
}
