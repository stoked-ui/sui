import * as React from 'react';
import {SxProps} from "@mui/system";
import {FileExplorerInstance, UseFileMinimalPlugins,} from '../../models';
import {UseFileExplorerGridColumnHeaderStatus} from './useFileExplorerGrid.types';

/**
 * Parameters for the useFileExplorerGridHeaders hook.
 *
 * @param id The id attribute of the item. If not provided, it will be generated.
 * @param visible If `true`, the item is disabled.
 * @param rootRef The content of the component.
 */
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

/**
 * Props for the iconContainer slot.
 *
 * @param ref A reference to the DOM element.
 * @param iconName The name of the icon. Can be 'collapseIcon', 'expandIcon', 'endIcon' or 'icon'.
 * @param sx Styles for the icon container.
 */
export interface UseFileExplorerGridHeadersIconContainerSlotOwnProps {
  ref:  React.RefObject<HTMLDivElement>;
  iconName?: 'collapseIcon' | 'expandIcon' | 'endIcon' | 'icon';
  sx?: SxProps;
}

/**
 * Props for the column slot, including all iconContainer props.
 *
 * @param externalProps Additional props.
 */
export type UseFileExplorerGridHeadersIconContainerSlotProps<ExternalProps = {}> = ExternalProps &
  UseFileExplorerGridHeadersIconContainerSlotOwnProps;

/**
 * Props for the label slot, including all iconContainer props.
 *
 * @param children The content of the label slot.
 */
export interface UseFileExplorerGridHeadersLabelSlotOwnProps {
  children: React.ReactNode;
}

/**
 * Props for the label slot, including all iconContainer props.
 *
 * @param externalProps Additional props.
 */
export type UseFileExplorerGridHeadersLabelSlotProps<ExternalProps = {}> = ExternalProps &
  UseFileExplorerGridHeadersLabelSlotOwnProps;

/**
 * Props for the GroupTransition slot, including all iconContainer and label props.
 *
 * @param unmountOnExit Whether to unmount on exit.
 * @param in Whether the group is shown.
 * @param component The type of component.
 * @param role The accessibility role.
 * @param children The content of the GroupTransition slot.
 * @param indentationAtItemLevel Only defined when the `indentationAtItemLevel` experimental feature is enabled.
 */
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

/**
 * Props for the GroupTransition slot, including all iconContainer and label props.
 *
 * @param externalProps Additional props.
 */
export type UseFileExplorerGridHeadersGroupTransitionSlotProps<ExternalProps = {}> = ExternalProps &
  UseFileExplorerGridHeadersGroupTransitionSlotOwnProps;

/**
 * The return value of the useFileExplorerGridHeaders hook, including all props for the column slot,
 * label slot and GroupTransition slot.
 *
 * @param TSignatures The type signatures to use for this grid.
 */
export interface UseFileExplorerGridColumnHeaderReturnValue<
  TSignatures extends UseFileMinimalPlugins = UseFileMinimalPlugins,
> {

  /**
   * Returns props for the column slot, including all iconContainer props.
   *
   * @param externalProps Additional props.
   * @returns Props that should be spread on the column slot.
   */
  getColumnProps: <ExternalProps extends Record<string, any> = {}>(
    externalProps?: ExternalProps,
  ) => UseFileExplorerGridHeadersIconContainerSlotProps<ExternalProps>;

  /**
   * Returns props for the label slot, including all iconContainer props.
   *
   * @param externalProps Additional props.
   * @returns Props that should be spread on the label slot.
   */
  getLabelProps: <ExternalProps extends Record<string, any> = {}>(
    externalProps?: ExternalProps,
  ) => UseFileExplorerGridHeadersLabelSlotProps<ExternalProps>;

  /**
   * Returns props for the GroupTransition slot, including all iconContainer and label props.
   *
   * @param externalProps Additional props.
   * @returns Props that should be spread on the GroupTransition slot.
   */
  getGroupTransitionProps: <ExternalProps extends Record<string, any> = {}>(
    externalProps?: ExternalProps,
  ) => UseFileExplorerGridHeadersGroupTransitionSlotProps<ExternalProps>;

  /**
   * A reference to the component's root DOM element.
   */
  instance: FileExplorerInstance<TSignatures>;
  status: UseFileExplorerGridColumnHeaderStatus | null;
}