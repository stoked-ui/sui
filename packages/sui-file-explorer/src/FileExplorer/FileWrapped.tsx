import * as React from "react";
import { useSlotProps } from "@mui/base/utils";
import { MediaType } from '@stoked-ui/media-selector'
import { FileExplorerProps } from "./FileExplorer.types";
import { File, FileProps } from "../File";
import { FileBase } from "../models";

export function FileWrapped<R extends FileBase, Multiple extends boolean | undefined>(props: Pick<FileExplorerProps<R, Multiple>, 'slots' | 'slotProps'> &
  Pick<FileProps, 'children' | 'id' | 'itemId'> & { type: MediaType, size: number, lastModified: number, label: string, last?: boolean }) {
  const {
    slots,
    slotProps,
    label,
    children,
    last,
    id,
    itemId,
    type,
    size,
    lastModified,
    ...other
  } = props;
  const Item = slots?.item ?? File;
  const itemProps = useSlotProps({
    elementType: Item,
    externalSlotProps: slotProps?.item,
    additionalProps: { label, id, itemId, last, type, size, lastModified, ...other},
    ownerState: { itemId: itemId!, label },
  });
  return <Item {...itemProps}>{children}</Item>;
}
