import * as React from 'react';
import {resolveComponentProps, useSlotProps} from '@mui/base/utils';

/**
 * @typedef {Object} FileIconProps
 * @property {Object} slots - Slot objects with icons
 * @property {Object} slotProps - Props for the slots
 * @property {string} status - Status of the file explorer component
 */

/**
 * @typedef {Object} UseFileExplorerIconsSignature
 * @property {Object} icons.slots - Slot icons
 * @property {string} icons.expanded - Expanded state flag
 * @property {Object} icons.slotProps - Props for slot elements
 */

import { FileIconProps } from './FileIcon.types';
import { useFileExplorerContext } from '../FileExplorerProvider/useFileExplorerContext';
import {
  UseFileExplorerIconsSignature
} from '../plugins/useFileExplorerIcons/useFileExplorerIcons.types';
import { FileExplorerCollapseIcon, FileExplorerExpandIcon } from '../../icons';

/**
 * A file icon component that adapts to the status of the file explorer.
 *
 * @param {FileIconProps} props - Component props
 * @returns {React.JSX.Element | undefined} - The rendered component or undefined if no icon is available
 */
function FileIcon(props: FileIconProps): React.JSX.Element | undefined {
  const { slots, slotProps, status } = props;
  let { iconName } = props;

  /**
   * Context object with file explorer icons and slot props.
   *
   * @type {UseFileExplorerIconsSignature}
   */
  const context = useFileExplorerContext<[UseFileExplorerIconsSignature]>();

  /**
   * A mapping of icon names to their corresponding values from the context.
   *
   * @type {Object<string, string>}
   */
  const contextIcons = {
    ...context.icons.slots,
    expandIcon: context.icons.slots.expandIcon ?? FileExplorerExpandIcon,
    collapseIcon: context.icons.slots.collapseIcon ?? FileExplorerCollapseIcon,
  };

  /**
   * Props for the icon elements.
   *
   * @type {Object<string, Object>}
   */
  const contextIconProps = context.icons.slotProps;

  if (!iconName) {
    if (slots?.icon) {
      iconName = 'icon';
    } else if (status.expandable) {
      if (status.expanded) {
        iconName = 'collapseIcon';
      } else {
        iconName = 'expandIcon';
      }
    } else {
      iconName = 'endIcon';
    }
  }

  /**
   * The icon to be rendered based on the iconName prop.
   *
   * @type {React.JSX.Element | undefined}
   */
  const Icon = slots?.[iconName] ?? contextIcons[iconName as keyof typeof contextIcons];

  /**
   * Props for the icon element, computed using resolveComponentProps.
   *
   * @type {Object}
   */
  const { ...iconProps} = useSlotProps({
    elementType: Icon,
    externalSlotProps: () => ({
      ...resolveComponentProps(
        contextIconProps[iconName as keyof typeof contextIconProps],
        props,
      ),
      ...resolveComponentProps(slotProps?.[iconName], props),
    }),
    // TODO: Add proper ownerState
    ownerState: props,
  });

  if (!Icon) {
    return undefined;
  }
  return <Icon ownerState={iconProps.ownerState} />;
}

FileIcon.propTypes = {

};

export { FileIcon };