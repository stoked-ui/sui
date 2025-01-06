import * as React from 'react';
import {SxProps} from "@mui/system";
import {FileExplorerInstance, UseFileMinimalPlugins,} from '../../models';
import {UseFileExplorerGridColumnHeaderStatus} from './useFileExplorerGrid.types';

export interface UseFileExplorerGridHeadersParameters {
  /**
   * The id attribute of the item. If not provided, it will be generated.
   */
  id: string;
  /**
   * If `true`, the item is disabled.
   * @default false
   */
  visible?: boolean;

  rootRef?: React.Ref<HTMLDivElement>;
  /**
   * The content of the component.
   */
  children?: React.ReactNode;
}

export interface UseFileExplorerGridHeadersIconContainerSlotOwnProps {
  ref:  React.RefObject<HTMLDivElement>;
  iconName?: 'collapseIcon' | 'expandIcon' | 'endIcon' | 'icon';
  sx?: SxProps;
}

export type UseFileExplorerGridHeadersIconContainerSlotProps<ExternalProps = {}> = ExternalProps &
  UseFileExplorerGridHeadersIconContainerSlotOwnProps;


export interface UseFileExplorerGridHeadersColumnSlotOwnProps {
  ref:  React.RefObject<HTMLDivElement>;
}

export type UseFileExplorerGridHeadersColumnSlotProps<ExternalProps = {}> = ExternalProps &
  UseFileExplorerGridHeadersColumnSlotOwnProps;

export interface UseFileExplorerGridHeadersLabelSlotOwnProps {
  children: React.ReactNode;
}

export type UseFileExplorerGridHeadersLabelSlotProps<ExternalProps = {}> = ExternalProps &
  UseFileExplorerGridHeadersLabelSlotOwnProps;

export interface UseFileExplorerGridHeadersGroupTransitionSlotOwnProps {
  unmountOnExit: boolean;
  in?: boolean;
  component: 'div';
  role: 'group';
  children: React.ReactNode;
  /**
   * Only defined when the `indentationAtItemLevel` experimental feature is enabled.
   */
  indentationAtItemLevel?: true;
}

export type UseFileExplorerGridHeadersGroupTransitionSlotProps<ExternalProps = {}> = ExternalProps &
  UseFileExplorerGridHeadersGroupTransitionSlotOwnProps;

export interface UseFileExplorerGridColumnHeaderReturnValue<
  TSignatures extends UseFileMinimalPlugins = UseFileMinimalPlugins,
> {

  getColumnProps: <ExternalProps extends Record<string, any> = {}>(
    externalProps?: ExternalProps,
  ) => UseFileExplorerGridHeadersColumnSlotProps<ExternalProps>;

  /**
   * Resolver for the label slot's props.
   * @param {ExternalProps} externalProps Additional props for the label slot
   * @returns {UseFileExplorerGridHeadersLabelSlotProps<ExternalProps>} Props that should be spread
   *   on the label slot
   */
  getLabelProps: <ExternalProps extends Record<string, any> = {}>(
    externalProps?: ExternalProps,
  ) => UseFileExplorerGridHeadersLabelSlotProps<ExternalProps>;

  /**
   * Resolver for the iconContainer slot's props.
   * @param {ExternalProps} externalProps Additional props for the iconContainer slot
   * @returns {UseFileExplorerGridHeadersIconContainerSlotProps<ExternalProps>} Props that should
   *   be spread on the iconContainer slot
   */
  getIconContainerProps: <ExternalProps extends Record<string, any> = {}>(
    externalProps?: ExternalProps,
  ) => UseFileExplorerGridHeadersIconContainerSlotProps<ExternalProps>;
  /**
   * Resolver for the GroupTransition slot's props.
   * @param {ExternalProps} externalProps Additional props for the GroupTransition slot
   * @returns {UseFileExplorerGridHeadersGroupTransitionSlotProps<ExternalProps>} Props that should
   *   be spread on the GroupTransition slot
   */
  getGroupTransitionProps: <ExternalProps extends Record<string, any> = {}>(
    externalProps?: ExternalProps,
  ) => UseFileExplorerGridHeadersGroupTransitionSlotProps<ExternalProps>;
  /**
   * A ref to the component's root DOM element.
   */
  instance: FileExplorerInstance<TSignatures>;
  status: UseFileExplorerGridColumnHeaderStatus | null;
}

