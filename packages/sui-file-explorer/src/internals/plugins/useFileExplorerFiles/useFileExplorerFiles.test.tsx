import * as React from 'react';
import {expect} from 'chai';
import {spy} from 'sinon';
import {fireEvent} from '@stoked-ui/internal-test-utils';
import {describeFileExplorer} from 'test/utils/fileExplorer/describeFileExplorer';
import {
  UseFileExplorerExpansionSignature,
  UseFileExplorerFilesSignature,
  UseFileExplorerSelectionSignature,
} from '@stoked-ui/file-explorer/internals';

describeFileExplorer<
  [UseFileExplorerFilesSignature, UseFileExplorerExpansionSignature, UseFileExplorerSelectionSignature]
>(
  'useFileExplorerFiles plugin',
  ({ render, renderFromJSX, fileExplorerViewComponentName, FileExplorerComponent, FileComponent }) => {
    it('should throw an error when two items have the same ID', function test() {
      // TODO is this fixed?
      if (!/jsdom/.test(window.navigator.userAgent)) {
        // can't catch render errors in the browser for unknown reason
        // tried try-catch + error boundary + window onError preventDefault
        this.skip();
      }

      expect(() =>
        render({ items: [{ id: '1' }, { id: '1' }], withErrorBoundary: true }),
      ).toErrorDev([
        ...(fileExplorerViewComponentName === 'FileExplorerBasic'
          ? ['Encountered two children with the same key']
          : []),
        'Stoked UI: The FileExplorer component requires all items to have a unique `id` property.',
        'Stoked UI: The FileExplorer component requires all items to have a unique `id` property.',
        `The above error occurred in the <ForwardRef(${fileExplorerViewComponentName})> component`,
      ]);
    });

    it('should be able to use a custom id attribute', function test() {
      // For now, only FileExplorerBasic can use custom id attributes
      if (fileExplorerViewComponentName.startsWith('FileExplorer')) {
        this.skip();
      }

      const response = render({
        items: [{ id: '1' }],
        slotProps: {
          item: {
            id: 'customId',
          },
        },
      });

      expect(response.getItemRoot('1')).to.have.attribute('id', 'customId');
    });

    describe('items prop / JSX FileExplorer Item', () => {
      it('should support removing an item', () => {
        const response = render({
          items: [{ id: '1' }, { id: '2' }],
        });

        response.setItems([{ id: '1' }]);
        expect(response.getAllFileIds()).to.deep.equal(['1']);
      });

      it('should support adding an item at the end', () => {
        const response = render({
          items: [{ id: '1' }],
        });

        response.setItems([{ id: '1' }, { id: '2' }]);
        expect(response.getAllFileIds()).to.deep.equal(['1', '2']);
      });

      it('should support adding an item at the beginning', () => {
        const response = render({
          items: [{ id: '2' }],
        });

        response.setItems([{ id: '1' }, { id: '2' }]);
        expect(response.getAllFileIds()).to.deep.equal(['1', '2']);
      });

      it('should update indexes when two items are swapped', () => {
        const onSelectedItemsChange = spy();

        const response = render({
          items: [{ id: '1' }, { id: '2' }, { id: '3' }],
          multiSelect: true,
          onSelectedItemsChange,
        });

        response.setItems([{ id: '1' }, { id: '3' }, { id: '2' }]);
        expect(response.getAllFileIds()).to.deep.equal(['1', '3', '2']);

        // Check if the internal state is updated by running a range selection
        fireEvent.click(response.getItemContent('1'));
        fireEvent.click(response.getItemContent('3'), { shiftKey: true });
        expect(onSelectedItemsChange.lastCall.args[1]).to.deep.equal(['1', '3']);
      });

      it('should not mark an item as expandable if its children is an empty array', () => {
        const response = render({
          items: [{ id: '1', children: [] }],
          defaultExpandedItems: ['1'],
        });

        expect(response.getItemRoot('1')).not.to.have.attribute('aria-expanded');
      });

      it('should mark an item as not expandable if it has only empty conditional arrays', function test() {
        if (fileExplorerViewComponentName.startsWith('FileExplorer')) {
          this.skip();
        }

        const response = renderFromJSX(
          <FileExplorerComponent defaultExpandedItems={['1']}>
            <FileComponent id="1" label="1" data-testid="1">
              {[]}
              {[]}
            </FileComponent>
          </FileExplorerComponent>,
        );

        expect(response.isItemExpanded('1')).to.equal(false);
      });

      it('should mark an item as expandable if it has two array as children, one of which is empty (FileExplorerBasic only)', function test() {
        if (fileExplorerViewComponentName.startsWith('FileExplorer')) {
          this.skip();
        }

        const response = renderFromJSX(
          <FileExplorerComponent defaultExpandedItems={['1']}>
            <FileComponent id="1" label="1" data-testid="1">
              {[]}
              {[<FileComponent key="1.1" id="1.1" />]}
            </FileComponent>
          </FileExplorerComponent>,
        );

        expect(response.isItemExpanded('1')).to.equal(true);
      });

      it('should mark an item as not expandable if it has one array containing an empty array as a children (FileExplorerBasic only)', function test() {
        if (fileExplorerViewComponentName.startsWith('FileExplorer')) {
          this.skip();
        }

        const response = renderFromJSX(
          <FileExplorerComponent defaultExpandedItems={['1']}>
            <FileComponent id="1" label="1" data-testid="1">
              {[[]]}
            </FileComponent>
          </FileExplorerComponent>,
        );

        expect(response.isItemExpanded('1')).to.equal(false);
      });
    });

    describe('disabled prop', () => {
      it('should not have the attribute `aria-disabled` if disabled is not defined', () => {
        const response = render({
          items: [{ id: '1' }, { id: '2', disabled: false }, { id: '3', disabled: true }],
        });

        expect(response.getItemRoot('1')).not.to.have.attribute('aria-disabled');
        expect(response.getItemRoot('2')).not.to.have.attribute('aria-disabled');
        expect(response.getItemRoot('3')).to.have.attribute('aria-disabled');
      });

      it('should disable all descendants of a disabled item', () => {
        const response = render({
          items: [
            { id: '1', disabled: true, children: [{ id: '1.1', children: [{ id: '1.1.1' }] }] },
          ],
          defaultExpandedItems: ['1', '1.1'],
        });

        expect(response.getItemRoot('1')).to.have.attribute('aria-disabled', 'true');
        expect(response.getItemRoot('1.1')).to.have.attribute('aria-disabled', 'true');
        expect(response.getItemRoot('1.1.1')).to.have.attribute('aria-disabled', 'true');
      });
    });
  },
);
