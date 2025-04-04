/**
 * FileProvider Props Interface
 *
 * @description Defines the props for the FileProvider component.
 */
export interface FileProviderProps {
  /**
   * The child elements of the provider.
   * 
   * @example <FileProvider><Text>Hello World!</Text></FileProvider>
   */
  children: React.ReactNode;

  /**
   * The unique identifier of the file provided.
   * 
   * @type {FileId}
   */
  id: FileId;
}