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
    describe('basic behavior', () => {
      it('should allow to focus an item', () => {
        const response = render({
          items: [{ id: '1' }, { id: '2' }],
        });

        fireEvent.focus(response.getItemRoot('2'));
        expect(response.getFocusedItemId()).to.equal('2');

        fireEvent.focus(response.getItemRoot('1'));
        expect(response.getFocusedItemId()).to.equal('1');
      });

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

    describe('tabIndex HTML attribute', () => {
      it('should set tabIndex={0} on the first item if none are selected', () => {
        const response = render({
          items: [{ id: '1' }, { id: '2' }],
        });

        expect(response.getItemRoot('1').tabIndex).to.equal(0);
        expect(response.getItemRoot('2').tabIndex).to.equal(-1);
      });

      it('should set tabIndex={0} on the selected item (single selection)', () => {
        const response = render({
          items: [{ id: '1' }, { id: '2' }],
          selectedItems: '2',
        });

        expect(response.getItemRoot('1').tabIndex).to.equal(-1);
        expect(response.getItemRoot('2').tabIndex).to.equal(0);
      });

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

      it('should set tabIndex={0} on the first item if the selected item is not visible', () => {
        const response = render({
          items: [{ id: '1' }, { id: '2', children: [{ id: '2.1' }] }],
          selectedItems: '2.1',
        });

        expect(response.getItemRoot('1').tabIndex).to.equal(0);
        expect(response.getItemRoot('2').tabIndex).to.equal(-1);
      });

      it('should set tabIndex={0} on the first item if the no selected item is visible', () => {
        const response = render({
          items: [{ id: '1' }, { id: '2', children: [{ id: '2.1' }, { id: '2.2' }] }],
          selectedItems: ['2.1', '2.2'],
          multiSelect: true,
        });

        expect(response.getItemRoot('1').tabIndex).to.equal(0);
        expect(response.getItemRoot('2').tabIndex).to.equal(-1);
      });
    });

    describe('focusItem api method', () => {
      it('should focus the item', () => {
        const response = render({
          items: [{ id: '1' }, { id: '2' }],
        });

        act(() => {
          response.apiRef.current.focusItem({} as any, '2');
        });

        expect(response.getFocusedItemId()).to.equal('2');
      });

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

    describe('onItemFocus prop', () => {
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

    describe('disabledItemsFocusable prop', () => {
      describe('disabledItemFocusable={false}', () => {
        it('should prevent focus by mouse', () => {
          const response = render({
            items: [{ id: '1', disabled: true }],
            disabledItemsFocusable: false,
          });

          fireEvent.click(response.getItemContent('1'));
          expect(response.getFocusedItemId()).to.equal(null);
        });

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

      describe('disabledItemFocusable={true}', () => {
        it('should prevent focus by mouse', () => {
          const response = render({
            items: [{ id: '1', disabled: true }],
            disabledItemsFocusable: true,
          });

          fireEvent.click(response.getItemContent('1'));
          expect(response.getFocusedItemId()).to.equal(null);
        });

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
