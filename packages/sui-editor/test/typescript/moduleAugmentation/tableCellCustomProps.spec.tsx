import * as React from 'react';
import Table from '@mui/material/Table';
import TableCell from '@mui/material/TableCell';
import { createTheme } from '@mui/material/styles';

/**
 * Extends TablePropsSizeOverrides interface to include large size.
 */
declare module '@mui/material/Table' {
  interface TablePropsSizeOverrides {
    large: true;
  }
}

/**
 * Extends TableCellPropsSizeOverrides and TableCellPropsVariantOverrides interfaces
 * to include large size and tableBody variant respectively.
 */
declare module '@mui/material/TableCell' {
  interface TableCellPropsSizeOverrides {
    large: true;
  }
  interface TableCellPropsVariantOverrides {
    tableBody: true;
  }
}

// theme typings should work as expected

/**
 * Theme customization using createTheme.
 */
const theme = createTheme({
  components: {
    MuiTableCell: {
      styleOverrides: {
        root: ({ ownerState }) => ({
          ...(ownerState.size === 'large' && {
            paddingBlock: '1rem',
          }),
        }),
      },
      variants: [
        {
          props: { variant: 'tableBody' },
          style: {
            fontSize: '1.2em',
            color: '#C1D3FF',
          },
        },
      ],
    },
  },
});

/**
 * Example usage of Table with large size and TableCell with large size.
 */
<Table size="large">
  <TableCell size="large" />
</Table>;

/**
 * Example usage of Table with large size and TableCell with tableBody variant.
 */
<Table size="large">
  <TableCell variant="tableBody">Foo</TableCell>;
</Table>;

/**
 * Example usage of Table with large size and TableCell with unknown variant (error expected).
 */
<Table size="large">
  {/* @ts-expect-error unknown variant */}
  <TableCell variant="tableHeading">Bar</TableCell>;
</Table>;