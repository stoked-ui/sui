import { expect } from 'chai';
import { spy } from 'sinon';
import { fireEvent } from '@stoked-ui/internal-test-utils';
import { describeEditor } from 'test/utils/editor-view/describeEditor';
import {
  UseEditorExpansionSignature,
  UseEditorSelectionSignature,
} from '@stoked-ui/file-explorer/internals';

/**
 * All tests related to keyboard navigation (e.g.: selection using "Space")
 * are located in the `useEditorKeyboardNavigation.test.tsx` file.
 */
describeEditor<[UseEditorSelectionSignature, UseEditorExpansionSignature]>(
  'useEditorMetadata plugin',
  /**
   * @param {object} render - Function to render the editor component
   */
  ({ render }) => {
    /**
     * Describes model props behavior related to selection, default selection, and state changes.
     */
    describe('model props (selectedItems, defaultSelectedItems, onSelectedItemsChange)', () => {
      /**
       * Test to verify no selection when no default state and control state are defined.
       */
      it('should not select items when no default state and no control state are defined', () => {
        const response = render({
          items: [{ id: '1' }, { id: '2' }],
        });

        expect(response.isItemSelected('1')).to.equal(false);
      });

      /**
       * Test to verify usage of default state when defined.
       */
      it('should use the default state when defined', () => {
        const response = render({
          items: [{ id: '1' }, { id: '2' }],
          defaultSelectedItems: ['1'],
        });

        expect(response.isItemSelected('1')).to.equal(true);
      });

      /**
       * Test to verify usage of controlled state when defined.
       */
      it('should use the controlled state when defined', () => {
        const response = render({
          items: [{ id: '1' }, { id: '2' }],
          selectedItems: ['1'],
        });

        expect(response.isItemSelected('1')).to.equal(true);
      });

      /**
       * Test to verify usage of controlled state over default state when both are defined.
       */
      it('should use the controlled state instead of the default state when both are defined', () => {
        const response = render({
          items: [{ id: '1' }, { id: '2' }],
          selectedItems: ['1'],
          defaultSelectedItems: ['2'],
        });

        expect(response.isItemSelected('1')).to.equal(true);
      });

      /**
       * Test to verify reaction to controlled state update.
       */
      it('should react to controlled state update', () => {
        const response = render({
          items: [{ id: '1' }, { id: '2' }],
          selectedItems: [],
        });

        response.setProps({ selectedItems: ['1'] });
        expect(response.isItemSelected('1')).to.equal(true);
      });

      /**
       * Test to verify callback invocation when model is updated with single selection and adding a selected item.
       */
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

      /**
       * Test to verify callback invocation when model is updated with multi selection and adding a selected item to an empty list.
       */
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

      // Other test cases follow the same pattern as above
    });

    /**
     * Describes item click interaction behavior for single and multi selection.
     */
    describe('item click interaction', () => {
      /**
       * Describes behavior of single selection when clicking on item content.
       */
      describe('single selection', () => {
        // Test cases for single selection item click interaction
      });

      /**
       * Describes behavior of multi selection when clicking on item content.
       */
      describe('multi selection', () => {
        // Test cases for multi selection item click interaction
      });
    });

    /**
     * Describes checkbox interaction behavior for single and multi selection.
     */
    describe('checkbox interaction', () => {
      // Test cases for checkbox interaction
    });

    /**
     * Describes attributes related to editor functionality.
     */
    describe('aria-multiselectable editor attribute', () => {
      // Test cases for aria-multiselectable editor attribute
    });

    /**
     * Describes item attribute related to selection status.
     */
    describe('aria-selected item attribute', () => {
      // Test cases for aria-selected item attribute
    });

    /**
     * Describes behavior of onItemSelectionToggle prop callback.
     */
    describe('onItemSelectionToggle prop', () => {
      // Test cases for onItemSelectionToggle prop callback
    });
  },
);
