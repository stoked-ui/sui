/**
 * Represents the type of media (e.g., image, video) for a file.
 */
import { MediaType } from "@stoked-ui/media-selector";

/**
 * Represents a unique identifier for a file.
 */
export type FileId = string;

/**
 * Represents the common properties shared by file objects.
 */
type CommonBase = {
  id?: string;
  name?: string;
  size?: number;
  lastModified?: number;
  mediaType?: MediaType;
  url?: string;
  media?: any;
  type?: string;
  created?: number;
  path?: string;
  expanded?: boolean;
  selected?: boolean;
  visibleIndex?: number;
  version?: number;
}

/**
 * Represents the input structure for a file with base properties.
 */
export type FileBaseInput<R extends {} = {}> = CommonBase & R & {
  children?: FileBaseInput<CommonBase & R>[];
};

/**
 * Represents the common properties shared by file objects.
 */
type Common = Omit<CommonBase, 'id' | 'name' | 'mediaType' | 'type'> & {
  id: string;
  name: string;
  mediaType: MediaType;
  type: string;
}

/**
 * Represents the structure for a file with base properties.
 */
export type FileBase<R extends {} = {}> = Common & R & {
  children?: FileBase<Common & R>[];
};