import { MediaType } from "@stoked-ui/media-selector";

/**
 * A unique identifier for a file, represented as a string.
 */
export type FileId = string;

/**
 * A base interface for all files, containing common properties and optional values.
 *
 * @see CommonBase
 */
type CommonBase = {
  /**
   * The ID of the file.
   */
  id?: string;
  
  /**
   * The name of the file.
   */
  name?: string;
  
  /**
   * The size of the file in bytes.
   */
  size?: number;
  
  /**
   * The last modified timestamp of the file in milliseconds.
   */
  lastModified?: number;
  
  /**
   * The media type of the file, such as image/jpeg or video/mp4.
   */
  mediaType?: MediaType;
  
  /**
   * The URL of the file.
   */
  url?: string;
  
  /**
   * Additional metadata about the file's media object.
   */
  media?: any;
  
  /**
   * The type of the file, such as image or video.
   */
  type?: string;
  
  /**
   * The timestamp when the file was created in milliseconds.
   */
  created?: number;
  
  /**
   * The path to the file on the server-side.
   */
  path?: string;
  
  /**
   * Whether the file is expanded and visible in the UI.
   */
  expanded?: boolean;
  
  /**
   * Whether the file is currently selected or not.
   */
  selected?: boolean;
  
  /**
   * The index of the file within a list of files.
   */
  visibleIndex?: number;
  
  /**
   * The version number of the file, used for concurrency control.
   */
  version?: number;
}

/**
 * An interface that extends CommonBase and allows for additional properties to be added through the 'R' generic type parameter.
 *
 * @template R
 */
export type FileBaseInput<R extends {} = {}> = CommonBase & R & {
  /**
   * A list of child files, recursively defined using FileBaseInput.
   */
  children?: FileBaseInput<CommonBase & R>[];
};

/**
 * An interface that omits certain properties from CommonBase and adds the required 'id' and 'name' properties.
 *
 * @see Common
 */
type Common = Omit<CommonBase, 'id' | 'name' | 'mediaType' | 'type'> & {
  /**
   * The ID of the file.
   */
  id: string;
  
  /**
   * The name of the file.
   */
  name: string;
  
  /**
   * The media type of the file, such as image/jpeg or video/mp4.
   */
  mediaType: MediaType;
  
  /**
   * The type of the file, such as image or video.
   */
  type: string;
}

/**
 * An interface that extends Common and allows for additional properties to be added through the 'R' generic type parameter.
 *
 * @template R
 */
export type FileBase<R extends {} = {}> = Common & R & {
  /**
   * A list of child files, recursively defined using FileBase.
   */
  children?: FileBase<Common & R>[];
};