import * as React from 'react';
import { Theme } from '@mui/material/styles';
import { SxProps } from '@mui/system';
import { SlotComponentProps } from '@mui/base/utils';
import { FileExplorerTabsClasses } from './fileExplorerTabsClasses';
import {
  SlotComponentPropsFromProps,
} from '../internals/models';
import type { FileExplorer } from '../FileExplorer/FileExplorer';
import {FileExplorerProps} from "../FileExplorer";
import {FileBase} from "../models";

export interface ExplorerPanelProps {
  name: string;
  items: readonly FileBase[];
  gridColumns?: { [p: string]: (item: any) => string } | undefined,
  onItemDoubleClick?: (item: FileBase) => void;
  selectedId?: string;
  expandedItems?: string[];
}

export interface FileExplorerTabsSlots {
  root?: React.ElementType;
  /**
   * Element rendered at the root.
   * @default FileExplorerRoot
   */
  label?: React.ElementType;
  /**
   * Custom component for the item.
   * @default CCV F ileExplorerItem.
   */
  folder?: typeof FileExplorer;
}

export interface FileExplorerTabsSlotProps {
  root?: SlotComponentProps<'div', {}, {}>;
  label?: SlotComponentProps<'div', {}, {}>;
  folder?: SlotComponentPropsFromProps<typeof FileExplorer,{}, FileExplorerProps<any>>;
}

export interface FileExplorerTabsPropsBase extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  /**
   * Override or extend the styles applied to the component.
   */
  classes?: Partial<FileExplorerTabsClasses>;
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx?: SxProps<Theme>;
  tabSx?: SxProps<Theme>;
  currentTab: { name: string, files?: readonly FileBase[]};
  tabData: Record<string, ExplorerPanelProps>;
  setTabName: (tabName: string) => void;
  tabNames: string[];
  drawerOpen: () => void;
  variant?: 'standard' | 'drawer';
  onItemDoubleClick?: (item: FileBase) => void;
}

export interface FileExplorerTabsProps
  extends FileExplorerTabsPropsBase {
  /**
   * Overridable component slots.
   * @default {}
   */
  slots?: FileExplorerTabsSlots;
  /**
   * The props used for each component slot.
   * @default {}
   */
  slotProps?: FileExplorerTabsSlotProps;
}

export interface FileExplorerTabProps {
  children?: React.ReactNode;
  name?: string;
  files?: readonly FileBase[];
  sx?: SxProps<Theme>;
  index: number;
  value: number;
}

