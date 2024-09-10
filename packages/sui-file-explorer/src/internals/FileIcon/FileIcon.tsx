import * as React from 'react';
import {resolveComponentProps, useSlotProps} from '@mui/base/utils';
import {FileIconProps} from './FileIcon.types';
import {useFileExplorerContext} from '../FileExplorerProvider/useFileExplorerContext';
import {
  UseFileExplorerIconsSignature
} from '../plugins/useFileExplorerIcons/useFileExplorerIcons.types';
import {FileExplorerCollapseIcon, FileExplorerExpandIcon} from '../../icons';

function FileIcon(props: FileIconProps): React.JSX.Element | undefined {
  const { slots, slotProps, status } = props;
  let { iconName } = props;

  const context = useFileExplorerContext<[UseFileExplorerIconsSignature]>();

  const contextIcons = {
    ...context.icons.slots,
    expandIcon: context.icons.slots.expandIcon ?? FileExplorerExpandIcon,
    collapseIcon: context.icons.slots.collapseIcon ?? FileExplorerCollapseIcon,
  };

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

  const Icon = slots?.[iconName] ?? contextIcons[iconName as keyof typeof contextIcons];
  const iconProps = useSlotProps({
    elementType: Icon,
    externalSlotProps: (tempOwnerState: any) => ({
      ...resolveComponentProps(
        contextIconProps[iconName as keyof typeof contextIconProps],
        tempOwnerState,
      ),
      ...resolveComponentProps(slotProps?.[iconName], tempOwnerState),
    }),
    // TODO: Add proper ownerState
    ownerState: {},
  });

  if (!Icon) {
    return undefined;
  }

  return <Icon {...iconProps} />;
}

FileIcon.propTypes = {

};

export { FileIcon };
