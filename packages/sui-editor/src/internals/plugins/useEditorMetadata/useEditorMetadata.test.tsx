import {expect} from 'chai';
import {spy} from 'sinon';
import {fireEvent} from '@stoked-ui/internal-test-utils';
import {describeEditor} from 'test/utils/editor-view/describeEditor';
import {
  UseEditorExpansionSignature, UseEditorSelectionSignature,
} from '@stoked-ui/file-explorer/internals';

/**
 * All tests related to keyboard navigation (e.g.: selection using "Space")
 * are located in the `useEditorKeyboardNavigation.test.tsx` file.
 */
describeEditor<[UseEditorSelectionSignature, UseEditorExpansionSignature]>(
  'useEditorMetadata plugin',
  ({ render }) => {
    describe('model props (selectedItems, defaultSelectedItems, onSelectedItemsChange)', () => {
      it('should not select items when no default state and no control state are defined', () => {
        const response = render({
          items: [{ id: '1' }, { id: '2' }],
        });

        expect(response.isItemSelected('1')).to.equal(false);
      });

      it('should use the default state when defined', () => {
        const response = render({
          items: [{ id: '1' }, { id: '2' }],
          defaultSelectedItems: ['1'],
        });

        expect(response.isItemSelected('1')).to.equal(true);
      });

      it('should use the controlled state when defined', () => {
        const response = render({
          items: [{ id: '1' }, { id: '2' }],
          selectedItems: ['1'],
        });

        expect(response.isItemSelected('1')).to.equal(true);
      });

      it('should use the controlled state instead of the default state when both are defined', () => {
        const response = render({
          items: [{ id: '1' }, { id: '2' }],
          selectedItems: ['1'],
          defaultSelectedItems: ['2'],
        });

        expect(response.isItemSelected('1')).to.equal(true);
      });

      it('should react to controlled state update', () => {
        const response = render({
          items: [{ id: '1' }, { id: '2' }],
          selectedItems: [],
        });

        response.setProps({ selectedItems: ['1'] });
        expect(response.isItemSelected('1')).to.equal(true);
      });

      it('should call the onSelectedItemsChange callback when the model is updated (single selection and add selected item)', () => {
        const onSelectedItemsChange = spy();

        const response = render({
          items: [{ id: '1' }, { id: '2' }],
          onSelectedItemsChange,
        });

        fireEvent.click(response.getItemContent('1'));

        expect(onSelectedItemsChange.callCount).to.equal(1);
        expect(onSelectedItemsChange.lastCall.args[1]).to.deep.equal('1');
      });

      // TODO: Re-enable this test if we have a way to un-select an item in single selection.
      // eslint-disable-next-line mocha/no-skipped-tests
      it.skip('should call onSelectedItemsChange callback when the model is updated (single selection and remove selected item', () => {
        const onSelectedItemsChange = spy();

        const response = render({
          items: [{ id: '1' }, { id: '2' }],
          onSelectedItemsChange,
          defaultSelectedItems: ['1'],
        });

        fireEvent.click(response.getItemContent('1'));

        expect(onSelectedItemsChange.callCount).to.equal(1);
        expect(onSelectedItemsChange.lastCall.args[1]).to.deep.equal([]);
      });

      it('should call the onSelectedItemsChange callback when the model is updated (multi selection and add selected item to empty list)', () => {
        const onSelectedItemsChange = spy();

        const response = render({
          multiSelect: true,
          items: [{ id: '1' }, { id: '2' }],
          onSelectedItemsChange,
        });

        fireEvent.click(response.getItemContent('1'));

        expect(onSelectedItemsChange.callCount).to.equal(1);
        expect(onSelectedItemsChange.lastCall.args[1]).to.deep.equal(['1']);
      });

      it('should call the onSelectedItemsChange callback when the model is updated (multi selection and add selected item to non-empty list)', () => {
        const onSelectedItemsChange = spy();

        const response = render({
          multiSelect: true,
          items: [{ id: '1' }, { id: '2' }],
          onSelectedItemsChange,
          defaultSelectedItems: ['1'],
        });

        fireEvent.click(response.getItemContent('2'), { ctrlKey: true });

        expect(onSelectedItemsChange.callCount).to.equal(1);
        expect(onSelectedItemsChange.lastCall.args[1]).to.deep.equal(['2', '1']);
      });

      it('should call the onSelectedItemsChange callback when the model is updated (multi selection and remove selected item)', () => {
        const onSelectedItemsChange = spy();

        const response = render({
          multiSelect: true,
          items: [{ id: '1' }, { id: '2' }],
          onSelectedItemsChange,
          defaultSelectedItems: ['1'],
        });

        fireEvent.click(response.getItemContent('1'), { ctrlKey: true });

        expect(onSelectedItemsChange.callCount).to.equal(1);
        expect(onSelectedItemsChange.lastCall.args[1]).to.deep.equal([]);
      });

      it('should warn when switching from controlled to uncontrolled', () => {
        const response = render({
          items: [{ id: '1' }, { id: '2' }],
          selectedItems: [],
        });

        expect(() => {
          response.setProps({ selectedItems: undefined });
        }).toErrorDev(
          'SUI X: A component is changing the controlled selectedItems state of Editor to be uncontrolled.',
        );
      });

      it('should warn and not react to update when updating the default state', () => {
        const response = render({
          items: [{ id: '1' }, { id: '2' }],
          defaultSelectedItems: ['1'],
        });

        expect(() => {
          response.setProps({ defaultSelectedItems: ['2'] });
          expect(response.getSelectedFiles()).to.deep.equal(['1']);
        }).toErrorDev(
          'SUI X: A component is changing the default selectedItems state of an uncontrolled Editor after being initialized. To suppress this warning opt to use a controlled Editor.',
        );
      });
    });

    describe('item click interaction', () => {
      describe('single selection', () => {
        it('should select un-selected item when clicking on an item content', () => {
          const response = render({
            items: [{ id: '1' }, { id: '2' }],
          });

          expect(response.isItemSelected('1')).to.equal(false);

          fireEvent.click(response.getItemContent('1'));
          expect(response.isItemSelected('1')).to.equal(true);
        });

        it('should not un-select selected item when clicking on an item content', () => {
          const response = render({
            items: [{ id: '1' }, { id: '2' }],
            defaultSelectedItems: '1',
          });

          expect(response.isItemSelected('1')).to.equal(true);

          fireEvent.click(response.getItemContent('1'));
          expect(response.isItemSelected('1')).to.equal(true);
        });

        it('should not select an item when click and disableSelection', () => {
          const response = render({
            items: [{ id: '1' }, { id: '2' }],
            disableSelection: true,
          });

          expect(response.isItemSelected('1')).to.equal(false);

          fireEvent.click(response.getItemContent('1'));
          expect(response.isItemSelected('1')).to.equal(false);
        });

        it('should not select an item when clicking on a disabled item content', () => {
          const response = render({
            items: [{ id: '1', disabled: true }, { id: '2' }],
          });

          expect(response.isItemSelected('1')).to.equal(false);
          fireEvent.click(response.getItemContent('1'));
          expect(response.isItemSelected('1')).to.equal(false);
        });
      });

      describe('multi selection', () => {
        it('should select un-selected item and remove other selected items when clicking on an item content', () => {
          const response = render({
            multiSelect: true,
            items: [{ id: '1' }, { id: '2' }],
            defaultSelectedItems: ['2'],
          });

          expect(response.getSelectedFiles()).to.deep.equal(['2']);

          fireEvent.click(response.getItemContent('1'));
          expect(response.getSelectedFiles()).to.deep.equal(['1']);
        });

        it('should not un-select selected item when clicking on an item content', () => {
          const response = render({
            multiSelect: true,
            items: [{ id: '1' }, { id: '2' }],
            defaultSelectedItems: ['1'],
          });

          expect(response.isItemSelected('1')).to.equal(true);

          fireEvent.click(response.getItemContent('1'));
          expect(response.isItemSelected('1')).to.equal(true);
        });

        it('should un-select selected item when clicking on its content while holding Ctrl', () => {
          const response = render({
            multiSelect: true,
            items: [{ id: '1' }, { id: '2' }],
            defaultSelectedItems: ['1', '2'],
          });

          expect(response.getSelectedFiles()).to.deep.equal(['1', '2']);
          fireEvent.click(response.getItemContent('1'), { ctrlKey: true });
          expect(response.getSelectedFiles()).to.deep.equal(['2']);
        });

        it('should un-select selected item when clicking on its content while holding Meta', () => {
          const response = render({
            multiSelect: true,
            items: [{ id: '1' }, { id: '2' }],
            defaultSelectedItems: ['1', '2'],
          });

          expect(response.getSelectedFiles()).to.deep.equal(['1', '2']);

          fireEvent.click(response.getItemContent('1'), { metaKey: true });
          expect(response.getSelectedFiles()).to.deep.equal(['2']);
        });

        it('should not select an item when click and disableSelection', () => {
          const response = render({
            multiSelect: true,
            items: [{ id: '1' }, { id: '2' }],
            disableSelection: true,
          });

          expect(response.isItemSelected('1')).to.equal(false);

          fireEvent.click(response.getItemContent('1'));
          expect(response.isItemSelected('1')).to.equal(false);
        });

        it('should not select an item when clicking on a disabled item content', () => {
          const response = render({
            multiSelect: true,
            items: [{ id: '1', disabled: true }, { id: '2' }],
          });

          expect(response.isItemSelected('1')).to.equal(false);
          fireEvent.click(response.getItemContent('1'));
          expect(response.isItemSelected('1')).to.equal(false);
        });

        it('should select un-selected item when clicking on its content while holding Ctrl', () => {
          const response = render({
            multiSelect: true,
            items: [{ id: '1' }, { id: '2' }, { id: '3' }],
            defaultSelectedItems: ['1'],
          });

          expect(response.getSelectedFiles()).to.deep.equal(['1']);

          fireEvent.click(response.getItemContent('3'), { ctrlKey: true });
          expect(response.getSelectedFiles()).to.deep.equal(['1', '3']);
        });

        it('should do nothing when clicking on an item content on a fresh editor whil holding Shift', () => {
          const response = render({
            multiSelect: true,
            items: [{ id: '1' }, { id: '2' }, { id: '2.1' }, { id: '3' }, { id: '4' }],
          });

          fireEvent.click(response.getItemContent('3'), { shiftKey: true });
          expect(response.getSelectedFiles()).to.deep.equal([]);
        });

        it('should expand the selection range when clicking on an item content below the last selected item while holding Shift', () => {
          const response = render({
            multiSelect: true,
            items: [{ id: '1' }, { id: '2' }, { id: '2.1' }, { id: '3' }, { id: '4' }],
          });

          fireEvent.click(response.getItemContent('2'));
          expect(response.getSelectedFiles()).to.deep.equal(['2']);

          fireEvent.click(response.getItemContent('3'), { shiftKey: true });
          expect(response.getSelectedFiles()).to.deep.equal(['2', '2.1', '3']);
        });

        it('should expand the selection range when clicking on an item content above the last selected item while holding Shift', () => {
          const response = render({
            multiSelect: true,
            items: [{ id: '1' }, { id: '2' }, { id: '2.1' }, { id: '3' }, { id: '4' }],
          });

          fireEvent.click(response.getItemContent('3'));
          expect(response.getSelectedFiles()).to.deep.equal(['3']);

          fireEvent.click(response.getItemContent('2'), { shiftKey: true });
          expect(response.getSelectedFiles()).to.deep.equal(['2', '2.1', '3']);
        });

        it('should expand the selection range when clicking on an item content while holding Shift after un-selecting another item', () => {
          const response = render({
            multiSelect: true,
            items: [{ id: '1' }, { id: '2' }, { id: '2.1' }, { id: '3' }, { id: '4' }],
          });

          fireEvent.click(response.getItemContent('1'));
          expect(response.getSelectedFiles()).to.deep.equal(['1']);

          fireEvent.click(response.getItemContent('2'), { ctrlKey: true });
          expect(response.getSelectedFiles()).to.deep.equal(['1', '2']);

          fireEvent.click(response.getItemContent('2'), { ctrlKey: true });
          expect(response.getSelectedFiles()).to.deep.equal(['1']);

          fireEvent.click(response.getItemContent('3'), { shiftKey: true });
          expect(response.getSelectedFiles()).to.deep.equal(['1', '2', '2.1', '3']);
        });

        it('should not expand the selection range when clicking on a disabled item content then clicking on an item content while holding Shift', () => {
          const response = render({
            multiSelect: true,
            items: [
              { id: '1' },
              { id: '2', disabled: true },
              { id: '2.1' },
              { id: '3' },
              { id: '4' },
            ],
          });

          fireEvent.click(response.getItemContent('2'));
          expect(response.getSelectedFiles()).to.deep.equal([]);

          fireEvent.click(response.getItemContent('3'), { shiftKey: true });
          expect(response.getSelectedFiles()).to.deep.equal([]);
        });

        it('should not expand the selection range when clicking on an item content then clicking a disabled item content while holding Shift', () => {
          const response = render({
            multiSelect: true,
            items: [
              { id: '1' },
              { id: '2' },
              { id: '2.1' },
              { id: '3', disabled: true },
              { id: '4' },
            ],
          });

          fireEvent.click(response.getItemContent('2'));
          expect(response.getSelectedFiles()).to.deep.equal(['2']);

          fireEvent.click(response.getItemContent('3'), { shiftKey: true });
          expect(response.getSelectedFiles()).to.deep.equal(['2']);
        });

        it('should not select disabled items that are part of the selected range', () => {
          const response = render({
            multiSelect: true,
            items: [{ id: '1' }, { id: '2', disabled: true }, { id: '3' }],
          });

          fireEvent.click(response.getItemContent('1'));
          expect(response.getSelectedFiles()).to.deep.equal(['1']);

          fireEvent.click(response.getItemContent('3'), { shiftKey: true });
          expect(response.getSelectedFiles()).to.deep.equal(['1', '3']);
        });

        it('should not crash when selecting multiple items in a deeply nested editor', () => {
          const response = render({
            multiSelect: true,
            items: [
              { id: '1', children: [{ id: '1.1', children: [{ id: '1.1.1' }] }] },
              { id: '2' },
            ],
            defaultExpandedItems: ['1', '1.1'],
          });

          fireEvent.click(response.getItemContent('1.1.1'));
          fireEvent.click(response.getItemContent('2'), { shiftKey: true });

          expect(response.getSelectedFiles()).to.deep.equal(['1.1.1', '2']);
        });
      });
    });

    describe('checkbox interaction', () => {
      describe('render checkbox when needed', () => {
        it('should not render a checkbox when checkboxSelection is not defined', () => {
          const response = render({
            items: [{ id: '1' }],
          });

          expect(response.getItemCheckbox('1')).to.equal(null);
        });

        it('should not render a checkbox when checkboxSelection is false', () => {
          const response = render({
            checkboxSelection: false,
            items: [{ id: '1' }],
          });

          expect(response.getItemCheckbox('1')).to.equal(null);
        });

        it('should render a checkbox when checkboxSelection is true', () => {
          const response = render({
            checkboxSelection: true,
            items: [{ id: '1' }],
          });

          expect(response.getItemCheckbox('1')).not.to.equal(null);
        });
      });

      describe('single selection', () => {
        it('should not change selection when clicking on an item content', () => {
          const response = render({
            checkboxSelection: true,
            items: [{ id: '1' }],
          });

          expect(response.isItemSelected('1')).to.equal(false);

          fireEvent.click(response.getItemContent('1'));
          expect(response.isItemSelected('1')).to.equal(false);
        });

        it('should select un-selected item when clicking on an item checkbox', () => {
          const response = render({
            items: [{ id: '1' }, { id: '2' }],
            checkboxSelection: true,
          });

          expect(response.isItemSelected('1')).to.equal(false);

          fireEvent.click(response.getItemCheckboxInput('1'));
          expect(response.isItemSelected('1')).to.equal(true);
        });

        it('should un-select selected item when clicking on an item checkbox', () => {
          const response = render({
            items: [{ id: '1' }, { id: '2' }],
            defaultSelectedItems: '1',
            checkboxSelection: true,
          });

          expect(response.isItemSelected('1')).to.equal(true);

          fireEvent.click(response.getItemCheckboxInput('1'));
          expect(response.isItemSelected('1')).to.equal(false);
        });

        it('should not select an item when click and disableSelection', () => {
          const response = render({
            items: [{ id: '1' }, { id: '2' }],
            disableSelection: true,
            checkboxSelection: true,
          });

          expect(response.isItemSelected('1')).to.equal(false);

          fireEvent.click(response.getItemCheckboxInput('1'));
          expect(response.isItemSelected('1')).to.equal(false);
        });

        it('should not select an item when clicking on a disabled item checkbox', () => {
          const response = render({
            items: [{ id: '1', disabled: true }, { id: '2' }],
            checkboxSelection: true,
          });

          expect(response.isItemSelected('1')).to.equal(false);
          fireEvent.click(response.getItemCheckboxInput('1'));
          expect(response.isItemSelected('1')).to.equal(false);
        });
      });

      describe('multi selection', () => {
        it('should not change selection when clicking on an item content', () => {
          const response = render({
            multiSelect: true,
            checkboxSelection: true,
            items: [{ id: '1' }],
          });

          expect(response.isItemSelected('1')).to.equal(false);

          fireEvent.click(response.getItemContent('1'));
          expect(response.isItemSelected('1')).to.equal(false);
        });

        it('should select un-selected item and keep other items selected when clicking on an item checkbox', () => {
          const response = render({
            multiSelect: true,
            checkboxSelection: true,
            items: [{ id: '1' }, { id: '2' }],
            defaultSelectedItems: ['2'],
          });

          expect(response.getSelectedFiles()).to.deep.equal(['2']);

          fireEvent.click(response.getItemCheckboxInput('1'));
          expect(response.getSelectedFiles()).to.deep.equal(['1', '2']);
        });

        it('should un-select selected item when clicking on an item checkbox', () => {
          const response = render({
            multiSelect: true,
            checkboxSelection: true,
            items: [{ id: '1' }, { id: '2' }],
            defaultSelectedItems: ['1'],
          });

          expect(response.isItemSelected('1')).to.equal(true);

          fireEvent.click(response.getItemCheckboxInput('1'));
          expect(response.isItemSelected('1')).to.equal(false);
        });

        it('should not select an item when click and disableSelection', () => {
          const response = render({
            multiSelect: true,
            checkboxSelection: true,
            items: [{ id: '1' }, { id: '2' }],
            disableSelection: true,
          });

          expect(response.isItemSelected('1')).to.equal(false);

          fireEvent.click(response.getItemCheckboxInput('1'));
          expect(response.isItemSelected('1')).to.equal(false);
        });

        it('should not select an item when clicking on a disabled item content', () => {
          const response = render({
            multiSelect: true,
            checkboxSelection: true,
            items: [{ id: '1', disabled: true }, { id: '2' }],
          });

          expect(response.isItemSelected('1')).to.equal(false);
          fireEvent.click(response.getItemCheckboxInput('1'));
          expect(response.isItemSelected('1')).to.equal(false);
        });

        it('should expand the selection range when clicking on an item checkbox below the last selected item while holding Shift', () => {
          const response = render({
            multiSelect: true,
            checkboxSelection: true,
            items: [{ id: '1' }, { id: '2' }, { id: '2.1' }, { id: '3' }, { id: '4' }],
          });

          fireEvent.click(response.getItemCheckboxInput('2'));
          expect(response.getSelectedFiles()).to.deep.equal(['2']);

          fireEvent.click(response.getItemCheckboxInput('3'), { shiftKey: true });
          expect(response.getSelectedFiles()).to.deep.equal(['2', '2.1', '3']);
        });

        it('should expand the selection range when clicking on an item checkbox above the last selected item while holding Shift', () => {
          const response = render({
            multiSelect: true,
            checkboxSelection: true,
            items: [{ id: '1' }, { id: '2' }, { id: '2.1' }, { id: '3' }, { id: '4' }],
          });

          fireEvent.click(response.getItemCheckboxInput('3'));
          expect(response.getSelectedFiles()).to.deep.equal(['3']);

          fireEvent.click(response.getItemCheckboxInput('2'), { shiftKey: true });
          expect(response.getSelectedFiles()).to.deep.equal(['2', '2.1', '3']);
        });

        it('should expand the selection range when clicking on an item checkbox while holding Shift after un-selecting another item', () => {
          const response = render({
            multiSelect: true,
            checkboxSelection: true,
            items: [{ id: '1' }, { id: '2' }, { id: '2.1' }, { id: '3' }, { id: '4' }],
          });

          fireEvent.click(response.getItemCheckboxInput('1'));
          expect(response.getSelectedFiles()).to.deep.equal(['1']);

          fireEvent.click(response.getItemCheckboxInput('2'));
          expect(response.getSelectedFiles()).to.deep.equal(['1', '2']);

          fireEvent.click(response.getItemCheckboxInput('2'));
          expect(response.getSelectedFiles()).to.deep.equal(['1']);

          fireEvent.click(response.getItemCheckboxInput('3'), { shiftKey: true });
          expect(response.getSelectedFiles()).to.deep.equal(['1', '2', '2.1', '3']);
        });

        it('should not expand the selection range when clicking on a disabled item checkbox then clicking on an item checkbox while holding Shift', () => {
          const response = render({
            multiSelect: true,
            checkboxSelection: true,
            items: [
              { id: '1' },
              { id: '2', disabled: true },
              { id: '2.1' },
              { id: '3' },
              { id: '4' },
            ],
          });

          fireEvent.click(response.getItemCheckboxInput('2'));
          expect(response.getSelectedFiles()).to.deep.equal([]);

          fireEvent.click(response.getItemCheckboxInput('3'), { shiftKey: true });
          expect(response.getSelectedFiles()).to.deep.equal([]);
        });

        it('should not expand the selection range when clicking on an item checkbox then clicking a disabled item checkbox while holding Shift', () => {
          const response = render({
            multiSelect: true,
            checkboxSelection: true,
            items: [
              { id: '1' },
              { id: '2' },
              { id: '2.1' },
              { id: '3', disabled: true },
              { id: '4' },
            ],
          });

          fireEvent.click(response.getItemCheckboxInput('2'));
          expect(response.getSelectedFiles()).to.deep.equal(['2']);

          fireEvent.click(response.getItemCheckboxInput('3'), { shiftKey: true });
          expect(response.getSelectedFiles()).to.deep.equal(['2']);
        });

        it('should not select disabled items that are part of the selected range', () => {
          const response = render({
            multiSelect: true,
            checkboxSelection: true,
            items: [{ id: '1' }, { id: '2', disabled: true }, { id: '3' }],
          });

          fireEvent.click(response.getItemCheckboxInput('1'));
          expect(response.getSelectedFiles()).to.deep.equal(['1']);

          fireEvent.click(response.getItemCheckboxInput('3'), { shiftKey: true });
          expect(response.getSelectedFiles()).to.deep.equal(['1', '3']);
        });
      });
    });

    describe('aria-multiselectable editor attribute', () => {
      it('should have the attribute `aria-multiselectable=false if using single select`', () => {
        const response = render({
          items: [{ id: '1' }, { id: '2' }],
        });

        expect(response.getRoot()).to.have.attribute('aria-multiselectable', 'false');
      });

      it('should have the attribute `aria-multiselectable=true if using multi select`', () => {
        const response = render({ items: [{ id: '1' }, { id: '2' }], multiSelect: true });

        expect(response.getRoot()).to.have.attribute('aria-multiselectable', 'true');
      });
    });

    // The `aria-selected` attribute is used by the `response.isItemSelected` method.
    // This `describe` only tests basics scenarios, more complex scenarios are tested in this file's other `describe`.
    describe('aria-selected item attribute', () => {
      describe('single selection', () => {
        it('should not have the attribute `aria-selected=false` if not selected', () => {
          const response = render({
            items: [{ id: '1' }, { id: '2' }],
          });

          expect(response.getItemRoot('1')).not.to.have.attribute('aria-selected');
        });

        it('should have the attribute `aria-selected=true` if selected', () => {
          const response = render({
            items: [{ id: '1' }, { id: '2' }],
            defaultSelectedItems: '1',
          });

          expect(response.getItemRoot('1')).to.have.attribute('aria-selected', 'true');
        });
      });

      describe('multi selection', () => {
        it('should have the attribute `aria-selected=false` if not selected', () => {
          const response = render({
            multiSelect: true,
            items: [{ id: '1' }, { id: '2' }],
          });

          expect(response.getItemRoot('1')).to.have.attribute('aria-selected', 'false');
        });

        it('should have the attribute `aria-selected=true` if selected', () => {
          const response = render({
            multiSelect: true,
            items: [{ id: '1' }, { id: '2' }],
            defaultSelectedItems: ['1'],
          });

          expect(response.getItemRoot('1')).to.have.attribute('aria-selected', 'true');
        });

        it('should have the attribute `aria-selected=false` if disabledSelection is true', () => {
          const response = render({
            multiSelect: true,
            items: [{ id: '1' }, { id: '2' }],
            disableSelection: true,
          });

          expect(response.getItemRoot('1')).to.have.attribute('aria-selected', 'false');
        });
      });
    });

    describe('onItemSelectionToggle prop', () => {
      it('should call the onItemSelectionToggle callback when selecting an item', () => {
        const onItemSelectionToggle = spy();

        const response = render({
          multiSelect: true,
          items: [{ id: '1' }, { id: '2' }],
          onItemSelectionToggle,
        });

        fireEvent.click(response.getItemContent('1'));
        expect(onItemSelectionToggle.callCount).to.equal(1);
        expect(onItemSelectionToggle.lastCall.args[1]).to.equal('1');
        expect(onItemSelectionToggle.lastCall.args[2]).to.equal(true);
      });

      it('should call the onItemSelectionToggle callback when un-selecting an item', () => {
        const onItemSelectionToggle = spy();

        const response = render({
          multiSelect: true,
          items: [{ id: '1' }, { id: '2' }],
          defaultSelectedItems: ['1'],
          onItemSelectionToggle,
        });

        fireEvent.click(response.getItemContent('1'), { ctrlKey: true });
        expect(onItemSelectionToggle.callCount).to.equal(1);
        expect(onItemSelectionToggle.lastCall.args[1]).to.equal('1');
        expect(onItemSelectionToggle.lastCall.args[2]).to.equal(false);
      });
    });
  },
);
