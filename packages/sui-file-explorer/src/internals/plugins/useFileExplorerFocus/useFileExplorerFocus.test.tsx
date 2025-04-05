import * as React from 'react';
import {expect} from 'chai';
import {spy} from 'sinon';
import {act, fireEvent} from '@stoked-ui/internal-test-utils';
import {describeFileExplorer} from 'test/utils/fileExplorer-view/describeFileExplorer';
import {
  UseFileExplorerFilesSignature, UseFileExplorerFocusSignature, UseFileExplorerSelectionSignature,
} from '@stoked-ui/file-explorer/internals';

/**
 * All tests related to keyboard navigation (e.g.: type-ahead when using
 * `props.disabledItemsFocusable`) are located in the `useFileExplorerKeyboardNavigation.test.tsx`
 * file.
 */
describeFileExplorer<
  [UseFileExplorerFocusSignature, UseFileExplorerSelectionSignature, UseFileExplorerFilesSignature]
>(
  'useFileExplorerFocus plugin',
  ({ render, renderFromJSX, FileComponent, fileExplorerViewComponentName, FileExplorerComponent }) => {
    /**
     * @description Tests for the basic behavior of focusing items in the file explorer.
     */
    describe('basic behavior', () => {
      /**
       * @description Should allow focusing an item.
       */
      it('should allow to focus an item', () => {
        const response = render({
          items: [{ id: '1' }, { id: '2' }],
        });

        fireEvent.focus(response.getItemRoot('2'));
        expect(response.getFocusedItemId()).to.equal('2');

        fireEvent.focus(response.getItemRoot('1'));
        expect(response.getFocusedItemId()).to.equal('1');
      });

      /**
       * @description Should move the focus when the focused item is removed.
       */
      it('should move the focus when the focused item is removed', () => {
        const response = render({
          items: [{ id: '1' }, { id: '2' }],
        });

        fireEvent.focus(response.getItemRoot('2'));
        expect(response.getFocusedItemId()).to.equal('2');

        response.setItems([{ id: '1' }]);
        expect(response.getFocusedItemId()).to.equal('1');
      });
    });

    /**
     * @description Tests for the tabIndex HTML attribute behavior.
     */
    describe('tabIndex HTML attribute', () => {
      /**
       * @description Should set tabIndex={0} on the first item if none are selected.
       */
      it('should set tabIndex={0} on the first item if none are selected', () => {
        const response = render({
          items: [{ id: '1' }, { id: '2' }],
        });

        expect(response.getItemRoot('1').tabIndex).to.equal(0);
        expect(response.getItemRoot('2').tabIndex).to.equal(-1);
      });

      /**
       * @description Should set tabIndex={0} on the selected item (single selection).
       */
      it('should set tabIndex={0} on the selected item (single selection)', () => {
        const response = render({
          items: [{ id: '1' }, { id: '2' }],
          selectedItems: '2',
        });

        expect(response.getItemRoot('1').tabIndex).to.equal(-1);
        expect(response.getItemRoot('2').tabIndex).to.equal(0);
      });

      /**
       * @description Should set tabIndex={0} on the first selected item (multi selection).
       */
      it('should set tabIndex={0} on the first selected item (multi selection)', () => {
        const response = render({
          items: [{ id: '1' }, { id: '2' }, { id: '3' }],
          selectedItems: ['2', '3'],
          multiSelect: true,
        });

        expect(response.getItemRoot('1').tabIndex).to.equal(-1);
        expect(response.getItemRoot('2').tabIndex).to.equal(0);
        expect(response.getItemRoot('3').tabIndex).to.equal(-1);
      });

      /**
       * @description Should set tabIndex={0} on the first item if the selected item is not visible.
       */
      it('should set tabIndex={0} on the first item if the selected item is not visible', () => {
        const response = render({
          items: [{ id: '1' }, { id: '2', children: [{ id: '2.1' }] }],
          selectedItems: '2.1',
        });

        expect(response.getItemRoot('1').tabIndex).to.equal(0);
        expect(response.getItemRoot('2').tabIndex).to.equal(-1);
      });

      /**
       * @description Should set tabIndex={0} on the first item if no selected item is visible.
       */
      it('should set tabIndex={0} on the first item if no selected item is visible', () => {
        const response = render({
          items: [{ id: '1' }, { id: '2', children: [{ id: '2.1' }, { id: '2.2' }] }],
          selectedItems: ['2.1', '2.2'],
          multiSelect: true,
        });

        expect(response.getItemRoot('1').tabIndex).to.equal(0);
        expect(response.getItemRoot('2').tabIndex).to.equal(-1);
      });
    });

    /**
     * @description Tests for the focusItem API method.
     */
    describe('focusItem api method', () => {
      /**
       * @description Should focus the item.
       */
      it('should focus the item', () => {
        const response = render({
          items: [{ id: '1' }, { id: '2' }],
        });

        act(() => {
          response.apiRef.current.focusItem({} as any, '2');
        });

        expect(response.getFocusedItemId()).to.equal('2');
      });

      /**
       * @description Should not focus item if parent is collapsed.
       */
      it('should not focus item if parent is collapsed', () => {
        const response = render({
          items: [{ id: '1' }, { id: '2', children: [{ id: '2.1' }] }],
        });

        act(() => {
          response.apiRef.current.focusItem({} as any, '2.1');
        });

        expect(response.getFocusedItemId()).to.equal(null);
      });
    });

    /**
     * @description Tests for the onItemFocus prop.
     */
    describe('onItemFocus prop', () => {
      /**
       * @description Should be called when an item is focused.
       */
      it('should be called when an item is focused', () => {
        const onItemFocus = spy();

        const response = render({
          items: [{ id: '1' }],
          onItemFocus,
        });

        act(() => {
          response.getItemRoot('1').focus();
        });

        expect(onItemFocus.callCount).to.equal(1);
        expect(onItemFocus.lastCall.lastArg).to.equal('1');
      });
    });

    /**
     * @description Tests for the disabledItemsFocusable prop.
     */
    describe('disabledItemsFocusable prop', () => {
      /**
       * @description Sub-tests for disabledItemFocusable={false}.
       */
      describe('disabledItemFocusable={false}', () => {
        /**
         * @description Should prevent focus by mouse.
         */
        it('should prevent focus by mouse', () => {
          const response = render({
            items: [{ id: '1', disabled: true }],
            disabledItemsFocusable: false,
          });

          fireEvent.click(response.getItemContent('1'));
          expect(response.getFocusedItemId()).to.equal(null);
        });

        /**
         * @description Should set tabIndex={-1} on the disabled item and tabIndex={0} on the first non-disabled item.
         */
        it('should tab tabIndex={-1} on the disabled item and tabIndex={0} on the first non-disabled item', () => {
          const response = render({
            items: [{ id: '1', disabled: true }, { id: '2' }, { id: '3' }],
            disabledItemsFocusable: false,
          });

          expect(response.getItemRoot('1').tabIndex).to.equal(-1);
          expect(response.getItemRoot('2').tabIndex).to.equal(0);
          expect(response.getItemRoot('3').tabIndex).to.equal(-1);
        });
      });

      /**
       * @description Sub-tests for disabledItemFocusable={true}.
       */
      describe('disabledItemFocusable={true}', () => {
        /**
         * @description Should prevent focus by mouse.
         */
        it('should prevent focus by mouse', () => {
          const response = render({
            items: [{ id: '1', disabled: true }],
            disabledItemsFocusable: true,
          });

          fireEvent.click(response.getItemContent('1'));
          expect(response.getFocusedItemId()).to.equal(null);
        });

        /**
         * @description Should set tabIndex={0} on the disabled item and tabIndex={-1} on the other items.
         */
        it('should tab tabIndex={0} on the disabled item and tabIndex={-1} on the other items', () => {
          const response = render({
            items: [{ id: '1', disabled: true }, { id: '2' }, { id: '3' }],
            disabledItemsFocusable: true,
          });

          expect(response.getItemRoot('1').tabIndex).to.equal(0);
          expect(response.getItemRoot('2').tabIndex).to.equal(-1);
          expect(response.getItemRoot('3').tabIndex).to.equal(-1);
        });
      });
    });

    /**
     * @description Should not error when component state changes.
     */
    it('should not error when component state changes', () => {
      const items = [{ id: '1', children: [{ id: '1.1' }] }];
      const getItemLabel = (item) => item.id;

      function MyComponent() {
        const [, setState] = React.useState(1);

        if (fileExplorerViewComponentName === 'FileExplorerBasic') {
          return (
            <FileExplorerComponent
              defaultExpandedItems={['1']}
              onItemFocus={() => {
                setState(Math.random);
              }}
            >
              <FileComponent id="1" data-testid="1">
                <FileComponent id="1.1" data-testid="1.1" />
              </FileComponent>
            </FileExplorerComponent>
          );
        }

        return (
          <FileExplorerComponent
            items={items}
            defaultExpandedItems={['1']}
            onItemFocus={() => {
              setState(Math.random);
            }}
            slotProps={{
              item: (ownerState) => ({ 'data-testid': ownerState.id }) as any,
            }}
            getItemLabel={getItemLabel}
          />
        );
      }

      const response = renderFromJSX(<MyComponent />);

      fireEvent.focus(response.getItemRoot('1'));
      expect(response.getFocusedItemId()).to.equal('1');

      fireEvent.keyDown(response.getItemRoot('1'), { key: 'ArrowDown' });
      expect(response.getFocusedItemId()).to.equal('1.1');

      fireEvent.keyDown(response.getItemRoot('1.1'), { key: 'ArrowUp' });
      expect(response.getFocusedItemId()).to.equal('1');

      fireEvent.keyDown(response.getItemRoot('1'), { key: 'ArrowDown' });
      expect(response.getFocusedItemId()).to.equal('1.1');
    });
  },
);