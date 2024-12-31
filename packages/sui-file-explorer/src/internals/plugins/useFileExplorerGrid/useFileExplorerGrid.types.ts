import * as React from "react";
import {SystemStyleObject} from "@mui/system";
import {DefaultizedProps, FileExplorerPlugin, FileExplorerPluginSignature} from '../../models';
import {FileId} from '../../../models';
import {UseFileStatus} from "../../models/UseFileStatus";
import {ItemMode} from "../useFileExplorerFiles/useFileExplorerFiles.types";

export type GridHeader = {
  sx: SystemStyleObject,
  renderContent: (content: any) => string,
  width: number,
  status: UseFileExplorerGridColumnHeaderStatus
}

export type GridHeaders = {
  [id: string]: GridHeader;
};

export type GridColumnRowData = {
  [key: string]: {
    width: number,
    waiting?: boolean
  }
}

export interface UseFileExplorerGridColumnHeaderStatus {
  ascending: boolean;
  focused: boolean;
  visible: boolean;
  sort: boolean;
}

export type GridColumn = {
  sx: SystemStyleObject,
  renderContent: (content: any) => string,
  getContent?: (item: any) => any,
  evaluator?: (item: any, columnName: string) => any,
  width: number,
  track: GridColumnRowData,
  waiting: boolean
  cells: React.ReactElement[];
  children: (cells: React.ReactElement[]) => React.ReactNode;
}

export type GridColumns = {
  [id: string]: GridColumn;
};

export interface UseFileExplorerGridPublicAPI {
  setVisibleOrder: (value: FileId[]) => void;
  setColumns: (value: GridColumns) => void;
  gridEnabled: () => boolean;
}

export type UseFileExplorerGridPlugin = FileExplorerPlugin<UseFileExplorerGridSignature>;

export interface UseFileExplorerGridInstance extends UseFileExplorerGridPublicAPI {
  getItemStatus: (id: FileId, children: React.ReactNode) => UseFileStatus
  getAltRowClass: (id: FileId) => string;
  getColumns: () => GridColumns;
  getHeaders: () => GridHeaders;
  focusHeader: (event: React.FocusEvent | React.MouseEvent | null, columnName: string) => void;
  blurHeader: (event: React.FocusEvent | null, columnName: string) => void;
  isColumnAscending: (columnName: string) => boolean | null;
  isColumnFocused: (columnName: string) => boolean | null;
  isColumnVisible: (columnName: string) => boolean | null;
  isSortColumn: (columnName: string) => boolean | null;
  getHeaderStatus: (columnName: string) =>  UseFileExplorerGridColumnHeaderStatus;
  toggleColumnSort: (colunName: string) => boolean | null;
  toggleColumnVisible: (colunName: string) => boolean | null;
  gridEnabled: () => boolean;
  getItemMode: (item: any) => ItemMode;
}

export interface UseFileExplorerGridParameters {
  grid?: boolean;
  gridHeader?: boolean;
  columns?: GridColumns;
  headers?: GridHeaders;
  initializedIndexes?: boolean;
  defaultGridColumns?: GridColumns;
  defaultGridHeaders?: GridHeaders;
  gridColumns?: { [name: string]: (item: any) => string };
}

export type UseFileExplorerGridDefaultizedParameters = DefaultizedProps<UseFileExplorerGridParameters, 'defaultGridColumns' | 'defaultGridHeaders'>;

export interface UseFileExplorerGridStateGuts {
  columns: GridColumns;
  headers: GridHeaders;
  initializedIndexes: boolean;
}

export interface UseFileExplorerGridState {
  grid: UseFileExplorerGridStateGuts;
  id: string;
}

type ContextValue = Pick<UseFileExplorerGridParameters, 'columns' | 'headers' | 'grid' | 'gridHeader'>;
interface UseFileExplorerGridContextValue extends ContextValue {
  grid: boolean;
  gridHeader: boolean;
  id: string;
}

export type UseFileExplorerGridSignature = FileExplorerPluginSignature<{
  params: UseFileExplorerGridParameters;
  defaultizedParams: UseFileExplorerGridDefaultizedParameters;
  instance: UseFileExplorerGridInstance;
  publicAPI: UseFileExplorerGridPublicAPI;
  state: UseFileExplorerGridState;
  contextValue: UseFileExplorerGridContextValue;
  dependencies:  [

  ];
}>;
