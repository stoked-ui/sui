import * as React from 'react';
import { IMediaFile } from '@stoked-ui/media-selector';
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
import { FileBase, FileId } from '../models';
import {
  FileExplorerExperimentalFeatures,
  FileExplorerPublicAPI,
  SlotComponentPropsFromProps,
} from '../internals/models';

interface FileExplorerItemSlotOwnerState {
  itemId: FileId;
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

export interface FileExplorerSlotProps<R extends FileBase, Multiple extends boolean | undefined>
  extends FileExplorerPluginSlotProps {
  root?: SlotComponentProps<'ul', {}, FileExplorerProps<R, Multiple>>;
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

  onAddFiles?:  (mediaFile: IMediaFile[]) => void;
}

export interface FileExplorerProps<R extends FileBase, Multiple extends boolean | undefined>
  extends FileExplorerPluginParameters<R, Multiple>,
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
  slotProps?: FileExplorerSlotProps<R, Multiple>;
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
