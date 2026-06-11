import { IMediaFile } from "@stoked-ui/media";
import { OutputBlob } from "@stoked-ui/timeline";
import * as React from "react";
import {SlotComponentProps} from "@mui/base/utils";
import {
  EditorControlsProps, EditorControlsPropsBase, EditorControlsSlotProps, EditorControlsSlots
} from "../EditorControls";

export type VersionProps =  {
  versions: OutputBlob[];
  currentVersion: string | undefined;
  setCurrentVersion: React.Dispatch<React.SetStateAction<string | undefined>>;
}


export interface EditorScreenerSlots {
  /**
   * Element rendered at the root.
   * @default EditorControlsRoot
   */
  root?: React.ElementType;

  screener?: React.ElementType;
}

export interface EditorScreenerSlotProps {
  root?: SlotComponentProps<'div', {}, EditorScreenerSlots>;

  screener?: SlotComponentProps<React.ElementType, {}, { mediaFile: IMediaFile }>;
}

interface EditorScreenerPropsBase {
  file: IMediaFile
}
