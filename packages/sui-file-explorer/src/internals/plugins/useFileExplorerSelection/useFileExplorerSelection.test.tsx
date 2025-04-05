import { expect } from 'chai';
import { spy } from 'sinon';
import { fireEvent } from '@stoked-ui/internal-test-utils';
import { describeFileExplorer } from 'test/utils/fileExplorer-view/describeFileExplorer';
import {
  UseFileExplorerExpansionSignature,
  UseFileExplorerSelectionSignature,
} from '@stoked-ui/file-explorer/internals';

/**
 * All tests related to keyboard navigation (e.g.: selection using "Space")
 * are located in the `useFileExplorerKeyboardNavigation.test.tsx` file.
 */
describeFileExplorer<[UseFileExplorerSelectionSignature, UseFileExplorerExpansionSignature]>(
  'useFileExplorerSelection plugin',
  /**
   * @param {Object} render - The render object.
   * @param {Function} render.render - The render function.
   */
  ({ render }) => {
    /**
     * @description Tests related to model props (selectedItems, defaultSelectedItems, onSelectedItemsChange)
     */
    describe('model props (selectedItems, defaultSelectedItems, onSelectedItemsChange)', () => {
      /**
       * @description Test case: should not select items when no default state and no control state are defined
       */
      it('should not select items when no default state and no control state are defined', () => {
        const response = render({
          items: [{ id: '1' }, { id: '2' }],
        });

        expect(response.isItemSelected('1')).to.equal(false);
      });

      /**
       * @description Test case: should use the default state when defined
       */
      it('should use the default state when defined', () => {
        const response = render({
          items: [{ id: '1' }, { id: '2' }],
          defaultSelectedItems: ['1'],
        });

        expect(response.isItemSelected('1')).to.equal(true);
      });

      /**
       * @description Test case: should use the controlled state when defined
       */
      it('should use the controlled state when defined', () => {
        const response = render({
          items: [{ id: '1' }, { id: '2' }],
          selectedItems: ['1'],
        });

        expect(response.isItemSelected('1')).to.equal(true);
      });

      /**
       * @description Test case: should use the controlled state instead of the default state when both are defined
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
       * @description Test case: should react to controlled state update
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
       * @description Test case: should call the onSelectedItemsChange callback when the model is updated (single selection and add selected item)
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

      // TODO: Re-enable this test if we have a way to un-select an item in single selection.
      // eslint-disable-next-line mocha/no-skipped-tests
      /**
       * @description Test case: should call onSelectedItemsChange callback when the model is updated (single selection and remove selected item)
       */
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

      /**
       * @description Test case: should call the onSelectedItemsChange callback when the model is updated (multi selection and add selected item to empty list)
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

      /**
       * @description Test case: should call the onSelectedItemsChange callback when the model is updated (multi selection and add selected item to non-empty list)
       */
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

      /**
       * @description Test case: should call the onSelectedItemsChange callback when the model is updated (multi selection and remove selected item)
       */
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

      /**
       * @description Test case: should warn when switching from controlled to uncontrolled
       */
      it('should warn when switching from controlled to uncontrolled', () => {
        const response = render({
          items: [{ id: '1' }, { id: '2' }],
          selectedItems: [],
        });

        expect(() => {
          response.setProps({ selectedItems: undefined });
        }).toErrorDev(
          'SUI X: A component is changing the controlled selectedItems state of FileExplorer to be uncontrolled.',
        );
      });

      /**
       * @description Test case: should warn and not react to update when updating the default state
       */
      it('should warn and not react to update when updating the default state', () => {
        const response = render({
          items: [{ id: '1' }, { id: '2' }],
          defaultSelectedItems: ['1'],
        });

        expect(() => {
          response.setProps({ defaultSelectedItems: ['2'] });
          expect(response.getSelectedFiles()).to.deep.equal(['1']);
        }).toErrorDev(
          'SUI X: A component is changing the default selectedItems state of an uncontrolled FileExplorer after being initialized. To suppress this warning opt to use a controlled FileExplorer.',
        );
      });
    });

    /**
     * @description Tests related to item click interaction
     */
    describe('item click interaction', () => {
      /**
       * @description Tests related to single selection
       */
      describe('single selection', () => {
        /**
         * @description Test case: should select un-selected item when clicking on an item content
         */
        it('should select un-selected item when clicking on an item content', () => {
          const response = render({
            items: [{ id: '1' }, { id: '2' }],
          });

          expect(response.isItemSelected('1')).to.equal(false);

          fireEvent.click(response.getItemContent('1'));
          expect(response.isItemSelected('1')).to.equal(true);
        });

        /**
         * @description Test case: should not un-select selected item when clicking on an item content
         */
        it('should not un-select selected item when clicking on an item content', () => {
          const response = render({
            items: [{ id: '1' }, { id: '2' }],
            defaultSelectedItems: '1',
          });

          expect(response.isItemSelected('1')).to.equal(true);

          fireEvent.click(response.getItemContent('1'));
          expect(response.isItemSelected('1')).to.equal(true);
        });

        /**
         * @description Test case: should not select an item when click and disableSelection
         */
        it('should not select an item when click and disableSelection', () => {
          const response = render({
            items: [{ id: '1' }, { id: '2' }],
            disableSelection: true,
          });

          expect(response.isItemSelected('1')).to.equal(false);

          fireEvent.click(response.getItemContent('1'));
          expect(response.isItemSelected('1')).to.equal(false);
        });

        /**
         * @description Test case: should not select an item when clicking on a disabled item content
         */
        it('should not select an item when clicking on a disabled item content', () => {
          const response = render({
            items: [{ id: '1', disabled: true }, { id: '2' }],
          });

          expect(response.isItemSelected('1')).to.equal(false);
          fireEvent.click(response.getItemContent('1'));
          expect(response.isItemSelected('1')).to.equal(false);
        });
      });

      /**
       * @description Tests related to multi selection
       */
      describe('multi selection', () => {
        /**
         * @description Test case: should select un-selected item and remove other selected items when clicking on an item content
         */
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

        /**
         * @description Test case: should not un-select selected item when clicking on an item content
         */
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

        /**
         * @description Test case: should un-select selected item when clicking on its content while holding Ctrl
         */
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

        /**
         * @description Test case: should un-select selected item when clicking on its content while holding Meta
         */
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

        /**
         * @description Test case: should not select an item when click and disableSelection
         */
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

        /**
         * @description Test case: should not select an item when clicking on a disabled item content
         */
        it('should not select an item when clicking on a disabled item content', () => {
          const response = render({
            multiSelect: true,
            items: [{ id: '1', disabled: true }, { id: '2' }],
          });

          expect(response.isItemSelected('1')).to.equal(false);
          fireEvent.click(response.getItemContent('1'));
          expect(response.isItemSelected('1')).to.equal(false);
        });

        /**
         * @description Test case: should select un-selected item when clicking on its content while holding Ctrl
         */
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

        /**
         * @description Test case: should do nothing when clicking on an item content on a fresh fileExplorer while holding Shift
         */
        it('should do nothing when clicking on an item content on a fresh fileExplorer while holding Shift', () => {
          const response = render({
            multiSelect: true,
            items: [{ id: '1' }, { id: '2' }, { id: '2.1' }, { id: '3' }, { id: '4' }],
          });

          fireEvent.click(response.getItemContent('3'), { shiftKey: true });
          expect(response.getSelectedFiles()).to.deep.equal([]);
        });

        /**
         * @description Test case: should expand the selection range when clicking on an item content below the last selected item while holding Shift
         */
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

        /**
         * @description Test case: should expand the selection range when clicking on an item content above the last selected item while holding Shift
         */
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

        /**
         * @description Test case: should expand the selection range when clicking on an item content while holding Shift after un-selecting another item
         */
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

        /**
         * @description Test case: should not expand the selection range when clicking on a disabled item content then clicking on an item content while holding Shift
         */
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

        /**
         * @description Test case: should not expand the selection range when clicking on an item content then clicking a disabled item content while holding Shift