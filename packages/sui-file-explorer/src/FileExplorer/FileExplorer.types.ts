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
 * The state of the item slot owner.
 */
interface FileExplorerItemSlotOwnerState {
  /**
   * The ID of the file.
   */
  id: FileId;
  /**
   * The label of the file.
   */
  label: string;
}

/**
 * Props for the root component of the File Explorer.
 */
export interface FileExplorerSlots extends FileExplorerPluginSlots {
  /**
   * The element to render at the root.
   * @default FileExplorerRoot
   */
  root?: React.ElementType;

  /**
   * Custom component for the item.
   * @default CCV F ileExplorerItem.
   */
  item?: React.JSXElementConstructor<FileProps> | React.JSXElementConstructor<FileProps>;
}

/**
 * Props for a single slot in the File Explorer.
 */
export interface FileExplorerSlotProps<Multiple extends boolean | undefined>
  extends FileExplorerPluginSlotProps {
  /**
   * The root props for the list.
   */
  root?: SlotComponentProps<'ul', {}, FileExplorerProps<Multiple>>;

  /**
   * The item props.
   */
  item?: SlotComponentPropsFromProps<
    FileProps | FileProps,
    {},
    FileExplorerItemSlotOwnerState
  >;
}

/**
 * A reference to the File Explorer public API.
 */
export type FileExplorerApiRef = React.MutableRefObject<
  FileExplorerPublicAPI<FileExplorerPluginSignatures> | undefined
>;

/**
 * Base props for the File Explorer component.
 */
export interface FileExplorerPropsBase extends React.HTMLAttributes<HTMLUListElement> {
  /**
   * The CSS class name of the component.
   */
  className?: string;

  /**
   * Override or extend the styles applied to the component.
   */
  classes?: Partial<FileExplorerClasses>;

  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx?: SxProps<Theme>;

  /**
   * Whether the component should render a dropzone.
   */
  dropzone?: boolean;

  /**
   * Callback function when adding files to the list.
   */
  onAddFiles?: (mediaFile: FileBase[]) => void;

  /**
   * Callback function when an item is double-clicked.
   */
  onItemDoubleClick?: (item: FileBase) => void;
}

/**
 * Props for the File Explorer component with experimental features.
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
   * A reference to the File Explorer public API.
   */
  apiRef?: FileExplorerApiRef;

  /**
   * Unstable features, breaking changes might be introduced.
   * For each feature, if the flag is not explicitly set to `true`,
   * the feature will be fully disabled and any property / method call will not have any effect.
   */
  experimentalFeatures?: FileExplorerExperimentalFeatures<FileExplorerPluginSignatures>;
}