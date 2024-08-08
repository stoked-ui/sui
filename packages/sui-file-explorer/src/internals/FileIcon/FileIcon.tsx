import * as React from 'react';
import PropTypes from 'prop-types';
import { resolveComponentProps, useSlotProps } from '@mui/base/utils';
import { FileIconProps } from './FileIcon.types';
import { useFileExplorerContext } from '../FileExplorerProvider/useFileExplorerContext';
import { UseFileExplorerIconsSignature } from '../plugins/useFileExplorerIcons/useFileExplorerIcons.types';
import { FileExplorerCollapseIcon, FileExplorerExpandIcon } from '../../icons';

function FileIcon(props: FileIconProps): React.JSX.Element | null {
  const { slots, slotProps, status } = props;

  const context = useFileExplorerContext<[UseFileExplorerIconsSignature]>();

  const contextIcons = {
    ...context.icons.slots,
    expandIcon: context.icons.slots.expandIcon ?? FileExplorerExpandIcon,
    collapseIcon: context.icons.slots.collapseIcon ?? FileExplorerCollapseIcon,
  };

  const contextIconProps = context.icons.slotProps;

  let iconName: 'collapseIcon' | 'expandIcon' | 'endIcon' | 'icon';
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
    return null;
  }

  return <Icon {...iconProps} />;
}

FileIcon.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  /**
   * The props used for each component slot.
   * @default {}
   */
  slotProps: PropTypes.object,
  /**
   * Overridable component slots.
   * @default {}
   */
  slots: PropTypes.object,
  status: PropTypes.shape({
    disabled: PropTypes.bool.isRequired,
    dndContainer: PropTypes.any.isRequired,
    dndInstruction: PropTypes.oneOfType([
      PropTypes.shape({
        currentLevel: PropTypes.number.isRequired,
        indentPerLevel: PropTypes.number.isRequired,
        type: PropTypes.oneOf(['reorder-above']).isRequired,
      }),
      PropTypes.shape({
        currentLevel: PropTypes.number.isRequired,
        indentPerLevel: PropTypes.number.isRequired,
        type: PropTypes.oneOf(['reorder-below']).isRequired,
      }),
      PropTypes.shape({
        currentLevel: PropTypes.number.isRequired,
        indentPerLevel: PropTypes.number.isRequired,
        type: PropTypes.oneOf(['make-child']).isRequired,
      }),
      PropTypes.shape({
        currentLevel: PropTypes.number.isRequired,
        desiredLevel: PropTypes.number.isRequired,
        indentPerLevel: PropTypes.number.isRequired,
        type: PropTypes.oneOf(['reparent']).isRequired,
      }),
      PropTypes.shape({
        desired: PropTypes.oneOfType([
          PropTypes.shape({
            currentLevel: PropTypes.number.isRequired,
            indentPerLevel: PropTypes.number.isRequired,
            type: PropTypes.oneOf(['reorder-above']).isRequired,
          }),
          PropTypes.shape({
            currentLevel: PropTypes.number.isRequired,
            indentPerLevel: PropTypes.number.isRequired,
            type: PropTypes.oneOf(['reorder-below']).isRequired,
          }),
          PropTypes.shape({
            currentLevel: PropTypes.number.isRequired,
            indentPerLevel: PropTypes.number.isRequired,
            type: PropTypes.oneOf(['make-child']).isRequired,
          }),
          PropTypes.shape({
            currentLevel: PropTypes.number.isRequired,
            desiredLevel: PropTypes.number.isRequired,
            indentPerLevel: PropTypes.number.isRequired,
            type: PropTypes.oneOf(['reparent']).isRequired,
          }),
        ]).isRequired,
        type: PropTypes.oneOf(['instruction-blocked']).isRequired,
      }),
    ]),
    dndState: PropTypes.oneOf(['dragging', 'idle', 'parent-of-instruction', 'preview']).isRequired,
    expandable: PropTypes.bool.isRequired,
    expanded: PropTypes.bool.isRequired,
    focused: PropTypes.bool.isRequired,
    grid: PropTypes.bool.isRequired,
    selected: PropTypes.bool.isRequired,
    visibleIndex: PropTypes.number.isRequired,
  }).isRequired,
} as any;

export { FileIcon };
