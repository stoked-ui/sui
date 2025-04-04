/**
 * Importing required components and interfaces.
 */
import { IMediaFile } from "@stoked-ui/media-selector";
import { OutputBlob } from "@stoked-ui/timeline";
import * as React from "react";
import {
  EditorControlsProps, EditorControlsPropsBase, EditorControlsSlotProps, EditorControlsSlots
} from "../EditorControls";
import { SlotComponentProps } from "@mui/base/utils";

/**
 * Props for the EditorScreener component.
 */
export type VersionProps = {
  /**
   * Array of available versions.
   */
  versions: OutputBlob[];
  /**
   * Current version selected.
   */
  currentVersion: string | undefined;
  /**
   * Dispatch function to update the current version state.
   */
  setCurrentVersion: React.Dispatch<React.SetStateAction<string | undefined>>;
};

/**
 * Props for the EditorScreener component's slots.
 */
export interface EditorScreenerSlots {
  /**
   * Element type to render at the root level.
   * @default EditorControlsRoot
   */
  root?: React.ElementType;

  /**
   * Element type to render the screener preview.
   */
  screener?: React.ElementType;
}

/**
 * Props for the individual slots within the EditorScreener component.
 */
export interface EditorScreenerSlotProps {
  /**
   * Props for the slot at the root level.
   */
  root?: SlotComponentProps<'div', {}, EditorScreenerSlots>;

  /**
   * Props for the slot containing the screener preview.
   */
  screener?: SlotComponentProps<React.ElementType, {}, { mediaFile: IMediaFile }>;
}

/**
 * Base props for the EditorScreener component.
 */
interface EditorScreenerPropsBase {
  /**
   * The media file being edited.
   */
  file: IMediaFile;
}