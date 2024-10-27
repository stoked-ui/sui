import * as React from 'react';
import PropTypes from 'prop-types';
import Typography from '@mui/material/Typography';
import {SxProps, Theme} from '@mui/system';
import Box from '@mui/material/Box';
import {shouldForwardProp} from '@mui/system/createStyled';
import {styled} from '../internals/zero-styled';
import {FileIconContainer} from './FileIconContainer';
import {FileIcon} from '../internals/FileIcon';
import {
  useFileExplorerGridColumnHeader
} from '../internals/plugins/useFileExplorerGrid/useFileExplorerGridColumnHeader';
import {UseFileMinimalPlugins} from '../internals/models';

const FileLabelRoot = styled('div', {
  name: 'MuiFile',
  slot: 'Label',
  overridesResolver: (props, styles) => styles.name,
  shouldForwardProp: (prop) =>
    shouldForwardProp(prop) &&
    prop !== 'grow' &&
    prop !== 'cell' &&
    prop !== 'last' &&
    prop !== 'header' &&
    prop !== 'first' &&
    prop !== 'grid' &&
    prop !== 'selected' &&
    prop !== 'iconName',
})<{
  grow?: boolean;
  header?: boolean;
  cell?: boolean;
  last?: boolean;
  grid?: boolean;
  selected?: boolean;
}>(({ theme, grow, cell }) => ({
  boxSizing: 'border-box', // prevent width + padding to overflow
  // fixes overflow - see https://github.com/stoked-ui/stoked-ui/issues/27372
  minWidth: 0,
  position: 'relative',
  ...theme.typography.body1,
  flexGrow: grow ? 1 : undefined,
  padding: cell ? theme.spacing(0.5) : undefined,
  variants: [
    {
      props: { cell: true, header: undefined },
      style: {
        /*
      '&::before': {
      content: '""',
      position: 'absolute',
      background: selected ? theme.palette.primary.dark : theme.palette.divider,
      width: '1px',
      height: '80%',
      left: -1,
      },
      */
      },
    },
    {
      props: { grid: true },
      style: { display: 'flex', alignItems: 'center', justifyContent: 'end' },
    },
    { props: { grid: false }, style: { width: '100%', display: 'flex', alignItems: 'center' } },
  ],
}));
interface CustomLabelProps {
  children: React.ReactNode;
  icon?: React.ElementType;
  expandable?: boolean;
}

const StyledFileLabelText = styled(Typography)({
  fontFamily: 'Roboto, Helvetica, Arial, sans-serif',
  fontWeight: 500,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  textWrap: 'nowrap',
}) as unknown as typeof Typography;

type FileLabelProps = {
  expandable?: boolean;
  grow?: boolean;
  children: React.ReactNode;
  sx?: SxProps<Theme>;
  width?: number;
  meta?: boolean;
  last?: boolean;
  icon?: React.ElementType;
  selected?: boolean;
} & CustomLabelProps &
  any;

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
    <StyledFileLabelText variant="body2" sx={sx}>
      {children}
    </StyledFileLabelText>
  );

  if (labelProps) {
    actualLabel = (
      <Box {...labelProps} sx={sx}>
        <StyledFileLabelText variant="body2" sx={sx}>
          {labelProps.children}
        </StyledFileLabelText>
      </Box>
    );
  }
  const headerIcon: SxProps<Theme> =
    status && !status.focused
      ? { visibility: 'visible', alignSelf: 'center', color: 'black' }
      : { alignSelf: 'center', color: 'black' };
  const sxProp: SxProps = {
    display: header ? 'flex' : undefined,
    overflow: 'hidden'
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
      {Icon && (
        <Box
          component={Icon}
          className="labelIcon"
          color="inherit"
          sx={{ mr: 1, fontSize: '1.2rem' }}
        />
      )}

      {actualLabel}
      {showIcon && (
        <FileIconContainer {...iconProps} sx={(theme) => ({ color: theme.palette.text.primary })}>
          <FileIcon status={status} sx={headerIcon} iconName={iconProps?.iconName} />
        </FileIconContainer>
      )}
    </FileLabelRoot>
  );
});

const HeaderCell = React.forwardRef(function HeaderCell(
  inProps: { columnName: string; id: string } & React.HTMLAttributes<HTMLDivElement> &
    React.HTMLProps<HTMLDivElement>,
  ref: React.Ref<HTMLDivElement>,
) {
  // const HeaderCell = (inProps: { columnName: string } & React.HTMLAttributes<HTMLDivElement> & React.HTMLProps<HTMLDivElement>) => {
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
