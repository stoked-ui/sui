import * as React from 'react';
import { Theme } from '@mui/material/styles';
import { SxProps } from '@mui/system';
import { SlotComponentProps } from '@mui/base/utils';
import { FileExplorerClasses } from './fileExplorerClasses';
import {
  FileExplorerPluginParameters,
  FileExplorerPluginSignatures,
  FileExplorerPluginSlotProps,
  FileExplorerPluginSlots,
} from './FileExplorer.plugins';
import { FileProps } from '../File';
import { FileId, FileBase } from '../models';
import {
  FileExplorerExperimentalFeatures,
  FileExplorerPublicAPI,
  SlotComponentPropsFromProps,
} from '../internals/models';

/**
 * Represents the state of a file explorer item slot owner.
 */
interface FileExplorerItemSlotOwnerState {
  id: FileId;
  label: string;
}

/**
 * Represents the available slots for a file explorer component.
 */
export interface FileExplorerSlots extends FileExplorerPluginSlots {
  /**
   * Element rendered at the root.
   * @default FileExplorerRoot
   */
  root?: React.ElementType;
  /**
   * Custom component for the item.
   * @default CCV FileExplorerItem.
   */
  item?: React.JSXElementConstructor<FileProps> | React.JSXElementConstructor<FileProps>;
}

/**
 * Represents the props for the file explorer slots.
 */
export interface FileExplorerSlotProps<Multiple extends boolean | undefined>
  extends FileExplorerPluginSlotProps {
  root?: SlotComponentProps<'ul', {}, FileExplorerProps<Multiple>>;
  item?: SlotComponentPropsFromProps<
    FileProps | FileProps,
    {},
    FileExplorerItemSlotOwnerState
  >;
}

/**
 * Represents the reference object for the file explorer public API.
 */
export type FileExplorerApiRef = React.MutableRefObject<
  FileExplorerPublicAPI<FileExplorerPluginSignatures> | undefined
>;

/**
 * Represents the base props for the file explorer component.
 */
export interface FileExplorerPropsBase extends React.HTMLAttributes<HTMLUListElement> {
  className?: string;
  /**
   * Override or extend the styles applied to the component.
   */
  classes?: Partial<FileExplorerClasses>;
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx?: SxProps<Theme>;

  dropzone?: boolean;

  /**
   * Callback function triggered when new files are added.
   * @param {FileBase[]} mediaFile - The array of files being added.
   */
  onAddFiles?: (mediaFile: FileBase[]) => void;
  /**
   * Callback function triggered when an item is double-clicked.
   * @param {FileBase} item - The file item being double-clicked.
   */
  onItemDoubleClick?: (item: FileBase) => void;
}

/**
 * Represents the props for the file explorer component.
 */
export interface FileExplorerProps<Multiple extends boolean | undefined>
  extends FileExplorerPluginParameters<Multiple>,
    FileExplorerPropsBase {
  /**
   * Overridable component slots.
   * @default {}
   */
  slots?: FileExplorerSlots;
  /**
   * The props used for each component slot.
   * @default {}
   */
  slotProps?: FileExplorerSlotProps<Multiple>;
  /**
   * The ref object that allows FileExplorer View manipulation. Can be instantiated with
   * `useFileExplorerApiRef()`.
   */
  apiRef?: FileExplorerApiRef;
  /**
   * Unstable features, breaking changes might be introduced.
   * For each feature, if the flag is not explicitly set to `true`,
   * the feature will be fully disabled and any property / method call will not have any effect.
   */
  experimentalFeatures?: FileExplorerExperimentalFeatures<FileExplorerPluginSignatures>;
}