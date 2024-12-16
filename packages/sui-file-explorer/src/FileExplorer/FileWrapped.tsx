import * as React from "react";
import { useSlotProps } from "@mui/base/utils";
import { MediaType } from '@stoked-ui/media-selector'
import { FileExplorerProps } from "./FileExplorer.types";
import { File, FileProps } from "../File";

export function FileWrapped<Multiple extends boolean | undefined>(props: Pick<FileExplorerProps<Multiple>, 'slots' | 'slotProps'> &
  Pick<FileProps, 'children' | 'id'> & { mediaType: MediaType, type: string, size: number, lastModified: number, label: string, last?: boolean }) {
  const {
    slots,
    slotProps,
    label,
    children,
    last,
    id,
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
    additionalProps: { label, id, last, type, mediaType, size, lastModified, ...other},
    ownerState: { id: id!, label },
  });
  return <Item {...itemProps}>{children}</Item>;
}
