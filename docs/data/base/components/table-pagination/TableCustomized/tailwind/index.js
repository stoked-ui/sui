import * as React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { useTheme } from '@mui/system';
import { TablePagination } from '@mui/base/TablePagination';

function useIsDarkMode() {
  const theme = useTheme();
  return theme.palette.mode === 'dark';
}

export default function TableCustomized() {
  // Replace this with your app logic for determining dark mode
  const isDarkMode = useIsDarkMode();

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <div
      className={`${isDarkMode ? 'dark' : ''} max-w-full`}
      style={{ width: '500px' }}
    >
      <table
        className="text-sm font-sans w-full border-collapse"
        aria-label="custom pagination table"
      >
        <thead>
          <tr>
            <th className="border border-solid border-slate-200 dark:border-slate-800 text-left p-1.5 bg-purple-50 dark:bg-purple-950">
              Dessert
            </th>
            <th className="border border-solid border-slate-200 dark:border-slate-800 text-left p-1.5 bg-purple-50 dark:bg-purple-950">
              Calories
            </th>
            <th className="border border-solid border-slate-200 dark:border-slate-800 text-left p-1.5 bg-purple-50 dark:bg-purple-950">
              Fat
            </th>
          </tr>
        </thead>
        <tbody>
          {(rowsPerPage > 0
            ? rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            : rows
          ).map((row) => (
            <tr key={row.name}>
              <td className="border border-solid border-slate-200 dark:border-slate-800 text-left p-1.5">
                {row.name}
              </td>
              <td
                className="border border-solid border-slate-200 dark:border-slate-800 text-left p-1.5"
                style={{ width: 120 }}
                align="right"
              >
                {row.calories}
              </td>
              <td
                className="border border-solid border-slate-200 dark:border-slate-800 text-left p-1.5"
                style={{ width: 120 }}
                align="right"
              >
                {row.fat}
              </td>
            </tr>
          ))}

          {emptyRows > 0 && (
            <tr style={{ height: 34 * emptyRows }}>
              <td
                className="border border-solid border-slate-200 dark:border-slate-800 text-left p-1.5"
                colSpan={3}
                aria-hidden
              />
            </tr>
          )}
        </tbody>
        <tfoot>
          <tr className="border border-solid border-slate-200 dark:border-slate-800 text-left p-1.5">
            <CustomTablePagination
              rowsPerPageOptions={[5, 10, 25, { label: 'All', value: -1 }]}
              colSpan={3}
              count={rows.length}
              rowsPerPage={rowsPerPage}
              page={page}
              slotProps={{
                select: {
                  'aria-label': 'rows per page',
                },
                actions: {
                  showFirstButton: true,
                  showLastButton: true,
                },
              }}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

const resolveSlotProps = (fn, args) => (typeof fn === 'function' ? fn(args) : fn);

const CustomTablePagination = React.forwardRef((props, ref) => {
  return (
    <TablePagination
      ref={ref}
      {...props}
      className={clsx('CustomTablePagination p-1.5', props.className)}
      slotProps={{
        ...props.slotProps,
        select: (ownerState) => {
          const resolvedSlotProps = resolveSlotProps(
            props.slotProps?.select,
            ownerState,
          );
          return {
            ...resolvedSlotProps,
            className: clsx(
              'p-0.5 border border-solid border-slate-200 dark:border-slate-800 rounded-3xl bg-transparent hover:bg-slate-20 hover:dark:bg-slate-800 focus:outline-0 focus:shadow-outline-purple-xs',
              resolvedSlotProps?.className,
            ),
          };
        },
        actions: (ownerState) => {
          const resolvedSlotProps = resolveSlotProps(
            props.slotProps?.actions,
            ownerState,
          );
          return {
            ...resolvedSlotProps,
            className: clsx(
              'p-0.5 border border-solid border-slate-200 dark:border-slate-800 rounded-3xl text-center [&>button]:my-0 [&>button]:mx-2 [&>button]:border-transparent [&>button]:rounded-sm [&>button]:bg-transparent [&>button:hover]:bg-slate-50 [&>button:hover]:dark:bg-slate-800 [&>button:focus]:outline-0 [&>button:focus]:shadow-outline-purple-xs',
              resolvedSlotProps?.className,
            ),
          };
        },
        spacer: (ownerState) => {
          const resolvedSlotProps = resolveSlotProps(
            props.slotProps?.spacer,
            ownerState,
          );
          return {
            ...resolvedSlotProps,
            className: clsx('hidden', resolvedSlotProps?.className),
          };
        },
        toolbar: (ownerState) => {
          const resolvedSlotProps = resolveSlotProps(
            props.slotProps?.toolbar,
            ownerState,
          );
          return {
            ...resolvedSlotProps,
            className: clsx(
              'flex flex-col items-start gap-2.5 md:flex-row md:items-center',
              resolvedSlotProps?.className,
            ),
          };
        },
        selectLabel: (ownerState) => {
          const resolvedSlotProps = resolveSlotProps(
            props.slotProps?.selectLabel,
            ownerState,
          );
          return {
            ...resolvedSlotProps,
            className: clsx('m-0', resolvedSlotProps?.className),
          };
        },
        displayedRows: (ownerState) => {
          const resolvedSlotProps = resolveSlotProps(
            props.slotProps?.displayedRows,
            ownerState,
          );
          return {
            ...resolvedSlotProps,
            className: clsx('m-0 md:ml-auto', resolvedSlotProps?.className),
          };
        },
      }}
    />
  );
});

CustomTablePagination.propTypes = {
  className: PropTypes.string,
  /**
   * The props used for each slot inside the TablePagination.
   * @default {}
   */
  slotProps: PropTypes.shape({
    actions: PropTypes.oneOfType([
      PropTypes.func,
      PropTypes.shape({
        count: PropTypes.number,
        direction: PropTypes.oneOf(['ltr', 'rtl']),
        getItemAriaLabel: PropTypes.func,
        onPageChange: PropTypes.func,
        page: PropTypes.number,
        rowsPerPage: PropTypes.number,
        showFirstButton: PropTypes.bool,
        showLastButton: PropTypes.bool,
        slotProps: PropTypes.shape({
          backButton: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
          firstButton: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
          lastButton: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
          nextButton: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
          root: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
        }),
        slots: PropTypes.shape({
          backButton: PropTypes.elementType,
          backPageIcon: PropTypes.elementType,
          firstButton: PropTypes.elementType,
          firstPageIcon: PropTypes.elementType,
          lastButton: PropTypes.elementType,
          lastPageIcon: PropTypes.elementType,
          nextButton: PropTypes.elementType,
          nextPageIcon: PropTypes.elementType,
          root: PropTypes.elementType,
        }),
      }),
    ]),
    displayedRows: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
    menuItem: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
    root: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
    select: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
    selectLabel: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
    spacer: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
    toolbar: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
  }),
};

function createData(name, calories, fat) {
  return { name, calories, fat };
}

const rows = [
  createData('Cupcake', 305, 3.7),
  createData('Donut', 452, 25.0),
  createData('Eclair', 262, 16.0),
  createData('Frozen yoghurt', 159, 6.0),
  createData('Gingerbread', 356, 16.0),
  createData('Honeycomb', 408, 3.2),
  createData('Ice cream sandwich', 237, 9.0),
  createData('Jelly Bean', 375, 0.0),
  createData('KitKat', 518, 26.0),
  createData('Lollipop', 392, 0.2),
  createData('Marshmallow', 318, 0),
  createData('Nougat', 360, 19.0),
  createData('Oreo', 437, 18.0),
].sort((a, b) => (a.calories < b.calories ? -1 : 1));
