import {IMediaFile, MediaType, namedId} from "@stoked-ui/media-selector";

export { MediaType };
export type FileId = string;

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
  file?: IMediaFile;
  visibleIndex?: number;
  expanded?: boolean;
  selected?: boolean;
  name?: string;
};

export function FileBaseFromMediaFile(file: IMediaFile) {
  const newId = namedId({id: 'file', length: 4});
  const type = file.type;
  const mediaType = file.mediaType;
  const fileBase = {
    mime: type,
    type: mediaType,
    id: newId,
    itemId: newId,
    file,
    label: file.name,
    expanded: false,
    modified: file.lastModified,
    size: file.size,
    children: [] as FileBase[],
    parent: null,
  } as FileBase;
  return fileBase;
}

export type FileBaseInput<R extends {} = {}> = R & CommonBase & {
  children?: FileBaseInput<R>[];
  size?: number;
  modified?: number;
  type?: MediaType;
};
