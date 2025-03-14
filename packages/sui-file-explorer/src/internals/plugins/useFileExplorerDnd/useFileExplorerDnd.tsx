import * as React from "react";
import type {BaseEventPayload, DragLocationHistory} from "@atlaskit/pragmatic-drag-and-drop/types";
import useForkRef from "@mui/utils/useForkRef";
import invariant from "tiny-invariant";
import {combine} from "@atlaskit/pragmatic-drag-and-drop/combine";
import {
  draggable, dropTargetForElements, monitorForElements
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import {
  setCustomNativeDragPreview
} from "@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview";
import {
  pointerOutsideOfPreview
} from "@atlaskit/pragmatic-drag-and-drop/element/pointer-outside-of-preview";
import {
  dropTargetForExternal, monitorForExternal
} from "@atlaskit/pragmatic-drag-and-drop/external/adapter";
import {containsFiles} from "@atlaskit/pragmatic-drag-and-drop/external/file";
import {preventUnhandled} from "@atlaskit/pragmatic-drag-and-drop/prevent-unhandled";
import type {Instruction} from "@atlaskit/pragmatic-drag-and-drop-hitbox/tree-item";
import {MediaFile} from "@stoked-ui/media-selector";
import { FileBase} from "../../../models";
import memoizeOne from "memoize-one";
import {
  triggerPostMoveFlash
} from "@atlaskit/pragmatic-drag-and-drop-flourish/trigger-post-move-flash";
import {FileExplorerPlugin, FilePlugin, FilePluginOptions} from '../../models/plugin';
import {
  DndItemState, DropInternalData, ElementDragType, UseFileExplorerDndSignature
} from './useFileExplorerDnd.types';
import {FileExplorerDndAction} from "./FileExplorerDndAction";
import {indentPerLevel} from "./constants";
import {FileExplorerDndItemContext} from "./FileExplorerDndItemContext";
import {
  fileExplorer,
  FileExplorerDndContext,
  FileExplorerDndContextValue,
  FileExplorerState,
  fileListStateReducer,
  getFileExplorerStateDefault
} from "./FileExplorerDndContext";
import {UseMinimalPlus} from "../../models/plugin.types";


type CleanupFn = () => void;

function createFileRegistry() {
  const registry = new Map<string, { element: HTMLElement }>();

  const registerFile = ({id, element}: {
    id: string;
    element: HTMLElement;
  }): CleanupFn => {
    registry.set(id, { element });
    return () => {
      registry.delete(id);
    };
  };

  return { registry, registerFile };
}


export const useFileExplorerDnd: FileExplorerPlugin<UseFileExplorerDndSignature> = ({
  instance,
  params,
  rootRef,
}) => {

  const reducerWrapper = <R extends FileBase>(wrappedState: FileExplorerState<R>, action: FileExplorerDndAction<R>)=> {
    const reducedState = fileListStateReducer(wrappedState, action);
    instance.updateItems(reducedState.items);
    instance.recalcVisibleIndices(reducedState.items, true, 0)
    if (params !== undefined && action.type === 'create-children') {
      const initialFiles = action.items.map((item) => item)
      const files: FileBase[] = initialFiles.filter((item) => item !== undefined) as FileBase[]
    }
    return reducedState;
  }

  const [reducedState, updateState] = React.useReducer(
    reducerWrapper,
    getFileExplorerStateDefault(),
    () => getFileExplorerStateDefault(params.items as FileBase[])
  );
  const [{ registry, registerFile }] = React.useState(createFileRegistry);
  const { items, lastAction } = reducedState;

  React.useEffect(() => {
    if (lastAction === null) {
      return;
    }

    if (lastAction.type === 'instruction') {
      const { element } = registry.get(lastAction.id) ?? {};
      if (element) {
        triggerPostMoveFlash(element);
      }
    }
  }, [lastAction, registry]);

  const createChildren = React.useCallback(
    (files: FileBase[], targetId: string | null) => {
      const childItems = files.flat(Infinity);
      params.onAddFiles?.(files);
      updateState({
        type: 'create-children',
        items: childItems,
        targetId,
        id: childItems[0].id ?? childItems[0].id!,
      });
    },
    [updateState],
  );

  const createChild = React.useCallback(
    (item: FileBase, targetId: string | null) => {
      updateState({
        type: 'create-child',
        item,
        targetId,
        id: item?.id ?? item?.id!,
      });
    },
    [updateState],
  );

  const removeItem = React.useCallback(
    (id: string) => {
      updateState({
        type: 'remove',
        id
      });
    }, []
  )
  const getMoveTargets = React.useCallback(({ id }: { id: string }) => {

    const targets: FileBase[] = [];

    const searchStack = Array.from(items);
    while (searchStack.length > 0) {
      const node = searchStack.pop();

      if (!node) {
        continue;
      }

      if (node.id === id) {
        continue;
      }

      if (!node.children) {
        node.children = new Array<FileBase>()
      }
      targets.push(node);

      node.children?.forEach((childNode) => searchStack.push(childNode as FileBase));
    }

    return targets;
  }, [items]);

  const getNodesOfItem = React.useCallback((id: string) => {
    if (id === '') {
      return [...items];
    }

    const item = fileExplorer.find(items as FileBase[], id);
    invariant(items);
    return item?.children ?? [];
  }, [items]);

  const getPathToItem = memoizeOne((targetId: string) =>
    fileExplorer.getPathToItem({ current: items as FileBase[], targetId }) ?? [],);

  const context = React.useMemo<FileExplorerDndContextValue<FileBase>>(
    () => ({
      dispatch: updateState,
      uniqueContextId: Symbol('unique-id'),
      // memoizing this function as it is called by all explorer items repeatedly
      // An ideal refactor would be to update our data shape
      // to allow quick lookups of parents
      getPathToItem,
      getMoveTargets,
      getNodesOfItem,
      registerFile,
    }), [updateState, getPathToItem, getMoveTargets, getNodesOfItem, registerFile],
  );


  const forkedRootRef = React.useRef<HTMLUListElement>(null);
  const combinedRootRef = useForkRef(rootRef, forkedRootRef);
  const { extractInstruction } = React.useContext(FileExplorerDndItemContext);

  const getDropInternalData = (event: BaseEventPayload<ElementDragType>): DropInternalData | undefined => {
    const { source, location } = event;
    // didn't drop on anything
    if (!location.current.dropTargets.length || source.data.type !== 'file-element') {
      return undefined;
    }

    const sourceId = source.data.id as string;
    const target = location.current.dropTargets[0];
    const targetId = target.data.id as string;
    const instruction: Instruction | null = extractInstruction(target.data);

    const targetItem = instance.getItem(targetId);
    const sourceItem = instance.getItem(sourceId);
    if (instruction === null) {
      return undefined;
    }
    return {
      dropped: {
        item: sourceItem,
        dnd: source,
      },
      target: {
        item: {...targetItem, type: targetItem.id === 'trash' ? 'trash' : targetItem.type},
        dnd: location.current
      },
      instruction
    };
  }
  const dropInternal = (event: BaseEventPayload<ElementDragType>) => {

    const handleTrashDrop = (data: DropInternalData) => {
      console.warn('handleTrashDrop', data)
      updateState({
        type: 'remove',
        id: data.dropped.item.id ?? data.dropped.item.id!,
      });
    }
    const handleFileDrop = (data: DropInternalData) => {
      console.warn('handleFileDrop', data)
    }
    const handleFolderDrop = (data: DropInternalData) => {
      updateState({
        type: 'instruction',
        instruction: data.instruction,
        id:  data.dropped.item.id ?? data.dropped.item.id!,
        targetId:  data.target.item.id ?? data.target.item.id!,
      });
    }

    const data = getDropInternalData(event);
    if (!data || data.instruction.type === 'instruction-blocked') {
      return;
    }

    switch(data.target.item.type) {
      case 'trash':
        handleTrashDrop(data);
        break;
      case 'folder':
        handleFolderDrop(data);
        break;
      case 'file':
      default:
        handleFileDrop(data);
        break;
    }
  }

  const getDndContext = React.useMemo(() => {
    return context;
  }, [context]);

  const dndEnabled = () => {
    return !!params.dndInternal || !!params.dndExternal;
  }

  const dndConfig = () => {
    return dndEnabled() ? {
      dndInternal: params.dndInternal,
      dndExternal: params.dndExternal,
      dndFileTypes: params.dndFileTypes,
      dndTrash: params.dndTrash,
    } : undefined;
  }
  const dndInternalEnabled = () => {
    return !!params.dndInternal
  }
  const dndExternalEnabled = () => {
    return !!params.dndExternal;
  }
  const dndExternalFileTypes = () => {
    return params.dndFileTypes ?? [];
  }
  const dndTrash = () => {
    return params.dndTrash;
  }
  return {
    rootRef: combinedRootRef,
    instance: {
      dndConfig,
      dndEnabled,
      dndInternalEnabled,
      dndExternalEnabled,
      dndExternalFileTypes,
      dndTrash,
      getDndContext,
      dropInternal,
      createChildren,
      createChild,
      removeItem
    },
    contextValue: {
      dnd: dndEnabled() ? {
        dndInternal: params.dndInternal ? true : undefined,
        dndExternal: params.dndExternal ? true : undefined,
        dndFileTypes: params.dndFileTypes ?? [],
        dndTrash: params.dndTrash,
      } : undefined
    },
    params: {
      onAddItems: params.onAddFiles,
      dndItems: reducedState.items,
      lastDndAction: reducedState.lastAction,
    }
  };
};



useFileExplorerDnd.getDefaultizedParams = (params) => ({
  ...params,
  dndInternal: params?.dndInternal ? true : undefined,
  dndExternal: params?.dndExternal ? true : undefined,
  dndFileTypes: params?.dndFileTypes ?? [],
  dndTrash: params?.dndTrash,
});

useFileExplorerDnd.params = {
  dndInternal: true,
  dndExternal: true,
  dndFileTypes: true,
  dndTrash: true,
  onAddFiles: true,
};

useFileExplorerDnd.getInitialState = () => ({

});

function delay({ waitMs: timeMs, fn }: { waitMs: number; fn: () => void }): () => void {
  let timeoutId: number | null = window.setTimeout(() => {
    timeoutId = null;
    fn();
  }, timeMs);
  return function cancel() {
    if (timeoutId) {
      window.clearTimeout(timeoutId);
      timeoutId = null;
    }
  };
}

const useFileExplorerDndItemPlugin: FilePlugin<UseMinimalPlus<UseFileExplorerDndSignature>> = (inProps: FilePluginOptions<UseMinimalPlus<UseFileExplorerDndSignature>>) => {
  const { props, rootRef, contentRef, instance, status } = inProps;
  const pluginContentRef                                = React.useRef<HTMLDivElement>(null);
  const handleContentRef = useForkRef(pluginContentRef, contentRef);
  const pluginRootRef = React.useRef<HTMLLIElement>(null);
  const handleRootRef = useForkRef(pluginRootRef, rootRef);

  //  useDnd({ status, pluginContentRef, props, instance });
  const cancelExpandRef = React.useRef<(() => void) | null>(null);
  const { uniqueContextId, getPathToItem, registerFile } = React.useContext(FileExplorerDndContext);
  const { attachInstruction, extractInstruction } =  React.useContext(FileExplorerDndItemContext);

  const state = (({dndState, dndInstruction, dndContainer}) => ({dndState, dndInstruction, dndContainer}))(props);

  const setState = (newState: DndItemState) => {
    instance.updateDndMeta(props.id!, newState);
  }

  React.useEffect(() => {
    if (pluginContentRef.current) {
      invariant(pluginContentRef.current);
      return registerFile({
        id: props.id!,
        element: pluginContentRef.current,
      });
    }
    return undefined;
  }, [props.id, registerFile]);

  function getParentLevelOfInstruction(currentInstruction: Instruction): number {
    if (currentInstruction.type === 'instruction-blocked') {
      return getParentLevelOfInstruction(currentInstruction.desired);
    }
    if (currentInstruction.type === 'reparent') {
      return currentInstruction.desiredLevel - 1;
    }
    return currentInstruction.currentLevel - 1;
  }

  // When an item has an instruction applied
  // we are highlighting it's parent item for improved clarity
  const shouldHighlightParent = React.useCallback(
    (location: DragLocationHistory): boolean => {
      const target = location.current.dropTargets[0];

      if (!target) {
        return false;
      }

      const highlightInstruction = extractInstruction(target.data);

      if (!highlightInstruction) {
        return false;
      }

      const targetId = target.data.id;
      invariant(typeof targetId === 'string');

      const path = getPathToItem(targetId);
      const parentLevel: number = getParentLevelOfInstruction(highlightInstruction);
      const parentId = path[parentLevel];
      return parentId === props.id;
    },
    [getPathToItem, extractInstruction, props],
  );

  const cancelExpand = React.useCallback(() => {
    cancelExpandRef.current?.();
    cancelExpandRef.current = null;
  }, []);

  const getTargetLabel = (element: Element) => {
    const target = element.closest('.MuiFile-content');
    return target;
  }

  const removeDropTargetAffordance = (element: Element) => {
    if (!element) {
      return;
    }
    const label = getTargetLabel(element);
    if (label) {
      if (label.classList.contains('can-drop')) {
        label.classList.remove('can-drop')
      } else if (label.classList.contains('can-not-drop')) {
        label.classList.remove('can-not-drop')
      } else if (label.classList.contains('can-not-drop-selected')) {
        label.classList.remove('can-not-drop-selected')
      } else if (label.classList.contains('can-drop-selected')) {
        label.classList.remove('can-drop-selected')
      }
    }
  }

  const addDropTargetAffordance = (canDrop: boolean, element: Element)=> {
    console.info((element as HTMLDivElement).innerText);
    if (!element) {
      return;
    }
    const label = getTargetLabel(element);

    if (label) {
      const isSelected = element?.parentElement?.parentElement?.classList.contains('.Mui-selected')
      let affordance = isSelected ? 'can-drop-selected' : 'can-drop'
      if (!canDrop) {
        affordance = isSelected ? 'can-not-drop-selected' : 'can-not-drop';
      }
      label.classList.add(affordance)
    }
  }

  const clearParentOfInstructionState = React.useCallback(() => {
    const updatedState = state.dndState === 'parent-of-instruction' ?  'idle' : state.dndState;
    setState({ ...state, dndState: updatedState})
  }, []);

  const updateIsParentOfInstruction = React.useCallback(
    ({ location }: { location: DragLocationHistory })=> {
      if (shouldHighlightParent(location)) {
        setState({ ...state, dndState: 'parent-of-instruction'});
        return;
      }
      clearParentOfInstructionState();
    }, [clearParentOfInstructionState, setState, shouldHighlightParent]);

  const dndConfig = instance.dndConfig();
  React.useEffect(() => {
    if (!dndConfig) {
      return undefined;
    }
    if (!pluginContentRef.current) {
      return undefined;
    }

    invariant(pluginContentRef.current);

    const canDrop = ['folder', 'trash'].includes(props.type!);;
    const handleDraggable = draggable({
      element: pluginContentRef.current,
      canDrag: () => true,
      getInitialData: () => {
        const initialData = {
          id: props.id,
          type: 'file-element',
          isOpenOnDragStart: props.children && props.type === 'folder',
          uniqueContextId,
        };
        return initialData
      },
      onGenerateDragPreview: (dragPreviewProps) => {
        const {nativeSetDragImage} = dragPreviewProps;

        setCustomNativeDragPreview({
          getOffset: pointerOutsideOfPreview({x: '16px', y: '8px'}),
          render: ({container: dndContainer}) => {
            setState({dndState: 'preview', dndContainer, dndInstruction: state.dndInstruction});
            // In our cleanup function: cause a `react` re-render to create remove your portal
            // Note: you can also remove the portal in `onDragStart`,
            // which is when the cleanup function is called
            return () => setState({
              dndState: 'idle',
              dndContainer,
              dndInstruction: state.dndInstruction
            });
          },
          nativeSetDragImage,
        });

      },
      onDragStart: ({source}) => {
        setState({...state, dndState: 'dragging'});
        // collapse open items during a drag
        if (source.data.isOpenOnDragStart) {
          if (instance.isItemExpanded(props.id!)) {
            instance.toggleItemExpansion(null as unknown as React.SyntheticEvent, props.id!);
          }
        }
      },
      onDrop: (dropData) =>{
        instance.dropInternal(dropData);
      },
    });

    const handleInternalDropTargets = dropTargetForElements({
      element: pluginContentRef?.current,
      onDragEnter: () => {
        setState({
          ...state,
          dndState: 'parent-of-instruction'
        });
      }, getData: ({input, element}) => {
        addDropTargetAffordance(canDrop, element);
        // console.info('getData', props.name, element);
        const data = {id: props.id, type: props.type};
        const mode = instance.getItemMode(props);

        const dataInstruction = attachInstruction(data, {
          input,
          element,
          indentPerLevel: 0,
          currentLevel: props.depth ?? 0,
          mode,
          block: !canDrop ? ['make-child'] : [],
        });

        return dataInstruction;
      }, canDrop: (canDropArg) => {
        const {source} = canDropArg;
        const canDrop = source.data.type === 'file-element' && source.data.uniqueContextId === uniqueContextId
        return canDrop;
      }, getIsSticky: () => true,

      onDragLeave: ({self}) => {
        removeDropTargetAffordance(self.element);
        cancelExpand();
        setState({...state, dndInstruction: null});
      }, onDrop: (event) => {
        let target;
        if (event.location.current.dropTargets.length) {
          target = event.location.current.dropTargets[0].element;
          removeDropTargetAffordance(event.location.current.dropTargets[0].element);
        }
        if (!canDrop) {
          return;
        }
        if (target) {
          instance.toggleItemExpansion(null as unknown as React.SyntheticEvent, props.id!);instance.toggleItemExpansion(null as unknown as React.SyntheticEvent, props.id!);
        }
        // const { sourceItemId } = source.data;
        // publishFileExplorerEvent(instance, 'removeItem', { targetId: item.id, sourceItemIds });

        instance.dropInternal(event);
        // console.log('combinedContentRef', pluginContentRef);

        cancelExpand();
        setState({...state, dndInstruction: null});
      },
    })
    const handleInternalMonitor = monitorForElements({
      canMonitor: ({source}) => source.data.uniqueContextId === uniqueContextId,
      onDragStart: updateIsParentOfInstruction,
      onDrag: updateIsParentOfInstruction,
      onDrop() {
        clearParentOfInstructionState();
      },
    });

    const handleExternalDropTargets = dropTargetForExternal({
      element: pluginContentRef?.current,
      canDrop: (/* {input, source, element} */) => {

        return true;
      }, getData: ({input, element}) => {
        const data = {id: props.id, type: props.type};
        addDropTargetAffordance(canDrop, element);

        const dataInstruction = attachInstruction(data, {
          input,
          element,
          indentPerLevel,
          currentLevel: props.depth ?? 0,
          mode: instance.getItemMode(props),
          block: !canDrop ? ['make-child'] : [],
        });
        // console.info('dropTargetForElements => dataInstruction', dataInstruction)
        return dataInstruction;
      }, onDragEnter: () => {
        setState({...state, dndState: 'parent-of-instruction'});
      }, onDragLeave: ({self}) => {
        removeDropTargetAffordance(self.element);
        setState({...state, dndState: 'idle', dndInstruction: null});
        cancelExpand();
      }, onDrag: (data) => {
        const {self} = data;
        const dragInstruction = extractInstruction(self.data);
        // console.log('drag dndExternal source:', source)
        // expand after 500ms if still merging
        // expand after 500ms if still merging
        if (dragInstruction?.type === 'make-child' && props.type === 'folder' && status?.expandable && !status?.expanded && !cancelExpandRef.current) {
          cancelExpandRef.current = delay({
            waitMs: 500, fn: () => {
              if (!instance.isItemExpanded(props.id!)) {
                instance.toggleItemExpansion(null as unknown as React.SyntheticEvent, props.id!);
              }
            },
          });
        }
        if (dragInstruction?.type !== 'make-child' && cancelExpandRef.current) {
          cancelExpand();
        }

        setState({...state, dndInstruction: dragInstruction});
      }, onDrop: async (dropEvent) => {
        let target;
        if (dropEvent.location.current.dropTargets.length) {
          target = dropEvent.location.current.dropTargets[0].element;
          removeDropTargetAffordance(target);
        }
        if (!canDrop) {
          return;
        }
        if (!instance.isItemExpanded(props.id!)) {
          instance.toggleItemExpansion(null as unknown as React.SyntheticEvent, props.id!);
        }
        const files = await MediaFile.from(dropEvent);
         const {self} = dropEvent;
         instance.createChildren(files as FileBase[], self.data.id as string);
        cancelExpand();
        setState({...state, dndInstruction: null});
      },
    });

    const handleExternalMonitor = monitorForExternal({
      canMonitor: containsFiles,
      onDragStart: updateIsParentOfInstruction,
      onDrag: updateIsParentOfInstruction,
      onDrop: () => {
        // setState({ value: 'idle', container: null});
        preventUnhandled.stop()
        clearParentOfInstructionState();
      },
    });

    const dndInternalProcess: CleanupFn = dndConfig?.dndInternal ? combine(handleDraggable, handleInternalDropTargets, handleInternalMonitor,) : combine();

    const dndExternalProcess = dndConfig.dndExternal ? combine(handleExternalDropTargets, handleExternalMonitor,) : combine()

    return combine(dndInternalProcess, dndExternalProcess)
  }, [pluginContentRef]);

  React.useEffect(
    function mount() {
      return function unmount() {
        cancelExpand();
      };
    },
    [cancelExpand],
  );

  return {
    contentRef: handleContentRef,
    rootRef: handleRootRef,
  };
};

useFileExplorerDnd.itemPlugin = useFileExplorerDndItemPlugin;
