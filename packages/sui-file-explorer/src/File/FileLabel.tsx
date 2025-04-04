import * as React from 'react';
import PropTypes from 'prop-types';
import Typography from '@mui/material/Typography';
import { SxProps, Theme } from '@mui/system';
import Box from '@mui/material/Box';
import { shouldForwardProp } from '@mui/system/createStyled';
import { styled } from '../internals/zero-styled';
import { FileIconContainer } from './FileIconContainer';
import { FileIcon } from '../internals/FileIcon';
import { useFileExplorerGridColumnHeader } from '../internals/plugins/useFileExplorerGrid/useFileExplorerGridColumnHeader';
import { UseFileMinimalPlugins } from '../internals/models';

/**
 * Props for the `FileLabelRoot` component.
 *
 * @interface FileLabelProps
 */
interface FileLabelProps {
  /**
   * Whether the file label is expandable.
   *
   * @default false
   */
  expandable?: boolean;

  /**
   * Whether the file label grows.
   *
   * @default undefined
   */
  grow?: boolean;

  /**
   * The children of the file label.
   *
   * @default null
   */
  children: React.ReactNode | string;

  /**
   * Additional styles for the file label.
   *
   * @default null
   */
  sx?: SxProps;
}

/**
 * Props for the `HeaderCell` component.
 *
 * @interface HeaderCellProps
 */
interface HeaderCellProps {
  /**
   * The column name of the header cell.
   *
   * @required
   */
  columnName: string;

  /**
   * The ID of the header cell.
   *
   * @required
   */
  id: string;

  /**
   * Additional styles for the header cell.
   *
   * @default null
   */
  sx?: SxProps;
}

/**
 * A component that represents a file label.
 *
 * @component FileLabelRoot
 * @description
 * The `FileLabelRoot` component is used to render a file label. It can be used as a child of the `HeaderCell` component.
 *
 * @extends React.Component
 */
const FileLabelRoot = styled.div`
  // CSS styles for the file label root
`;

/**
 * A component that represents a header cell in a grid.
 *
 * @component HeaderCell
 * @description
 * The `HeaderCell` component is used to render a header cell in a grid. It can be used as a child of the `GridCell` component.
 *
 * @extends React.Component
 */
const HeaderCell = React.forwardRef(function HeaderCell(
  /**
   * Props for the `HeaderCell` component.
   *
   * @param {HeaderCellProps} inProps
   * @param {React.Ref<HTMLDivElement>} ref
   */
  inProps: { columnName: string; id: string } & React.HTMLAttributes<HTMLDivElement> &
    React.HTMLProps<HTMLDivElement>,
  ref: React.Ref<HTMLDivElement>
) {
  // ...

  /**
   * Returns the `FileLabel` component.
   *
   * @returns {JSX.Element}
   */
  return <FileLabel {...columnProps} labelProps={getLabelProps()} status={status} iconProps={getIconContainerProps()} columnName={inProps.columnName} header />;
});

/**
 * Props for the `HeaderCell` component.
 *
 * @interface HeaderCellPropTypes
 */
HeaderCell.propTypes = {
  /**
   * The column name of the header cell.
   *
   * @required
   */
  columnName: PropTypes.string.isRequired,

  /**
   * The ID of the header cell.
   *
   * @required
   */
  id: PropTypes.string.isRequired,
};

/**
 * An object that defines the properties for the `HeaderCell` component.
 *
 * @interface HeaderCellPropTypes
 */
const HeaderCellPropTypes = {
  /**
   * The column name of the header cell.
   *
   * @default null
   */
  columnName: PropTypes.string,

  /**
   * The ID of the header cell.
   *
   * @default null
   */
  id: PropTypes.string,
};

export { FileLabelRoot, HeaderCell, HeaderCellPropTypes };