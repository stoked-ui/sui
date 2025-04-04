import * as React from 'react';
import Table from '@mui/material/Table';
import TableCell from '@mui/material/TableCell';
import { createTheme } from '@mui/material/styles';

/**
 * Adds table size overrides for large tables.
 */
declare module '@mui/material/Table' {
  interface TablePropsSizeOverrides {
    /**
     * The size of the table. Can be either 'small', 'medium', or 'large'.
     */
    large: true;
  }
}

/**
 * Adds table cell size overrides for large tables.
 */
declare module '@mui/material/TableCell' {
  interface TableCellPropsSizeOverrides {
    /**
     * The size of the table cell. Can be either 'small' or 'large'.
     */
    large: true;
  }
  interface TableCellPropsVariantOverrides {
    /**
     * Applies styles to the table cell for the `tableBody` variant.
     */
    tableBody: true;
  }
}

/**
 * Creates a theme with custom overrides for tables.
 *
 * @returns The created theme.
 */
const theme = createTheme({
  components: {
    MuiTableCell: {
      /**
       * Styles the root element of the table cell.
       *
       * @param {object} props - The component props.
       * @param {string} props.ownerState.size - The size of the table cell.
       */
      styleOverrides: {
        root: ({ ownerState }) => ({
          ...(ownerState.size === 'large' && {
            /**
             * Adds padding to the large table cells.
             */
            paddingBlock: '1rem',
          }),
        }),
      },
      variants: [
        {
          /**
           * Applies styles for the `tableBody` variant.
           *
           * @param {object} props - The component props.
           * @param {string} props.variant - The variant of the table cell.
           */
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
 * Renders a large table with a single column.
 *
 * @returns The JSX element for the table.
 */
<Table size="large">
  <TableCell size="large" />
</Table>;

/**
 * Renders a large table with a single cell containing text content.
 *
 * @returns The JSX element for the table.
 */
<Table size="large">
  <TableCell variant="tableBody">Foo</TableCell>;
</Table>;

/**
 * Renders a large table with a single cell containing unknown content.
 *
 * @returns The JSX element for the table.
 */
<Table size="large">
  {/* @ts-expect-error unknown variant */}
  <TableCell variant="tableHeading">Bar</TableCell>;
</Table>;