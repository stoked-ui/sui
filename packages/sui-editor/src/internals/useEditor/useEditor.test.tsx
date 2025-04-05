/**
 * Test suite for the useEditor hook.
 */
describeEditor<[]>(
  'useEditor hook',
  /**
   * Test cases for the useEditor hook functionality.
   * @param {function} render - Function to render editor
   * @param {function} renderFromJSX - Function to render editor from JSX
   * @param {string} editorViewComponentName - Name of the editor view component
   * @param {React.Component} EditorComponent - Editor component
   */
  ({ render, renderFromJSX, editorViewComponentName, EditorComponent, EditorComponent }) => {
    /**
     * Test case to check if the root slot has the role="editor".
     */
    it('should have the role="editor" on the root slot', () => {
      const response = render({ items: [{ id: '1' }] });

      expect(response.getRoot()).to.have.attribute('role', 'editor');
    });

    /**
     * Test case to check if the editor works inside a Portal.
     */
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
