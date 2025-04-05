/**
 * React component for the useFileExplorerIcons plugin.
 * This component renders different icons based on the state of the item in the file explorer.
 * @param {Object} props - Component props
 * @property {Function} props.render - Render function for the file explorer
 * @returns {JSX.Element} - Rendered component
 */
describeFileExplorer<[UseFileExplorerIconsSignature, UseFileExplorerExpansionSignature]>(
  'useFileExplorerIcons plugin',
  ({ render }) => {
    describe('slots (expandIcon, collapseIcon, endIcon, icon)', () => {
      /**
       * Get the test id of the icon for a specific item.
       * @param {DescribeFileExplorerRendererReturnValue<any>} response - File explorer response
       * @param {string} id - Item id
       * @returns {string} - Test id of the icon
       */
      const getIconTestId = (response: DescribeFileExplorerRendererReturnValue<any>, id: string) =>
        response.getItemIconContainer(id).querySelector(`div`)?.dataset.testid;

      /**
       * Test case: should render the expandIcon slot defined on the fileExplorer if no icon slot is defined on the item and the item is collapsed.
       */
      it('should render the expandIcon slot defined on the fileExplorer if no icon slot is defined on the item and the item is collapsed', () => {
        const response = render({
          items: [{ id: '1', children: [{ id: '1.1' }] }],
          slots: {
            expandIcon: () => <div data-testid="fileExplorerExpandIcon" />,
            collapseIcon: () => <div data-testid="fileExplorerCollapseIcon" />,
            endIcon: () => <div data-testid="fileExplorerEndIcon" />,
          },
        });

        expect(getIconTestId(response, '1')).to.equal('fileExplorerExpandIcon');
      });

      /**
       * Test case: should render the collapseIcon slot defined on the fileExplorer if no icon is defined on the item and the item is expanded.
       */
      it('should render the collapseIcon slot defined on the fileExplorer if no icon is defined on the item and the item is expanded', () => {
        const response = render({
          items: [{ id: '1', children: [{ id: '1.1' }] }],
          slots: {
            expandIcon: () => <div data-testid="fileExplorerExpandIcon" />,
            collapseIcon: () => <div data-testid="fileExplorerCollapseIcon" />,
            endIcon: () => <div data-testid="fileExplorerEndIcon" />,
          },
          defaultExpandedItems: ['1'],
        });

        expect(getIconTestId(response, '1')).to.equal('fileExplorerCollapseIcon');
      });

      // Additional test cases follow the same pattern as above with different scenarios for rendering icons.
    });
  },
);