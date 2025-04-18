import { MediaType } from "@stoked-ui/media-selector";

export type FileId = string;

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

export type FileBaseInput<R extends {} = {}> = CommonBase & R & {
  children?: FileBaseInput<CommonBase & R>[];
};

type Common = Omit<CommonBase, 'id' | 'name' | 'mediaType' | 'type'> & {
  id: string;
  name: string;
  mediaType: MediaType;
  type: string;
}

export type FileBase<R extends {} = {}> = Common & R & {
  children?: FileBase<Common & R>[];
};
