import * as React from 'react';
import {expect} from 'chai';
import {spy} from 'sinon';
import {act, fireEvent} from '@stoked-ui/internal-test-utils';
import {describeEditor} from 'test/utils/editor-view/describeEditor';
import {
  UseEditorExpansionSignature,
  UseEditorFilesSignature,
  UseEditorKeyboardSignature,
  UseEditorSelectionSignature,
} from '@stoked-ui/file-explorer/internals';

describeEditor<
  [
    UseEditorKeyboardSignature,
    UseEditorFilesSignature,
    UseEditorExpansionSignature,
    UseEditorSelectionSignature,
  ]
>('useEditorKeyboard', ({ render, editorViewComponentName }) => {
  describe('Navigation (focus and expansion)', () => {
    describe('key: ArrowDown', () => {
      it('should move the focus to a sibling item', () => {
        const response = render({
          items: [{ id: '1' }, { id: '2' }],
        });

        act(() => {
          response.getItemRoot('1').focus();
        });
        fireEvent.keyDown(response.getItemRoot('1'), { key: 'ArrowDown' });
        expect(response.getFocusedItemId()).to.equal('2');
      });

      it('should move the focus to a child item', () => {
        const response = render({
          items: [{ id: '1', children: [{ id: '1.1' }] }],
          defaultExpandedItems: ['1'],
        });

        act(() => {
          response.getItemRoot('1').focus();
        });
        fireEvent.keyDown(response.getItemRoot('1'), { key: 'ArrowDown' });
        expect(response.getFocusedItemId()).to.equal('1.1');
      });

      it('should move the focus to a child item with a dynamic editor', () => {
        const response = render({
          items: [{ id: '1', children: [{ id: '1.1' }] }, { id: '2' }],
          defaultExpandedItems: ['1'],
        });

        response.setItems([{ id: '2' }]);
        response.setItems([{ id: '1', children: [{ id: '1.1' }] }, { id: '2' }]);
        act(() => {
          response.getItemRoot('1').focus();
        });
        fireEvent.keyDown(response.getItemRoot('1'), { key: 'ArrowDown' });
        expect(response.getFocusedItemId()).to.equal('1.1');
      });

      it("should move the focus to a parent's sibling", () => {
        const response = render({
          items: [{ id: '1', children: [{ id: '1.1' }, { id: '2' }] }],
          defaultExpandedItems: ['1'],
        });

        act(() => {
          response.getItemRoot('1.1').focus();
        });
        fireEvent.keyDown(response.getItemRoot('1.1'), { key: 'ArrowDown' });
        expect(response.getFocusedItemId()).to.equal('2');
      });

      it('should skip disabled items', () => {
        const response = render({
          items: [{ id: '1' }, { id: '2', disabled: true }, { id: '3' }],
        });

        act(() => {
          response.getItemRoot('1').focus();
        });
        fireEvent.keyDown(response.getItemRoot('1'), { key: 'ArrowDown' });
        expect(response.getFocusedItemId()).to.equal('3');
      });

      it('should not skip disabled items if disabledItemsFocusable={true}', () => {
        const response = render({
          items: [{ id: '1' }, { id: '2', disabled: true }, { id: '3' }],
          disabledItemsFocusable: true,
        });

        act(() => {
          response.getItemRoot('1').focus();
        });
        fireEvent.keyDown(response.getItemRoot('1'), { key: 'ArrowDown' });
        expect(response.getFocusedItemId()).to.equal('2');
      });
    });

    describe('key: ArrowUp', () => {
      it('should move the focus to a sibling item', () => {
        const response = render({
          items: [{ id: '1' }, { id: '2' }],
        });

        act(() => {
          response.getItemRoot('2').focus();
        });
        fireEvent.keyDown(response.getItemRoot('2'), { key: 'ArrowUp' });
        expect(response.getFocusedItemId()).to.equal('1');
      });

      it('should move the focus to a parent', () => {
        const response = render({
          items: [{ id: '1', children: [{ id: '1.1' }] }],
          defaultExpandedItems: ['1'],
        });

        act(() => {
          response.getItemRoot('1.1').focus();
        });
        fireEvent.keyDown(response.getItemRoot('1.1'), { key: 'ArrowUp' });
        expect(response.getFocusedItemId()).to.equal('1');
      });

      it("should move the focus to a sibling's child", () => {
        const response = render({
          items: [{ id: '1', children: [{ id: '1.1' }] }, { id: '2' }],
          defaultExpandedItems: ['1'],
        });

        act(() => {
          response.getItemRoot('2').focus();
        });
        fireEvent.keyDown(response.getItemRoot('2'), { key: 'ArrowUp' });
        expect(response.getFocusedItemId()).to.equal('1.1');
      });

      it('should skip disabled items', () => {
        const response = render({
          items: [{ id: '1' }, { id: '2', disabled: true }, { id: '3' }],
        });

        act(() => {
          response.getItemRoot('3').focus();
        });
        fireEvent.keyDown(response.getItemRoot('3'), { key: 'ArrowUp' });
        expect(response.getFocusedItemId()).to.equal('1');
      });

      it('should not skip disabled items if disabledItemsFocusable={true}', () => {
        const response = render({
          items: [{ id: '1' }, { id: '2', disabled: true }, { id: '3' }],
          disabledItemsFocusable: true,
        });

        act(() => {
          response.getItemRoot('3').focus();
        });
        fireEvent.keyDown(response.getItemRoot('3'), { key: 'ArrowUp' });
        expect(response.getFocusedItemId()).to.equal('2');
      });
    });

    describe('key: ArrowRight', () => {
      it('should open the item and not move the focus if the focus is on a closed item', () => {
        const response = render({
          items: [{ id: '1', children: [{ id: '1.1' }] }],
        });

        act(() => {
          response.getItemRoot('1').focus();
        });
        fireEvent.keyDown(response.getItemRoot('1'), { key: 'ArrowRight' });
        expect(response.isItemExpanded('1')).to.equal(true);
        expect(response.getFocusedItemId()).to.equal('1');
      });

      it('should move the focus to the first child if the focus is on an open item', () => {
        const response = render({
          items: [{ id: '1', children: [{ id: '1.1' }] }],
          defaultExpandedItems: ['1'],
        });

        act(() => {
          response.getItemRoot('1').focus();
        });
        fireEvent.keyDown(response.getItemRoot('1'), { key: 'ArrowRight' });
        expect(response.getFocusedItemId()).to.equal('1.1');
      });

      it('should do nothing if the focus is on a leaf', () => {
        const response = render({
          items: [{ id: '1', children: [{ id: '1.1' }] }],
          defaultExpandedItems: ['1'],
        });

        act(() => {
          response.getItemRoot('1.1').focus();
        });
        fireEvent.keyDown(response.getItemRoot('1.1'), { key: 'ArrowRight' });
        expect(response.getFocusedItemId()).to.equal('1.1');
      });

      it('should not expand an item with children if it is collapsed but disabled even if disabledItemsFocusable={true}', () => {
        const response = render({
          items: [{ id: '1', disabled: true, children: [{ id: '1.1' }] }],
          disabledItemsFocusable: true,
        });

        act(() => {
          response.getItemRoot('1').focus();
        });
        fireEvent.keyDown(response.getItemRoot('1'), { key: 'ArrowRight' });
        expect(response.isItemExpanded('1')).to.equal(false);
      });
    });

    describe('key: ArrowLeft', () => {
      it('should close the item if the focus is on an open item', () => {
        const response = render({
          items: [{ id: '1', children: [{ id: '1.1' }] }],
          defaultExpandedItems: ['1'],
        });

        act(() => {
          response.getItemRoot('1').focus();
        });
        fireEvent.keyDown(response.getItemRoot('1'), { key: 'ArrowLeft' });
        expect(response.isItemExpanded('1')).to.equal(false);
      });

      it("should move focus to the item's parent if the focus is on a child item that is a leaf", () => {
        const response = render({
          items: [{ id: '1', children: [{ id: '1.1' }] }],
          defaultExpandedItems: ['1'],
        });

        act(() => {
          response.getItemRoot('1.1').focus();
        });
        fireEvent.keyDown(response.getItemRoot('1.1'), { key: 'ArrowLeft' });
        expect(response.getFocusedItemId()).to.equal('1');
        expect(response.isItemExpanded('1')).to.equal(true);
      });

      it("should move the focus to the item's parent if the focus is on a child item that is closed", () => {
        const response = render({
          items: [{ id: '1', children: [{ id: '1.1', children: [{ id: '1.1.1' }] }] }],
          defaultExpandedItems: ['1'],
        });

        act(() => {
          response.getItemRoot('1.1').focus();
        });
        fireEvent.keyDown(response.getItemRoot('1.1'), { key: 'ArrowLeft' });
        expect(response.getFocusedItemId()).to.equal('1');
        expect(response.isItemExpanded('1')).to.equal(true);
      });

      it('should do nothing if the focus is on a root item that is closed', () => {
        const response = render({
          items: [{ id: '1', children: [{ id: '1.1' }] }],
        });

        act(() => {
          response.getItemRoot('1').focus();
        });
        fireEvent.keyDown(response.getItemRoot('1'), { key: 'ArrowLeft' });
        expect(response.getFocusedItemId()).to.equal('1');
        expect(response.isItemExpanded('1')).to.equal(false);
      });

      it('should do nothing if the focus is on a root item that is a leaf', () => {
        const response = render({
          items: [{ id: '1' }],
        });

        act(() => {
          response.getItemRoot('1').focus();
        });
        fireEvent.keyDown(response.getItemRoot('1'), { key: 'ArrowLeft' });
        expect(response.getFocusedItemId()).to.equal('1');
      });

      it('should not collapse an item with children if it is collapsed but disabled even if disabledItemsFocusable={true}', () => {
        const response = render({
          items: [{ id: '1', disabled: true, children: [{ id: '1.1' }] }],
          defaultExpandedItems: ['1'],
          disabledItemsFocusable: true,
        });

        act(() => {
          response.getItemRoot('1').focus();
        });
        fireEvent.keyDown(response.getItemRoot('1'), { key: 'ArrowLeft' });
        expect(response.isItemExpanded('1')).to.equal(true);
      });
    });

    describe('key: Home', () => {
      it('should move the focus to the first item in the editor', () => {
        const response = render({
          items: [{ id: '1' }, { id: '2' }, { id: '3' }, { id: '4' }],
        });

        act(() => {
          response.getItemRoot('4').focus();
        });
        fireEvent.keyDown(response.getItemRoot('4'), { key: 'Home' });
        expect(response.getFocusedItemId()).to.equal('1');
      });
    });

    describe('key: End', () => {
      it('should move the focus to the last item in the editor when the last item is not expanded', () => {
        const response = render({
          items: [
            { id: '1' },
            { id: '2' },
            { id: '3' },
            { id: '4', children: [{ id: '4.1' }, { id: '4.2' }] },
          ],
        });

        act(() => {
          response.getItemRoot('1').focus();
        });
        fireEvent.keyDown(response.getItemRoot('1'), { key: 'End' });
        expect(response.getFocusedItemId()).to.equal('4');
      });

      it('should move the focus to the last item in the editor when the last item is expanded', () => {
        const response = render({
          items: [
            { id: '1' },
            { id: '2' },
            { id: '3' },
            { id: '4', children: [{ id: '4.1', children: [{ id: '4.1.1' }] }] },
          ],
          defaultExpandedItems: ['4', '4.1'],
        });

        act(() => {
          response.getItemRoot('1').focus();
        });
        fireEvent.keyDown(response.getItemRoot('1'), { key: 'End' });
        expect(response.getFocusedItemId()).to.equal('4.1.1');
      });
    });

    describe('key: * (asterisk)', () => {
      it('should expand all items that are at the same depth as the current item (depth = 0)', () => {
        const response = render({
          items: [
            { id: '1', children: [{ id: '1.1' }] },
            { id: '2', children: [{ id: '2.1' }] },
            { id: '3', children: [{ id: '3.1', children: [{ id: '3.1.1' }] }] },
            { id: '4' },
          ],
        });

        act(() => {
          response.getItemRoot('1').focus();
        });

        expect(response.isItemExpanded('1')).to.equal(false);
        expect(response.isItemExpanded('2')).to.equal(false);
        expect(response.isItemExpanded('3')).to.equal(false);

        fireEvent.keyDown(response.getItemRoot('1'), { key: '*' });
        expect(response.isItemExpanded('1')).to.equal(true);
        expect(response.isItemExpanded('2')).to.equal(true);
        expect(response.isItemExpanded('3')).to.equal(true);
        expect(response.isItemExpanded('3.1')).to.equal(false);
      });

      it('should expand all items that are at the same depth as the current item (depth = 1)', () => {
        const response = render({
          items: [
            { id: '1', children: [{ id: '1.1' }] },
            { id: '2', children: [{ id: '2.1' }] },
            {
              id: '3',
              children: [
                {
                  id: '3.1',
                  children: [{ id: '3.1.1' }, { id: '3.1.2', children: [{ id: '3.1.2.1' }] }],
                },
              ],
            },
            { id: '4' },
          ],
          defaultExpandedItems: ['3'],
        });

        act(() => {
          response.getItemRoot('3.1').focus();
        });

        expect(response.isItemExpanded('1')).to.equal(false);
        expect(response.isItemExpanded('2')).to.equal(false);
        expect(response.isItemExpanded('3')).to.equal(true);
        expect(response.isItemExpanded('3.1')).to.equal(false);

        fireEvent.keyDown(response.getItemRoot('3.1'), { key: '*' });
        expect(response.isItemExpanded('1')).to.equal(false);
        expect(response.isItemExpanded('2')).to.equal(false);
        expect(response.isItemExpanded('3')).to.equal(true);
        expect(response.isItemExpanded('3.1')).to.equal(true);
        expect(response.isItemExpanded('3.1.2')).to.equal(false);
      });
    });

    describe('key: Enter', () => {
      it('should expand an item with children if it is collapsed', () => {
        const response = render({
          items: [{ id: '1', children: [{ id: '1.1' }] }],
        });

        act(() => {
          response.getItemRoot('1').focus();
        });
        fireEvent.keyDown(response.getItemRoot('1'), { key: 'Enter' });
        expect(response.isItemExpanded('1')).to.equal(true);
      });

      it('should collapse an item with children if it is expanded', () => {
        const response = render({
          items: [{ id: '1', children: [{ id: '1.1' }] }],
          defaultExpandedItems: ['1'],
        });

        act(() => {
          response.getItemRoot('1').focus();
        });
        fireEvent.keyDown(response.getItemRoot('1'), { key: 'Enter' });
        expect(response.isItemExpanded('1')).to.equal(false);
      });

      it('should not expand an item with children if it is collapsed but disabled even if disabledItemsFocusable={true}', () => {
        const response = render({
          items: [{ id: '1', disabled: true, children: [{ id: '1.1' }] }],
          disabledItemsFocusable: true,
        });

        act(() => {
          response.getItemRoot('1').focus();
        });
        fireEvent.keyDown(response.getItemRoot('1'), { key: 'Enter' });
        expect(response.isItemExpanded('1')).to.equal(false);
      });
    });
  });

  describe('Selection', () => {
    describe('single selection', () => {
      describe('key: Space', () => {
        it('should select the focused item when Space is pressed', () => {
          const response = render({
            items: [{ id: '1' }, { id: '2' }],
          });

          act(() => {
            response.getItemRoot('1').focus();
          });
          fireEvent.keyDown(response.getItemRoot('1'), { key: ' ' });
          expect(response.isItemSelected('1')).to.equal(true);
        });

        it('should not un-select the focused item when Space is pressed', () => {
          const response = render({
            items: [{ id: '1' }, { id: '2' }],
            defaultSelectedItems: ['1'],
          });

          act(() => {
            response.getItemRoot('1').focus();
          });
          fireEvent.keyDown(response.getItemRoot('1'), { key: ' ' });
          expect(response.isItemSelected('1')).to.equal(true);
        });

        it('should not select the focused item when Space is pressed and disableSelection={true}', () => {
          const response = render({
            items: [{ id: '1' }, { id: '2' }],
            disableSelection: true,
          });

          act(() => {
            response.getItemRoot('1').focus();
          });
          fireEvent.keyDown(response.getItemRoot('1'), { key: ' ' });
          expect(response.isItemSelected('1')).to.equal(false);
        });

        it('should not select the focused item when Space is pressed and the item is disabled', () => {
          const response = render({
            items: [{ id: '1', disabled: true }, { id: '2' }],
          });

          act(() => {
            response.getItemRoot('1').focus();
          });
          fireEvent.keyDown(response.getItemRoot('1'), { key: ' ' });
          expect(response.isItemSelected('1')).to.equal(false);
        });

        it('should not select the focused item when Space is pressed and the item is disabled even if disabledItemsFocusable={true}', () => {
          const response = render({
            items: [{ id: '1', disabled: true }, { id: '2' }],
            disabledItemsFocusable: true,
          });

          act(() => {
            response.getItemRoot('1').focus();
          });
          fireEvent.keyDown(response.getItemRoot('1'), { key: ' ' });
          expect(response.isItemSelected('1')).to.equal(false);
        });
      });

      describe('key: Enter', () => {
        it('should select the focused item when Enter is pressed', () => {
          const response = render({
            items: [{ id: '1' }, { id: '2' }],
          });

          act(() => {
            response.getItemRoot('1').focus();
          });
          fireEvent.keyDown(response.getItemRoot('1'), { key: 'Enter' });
          expect(response.isItemSelected('1')).to.equal(true);
        });

        it('should not un-select the focused item when Enter is pressed', () => {
          const response = render({
            items: [{ id: '1' }, { id: '2' }],
            defaultSelectedItems: ['1'],
          });

          act(() => {
            response.getItemRoot('1').focus();
          });
          fireEvent.keyDown(response.getItemRoot('1'), { key: 'Enter' });
          expect(response.isItemSelected('1')).to.equal(true);
        });

        it('should not select the focused item when Enter is pressed and disableSelection={true}', () => {
          const response = render({
            items: [{ id: '1' }, { id: '2' }],
            disableSelection: true,
          });

          act(() => {
            response.getItemRoot('1').focus();
          });
          fireEvent.keyDown(response.getItemRoot('1'), { key: 'Enter' });
          expect(response.isItemSelected('1')).to.equal(false);
        });

        it('should not select the focused item when Enter is pressed and the item is disabled even if disabledItemsFocusable={true}', () => {
          const response = render({
            items: [{ id: '1', disabled: true }, { id: '2' }],
            disabledItemsFocusable: true,
          });

          act(() => {
            response.getItemRoot('1').focus();
          });
          fireEvent.keyDown(response.getItemRoot('1'), { key: 'Enter' });
          expect(response.isItemSelected('1')).to.equal(false);
        });
      });
    });

    describe('multi selection', () => {
      describe('key: Space', () => {
        it('should select the focused item without un-selecting the other selected items when Space is pressed', () => {
          const response = render({
            items: [{ id: '1' }, { id: '2' }],
            multiSelect: true,
            defaultSelectedItems: ['1'],
          });

          act(() => {
            response.getItemRoot('2').focus();
          });
          fireEvent.keyDown(response.getItemRoot('2'), { key: ' ' });
          expect(response.getSelectedFiles()).to.deep.equal(['1', '2']);
        });

        it('should un-select the focused item when Space is pressed', () => {
          const response = render({
            items: [{ id: '1' }, { id: '2' }],
            multiSelect: true,
            defaultSelectedItems: ['1', '2'],
          });

          act(() => {
            response.getItemRoot('1').focus();
          });
          fireEvent.keyDown(response.getItemRoot('1'), { key: ' ' });
          expect(response.getSelectedFiles()).to.deep.equal(['2']);
        });

        it('should select the focused item without un-selecting the other selected items when Space is pressed while holding Ctrl', () => {
          const response = render({
            items: [{ id: '1' }, { id: '2' }],
            multiSelect: true,
            defaultSelectedItems: ['1'],
          });

          act(() => {
            response.getItemRoot('2').focus();
          });
          fireEvent.keyDown(response.getItemRoot('2'), { key: ' ', ctrlKey: true });
          expect(response.getSelectedFiles()).to.deep.equal(['1', '2']);
        });

        it('should un-select the focused item when Space is pressed while holding Ctrl', () => {
          const response = render({
            items: [{ id: '1' }, { id: '2' }],
            multiSelect: true,
            defaultSelectedItems: ['1', '2'],
          });

          act(() => {
            response.getItemRoot('1').focus();
          });
          fireEvent.keyDown(response.getItemRoot('1'), { key: ' ', ctrlKey: true });
          expect(response.getSelectedFiles()).to.deep.equal(['2']);
        });

        it('should not select the focused item when Space is pressed and disableSelection={true}', () => {
          const response = render({
            items: [{ id: '1' }, { id: '2' }],
            multiSelect: true,
            disableSelection: true,
          });

          act(() => {
            response.getItemRoot('1').focus();
          });
          fireEvent.keyDown(response.getItemRoot('1'), { key: ' ' });
          expect(response.getSelectedFiles()).to.deep.equal([]);
        });

        it('should not select the focused item when Space is pressed and the item is disabled', () => {
          const response = render({
            items: [{ id: '1', disabled: true }, { id: '2' }],
            multiSelect: true,
          });

          act(() => {
            response.getItemRoot('1').focus();
          });
          fireEvent.keyDown(response.getItemRoot('1'), { key: ' ' });
          expect(response.getSelectedFiles()).to.deep.equal([]);
        });

        it('should not select the focused item when Space is pressed and the item is disabled even if disabledItemsFocusable={true}', () => {
          const response = render({
            items: [{ id: '1', disabled: true }, { id: '2' }],
            multiSelect: true,
            disabledItemsFocusable: true,
          });

          act(() => {
            response.getItemRoot('1').focus();
          });
          fireEvent.keyDown(response.getItemRoot('1'), { key: ' ' });
          expect(response.getSelectedFiles()).to.deep.equal([]);
        });
      });

      describe('key: ArrowDown', () => {
        it('should expand the selection range when ArrowDown is pressed while holding Shift from a selected item', () => {
          const response = render({
            items: [{ id: '1' }, { id: '2' }, { id: '3' }, { id: '4' }],
            multiSelect: true,
            defaultSelectedItems: ['2'],
          });

          act(() => {
            response.getItemRoot('2').focus();
          });
          fireEvent.keyDown(response.getItemRoot('2'), { key: 'ArrowDown', shiftKey: true });
          expect(response.getSelectedFiles()).to.deep.equal(['2', '3']);
        });

        it('should not un-select the item below the focused item when ArrowDown is pressed while holding Shift from a selected item', () => {
          const response = render({
            items: [{ id: '1' }, { id: '2' }, { id: '3' }, { id: '4' }],
            multiSelect: true,
            defaultSelectedItems: ['2', '3'],
          });

          act(() => {
            response.getItemRoot('2').focus();
          });
          fireEvent.keyDown(response.getItemRoot('2'), { key: 'ArrowDown', shiftKey: true });
          expect(response.getSelectedFiles()).to.deep.equal(['2', '3']);
        });

        it('should un-select the focused item when ArrowDown is pressed while holding Shift and the item below have been selected in the same range', () => {
          const response = render({
            items: [{ id: '1' }, { id: '2' }, { id: '3' }, { id: '4' }],
            multiSelect: true,
            defaultSelectedItems: ['3'],
          });

          act(() => {
            response.getItemRoot('3').focus();
          });
          fireEvent.keyDown(response.getItemRoot('3'), { key: 'ArrowUp', shiftKey: true });
          expect(response.getSelectedFiles()).to.deep.equal(['2', '3']);

          fireEvent.keyDown(response.getItemRoot('2'), { key: 'ArrowDown', shiftKey: true });
          expect(response.getSelectedFiles()).to.deep.equal(['3']);
        });

        it('should not select any item when ArrowDown is pressed while holding Shift and disabledSelection={true}', () => {
          const response = render({
            items: [{ id: '1' }, { id: '2' }],
            multiSelect: true,
            disableSelection: true,
          });

          act(() => {
            response.getItemRoot('1').focus();
          });
          fireEvent.keyDown(response.getItemRoot('1'), { key: 'ArrowDown', shiftKey: true });
          expect(response.getSelectedFiles()).to.deep.equal([]);
        });

        it('should select the next non-disabled item when ArrowDown is pressed while holding Shift', () => {
          const response = render({
            items: [{ id: '1' }, { id: '2', disabled: true }, { id: '3' }],
            multiSelect: true,
            defaultSelectedItems: ['1'],
          });

          act(() => {
            response.getItemRoot('1').focus();
          });
          fireEvent.keyDown(response.getItemRoot('1'), { key: 'ArrowDown', shiftKey: true });
          expect(response.getSelectedFiles()).to.deep.equal(['1', '3']);
        });

        it('should not select the next item when ArrowDown is pressed while holding Shift if the next item is disabled and disabledItemsFocusable={true}', () => {
          const response = render({
            items: [{ id: '1' }, { id: '2', disabled: true }, { id: '3' }],
            multiSelect: true,
            disabledItemsFocusable: true,
            defaultSelectedItems: ['1'],
          });

          act(() => {
            response.getItemRoot('1').focus();
          });
          fireEvent.keyDown(response.getItemRoot('1'), { key: 'ArrowDown', shiftKey: true });
          expect(response.getSelectedFiles()).to.deep.equal(['1']);
          expect(response.getFocusedItemId()).to.equal('2');
        });

        it('should select the next item when ArrowDown is pressed while holding Shift if the focused item is disabled and disabledItemsFocusable={true}', () => {
          const response = render({
            items: [{ id: '1', disabled: true }, { id: '2' }, { id: '3' }],
            multiSelect: true,
            disabledItemsFocusable: true,
          });

          act(() => {
            response.getItemRoot('1').focus();
          });
          fireEvent.keyDown(response.getItemRoot('1'), { key: 'ArrowDown', shiftKey: true });
          expect(response.getSelectedFiles()).to.deep.equal(['2']);
        });
      });

      describe('key: ArrowUp', () => {
        it('should expand the selection range when ArrowUp is pressed while holding Shift from a selected item', () => {
          const response = render({
            items: [{ id: '1' }, { id: '2' }, { id: '3' }, { id: '4' }],
            multiSelect: true,
            defaultSelectedItems: ['3'],
          });

          act(() => {
            response.getItemRoot('3').focus();
          });
          fireEvent.keyDown(response.getItemRoot('3'), { key: 'ArrowUp', shiftKey: true });
          expect(response.getSelectedFiles()).to.deep.equal(['2', '3']);
        });

        it('should not un-select the item above the focused item when ArrowUp is pressed while holding Shift from a selected item', () => {
          const response = render({
            items: [{ id: '1' }, { id: '2' }, { id: '3' }, { id: '4' }],
            multiSelect: true,
            defaultSelectedItems: ['2', '3'],
          });

          act(() => {
            response.getItemRoot('3').focus();
          });
          fireEvent.keyDown(response.getItemRoot('3'), { key: 'ArrowUp', shiftKey: true });
          expect(response.getSelectedFiles()).to.deep.equal(['2', '3']);
        });

        it('should un-select the focused item when ArrowUp is pressed while holding Shift and the item above have been selected in the same range', () => {
          const response = render({
            items: [{ id: '1' }, { id: '2' }, { id: '3' }, { id: '4' }],
            multiSelect: true,
            defaultSelectedItems: ['2'],
          });

          act(() => {
            response.getItemRoot('2').focus();
          });
          fireEvent.keyDown(response.getItemRoot('2'), { key: 'ArrowDown', shiftKey: true });
          expect(response.getSelectedFiles()).to.deep.equal(['2', '3']);

          fireEvent.keyDown(response.getItemRoot('3'), { key: 'ArrowUp', shiftKey: true });
          expect(response.getSelectedFiles()).to.deep.equal(['2']);
        });

        it('should not select any item when ArrowUp is pressed while holding Shift and disabledSelection={true}', () => {
          const response = render({
            items: [{ id: '1' }, { id: '2' }],
            multiSelect: true,
            disableSelection: true,
          });

          act(() => {
            response.getItemRoot('2').focus();
          });
          fireEvent.keyDown(response.getItemRoot('2'), { key: 'ArrowUp', shiftKey: true });
          expect(response.getSelectedFiles()).to.deep.equal([]);
        });

        it('should select the next non-disabled item when ArrowUp is pressed while holding Shift', () => {
          const response = render({
            items: [{ id: '1' }, { id: '2', disabled: true }, { id: '3' }],
            multiSelect: true,
            defaultSelectedItems: ['3'],
          });

          act(() => {
            response.getItemRoot('3').focus();
          });
          fireEvent.keyDown(response.getItemRoot('3'), { key: 'ArrowUp', shiftKey: true });
          expect(response.getSelectedFiles()).to.deep.equal(['1', '3']);
        });

        it('should not select the next item when ArrowUp is pressed while holding Shift if the next item is disabled and disabledItemsFocusable={true}', () => {
          const response = render({
            items: [{ id: '1' }, { id: '2', disabled: true }, { id: '3' }],
            multiSelect: true,
            disabledItemsFocusable: true,
            defaultSelectedItems: ['3'],
          });

          act(() => {
            response.getItemRoot('3').focus();
          });
          fireEvent.keyDown(response.getItemRoot('3'), { key: 'ArrowUp', shiftKey: true });
          expect(response.getSelectedFiles()).to.deep.equal(['3']);
          expect(response.getFocusedItemId()).to.equal('2');
        });

        it('should select the previous item when ArrowUp is pressed while holding Shift if the focused item is disabled and disabledItemsFocusable={true}', () => {
          const response = render({
            items: [{ id: '1' }, { id: '2' }, { id: '3', disabled: true }],
            multiSelect: true,
            disabledItemsFocusable: true,
          });

          act(() => {
            response.getItemRoot('3').focus();
          });
          fireEvent.keyDown(response.getItemRoot('3'), { key: 'ArrowUp', shiftKey: true });
          expect(response.getSelectedFiles()).to.deep.equal(['2']);
        });
      });

      describe('key: Home', () => {
        it('should select select the focused item and all the items above when Home is pressed while holding Shift + Ctrl', () => {
          const response = render({
            items: [{ id: '1' }, { id: '2', children: [{ id: '2.1' }] }, { id: '3' }, { id: '4' }],
            multiSelect: true,
            defaultExpandedItems: ['2'],
          });

          act(() => {
            response.getItemRoot('3').focus();
          });
          fireEvent.keyDown(response.getItemRoot('3'), {
            key: 'Home',
            shiftKey: true,
            ctrlKey: true,
          });
          expect(response.getSelectedFiles()).to.deep.equal(['1', '2', '2.1', '3']);
        });

        it('should not select any item when Home is pressed while holding Shift + Ctrl and disableSelection={true}', () => {
          const response = render({
            items: [{ id: '1' }, { id: '2' }, { id: '3' }, { id: '4' }],
            multiSelect: true,
            disableSelection: true,
          });

          act(() => {
            response.getItemRoot('3').focus();
          });
          fireEvent.keyDown(response.getItemRoot('3'), {
            key: 'Home',
            shiftKey: true,
            ctrlKey: true,
          });
          expect(response.getSelectedFiles()).to.deep.equal([]);
        });

        it('should not select disabled items when Home is pressed while holding Shift + Ctrl', () => {
          const response = render({
            items: [
              { id: '1' },
              { id: '2', disabled: true, children: [{ id: '2.1' }] },
              { id: '3' },
              { id: '4' },
            ],
            multiSelect: true,
            defaultExpandedItems: ['2'],
          });

          act(() => {
            response.getItemRoot('3').focus();
          });
          fireEvent.keyDown(response.getItemRoot('3'), {
            key: 'Home',
            shiftKey: true,
            ctrlKey: true,
          });
          expect(response.getSelectedFiles()).to.deep.equal(['1', '3']);
        });
      });

      describe('key: End', () => {
        it('should select select the focused item and all the items below when End is pressed while holding Shift + Ctrl', () => {
          const response = render({
            items: [{ id: '1' }, { id: '2', children: [{ id: '2.1' }] }, { id: '3' }, { id: '4' }],
            multiSelect: true,
            defaultExpandedItems: ['2'],
          });

          act(() => {
            response.getItemRoot('2').focus();
          });
          fireEvent.keyDown(response.getItemRoot('2'), {
            key: 'End',
            shiftKey: true,
            ctrlKey: true,
          });
          expect(response.getSelectedFiles()).to.deep.equal(['2', '2.1', '3', '4']);
        });

        it('should not select any item when End is pressed while holding Shift + Ctrl and disableSelection={true}', () => {
          const response = render({
            items: [{ id: '1' }, { id: '2' }, { id: '3' }, { id: '4' }],
            multiSelect: true,
            disableSelection: true,
          });

          act(() => {
            response.getItemRoot('2').focus();
          });
          fireEvent.keyDown(response.getItemRoot('2'), {
            key: 'End',
            shiftKey: true,
            ctrlKey: true,
          });
          expect(response.getSelectedFiles()).to.deep.equal([]);
        });

        it('should not select disabled items when End is pressed while holding Shift + Ctrl', () => {
          const response = render({
            items: [
              { id: '1' },
              { id: '2' },
              { id: '3', disabled: true, children: [{ id: '3.1' }] },
              { id: '4' },
            ],
            multiSelect: true,
            defaultExpandedItems: ['2'],
          });

          act(() => {
            response.getItemRoot('2').focus();
          });
          fireEvent.keyDown(response.getItemRoot('2'), {
            key: 'End',
            shiftKey: true,
            ctrlKey: true,
          });
          expect(response.getSelectedFiles()).to.deep.equal(['2', '4']);
        });
      });

      describe('key: Ctrl + A', () => {
        it('should select all items when Ctrl + A is pressed', () => {
          const response = render({
            items: [{ id: '1' }, { id: '2' }, { id: '3' }, { id: '4' }],
            multiSelect: true,
          });

          act(() => {
            response.getItemRoot('1').focus();
          });
          fireEvent.keyDown(response.getItemRoot('1'), { key: 'a', ctrlKey: true });
          expect(response.getSelectedFiles()).to.deep.equal(['1', '2', '3', '4']);
        });

        it('should not select any item when Ctrl + A is pressed and disableSelection={true}', () => {
          const response = render({
            items: [{ id: '1' }, { id: '2' }, { id: '3' }, { id: '4' }],
            multiSelect: true,
            disableSelection: true,
          });

          act(() => {
            response.getItemRoot('1').focus();
          });
          fireEvent.keyDown(response.getItemRoot('1'), { key: 'a', ctrlKey: true });
          expect(response.getSelectedFiles()).to.deep.equal([]);
        });

        it('should not select disabled items when Ctrl + A is pressed', () => {
          const response = render({
            items: [
              { id: '1' },
              { id: '2', disabled: true, children: [{ id: '2.1' }] },
              { id: '3' },
              { id: '4' },
            ],
            multiSelect: true,
          });

          act(() => {
            response.getItemRoot('1').focus();
          });
          fireEvent.keyDown(response.getItemRoot('1'), { key: 'a', ctrlKey: true });
          expect(response.getSelectedFiles()).to.deep.equal(['1', '3', '4']);
        });
      });
    });
  });

  describe('Type-ahead', () => {
    it('should move the focus to the next item with a name that starts with the typed character', () => {
      const response = render({
        items: [
          { id: '1', label: 'one' },
          { id: '2', label: 'two' },
          { id: '3', label: 'three' },
          { id: '4', label: 'four' },
        ],
      });

      act(() => {
        response.getItemRoot('1').focus();
      });
      expect(response.getFocusedItemId()).to.equal('1');

      fireEvent.keyDown(response.getItemRoot('1'), { key: 't' });
      expect(response.getFocusedItemId()).to.equal('2');

      fireEvent.keyDown(response.getItemRoot('2'), { key: 'f' });
      expect(response.getFocusedItemId()).to.equal('4');

      fireEvent.keyDown(response.getItemRoot('4'), { key: 'o' });
      expect(response.getFocusedItemId()).to.equal('1');
    });

    it('should move to the next item in the displayed order when typing the same starting character', () => {
      const response = render({
        items: [{ id: 'A1' }, { id: 'B1' }, { id: 'A2' }, { id: 'B3' }, { id: 'B2' }],
      });

      act(() => {
        response.getItemRoot('A1').focus();
      });
      expect(response.getFocusedItemId()).to.equal('A1');

      fireEvent.keyDown(response.getItemRoot('A1'), { key: 'b' });
      expect(response.getFocusedItemId()).to.equal('B1');

      fireEvent.keyDown(response.getItemRoot('B1'), { key: 'b' });
      expect(response.getFocusedItemId()).to.equal('B3');

      fireEvent.keyDown(response.getItemRoot('B3'), { key: 'b' });
      expect(response.getFocusedItemId()).to.equal('B2');

      fireEvent.keyDown(response.getItemRoot('B2'), { key: 'b' });
      expect(response.getFocusedItemId()).to.equal('B1');
    });

    it('should work with capitalized label', () => {
      const response = render({
        items: [
          { id: '1', label: 'One' },
          { id: '2', label: 'Two' },
          { id: '3', label: 'Three' },
          { id: '4', label: 'Four' },
        ],
      });

      act(() => {
        response.getItemRoot('1').focus();
      });
      expect(response.getFocusedItemId()).to.equal('1');

      fireEvent.keyDown(response.getItemRoot('1'), { key: 't' });
      expect(response.getFocusedItemId()).to.equal('2');

      fireEvent.keyDown(response.getItemRoot('2'), { key: 'f' });
      expect(response.getFocusedItemId()).to.equal('4');

      fireEvent.keyDown(response.getItemRoot('4'), { key: 'o' });
      expect(response.getFocusedItemId()).to.equal('1');
    });

    it('should work with ReactElement label', function test() {
      // Only the EditorBasic can have React Element labels.
      if (editorViewComponentName !== 'EditorBasic') {
        this.skip();
      }

      const response = render({
        items: [
          { id: '1', label: <span>one</span> },
          { id: '2', label: <span>two</span> },
          { id: '3', label: <span>three</span> },
          { id: '4', label: <span>four</span> },
        ],
      });

      act(() => {
        response.getItemRoot('1').focus();
      });
      expect(response.getFocusedItemId()).to.equal('1');

      fireEvent.keyDown(response.getItemRoot('1'), { key: 't' });
      expect(response.getFocusedItemId()).to.equal('2');

      fireEvent.keyDown(response.getItemRoot('2'), { key: 'f' });
      expect(response.getFocusedItemId()).to.equal('4');

      fireEvent.keyDown(response.getItemRoot('4'), { key: 'o' });
      expect(response.getFocusedItemId()).to.equal('1');
    });

    it('should work after adding / removing items', () => {
      const response = render({
        items: [{ id: '1' }, { id: '2' }, { id: '3' }, { id: '4' }],
      });

      act(() => {
        response.getItemRoot('1').focus();
      });

      fireEvent.keyDown(response.getItemRoot('1'), { key: '4' });
      expect(response.getFocusedItemId()).to.equal('4');

      response.setItems([{ id: '1' }, { id: '2' }, { id: '3' }]);
      expect(response.getFocusedItemId()).to.equal('1');

      fireEvent.keyDown(response.getItemRoot('1'), { key: '2' });
      expect(response.getFocusedItemId()).to.equal('2');

      response.setItems([{ id: '1' }, { id: '2' }, { id: '3' }, { id: '4' }]);
      expect(response.getFocusedItemId()).to.equal('2');

      fireEvent.keyDown(response.getItemRoot('2'), { key: '4' });
      expect(response.getFocusedItemId()).to.equal('4');
    });

    it('should not move focus when a modifier key and a letter are pressed', () => {
      const response = render({
        items: [
          { id: '1', label: 'one' },
          { id: '2', label: 'two' },
          { id: '3', label: 'three' },
          { id: '4', label: 'four' },
        ],
      });

      act(() => {
        response.getItemRoot('1').focus();
      });
      expect(response.getFocusedItemId()).to.equal('1');

      fireEvent.keyDown(response.getItemRoot('1'), { key: 't', ctrlKey: true });
      expect(response.getFocusedItemId()).to.equal('1');

      fireEvent.keyDown(response.getItemRoot('1'), { key: 't', metaKey: true });
      expect(response.getFocusedItemId()).to.equal('1');

      fireEvent.keyDown(response.getItemRoot('1'), { key: 't', shiftKey: true });
      expect(response.getFocusedItemId()).to.equal('1');
    });

    it('should work on disabled item when disabledItemsFocusable={true}', () => {
      const response = render({
        items: [
          { id: '1', label: 'one', disabled: true },
          { id: '2', label: 'two', disabled: true },
          { id: '3', label: 'three', disabled: true },
          { id: '4', label: 'four', disabled: true },
        ],
        disabledItemsFocusable: true,
      });

      act(() => {
        response.getItemRoot('1').focus();
      });
      expect(response.getFocusedItemId()).to.equal('1');

      fireEvent.keyDown(response.getItemRoot('1'), { key: 't' });
      expect(response.getFocusedItemId()).to.equal('2');
    });

    it('should not move focus on disabled item when disabledItemsFocusable={false}', () => {
      const response = render({
        items: [
          { id: '1', label: 'one', disabled: true },
          { id: '2', label: 'two', disabled: true },
          { id: '3', label: 'three', disabled: true },
          { id: '4', label: 'four', disabled: true },
        ],
        disabledItemsFocusable: false,
      });

      act(() => {
        response.getItemRoot('1').focus();
      });
      expect(response.getFocusedItemId()).to.equal('1');

      fireEvent.keyDown(response.getItemRoot('1'), { key: 't' });
      expect(response.getFocusedItemId()).to.equal('1');
    });
  });

  describe('onKeyDown prop', () => {
    it('should call onKeyDown on the Editor View and the Editor Item when a key is pressed', () => {
      const handleEditorKeyDown = spy();
      const handleFileKeyDown = spy();

      const response = render({
        items: [{ id: '1' }],
        onKeyDown: handleEditorKeyDown,
        slotProps: { item: { onKeyDown: handleFileKeyDown } },
      } as any);

      const itemRoot = response.getItemRoot('1');
      act(() => {
        itemRoot.focus();
      });

      fireEvent.keyDown(itemRoot, { key: 'Enter' });
      fireEvent.keyDown(itemRoot, { key: 'A' });
      fireEvent.keyDown(itemRoot, { key: ']' });

      expect(handleEditorKeyDown.callCount).to.equal(3);
      expect(handleFileKeyDown.callCount).to.equal(3);
    });
  });
});
