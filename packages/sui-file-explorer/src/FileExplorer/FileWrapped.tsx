import * as React from "react";
import { useSlotProps } from "@mui/base/utils";
import { MediaType, IMediaFile2 } from '@stoked-ui/media-selector'
import { FileExplorerProps } from "./FileExplorer.types";
import { File, FileProps } from "../File";

export function FileWrapped<R extends IMediaFile2, Multiple extends boolean | undefined>(props: Pick<FileExplorerProps<R, Multiple>, 'slots' | 'slotProps'> &
  Pick<FileProps, 'children' | 'id' | 'itemId'> & { mediaType: MediaType, type: string, size: number, lastModified: number, label: string, last?: boolean }) {
  const {
    slots,
    slotProps,
    label,
    children,
    last,
    id,
    itemId,
    type,
    mediaType,
    size,
    lastModified,
    ...other
  } = props;
  const Item = slots?.item ?? File;
  const itemProps = useSlotProps({
    elementType: Item,
    externalSlotProps: slotProps?.item,
    additionalProps: { label, id, itemId, last, type, mediaType, size, lastModified, ...other},
    ownerState: { itemId: itemId!, label },
  });
  return <Item {...itemProps}>{children}</Item>;
}
