import { IMediaFile } from "@stoked-ui/media-selector";
import { OutputBlob } from "@stoked-ui/timeline";
import * as React from "react";
import {
  EditorControlsProps, EditorControlsPropsBase, EditorControlsSlotProps, EditorControlsSlots
} from "../EditorControls";
import {SlotComponentProps} from "@mui/base/utils";

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
  mediaFile: IMediaFile
}

export interface EditorScreenerProps
  extends EditorScreenerPropsBase {
  /**
   * Overridable component slots.
   * @default {}
   */
  slots?: EditorScreenerSlots;
  /**
   * The props used for each component slot.
   * @default {}
   */
  slotProps?: EditorScreenerSlotProps
}
