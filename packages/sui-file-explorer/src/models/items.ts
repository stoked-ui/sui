import {IMediaFile, MediaType, namedId} from "@stoked-ui/media-selector";

export type FileId = string;

type CommonBase = {
  id?: string;
  name?: string;
  itemId?: string;
}

export type FileBaseInput<R extends {} = {}> = R & CommonBase & {
  children?: FileBaseInput<R>[];
  size?: number;
  lastModified?: number;
  type?: MediaType;
};
