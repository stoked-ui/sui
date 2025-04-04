import * as React from 'react';
import { expect } from 'chai';

/**
 * Integration tests for TableRow component.
 *
 * This suite of tests ensures the TableRow component functions correctly
 * within different contexts, including TableHead and TableFooter.
 */
describe('<TableRow> integration', () => {
  const { render } = createRenderer();

  /**
   * Test that TableRow renders with the head class when in a TableHead context.
   */
  it('should render with the head class when in the context of a table head', () => {
    const { getByRole } = render(
      <table>
        <TableHead>
          <TableRow />
        </TableHead>
      </table>,
    );
    expect(getByRole('row')).to.have.class(classes.root);
    expect(getByRole('row')).to.have.class(classes.head);
  });

  /**
   * Test that TableRow renders with the footer class when in a TableFooter context.
   */
  it('should render with the footer class when in the context of a table footer', () => {
    const { getByRole } = render(
      <table>
        <TableFooter>
          <TableRow />
        </TableFooter>
      </table>,
    );
    expect(getByRole('row')).to.have.class(classes.root);
    expect(getByRole('row')).to.have.class(classes.footer);
  });
});