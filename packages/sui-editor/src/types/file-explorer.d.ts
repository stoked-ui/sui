declare module '@stoked-ui/file-explorer' {
  import * as React from 'react';

  export interface FileExplorerTabsProps {
    showControls?: boolean;
    onDragEnter?: React.DragEventHandler<HTMLDivElement>;
    onDragLeave?: React.DragEventHandler<HTMLDivElement>;
    onDrop?: React.DragEventHandler<HTMLDivElement>;
    onDragOver?: React.DragEventHandler<HTMLDivElement>;
    onFileClick?: (file: any) => void;
    onFolderClick?: (file: any) => void;
    selectedFile?: any;
    className?: string;
    getFilePreview?: (file: any) => React.ReactNode;
    folders?: any[];
    files?: any[];
    sx?: any;
    setTabName?: React.Dispatch<React.SetStateAction<string>>;
    tabNames?: string[];
    tabData?: Record<string, ExplorerPanelProps>;
    currentTab?: { name: string; files?: readonly FileBase[] };
    variant?: string;
    id?: string;
  }

  export interface ExplorerPanelProps {
    onFileClick?: (file: any) => void;
    onFolderClick?: (file: any) => void;
    showControls?: boolean;
    items?: any[];
    getFilePreview?: (file: any) => React.ReactNode;
    variant?: string;
    className?: string;
    sx?: any;
  }

  export interface FileBase {
    id: string;
    name: string;
    type?: string;
    size?: number;
    path?: string;
  }

  export interface FileExplorerProps {
    showControls?: boolean;
    onDragEnter?: React.DragEventHandler<HTMLDivElement>;
    onDragLeave?: React.DragEventHandler<HTMLDivElement>;
    onDrop?: React.DragEventHandler<HTMLDivElement>;
    onDragOver?: React.DragEventHandler<HTMLDivElement>;
    onFileClick?: (file: any) => void;
    onFolderClick?: (file: any) => void;
    selectedFile?: any;
    className?: string;
    getFilePreview?: (file: any) => React.ReactNode;
    folders?: any[];
    files?: any[];
    sx?: any;
  }

  export interface FileElement {
    id: string;
    name: string;
    children?: FileElement[];
    parent?: FileElement;
    selected?: boolean;
    expanded?: boolean;
    file?: any;
  }

  export function useFileExplorerApiRef(): any;
  export function FileExplorer(props: FileExplorerProps): JSX.Element;
  export function FileExplorerTabs(props: FileExplorerTabsProps): JSX.Element;
  export function FileExplorerBasic(props: any): JSX.Element;
  export function FileElement(props: any): JSX.Element;
} 
