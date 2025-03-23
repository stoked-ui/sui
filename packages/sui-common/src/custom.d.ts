/**
 * Custom type declarations for @stoked-ui/common
 */

// Handle any specific module augmentations here
declare module '@tempfix/idb' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  export interface IDBPDatabase<DBTypes> {
    // Add any missing definitions here
  }
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  export interface IDBPTransaction<DBTypes, TxStores extends ArrayLike<keyof DBTypes>, Mode extends 'readonly' | 'readwrite'> {
    // Add any missing definitions here
  }
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  export function openDB<DBTypes>(
    name: string,
    version?: number,
    options?: any
  ): Promise<IDBPDatabase<DBTypes>>;
}

// Declare modules without types
declare module '*.svg' {
  const content: React.FunctionComponent<React.SVGAttributes<SVGElement>>;
  export default content;
}

declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*.jpg' {
  const content: string;
  export default content;
}

// Extend any global interfaces if needed
interface Window {
  // Add any window extensions here
} 
