import * as React from 'react';
import { Theme } from '@mui/material/styles';
import { SlotComponentProps } from '@mui/base/utils';
import { SxProps } from '@mui/system';
import { FileExplorerBasicClasses } from './fileExplorerBasicClasses';
import {
  FileExplorerBasicPluginParameters,
  FileExplorerBasicPluginSignatures,
  FileExplorerBasicPluginSlotProps,
  FileExplorerBasicPluginSlots,
} from './FileExplorerBasic.plugins';
import { FileExplorerExperimentalFeatures, FileExplorerPublicAPI } from '../internals/models';

export interface FileExplorerBasicSlots extends FileExplorerBasicPluginSlots {
  /**
   * Element rendered at the root.
   * @default FileExplorerBasicRoot
   */
  root?: React.ElementType;
}

export interface FileExplorerBasicSlotProps extends FileExplorerBasicPluginSlotProps {
  root?: SlotComponentProps<'ul', {}, {}>;
}

export type FileExplorerBasicApiRef = React.MutableRefObject<
  FileExplorerPublicAPI<FileExplorerBasicPluginSignatures> | undefined
>;

export interface FileExplorerBasicProps<Multiple extends boolean | undefined>
  extends FileExplorerBasicPluginParameters<Multiple>,
    React.HTMLAttributes<HTMLUListElement> {
  /**
   * The content of the component.
   */
  children?: React.ReactNode;
  /**
   * Overridable component slots.
   */
  slots?: FileExplorerBasicSlots;
  /**
   * The props used for each component slot.
   */
  slotProps?: FileExplorerBasicSlotProps;
  className?: string;
  /**
   * Override or extend the styles applied to the component.
   */
  classes?: Partial<FileExplorerBasicClasses>;
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx?: SxProps<Theme>;
  /**
   * The ref object that allows FileExplorer View manipulation. Can be instantiated with `useFileExplorerApiRef()`.
   */
  apiRef?: FileExplorerBasicApiRef;
  /**
   * Unstable features, breaking changes might be introduced.
   * For each feature, if the flag is not explicitly set to `true`,
   * the feature will be fully disabled and any property / method call will not have any effect.
   */
  experimentalFeatures?: FileExplorerExperimentalFeatures<FileExplorerBasicPluginSignatures>;
}
