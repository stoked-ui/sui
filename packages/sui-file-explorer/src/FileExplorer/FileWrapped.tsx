import * as React from "react";
import { useSlotProps } from "@mui/base/utils";
import { FileExplorerProps } from "./FileExplorer.types";
import { File, FileProps } from "../File";
import { FileBase, FileType } from "../models";

export function FileWrapped<R extends FileBase, Multiple extends boolean | undefined>(props: Pick<FileExplorerProps<R, Multiple>, 'slots' | 'slotProps'> &
  Pick<FileProps, 'children' | 'id' | 'itemId'> & { type: FileType, size: number, modified: number, label: string, last?: boolean }) {
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
    modified,
    ...other
  } = props;
  const Item = slots?.item ?? File;
  const itemProps = useSlotProps({
    elementType: Item,
    externalSlotProps: slotProps?.item,
    additionalProps: { label, id, itemId, last, type, size, modified, ...other},
    ownerState: { itemId: itemId!, label },
  });
  return <Item {...itemProps}>{children}</Item>;
}
