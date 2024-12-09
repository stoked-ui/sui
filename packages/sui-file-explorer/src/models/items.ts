import { MediaType } from "@stoked-ui/media-selector";
import { IMediaFileEx } from "../internals";

export type FileId = string;

type CommonBase = {
  id?: string;
  name?: string;
}
type FileBaseInputEx = Omit<IMediaFileEx, 'id' | 'name' | 'children' | 'size' | 'lastModified' | 'type'> & CommonBase & {
  size?: number;
  lastModified?: number;
  type?: MediaType;
};

export type FileBaseInput<R extends {} = {}> = FileBaseInputEx & R & {
  children?: FileBaseInput<FileBaseInputEx & R>[];
};
