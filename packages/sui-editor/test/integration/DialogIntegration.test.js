/**
 * Integration tests for the Dialog component.
 */
describe('<Dialog /> integration', () => {
  const { render } = createRenderer();

  /**
   * Test case: Dialog is automatically labelled by its DialogTitle.
   */
  it('is automatically labelled by its DialogTitle', () => {
    render(
      <Dialog open>
        <DialogTitle>Set backup account</DialogTitle>
      </Dialog>,
    );

    expect(screen.getByRole('dialog')).toHaveAccessibleName('Set backup account');
  });

  /**
   * Test case: Dialog can be manually labelled.
   */
  it('can be manually labelled', () => {
    render(
      <Dialog open aria-labelledby="dialog-title">
        <DialogTitle id="dialog-title">Set backup account</DialogTitle>
      </Dialog>,
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAccessibleName('Set backup account');
    expect(dialog).to.have.attr('aria-labelledby', 'dialog-title');
  });
});