// Fix for Blob compatibility issues
declare interface Blob {
  bytes?: any;
}

// Fix for File compatibility
declare interface File extends Blob {
  // Add any missing properties that might be expected
} 

