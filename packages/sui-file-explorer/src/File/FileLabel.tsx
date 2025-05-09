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
 * Custom label props for FileLabel component
 * @typedef {object} CustomLabelProps
 * @property {React.ReactNode} children - The content of the label
 * @property {React.ElementType} icon - The icon component
 * @property {boolean} expandable - Indicates if the label is expandable
 */

/**
 * Props for FileLabel component
 * @typedef {object} FileLabelProps
 * @property {React.ReactNode} children - The content of the label
 * @property {boolean} [expandable] - Indicates if the label is expandable
 * @property {boolean} [grow] - Indicates if the label should grow
 * @property {SxProps<Theme>} [sx] - The style props
 * @property {number} [width] - The width of the label
 * @property {boolean} [meta] - Indicates if the label is metadata
 * @property {boolean} [last] - Indicates if it is the last label
 * @property {React.ElementType} [icon] - The icon component
 * @property {boolean} [selected] - Indicates if the label is selected
 * @property {object} labelProps - Props for the label
 * @property {object} iconProps - Props for the icon
 * @property {object} status - The status of the label
 * @property {string} columnName - The column name
 * @property {boolean} showIcon - Indicates if the icon should be displayed
 */

/**
 * Represents a file label component
 * @param {FileLabelProps} props - The props for the component
 * @returns {JSX.Element} A React JSX Element representing the file label
 */
export const FileLabel = React.forwardRef(function FileExplorer(
  {
    icon: Icon,
    expandable,
    children,
    sx,
    width,
    meta,
    last,
    id,
    className,
    grow,
    header,
    cell,
    labelProps,
    iconProps,
    status,
    selected,
    columnName,
    showIcon,
    ...other
  }: FileLabelProps,
  ref: React.Ref<HTMLDivElement>,
) {
  const mx: string | undefined = meta && !last ? '4px' : undefined;
  const mr: string | undefined = meta && last ? '4px' : undefined;
  let actualLabel = (
    <StyledFileLabelText variant="body2" sx={[...(Array.isArray(sx) ? sx : [sx]), {width: '100%'}]}>
      {children}
    </StyledFileLabelText>
  );

  if (labelProps) {
    actualLabel = (
      <Box {...labelProps} sx={sx}>
        <StyledFileLabelText variant="body2" sx={sx}>
          {`${labelProps.children}` === 'Lastmodified' ? 'Modified' : labelProps.children}
        </StyledFileLabelText>
      </Box>
    );
  }

  const headerIcon = 
    status && !status.focused
      ? { visibility: 'visible', alignSelf: 'center', color: 'black' }
      : { alignSelf: 'center', color: 'black' };
  const sxProp: SxProps = {
    display: header ? 'flex' : undefined,
    overflow: 'hidden',
    alignItems: 'center',
  };
  showIcon = showIcon || header;
  if (!status && showIcon) {
    status = {};
  }
  if (!iconProps) {
    iconProps = { sx: { right: 0, position: 'absolute' } };
  }
  return (
    <FileLabelRoot
      {...other}
      sx={sxProp}
      mx={mx}
      mr={mr}
      className={className}
      key={id}
      grow={grow}
      header
      last={last}
      cell={cell}
      selected={selected}
      ref={ref}
    >
      <div style={{ width: '100%', display: 'flex' }}>
        {Icon && (
          <Box
            component={Icon}
            className="labelIcon"
            color="inherit"
            sx={{ mr: 1, fontSize: '1.2rem', '& svn': { paddingRight: '20px' } }}
          />
        )}

        {actualLabel}
      </div>
      {showIcon && (
        <FileIconContainer
          {...iconProps}
          sx={(theme) => ({ color: theme.palette.text.primary, '& svg': { marginRight: '10px' }})}
        >
          <FileIcon status={status} sx={[headerIcon, (theme) => ({ color: selected ? theme.palette.background.default : theme.palette.text.primary })]} iconName={iconProps?.iconName} />
        </FileIconContainer>
      )}
    </FileLabelRoot>
  );
});

/**
 * Represents a header cell component
 * @param {object} inProps - The props for the component
 * @param {string} inProps.columnName - The name of the column
 * @param {string} inProps.id - The id of the column
 * @returns {JSX.Element} A React JSX Element representing the header cell
 */
const HeaderCell = React.forwardRef(function HeaderCell(
  inProps: { columnName: string; id: string } & React.HTMLAttributes<HTMLDivElement> &
    React.HTMLProps<HTMLDivElement>,
  ref: React.Ref<HTMLDivElement>,
) {
  const { getColumnProps, getIconContainerProps, getLabelProps, status } =
    useFileExplorerGridColumnHeader<UseFileMinimalPlugins>({
      columnName: inProps.columnName,
      id: inProps.id,
      ref,
    });
  const columnProps = getColumnProps();
  return (
    <FileLabel
      {...columnProps}
      labelProps={getLabelProps()}
      status={status}
      iconProps={getIconContainerProps()}
      columnName={inProps.columnName}
      header
    />
  );
});

HeaderCell.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  columnName: PropTypes.string.isRequired,
};

export { HeaderCell };