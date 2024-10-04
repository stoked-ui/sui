import {MediaFile} from "@stoked-ui/media-selector";

export type FileId = string;
export type MediaType = 'image' | 'pdf' | 'doc' | 'video' | 'folder' | 'trash' | 'file' | 'lottie'

type CommonBase = {
  id?: string;
  label?: string;
  itemId?: string;
}

export type FileBase<R extends {} = {}> = R & CommonBase & {
  children?: FileBase<R>[];
  size?: number;
  modified?: number;
  type?: MediaType;
  file?: MediaFile;
  visibleIndex?: number;
  expanded?: boolean;
  selected?: boolean;
  name?: string;
};

export type FileBaseInput<R extends {} = {}> = R & CommonBase & {
  children?: FileBaseInput<R>[];
  size?: number;
  modified?: number;
  type?: MediaType;
};
