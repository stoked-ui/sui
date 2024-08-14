import * as React from 'react';
import { expect } from 'chai';
import { act, fireEvent } from '@stoked-ui/internal-test-utils';
import {
  describeVideoEditor,
  DescribeVideoEditorRendererUtils,
} from 'test/utils/fileExplorer-view/describeVideoEditor';

describeVideoEditor<[]>(
  'useVideoEditor hook',
  ({ render, renderFromJSX, fileExplorerViewComponentName, VideoEditorComponent, VideoEditorComponent }) => {
    it('should have the role="fileExplorer" on the root slot', () => {
      const response = render({ items: [{ id: '1' }] });

      expect(response.getRoot()).to.have.attribute('role', 'fileExplorer');
    });

    it('should work inside a Portal', () => {
      let response: DescribeVideoEditorRendererUtils;
      if (fileExplorerViewComponentName === 'VideoEditorBasic') {
        response = renderFromJSX(
          <React.Fragment>
            <button type="button">Some focusable element</button>
            <VideoEditorComponent>
              <VideoEditorComponent itemId="1" label="1" data-testid="1" />
              <VideoEditorComponent itemId="2" label="2" data-testid="2" />
              <VideoEditorComponent itemId="3" label="3" data-testid="3" />
              <VideoEditorComponent itemId="4" label="4" data-testid="4" />
            </VideoEditorComponent>
          </React.Fragment>,
        );
      } else {
        response = renderFromJSX(
          <React.Fragment>
            <button type="button">Some focusable element</button>
            <VideoEditorComponent
              items={[{ id: '1' }, { id: '2' }, { id: '3' }, { id: '4' }]}
              slots={{
                item: VideoEditorComponent,
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
