import { MediaFile, MediaType } from "@stoked-ui/media-selector";

export type FileId = string;

type CommonBase = {
  id?: string;
  label?: string;
  itemId?: string;
}
/*
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
}; */

export type FileBaseInput<R extends {} = {}> = R & CommonBase & {
  children?: FileBaseInput<R>[];
  size?: number;
  modified?: number;
  type?: MediaType;
};

