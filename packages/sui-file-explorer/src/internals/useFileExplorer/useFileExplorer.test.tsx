import * as React from 'react';
import {expect} from 'chai';
import {act, fireEvent} from '@stoked-ui/internal-test-utils';
import {
  describeFileExplorer, DescribeFileExplorerRendererUtils,
} from 'test/utils/fileExplorer-view/describeFileExplorer';

describeFileExplorer<[]>(
  'useFileExplorer hook',
  ({ render, renderFromJSX, fileExplorerViewComponentName, FileExplorerComponent, FileComponent }) => {
    it('should have the role="fileExplorer" on the root slot', () => {
      const response = render({ items: [{ id: '1' }] });

      expect(response.getRoot()).to.have.attribute('role', 'fileExplorer');
    });

    it('should work inside a Portal', () => {
      let response: DescribeFileExplorerRendererUtils;
      if (fileExplorerViewComponentName === 'FileExplorerBasic') {
        response = renderFromJSX(
          <React.Fragment>
            <button type="button">Some focusable element</button>
            <FileExplorerComponent>
              <FileComponent itemId="1" label="1" data-testid="1" />
              <FileComponent itemId="2" label="2" data-testid="2" />
              <FileComponent itemId="3" label="3" data-testid="3" />
              <FileComponent itemId="4" label="4" data-testid="4" />
            </FileExplorerComponent>
          </React.Fragment>,
        );
      } else {
        response = renderFromJSX(
          <React.Fragment>
            <button type="button">Some focusable element</button>
            <FileExplorerComponent
              items={[{ id: '1' }, { id: '2' }, { id: '3' }, { id: '4' }]}
              slots={{
                item: FileComponent,
              }}
              slotProps={{
                item: (ownerState) => ({ 'data-testid': ownerState.itemId }) as any,
              }}
              getItemLabel={(item) => item.id}
            />
          </React.Fragment>,
        );
      }

      act(() => {
        response.getItemRoot('1').focus();
      });

      fireEvent.keyDown(response.getItemRoot('1'), { key: 'ArrowDown' });
      expect(response.getFocusedItemId()).to.equal('2');

      fireEvent.keyDown(response.getItemRoot('2'), { key: 'ArrowDown' });
      expect(response.getFocusedItemId()).to.equal('3');

      fireEvent.keyDown(response.getItemRoot('3'), { key: 'ArrowDown' });
      expect(response.getFocusedItemId()).to.equal('4');
    });
  },
);
