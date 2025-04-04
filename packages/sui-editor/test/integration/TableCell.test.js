/**
 * @fileoverview Integration tests for TableCell
 */

import * as React from 'react';
import { expect } from 'chai';
import { createRenderer } from '@mui-internal/test-utils';
import TableCell, { tableCellClasses as classes } from '@mui/material/TableCell';
import Table from '@mui/material/Table';
import TableFooter from '@mui/material/TableFooter';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';

/**
 * Integration tests for TableCell
 */
describe('<TableRow> integration', () => {
  const { render } = createRenderer();

  /**
   * Renders a table row with the specified node and variant.
   *
   * @param {React.ReactNode} node - The node to be rendered in the table row.
   * @param {string} Variant - The variant of the table row.
   */
  function renderInTable(node, Variant) {
    return render(
      <Table>
        <Variant>
          <TableRow>{node}</TableRow>
        </Variant>
      </Table>,
    );
  }

  /**
   * Tests that a th element is rendered with the head class when in the context of a table head.
   */
  it('should render a th with the head class when in the context of a table head', () => {
    const { getByTestId } = renderInTable(<TableCell data-testid="cell" />, TableHead);
    expect(getByTestId('cell')).to.have.tagName('th');
    expect(getByTestId('cell')).to.have.class(classes.root);
    expect(getByTestId('cell')).to.have.class(classes.head);
    expect(getByTestId('cell')).to.have.attribute('scope', 'col');
  });

  /**
   * Tests that the specified scope attribute is rendered when in the context of a table head.
   */
  it('should render specified scope attribute even when in the context of a table head', () => {
    const { getByTestId } = renderInTable(<TableCell scope="row" data-testid="cell" />, TableHead);
    expect(getByTestId('cell')).to.have.attribute('scope', 'row');
  });

  /**
   * Tests that a th element is rendered with the footer class when in the context of a table footer.
   */
  it('should render a th with the footer class when in the context of a table footer', () => {
    const { getByTestId } = renderInTable(<TableCell data-testid="cell" />, TableFooter);
    expect(getByTestId('cell')).to.have.tagName('td');
    expect(getByTestId('cell')).to.have.class(classes.root);
    expect(getByTestId('cell')).to.have.class(classes.footer);
  });

  /**
   * Tests that the footer class is rendered when in the context of a table footer.
   */
  it('should render with the footer class when variant is body, overriding context', () => {
    const { getByTestId } = renderInTable(
      <TableCell data-testid="cell" />,
      TableFooter,
    );
    expect(getByTestId('cell')).to.have.class(classes.root);
    expect(getByTestId('cell')).to.have.class(classes.footer);
  });

  /**
   * Tests that the head class is rendered when variant is head and overriding context.
   */
  it('should render with the head class when variant is head, overriding context', () => {
    const { getByTestId } = renderInTable(
      <TableCell variant="head" data-testid="cell" />,
      TableFooter,
    );
    expect(getByTestId('cell')).to.have.class(classes.head);
    expect(getByTestId('cell')).not.to.have.attribute('scope');
  });

  /**
   * Tests that the head class is not rendered when variant is body and overriding context.
   */
  it('should not render head class when variant is body, overriding context', () => {
    const { getByTestId } = renderInTable(
      <TableCell data-testid="cell" />,
      TableFooter,
    );
    expect(getByTestId('cell')).not.to.have.class(classes.head);
  });

  /**
   * Tests that the role attribute is not set when component prop is set and used in the context of table head.
   */
  it('does not set `role` when `component` prop is set and used in the context of table head', () => {
    const { getByTestId } = render(
      <TableHead component="div">
        <TableCell component="div" data-testid="cell" />,
      </TableHead>,
    );
    expect(getByTestId('cell')).not.to.have.attribute('role');
  });

  /**
   * Tests that the role attribute is not set when component prop is set and used in the context of table body.
   */
  it('does not set `role` when `component` prop is set and used in the context of table body', () => {
    const { getByTestId } = render(
      <TableBody component="div">
        <TableCell component="div" data-testid="cell" />,
      </TableBody>,
    );
    expect(getByTestId('cell')).not.to.have.attribute('role');
  });

  /**
   * Tests that the role attribute is not set when component prop is set and used in the context of table footer.
   */
  it('does not set `role` when `component` prop is set and used in the context of table footer', () => {
    const { getByTestId } = render(
      <TableFooter component="div">
        <TableCell component="div" data-testid="cell" />,
      </TableFooter>,
    );
    expect(getByTestId('cell')).not.to.have.attribute('role');
  });
});