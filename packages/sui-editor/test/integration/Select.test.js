import * as React from 'react';
import { expect } from 'chai';
import { act, createRenderer, fireEvent } from '@mui-internal/test-utils';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Dialog from '@mui/material/Dialog';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';

/**
 * This test suite integrates the Material-UI Select component with a Dialog.
 * It tests various scenarios, including focusing and changing the selected item,
 * ensuring accessibility and rendering of labels.
 */

describe('<Select> integration', () => {
  /**
   * Creates a renderer instance for Material-UI components.
   */
  const { clock, render } = createRenderer({ clock: 'fake' });

  describe('with Dialog', () => {
    function SelectAndDialog() {
      /**
       * State to store the selected value and handle changes.
       */
      const [value, setValue] = React.useState(10);

      /**
       * Handles changes in the select component.
       *
       * @param {Event} event - The change event.
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

    it('should focus the selected item', () => {
      /**
       * Renders the SelectAndDialog component and gets references to elements.
       */
      const { getByTestId, getAllByRole, getByRole, queryByRole } = render(<SelectAndDialog />);

      const trigger = getByRole('combobox');
      fireEvent.mouseDown(trigger);
      expect(getAllByRole('option')[1]).toHaveFocus();

      act(() => {
        getByTestId('select-backdrop').click();
      });
      clock.tick(0);

      expect(queryByRole('listbox')).to.equal(null);
      expect(trigger).toHaveFocus();
    });

    it('should be able to change the selected item', () => {
      const { getAllByRole, getByRole, queryByRole } = render(<SelectAndDialog />);

      const trigger = getByRole('combobox');
      expect(trigger).toHaveAccessibleName('');
      fireEvent.mouseDown(trigger);
      expect(getAllByRole('option')[1]).toHaveFocus();

      act(() => {
        options[2].click();
      });
      clock.tick(0);

      expect(queryByRole('listbox')).to.equal(null);
      expect(trigger).toHaveFocus();
    });

    /**
     * Tests accessibility features of the Select component.
     */
    it('should have proper accessibility attributes', () => {
      const { getByRole } = render(<Select />);
      expect(getByRole('combobox')).not.toBeNull();
    });
  });

  describe('with label', () => {
    function LabelAndSelect() {
      return (
        <FormControl>
          <InputLabel classes={{ focused: 'focused-label' }} data-testid="label">
            Age
          </InputLabel>
          <Select MenuProps={{ transitionDuration: 0 }}>
            <MenuItem value="">none</MenuItem>
            <MenuItem value={10}>Ten</MenuItem>
          </Select>
        </FormControl>
      );
    }

    it('should have proper accessibility attributes', () => {
      const { getByRole, getByTestId } = render(<LabelAndSelect />);
      expect(getByRole('combobox')).not.toBeNull();
      expect(getByTestId('label')).not.toBeNull();
    });

    /**
     * Tests focus and blur behavior of the label.
     */
    it('should have proper focus and blur behavior', () => {
      const { container, getByRole } = render(<LabelAndSelect />);
      act(() => {
        getByRole('combobox').focus();
      });
      fireEvent.keyDown(getByRole('combobox'), { key: 'Enter' });

      expect(container.querySelector('[for="age-simple"]')).to.have.class('focused-label');

      act(() => {
        getByRole('combobox').blur();
      });

      expect(container.querySelector('[for="age-simple"]')).not.to.have.class('focused-label');
    });
  });
});