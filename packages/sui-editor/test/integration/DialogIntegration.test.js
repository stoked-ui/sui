import * as React from 'react';
import { expect } from 'chai';
import { createRenderer, screen } from '@mui-internal/test-utils';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';

/**
 * Dialog component integration test suite.
 */
describe('<Dialog /> integration', () => {
  /**
   * Renderer instance for rendering components.
   */
  const { render } = createRenderer();

  /**
   * Test that the dialog is automatically labelled by its DialogTitle.
   */
  it('is automatically labelled by its DialogTitle', () => {
    // Render a dialog with an auto-generated title
    render(
      <Dialog open>
        <DialogTitle>Set backup account</DialogTitle>
      </Dialog>,
    );

    // Expect the dialog to have an accessible name that matches the title text
    expect(screen.getByRole('dialog')).toHaveAccessibleName('Set backup account');
  });

  /**
   * Test that a manually labelled dialog works as expected.
   */
  it('can be manually labelled', () => {
    // Render a dialog with a custom aria-labelledby attribute and an auto-generated title
    render(
      <Dialog open aria-labelledby="dialog-title">
        <DialogTitle id="dialog-title">Set backup account</DialogTitle>
      </Dialog>,
    );

    // Get the rendered dialog element
    const dialog = screen.getByRole('dialog');

    // Expect the dialog to have an accessible name that matches the title text
    expect(dialog).toHaveAccessibleName('Set backup account');

    // Expect the dialog's aria-labelledby attribute to match the custom id
    expect(dialog).to.have.attr('aria-labelledby', 'dialog-title');
  });
});