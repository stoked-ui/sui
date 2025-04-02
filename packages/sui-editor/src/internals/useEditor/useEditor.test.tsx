import * as React from 'react';
import {expect} from 'chai';
import {act, fireEvent} from '@stoked-ui/internal-test-utils';
import {describeEditor, DescribeEditorRendererUtils,} from 'test/utils/editor-view/describeEditor';

describeEditor<[]>(
  'useEditor hook',
  ({ render, renderFromJSX, editorViewComponentName, EditorComponent, EditorComponent }) => {
    it('should have the role="editor" on the root slot', () => {
      const response = render({ items: [{ id: '1' }] });

      expect(response.getRoot()).to.have.attribute('role', 'editor');
    });

    it('should work inside a Portal', () => {
      let response: DescribeEditorRendererUtils;
      if (editorViewComponentName === 'EditorBasic') {
        response = renderFromJSX(
          <React.Fragment>
            <button type="button">Some focusable element</button>
            <EditorComponent>
              <EditorComponent itemId="1" label="1" data-testid="1" />
              <EditorComponent itemId="2" label="2" data-testid="2" />
              <EditorComponent itemId="3" label="3" data-testid="3" />
              <EditorComponent itemId="4" label="4" data-testid="4" />
            </EditorComponent>
          </React.Fragment>,
        );
      } else {
        response = renderFromJSX(
          <React.Fragment>
            <button type="button">Some focusable element</button>
            <EditorComponent
              items={[{ id: '1' }, { id: '2' }, { id: '3' }, { id: '4' }]}
              slots={{
                item: EditorComponent,
              }}
              slotProps={{
                item: (ownerState) => ({ 'data-testid': ownerState.itemId }) as any,
              }}
              getItemName={(item) => item.id}
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

