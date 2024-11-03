import * as React from 'react';
import {EventHandlers, extractEventHandlers} from '@mui/base/utils';
import useForkRef from '@mui/utils/useForkRef';
import {
  UseFileCheckboxSlotProps,
  UseFileContentSlotProps,
  UseFileGroupTransitionSlotProps,
  UseFileIconContainerSlotProps,
  UseFileLabelSlotProps,
  UseFileParameters,
  UseFileReturnValue,
  UseFileRootSlotProps,
} from './useFile.types';
import {UseFileMinimalPlugins, UseFileOptionalPlugins,} from '../internals/models';
import {useFileExplorerContext} from '../internals/FileExplorerProvider/useFileExplorerContext';
import {MuiCancellableEvent} from '../internals/models/MuiCancellableEvent';
import {useFileUtils} from '../hooks/useFileUtils';
import {FileDepthContext} from '../internals/FileDepthContext';

export const useFile = <
  TSignatures extends UseFileMinimalPlugins = UseFileMinimalPlugins,
  TOptionalSignatures extends UseFileOptionalPlugins = UseFileOptionalPlugins,
>(
  parameters: UseFileParameters,
): UseFileReturnValue<TSignatures, TOptionalSignatures> => {
  const {
    runItemPlugins,
    selection: { multiSelect, disableSelection, checkboxSelection },
    expansion: { expansionTrigger },
    disabledItemsFocusable,
    indentationAtItemLevel,
    instance,
    publicAPI,
    alternatingRows,

  } = useFileExplorerContext<TSignatures, TOptionalSignatures>();
  const depthContext = React.useContext(FileDepthContext);

  const { id, itemId, name, children, rootRef } = parameters;
  const itemMeta = instance.getItemMeta(itemId!);
  const initialStatus = instance.getItemStatus(itemId!, children)
  const { rootRef: pluginRootRef, contentRef, status: pluginStatus } = runItemPlugins({...itemMeta, ...parameters, instance, status: initialStatus });
  const { interactions, status } = useFileUtils({ itemId: itemId!, children, status: pluginStatus });
  const idAttribute = instance.getFileIdAttribute(itemId!, id);
  const handleRootRef = useForkRef(rootRef, pluginRootRef)!;
  const checkboxRef = React.useRef<HTMLButtonElement>(null);

  const depth = typeof depthContext === 'function' ? depthContext(itemId!) : depthContext;

  const createRootHandleFocus =
    (otherHandlers: EventHandlers) =>
    (event: React.FocusEvent<HTMLElement> & MuiCancellableEvent) => {
      otherHandlers.onFocus?.(event);
      if (event.defaultMuiPrevented) {
        return;
      }

      const canBeFocused = !status.disabled || disabledItemsFocusable;
      if (!status.focused && canBeFocused && event.currentTarget === event.target) {
        instance.focusItem(event, itemId!);
      }
    };

  const createRootHandleBlur =
    (otherHandlers: EventHandlers) =>
    (event: React.FocusEvent<HTMLElement> & MuiCancellableEvent) => {
      otherHandlers.onBlur?.(event);
      if (event.defaultMuiPrevented) {
        return;
      }

      instance.removeFocusedItem();
    };

  const createRootHandleKeyDown =
    (otherHandlers: EventHandlers) =>
    (event: React.KeyboardEvent<HTMLElement> & MuiCancellableEvent) => {
      otherHandlers.onKeyDown?.(event);
      if (event.defaultMuiPrevented) {
        return;
      }

      instance.handleItemKeyDown(event, itemId!);
    };

  const createContentHandleClick =
    (otherHandlers: EventHandlers) => (event: React.MouseEvent & MuiCancellableEvent) => {
      otherHandlers.onClick?.(event);
      if (event.defaultMuiPrevented || checkboxRef.current?.contains(event.target as HTMLElement)) {
        return;
      }

      if (expansionTrigger === 'content') {
        interactions.handleExpansion(event);
      }

      if (!checkboxSelection) {
        interactions.handleSelection(event);
      }
    };

  const createContentHandleMouseDown =
    (otherHandlers: EventHandlers) => (event: React.MouseEvent & MuiCancellableEvent) => {
      otherHandlers.onMouseDown?.(event);
      if (event.defaultMuiPrevented) {
        return;
      }

      // Prevent text selection
      if (event.shiftKey || event.ctrlKey || event.metaKey || status.disabled) {
        event.preventDefault();
      }
    };

  const createCheckboxHandleChange =
    (otherHandlers: EventHandlers) =>
    (event: React.ChangeEvent<HTMLInputElement> & MuiCancellableEvent) => {
      otherHandlers.onChange?.(event);
      if (event.defaultMuiPrevented) {
        return;
      }

      if (disableSelection || status.disabled) {
        return;
      }

      interactions.handleCheckboxSelection(event);
    };

  const createIconContainerHandleClick =
    (otherHandlers: EventHandlers) => (event: React.MouseEvent & MuiCancellableEvent) => {
      otherHandlers.onClick?.(event);
      if (event.defaultMuiPrevented) {
        return;
      }
      if (expansionTrigger === 'iconContainer') {
        interactions.handleExpansion(event);
      }
    };

  const getRootProps = <ExternalProps extends Record<string, any> = {}>(
    externalProps: ExternalProps = {} as ExternalProps,
  ): UseFileRootSlotProps<ExternalProps> => {
    const externalEventHandlers = {
      ...extractEventHandlers(parameters),
      ...extractEventHandlers(externalProps),
    };

    let ariaSelected: boolean | undefined;
    if (multiSelect) {
      ariaSelected = status.selected;
    } else if (status.selected) {
      /* single-selection fileExplorers unset aria-selected on un-selected items.
       *
       * If the fileExplorer does not support multiple selection, aria-selected
       * is set to true for the selected item and it is not present on any other item in the fileExplorer.
       * Source: https://www.w3.org/WAI/ARIA/apg/patterns/fileExplorerview/
       */
      ariaSelected = true;
    }

    const response: UseFileRootSlotProps<ExternalProps> = {
      ...externalEventHandlers,
      ref: handleRootRef,
      role: 'fileexploreritem',
      tabIndex: instance.canItemBeTabbed(itemId!) ? 0 : -1,
      id: idAttribute,
      'aria-expanded': status.expandable ? status.expanded : undefined,
      'aria-selected': ariaSelected,
      'aria-disabled': status.disabled || undefined,
      ...externalProps,
      onFocus: createRootHandleFocus(externalEventHandlers),
      onBlur: createRootHandleBlur(externalEventHandlers),
      onKeyDown: createRootHandleKeyDown(externalEventHandlers),
    };

    if (indentationAtItemLevel) {
      response.style = {
        '--FileExplorer-itemDepth': depth,
      } as React.CSSProperties;
    }

    return response;
  };

  const getContentProps = <ExternalProps extends Record<string, any> = {}>(
    externalProps: ExternalProps = {} as ExternalProps,
  ): UseFileContentSlotProps<ExternalProps> => {
    const externalEventHandlers = extractEventHandlers(externalProps);

    const response: UseFileContentSlotProps<ExternalProps> = {
      ...externalEventHandlers,
      ...externalProps,
      ref: contentRef,
      onClick: createContentHandleClick(externalEventHandlers),
      onMouseDown: createContentHandleMouseDown(externalEventHandlers),
      status,
      alternatingRows,
    };

    if (indentationAtItemLevel) {
      response.indentationAtItemLevel = true;
    }

    return response;
  };

  const getCheckboxProps = <ExternalProps extends Record<string, any> = {}>(
    externalProps: ExternalProps = {} as ExternalProps,
  ): UseFileCheckboxSlotProps<ExternalProps> => {
    const externalEventHandlers = extractEventHandlers(externalProps);

    return {
      ...externalEventHandlers,
      visible: checkboxSelection,
      ref: checkboxRef,
      checked: status.selected,
      disabled: disableSelection || status.disabled,
      tabIndex: -1,
      ...externalProps,
      onChange: createCheckboxHandleChange(externalEventHandlers),
    };
  };

  const getLabelProps = <ExternalProps extends Record<string, any> = {}>(
    externalProps: ExternalProps = {} as ExternalProps,
  ): UseFileLabelSlotProps<ExternalProps> => {
    const externalEventHandlers = {
      ...extractEventHandlers(parameters),
      ...extractEventHandlers(externalProps),
    };

    return {
      ...externalEventHandlers,
      children: name,
      ...externalProps,
    };
  };

  const getIconContainerProps = <ExternalProps extends Record<string, any> = {}>(
    externalProps: ExternalProps = {} as ExternalProps,
  ): UseFileIconContainerSlotProps<ExternalProps> => {
    const externalEventHandlers = extractEventHandlers(externalProps);

    return {
      ...externalEventHandlers,
      ...externalProps,
      onClick: createIconContainerHandleClick(externalEventHandlers),
    };
  };

  const getGroupTransitionProps = <ExternalProps extends Record<string, any> = {}>(
    externalProps: ExternalProps = {} as ExternalProps,
  ): UseFileGroupTransitionSlotProps<ExternalProps> => {
    const externalEventHandlers = extractEventHandlers(externalProps);

    const response: UseFileGroupTransitionSlotProps<ExternalProps> = {
      ...externalEventHandlers,
      unmountOnExit: true,
      component: 'ul',
      role: 'group',
      in: status.expanded,
      children,
      ...externalProps,
    };

    if (indentationAtItemLevel) {
      response.indentationAtItemLevel = true;
    }

    return response;
  };

  const depthStatus = {...status, depth};
  return {
    getRootProps,
    getContentProps,
    getGroupTransitionProps,
    getIconContainerProps,
    getCheckboxProps,
    getLabelProps,
    rootRef: handleRootRef,
    status: depthStatus,
    publicAPI,
  };
};
