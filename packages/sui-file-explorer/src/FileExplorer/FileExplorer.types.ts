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

interface FileExplorerItemSlotOwnerState {
  id: FileId;
  label: string;
}

export interface FileExplorerSlots extends FileExplorerPluginSlots {
  /**
   * Element rendered at the root.
   * @default FileExplorerRoot
   */
  root?: React.ElementType;
  /**
   * Custom component for the item.
   * @default CCV F ileExplorerItem.
   */
  item?: React.JSXElementConstructor<FileProps> | React.JSXElementConstructor<FileProps>;
}

export interface FileExplorerSlotProps<Multiple extends boolean | undefined>
  extends FileExplorerPluginSlotProps {
  root?: SlotComponentProps<'ul', {}, FileExplorerProps<Multiple>>;
  item?: SlotComponentPropsFromProps<
    FileProps | FileProps,
    {},
    FileExplorerItemSlotOwnerState
  >;
}

export type FileExplorerApiRef = React.MutableRefObject<
  FileExplorerPublicAPI<FileExplorerPluginSignatures> | undefined
>;

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

  onAddFiles?:  (mediaFile: FileBase[]) => void;
  onItemDoubleClick?: (item: FileBase) => void;
}

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
