import * as React from 'react';
import {expect} from 'chai';
import {
  describeFileExplorer, DescribeFileExplorerRendererReturnValue,
} from 'test/utils/fileExplorer-view/describeFileExplorer';
import {
  UseFileExplorerExpansionSignature, UseFileExplorerIconsSignature,
} from '@stoked-ui/file-explorer/internals';

describeFileExplorer<[UseFileExplorerIconsSignature, UseFileExplorerExpansionSignature]>(
  'useFileExplorerIcons plugin',
  ({ render }) => {
    describe('slots (expandIcon, collapseIcon, endIcon, icon)', () => {
      const getIconTestId = (response: DescribeFileExplorerRendererReturnValue<any>, itemId: string) =>
        response.getItemIconContainer(itemId).querySelector(`div`)?.dataset.testid;

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

      it('should render the endIcon slot defined on the fileExplorer if no icon is defined on the item and the item has no children', () => {
        const response = render({
          items: [{ id: '1' }],
          slots: {
            expandIcon: () => <div data-testid="fileExplorerExpandIcon" />,
            collapseIcon: () => <div data-testid="fileExplorerCollapseIcon" />,
            endIcon: () => <div data-testid="fileExplorerEndIcon" />,
          },
        });

        expect(getIconTestId(response, '1')).to.equal('fileExplorerEndIcon');
      });

      it('should render the expandIcon slot defined on the item if the item is collapsed', () => {
        const response = render({
          items: [{ id: '1', children: [{ id: '1.1' }] }],
          slots: {
            expandIcon: () => <div data-testid="fileExplorerExpandIcon" />,
            collapseIcon: () => <div data-testid="fileExplorerCollapseIcon" />,
            endIcon: () => <div data-testid="fileExplorerEndIcon" />,
          },
          slotProps: {
            item: {
              slots: {
                expandIcon: () => <div data-testid="itemExpandIcon" />,
                collapseIcon: () => <div data-testid="itemCollapseIcon" />,
                endIcon: () => <div data-testid="itemEndIcon" />,
              },
            },
          },
        });

        expect(getIconTestId(response, '1')).to.equal('itemExpandIcon');
      });

      it('should render the collapseIcon slot defined on the item if the item is expanded', () => {
        const response = render({
          items: [{ id: '1', children: [{ id: '1.1' }] }],
          slots: {
            expandIcon: () => <div data-testid="fileExplorerExpandIcon" />,
            collapseIcon: () => <div data-testid="fileExplorerCollapseIcon" />,
            endIcon: () => <div data-testid="fileExplorerEndIcon" />,
          },
          slotProps: {
            item: {
              slots: {
                expandIcon: () => <div data-testid="itemExpandIcon" />,
                collapseIcon: () => <div data-testid="itemCollapseIcon" />,
                endIcon: () => <div data-testid="itemEndIcon" />,
              },
            },
          },
          defaultExpandedItems: ['1'],
        });

        expect(getIconTestId(response, '1')).to.equal('itemCollapseIcon');
      });

      it('should render the endIcon slot defined on the fileExplorer if the item has no children', () => {
        const response = render({
          items: [{ id: '1' }],
          slots: {
            expandIcon: () => <div data-testid="fileExplorerExpandIcon" />,
            collapseIcon: () => <div data-testid="fileExplorerCollapseIcon" />,
            endIcon: () => <div data-testid="fileExplorerEndIcon" />,
          },
          slotProps: {
            item: {
              slots: {
                expandIcon: () => <div data-testid="itemExpandIcon" />,
                collapseIcon: () => <div data-testid="itemCollapseIcon" />,
                endIcon: () => <div data-testid="itemEndIcon" />,
              },
            },
          },
        });

        expect(getIconTestId(response, '1')).to.equal('itemEndIcon');
      });

      it('should render the icon slot defined on the item if the item is collapsed', () => {
        const response = render({
          items: [{ id: '1', children: [{ id: '1.1' }] }],
          slots: {
            expandIcon: () => <div data-testid="fileExplorerExpandIcon" />,
            collapseIcon: () => <div data-testid="fileExplorerCollapseIcon" />,
            endIcon: () => <div data-testid="fileExplorerEndIcon" />,
          },
          slotProps: {
            item: {
              slots: {
                expandIcon: () => <div data-testid="itemExpandIcon" />,
                collapseIcon: () => <div data-testid="itemCollapseIcon" />,
                endIcon: () => <div data-testid="itemEndIcon" />,
                icon: () => <div data-testid="itemIcon" />,
              },
            },
          },
        });

        expect(getIconTestId(response, '1')).to.equal('itemIcon');
      });

      it('should render the icon slot defined on the item if the item is expanded', () => {
        const response = render({
          items: [{ id: '1', children: [{ id: '1.1' }] }],
          slots: {
            expandIcon: () => <div data-testid="fileExplorerExpandIcon" />,
            collapseIcon: () => <div data-testid="fileExplorerCollapseIcon" />,
            endIcon: () => <div data-testid="fileExplorerEndIcon" />,
          },
          slotProps: {
            item: {
              slots: {
                expandIcon: () => <div data-testid="itemExpandIcon" />,
                collapseIcon: () => <div data-testid="itemCollapseIcon" />,
                endIcon: () => <div data-testid="itemEndIcon" />,
                icon: () => <div data-testid="itemIcon" />,
              },
            },
          },
          defaultExpandedItems: ['1'],
        });

        expect(getIconTestId(response, '1')).to.equal('itemIcon');
      });

      it('should render the icon slot defined on the item if the item has no children', () => {
        const response = render({
          items: [{ id: '1' }],
          slots: {
            expandIcon: () => <div data-testid="fileExplorerExpandIcon" />,
            collapseIcon: () => <div data-testid="fileExplorerCollapseIcon" />,
            endIcon: () => <div data-testid="fileExplorerEndIcon" />,
          },
          slotProps: {
            item: {
              slots: {
                expandIcon: () => <div data-testid="itemExpandIcon" />,
                collapseIcon: () => <div data-testid="itemCollapseIcon" />,
                endIcon: () => <div data-testid="itemEndIcon" />,
                icon: () => <div data-testid="itemIcon" />,
              },
            },
          },
        });

        expect(getIconTestId(response, '1')).to.equal('itemIcon');
      });
    });
  },
);
