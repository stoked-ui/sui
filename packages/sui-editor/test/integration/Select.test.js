/**
 * Integration test for the Select component.
 */
describe('<Select> integration', () => {
  const { clock, render } = createRenderer({ clock: 'fake' });

  /**
   * Select component within a Dialog.
   */
  function SelectAndDialog() {
    const [value, setValue] = React.useState(10);

    /**
     * Handles the change event of the Select component.
     * @param {React.ChangeEvent} event - The event object.
     */
    const handleChange = (event) => {
      setValue(Number(event.target.value));
    };

    return (
      <Dialog open>
        <Select
          MenuProps={{
            transitionDuration: 0,
            BackdropProps: { 'data-testid': 'select-backdrop' },
          }}
          value={value}
          onChange={handleChange}
        >
          <MenuItem value="">
            <em>None</em>
          </MenuItem>
          <MenuItem value={10}>Ten</MenuItem>
          <MenuItem value={20}>Twenty</MenuItem>
          <MenuItem value={30}>Thirty</MenuItem>
        </Select>
      </Dialog>
    );
  }

  /**
   * Test to focus the selected item.
   */
  it('should focus the selected item', () => {
    const { getByTestId, getAllByRole, getByRole, queryByRole } = render(<SelectAndDialog />);

    const trigger = getByRole('combobox');
    // Let's open the select component
    // in the browser user click also focuses
    fireEvent.mouseDown(trigger);

    const options = getAllByRole('option');
    expect(options[1]).toHaveFocus();

    // Now, let's close the select component
    act(() => {
      getByTestId('select-backdrop').click();
    });
    clock.tick(0);

    expect(queryByRole('listbox')).to.equal(null);
    expect(trigger).toHaveFocus();
  });

  /**
   * Test to change the selected item.
   */
  it('should be able to change the selected item', () => {
    const { getAllByRole, getByRole, queryByRole } = render(<SelectAndDialog />);

    const trigger = getByRole('combobox');
    expect(trigger).toHaveAccessibleName('');
    // Let's open the select component
    // in the browser user click also focuses
    fireEvent.mouseDown(trigger);

    const options = getAllByRole('option');
    expect(options[1]).toHaveFocus();

    // Now, let's close the select component
    act(() => {
      options[2].click();
    });
    clock.tick(0);

    expect(queryByRole('listbox')).to.equal(null);
    expect(trigger).toHaveFocus();
    expect(trigger).to.have.text('Twenty');
  });
});

/**
 * Test scenarios with label.
 */
describe('with label', () => {
  /**
   * Test for a proper accessible name with 'id' and 'labelId'.
   */
  it('requires `id` and `labelId` for a proper accessible name', () => {
    const { getByRole } = render(
      <FormControl>
        <InputLabel id="label">Age</InputLabel>
        <Select id="input" labelId="label" value="10">
          <MenuItem value="">none</MenuItem>
          <MenuItem value="10">Ten</MenuItem>
        </Select>
      </FormControl>,
    );

    expect(getByRole('combobox')).toHaveAccessibleName('Age');
  });

  /**
   * Test to display as focused while open.
   */
  it('is displayed as focused while open', () => {
    const { getByTestId, getByRole } = render(
      <FormControl>
        <InputLabel classes={{ focused: 'focused-label' }} data-testid="label">
          Age
        </InputLabel>
        <Select
          MenuProps={{
            transitionDuration: 0,
          }}
          value=""
        >
          <MenuItem value="">none</MenuItem>
          <MenuItem value={10}>Ten</MenuItem>
        </Select>
      </FormControl>,
    );

    const trigger = getByRole('combobox');
    act(() => {
      trigger.focus();
    });
    fireEvent.keyDown(trigger, { key: 'Enter' });
    clock.tick(0);

    expect(getByTestId('label')).to.have.class('focused-label');
  });

  /**
   * Test when not staying in an active state if action did not open.
   */
  it('does not stays in an active state if an open action did not actually open', () => {
    const { container, getByRole } = render(
      <FormControl>
        <InputLabel classes={{ focused: 'focused-label' }} htmlFor="age-simple">
          Age
        </InputLabel>
        <Select inputProps={{ id: 'age' }} open={false} value="">
          <MenuItem value="">none</MenuItem>
          <MenuItem value={10}>Ten</MenuItem>
        </Select>
      </FormControl>,
    );
    const trigger = getByRole('combobox');

    act(() => {
      trigger.focus();
    });

    expect(container.querySelector('[for="age-simple"]')).to.have.class('focused-label');

    fireEvent.keyDown(trigger, { key: 'Enter' });

    expect(container.querySelector('[for="age-simple"]')).to.have.class('focused-label');

    act(() => {
      trigger.blur();
    });

    expect(container.querySelector('[for="age-simple"]')).not.to.have.class('focused-label');
  });
});