/**
 * Test suite for the useFileExplorerFiles plugin.
 * @param {UseFileExplorerFilesSignature} render - Function to render the file explorer.
 * @param {UseFileExplorerExpansionSignature} renderFromJSX - Function to render the file explorer from JSX.
 * @param {string} fileExplorerViewComponentName - Name of the file explorer view component.
 * @param {React.ComponentType} FileExplorerComponent - File explorer component.
 * @param {React.ComponentType} FileComponent - File component.
 */
describeFileExplorer<
  [UseFileExplorerFilesSignature, UseFileExplorerExpansionSignature, UseFileExplorerSelectionSignature]
>(
  'useFileExplorerFiles plugin',
  ({ render, renderFromJSX, fileExplorerViewComponentName, FileExplorerComponent, FileComponent }) => {
    /**
     * Test case to check for error when two items have the same ID.
     */
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

    /**
     * Test case to check usage of custom id attribute.
     */
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

    /**
     * Test suite for items prop / JSX FileExplorer Item.
     */
    describe('items prop / JSX FileExplorer Item', () => {
      /**
       * Test case to support removing an item.
       */
      it('should support removing an item', () => {
        const response = render({
          items: [{ id: '1' }, { id: '2' }],
        });

        response.setItems([{ id: '1' }]);
        expect(response.getAllFileIds()).to.deep.equal(['1']);
      });

      // More test cases can be added for different scenarios

      /**
       * Test suite for disabled prop.
       */
      describe('disabled prop', () => {
        /**
         * Test case to check disabled attribute.
         */
        it('should not have the attribute `aria-disabled` if disabled is not defined', () => {
          const response = render({
            items: [{ id: '1' }, { id: '2', disabled: false }, { id: '3', disabled: true }],
          });

          expect(response.getItemRoot('1')).not.to.have.attribute('aria-disabled');
          expect(response.getItemRoot('2')).not.to.have.attribute('aria-disabled');
          expect(response.getItemRoot('3')).to.have.attribute('aria-disabled');
        });

        /**
         * Test case to disable descendants of a disabled item.
         */
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
    });
  },
);
