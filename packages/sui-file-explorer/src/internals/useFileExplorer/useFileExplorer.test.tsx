/**
 * Test suite for the useFileExplorer hook functionality.
 * @param {object} props - The properties for the file explorer.
 * @param {string} props.items - The items to render in the file explorer.
 * @returns {void}
 */
describeFileExplorer<[]>(
  'useFileExplorer hook',
  ({ render, renderFromJSX, fileExplorerViewComponentName, FileExplorerComponent, FileComponent }) => {
    /**
     * Test to check if the root slot has the role="fileExplorer".
     * @returns {void}
     */
    it('should have the role="fileExplorer" on the root slot', () => {
      const response = render({ items: [{ id: '1' }] });

      expect(response.getRoot()).to.have.attribute('role', 'fileExplorer');
    });

    /**
     * Test to check if the file explorer works inside a Portal.
     * @returns {void}
     */
    it('should work inside a Portal', () => {
      let response: DescribeFileExplorerRendererUtils;
      if (fileExplorerViewComponentName === 'FileExplorerBasic') {
        response = renderFromJSX(
          <React.Fragment>
            <button type="button">Some focusable element</button>
            <FileExplorerComponent>
              <FileComponent id="1" label="1" data-testid="1" />
              <FileComponent id="2" label="2" data-testid="2" />
              <FileComponent id="3" label="3" data-testid="3" />
              <FileComponent id="4" label="4" data-testid="4" />
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
                item: (ownerState) => ({ 'data-testid': ownerState.id }) as any,
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