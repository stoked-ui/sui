import type {BaseEventPayload, DragLocation} from "@atlaskit/pragmatic-drag-and-drop/types";
import type {Instruction} from "@atlaskit/pragmatic-drag-and-drop-hitbox/tree-item";
import {FileBase} from '../../../models';
import {DndState} from '../../models/fileExplorerView';
import {FileExplorerPluginSignature} from "../../models/plugin.types";
import {FileExplorerDndContextValue} from "./FileExplorerDndContext";
import type {
  UseFileExplorerFilesSignature
} from "../useFileExplorerFiles/useFileExplorerFiles.types";

export type DndItemState = {
  dndState: DndState,
  dndContainer: HTMLElement | null,
  dndInstruction: any | null
}

export type ElementDragPayload = {
  element: HTMLElement ,
  dragHandle: Element | null,
  data: Record<string, unknown>
}

export type ElementDragType = {
  type: 'element';
  startedFrom: 'internal';
  payload: ElementDragPayload;
}

export type DropInternalData = {
  dropped: {
    item: FileBase;
    dnd: ElementDragPayload;
  },
  target: {
    item: FileBase;
    dnd: DragLocation;
  },
  instruction: Instruction;
}

export type DndTrashMode = 'remove' | 'collect-remove-restore' | 'collect-restore' | 'collect';

export interface UseFileListItemsInstance {
  dndConfig: () => {
    dndInternal?: true;
    dndExternal?: true;
    dndFileTypes?: string[];
    dndTrash?: true;
  } | undefined;
  dndEnabled: () => boolean;
  dndInternalEnabled: () => boolean;
  dndExternalEnabled: () => boolean;
  dndExternalFileTypes: () =>  string[];
  dndTrash: () => true | undefined;
  getDndContext: FileExplorerDndContextValue<FileBase>
  dropInternal: (event: BaseEventPayload<ElementDragType>) => void;
  createChildren: (items: FileBase[], targetId: string | null) => void;
  createChild: (item: FileBase, targetId: string | null) => void;
  removeItem: (itemId: string) => void;
}

export interface UseFileExplorerDndParameters {
  dndInternal?: true;
  dndExternal?: true;
  dndFileTypes?: string[];
  dndTrash?: true;
}

export type UseFileExplorerDndDefaultizedParameters = UseFileExplorerDndParameters;

interface UseFileExplorerDndContextValue {
  dnd: {
    dndInternal?: true;
    dndExternal?: true;
    dndFileTypes?: string[];
    dndTrash?: true;
  } | undefined;
}

export type UseFileExplorerDndSignature = FileExplorerPluginSignature<{
  params: UseFileExplorerDndParameters;
  defaultizedParams: UseFileExplorerDndDefaultizedParameters;
  instance: UseFileListItemsInstance;
  dependencies: [UseFileExplorerFilesSignature];
  contextValue: UseFileExplorerDndContextValue;
}>;
