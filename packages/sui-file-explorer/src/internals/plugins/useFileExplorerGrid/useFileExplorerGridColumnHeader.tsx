import * as React from 'react';
import { EventHandlers, extractEventHandlers, } from "@mui/base/utils";
import { SxProps, useTheme } from "@mui/system";
import { MuiCancellableEvent } from "@mui/base/utils/MuiCancellableEvent";
import { useFileExplorerContext } from '../../FileExplorerProvider/useFileExplorerContext';
import { FileExplorerAnyPluginSignature, UseFileMinimalPlugins, } from "../../models";

import {
  UseFileExplorerGridColumnHeaderReturnValue,
  UseFileExplorerGridHeadersColumnSlotProps,
  UseFileExplorerGridHeadersGroupTransitionSlotProps,
  UseFileExplorerGridHeadersIconContainerSlotProps,
  UseFileExplorerGridHeadersLabelSlotProps
} from "./useFileExplorerGridColumnHeader.types";
import { UseFileExplorerGridColumnHeaderStatus } from './useFileExplorerGrid.types'

interface UseFileExplorerGridColumnHeaderInteractions {
  handleFocus: (event: React.FocusEvent | React.MouseEvent) => void;
  handleBlur: (event: React.FocusEvent) => void;
  handleSortToggle: (event: React.FocusEvent | React.MouseEvent) => void;
  handleVisibleToggle: (event: React.MouseEvent) => void;
}

export const useFileExplorerGridColumnHeader =  <
  TSignatures extends UseFileMinimalPlugins,
  TOptionalSignatures extends FileExplorerAnyPluginSignature[] = [],
>(parameters: {
  columnName: string;
  id: string;
  ref: React.Ref<HTMLDivElement>;
}): UseFileExplorerGridColumnHeaderReturnValue => {
  const {
    instance,
  } = useFileExplorerContext<TSignatures, TOptionalSignatures>();

  const theme = useTheme()
  const { columnName } = parameters;
  const headers = instance.getHeaders();
  const columns = instance.getColumns();
  const headerData = headers[columnName];

  if (!headers) {
    throw new Error(`Column ${columnName} does not exist in headers or columns.`)
  }
  const columnData = columns[columnName];

  const columnRef = React.useRef<HTMLDivElement>(null);
  const iconContainerRef = React.useRef<HTMLDivElement>(null);
  const status: UseFileExplorerGridColumnHeaderStatus = instance.getHeaderStatus(columnName);

  const handleFocus = (event: React.FocusEvent | React.MouseEvent | null) => {
    if (!status.visible) {
      return;
    }

    if (!status.focused) {
      instance.focusHeader(event, columnName);
    }
  };

  const handleBlur = (event: React.FocusEvent) => {
    if (!status.visible) {
      return;
    }

    if (!status.focused) {
      instance.blurHeader(event, columnName);
    }
  };

  const handleSortToggle = (event: React.FocusEvent | React.MouseEvent | null) => {
    if (!status.visible) {
      return;
    }

    if (!status.focused) {
      handleFocus(event);
      return;
    }

    instance.toggleColumnSort(columnName);
  };

  const handleVisibleToggle = (event: React.MouseEvent) => {
    if (!status.visible) {
      return;
    }

    if (!status.focused) {
      handleFocus(event);
      return;
    }
    instance.toggleColumnVisible(columnName);
  };

  const interactions: UseFileExplorerGridColumnHeaderInteractions = {
    handleFocus,
    handleBlur,
    handleSortToggle,
    handleVisibleToggle,
  };

  const getColumnProps = <ExternalProps extends Record<string, any> = {}>(
    externalProps: ExternalProps = {} as ExternalProps,
  ): UseFileExplorerGridHeadersColumnSlotProps<ExternalProps> => {
    const externalEventHandlers = extractEventHandlers(externalProps);

    const columnFocusSort =
      (otherHandlers: EventHandlers) =>
        (event: (React.FocusEvent<HTMLElement> | React.MouseEvent<HTMLElement>) & MuiCancellableEvent) => {
          otherHandlers.onFocus?.(event);
          if (event.defaultMuiPrevented) {
            return;
          }

          const canBeFocused = status.visible;
          if (!status.focused && canBeFocused) {
            interactions.handleFocus(event);
          }
          interactions.handleSortToggle(event)
        };

    const columnMouseDown =
      (otherHandlers: EventHandlers) =>
        (event: React.MouseEvent<HTMLElement> & MuiCancellableEvent) => {
          otherHandlers.onFocus?.(event);
          if (event.defaultMuiPrevented) {
            return;
          }
          if(event?.currentTarget){
            event.currentTarget.style.background = theme.palette.action.hover;
          }
        };

    const columnMouseUp =
      (otherHandlers: EventHandlers) =>
        (event: React.MouseEvent<HTMLElement> & MuiCancellableEvent) => {
          otherHandlers.onFocus?.(event);
          if (event.defaultMuiPrevented) {
            return;
          }
          if(event?.currentTarget){
            event.currentTarget.style.background = 'unset';
          }
        };

    const columnHeaderBlur =
      (otherHandlers: EventHandlers) =>
        (event: React.FocusEvent<HTMLElement> & MuiCancellableEvent) => {
          otherHandlers.onBlur?.(event);
          if (event.defaultMuiPrevented) {
            return;
          }

          interactions.handleBlur(event);
        };

    const id = `header-${columnName}`;
    let response: UseFileExplorerGridHeadersColumnSlotProps<ExternalProps> = {
      ...externalEventHandlers,
      ...externalProps,
      ref: columnRef,
      tabIndex: 0,
      header: true,
      onClick: columnFocusSort(externalEventHandlers),
      onMouseDown: columnMouseDown(externalEventHandlers),
      onBlur: columnHeaderBlur (externalEventHandlers),
      onMouseUp: columnMouseUp(externalEventHandlers),
      className: `header ${id}`
    };

    if (columnData && headerData) {
      const width = (columnData?.width ?? -1) !== -1 ? {width: `${columnData.width - 8}px`} : undefined;
      const flexGrow = columnName === 'label' ? { flexGrow: 1 } : undefined;
      const sx: SxProps = {
        ...headerData.sx,
        color: theme.palette.text.primary,
        ...width,
        ...flexGrow,
        justifyContent: 'space-between',
        display: 'flex',
        height: '28px'
      };
      const index = Object.keys(headers).indexOf(columnName)
      const last = index === Object.keys(headers).length - 1;
      const first = index === 0;
      response = {
        ...response,
        sx,
        id,
        grow: index === 0,
        last,
        first
      }
    }

    return response;
  };

  const getIconContainerProps = <ExternalProps extends Record<string, any> = {}>(
    externalProps: ExternalProps = {} as ExternalProps,
  ): UseFileExplorerGridHeadersIconContainerSlotProps<ExternalProps> => {
    const externalEventHandlers = extractEventHandlers(externalProps);

    const response: UseFileExplorerGridHeadersIconContainerSlotProps<ExternalProps> = {
      ...externalEventHandlers,
      ...externalProps,
      ref: iconContainerRef,
      iconName: status.ascending ? 'collapseIcon' : 'expandIcon',
      sx: { color: 'black' }
    };
    return response;
  };

  function toTitleCase(str: string) {
    return str.replace(
      /\w\S*/g,
      (text: string) => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
    );
  }

  const getLabelProps = <ExternalProps extends Record<string, any> = {}>(
    externalProps: ExternalProps = {} as ExternalProps,
  ): UseFileExplorerGridHeadersLabelSlotProps<ExternalProps> => {
    const externalEventHandlers = {
      ...extractEventHandlers(parameters),
      ...extractEventHandlers(externalProps),
    };

    return {
      ...externalEventHandlers,
      children: toTitleCase(columnName === 'label' ? 'File' : columnName),
      ...externalProps,
    };
  };

  const getGroupTransitionProps = <ExternalProps extends Record<string, any> = {}>(
    externalProps: ExternalProps = {} as ExternalProps,
  ): UseFileExplorerGridHeadersGroupTransitionSlotProps<ExternalProps> => {
    const externalEventHandlers = extractEventHandlers(externalProps);

    const response: UseFileExplorerGridHeadersGroupTransitionSlotProps<ExternalProps> = {
      ...externalEventHandlers,
      unmountOnExit: true,
      component: 'div',
      role: 'group',
      in: status.ascending,
      children: columnData.children(columnData.cells),
      ...externalProps,
    };
    return response;
  };

  return {
    getColumnProps,
    getGroupTransitionProps,
    getIconContainerProps,
    getLabelProps,
    status,
    instance,
  };
};
