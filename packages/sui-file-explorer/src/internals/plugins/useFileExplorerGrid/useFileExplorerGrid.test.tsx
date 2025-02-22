import * as React from 'react';
import {expect} from 'chai';
import {spy} from 'sinon';
import {describeFileExplorer} from 'test/utils/file-list/describeFileExplorer';
import {UseFileExplorerExpansionSignature} from '@mui/x-file-list/internals';
import {act, fireEvent} from '@stoked-ui/internal-test-utils';
import {File, FileProps} from '@mui/x-file-list/File';
import {UseFileContentSlotOwnProps} from '@mui/x-file-list/useFile';
import {useFileUtils} from '@mui/x-file-list/hooks';

/**
 * All tests related to keyboard navigation (e.g.: expanding using "Enter" and "ArrowRight")
 * are located in the `useFileExplorerKeyboardNavigation.test.tsx` file.
 */
describeFileExplorer<[UseFileExplorerExpansionSignature]>(
  'useFileExplorerExpansion plugin',
  ({ render, setup }) => {
    describe('model props (expandedItems, defaultExpandedItems, onExpandedItemsChange)', () => {
      it('should not expand items when no default state and no control state are defined', () => {
        const response = render({
          items: [{ id: '1', children: [{ id: '1.1' }] }, { id: '2' }],
        });

        expect(response.isItemExpanded('1')).to.equal(false);
        expect(response.getAllFileIds()).to.deep.equal(['1', '2']);
      });

      it('should use the default state when defined', () => {
        const response = render({
          items: [{ id: '1', children: [{ id: '1.1' }] }, { id: '2' }],
          defaultExpandedItems: ['1'],
        });

        expect(response.isItemExpanded('1')).to.equal(true);
        expect(response.getAllFileIds()).to.deep.equal(['1', '1.1', '2']);
      });

      it('should use the controlled state when defined', () => {
        const response = render({
          items: [{ id: '1', children: [{ id: '1.1' }] }, { id: '2' }],
          expandedItems: ['1'],
        });

        expect(response.isItemExpanded('1')).to.equal(true);
        expect(response.getItemRoot('1.1')).toBeVisible();
      });

      it('should use the controlled state instead of the default state when both are defined', () => {
        const response = render({
          items: [{ id: '1', children: [{ id: '1.1' }] }, { id: '2' }],
          expandedItems: ['1'],
          defaultExpandedItems: ['2'],
        });

        expect(response.isItemExpanded('1')).to.equal(true);
      });

      it('should react to controlled state update', () => {
        const response = render({
          items: [{ id: '1', children: [{ id: '1.1' }] }],
          expandedItems: [],
        });

        response.setProps({ expandedItems: ['1'] });
        expect(response.isItemExpanded('1')).to.equal(true);
      });

      it('should call the onExpandedItemsChange callback when the model is updated (add expanded item to empty list)', () => {
        const onExpandedItemsChange = spy();

        const response = render({
          items: [{ id: '1', children: [{ id: '1.1' }] }],
          onExpandedItemsChange,
        });

        fireEvent.click(response.getItemContent('1'));

        expect(onExpandedItemsChange.callCount).to.equal(1);
        expect(onExpandedItemsChange.lastCall.args[1]).to.deep.equal(['1']);
      });

      it('should call the onExpandedItemsChange callback when the model is updated (add expanded item to non-empty list)', () => {
        const onExpandedItemsChange = spy();

        const response = render({
          items: [
            { id: '1', children: [{ id: '1.1' }] },
            { id: '2', children: [{ id: '2.1' }] },
          ],
          onExpandedItemsChange,
          defaultExpandedItems: ['1'],
        });

        fireEvent.click(response.getItemContent('2'));

        expect(onExpandedItemsChange.callCount).to.equal(1);
        expect(onExpandedItemsChange.lastCall.args[1]).to.deep.equal(['2', '1']);
      });

      it('should call the onExpandedItemsChange callback when the model is updated (remove expanded item)', () => {
        const onExpandedItemsChange = spy();

        const response = render({
          items: [
            { id: '1', children: [{ id: '1.1' }] },
            { id: '2', children: [{ id: '2.1' }] },
          ],
          onExpandedItemsChange,
          defaultExpandedItems: ['1'],
        });

        fireEvent.click(response.getItemContent('1'));

        expect(onExpandedItemsChange.callCount).to.equal(1);
        expect(onExpandedItemsChange.lastCall.args[1]).to.deep.equal([]);
      });

      it('should warn when switching from controlled to uncontrolled', () => {
        const response = render({
          items: [{ id: '1' }],
          expandedItems: [],
        });

        expect(() => {
          response.setProps({ expandedItems: undefined });
        }).toErrorDev(
          'SUI X: A component is changing the controlled expandedItems state of FileExplorer to be uncontrolled.',
        );
      });

      it('should warn and not react to update when updating the default state', () => {
        const response = render({
          items: [{ id: '1', children: [{ id: '1.1' }] }, { id: '2' }],
          defaultExpandedItems: ['1'],
        });

        expect(() => {
          response.setProps({ defaultExpandedItems: ['2'] });
          expect(response.isItemExpanded('1')).to.equal(true);
          expect(response.isItemExpanded('2')).to.equal(false);
        }).toErrorDev(
          'SUI X: A component is changing the default expandedItems state of an uncontrolled FileExplorer after being initialized. To suppress this warning opt to use a controlled FileExplorer.',
        );
      });
    });

    describe('item click interaction', () => {
      it('should expand collapsed item when clicking on an item content', () => {
        const response = render({
          items: [{ id: '1', children: [{ id: '1.1' }] }, { id: '2' }],
        });

        expect(response.isItemExpanded('1')).to.equal(false);
        fireEvent.click(response.getItemContent('1'));
        expect(response.isItemExpanded('1')).to.equal(true);
      });

      it('should collapse expanded item when clicking on an item content', () => {
        const response = render({
          items: [{ id: '1', children: [{ id: '1.1' }] }, { id: '2' }],
          defaultExpandedItems: ['1'],
        });

        expect(response.isItemExpanded('1')).to.equal(true);
        fireEvent.click(response.getItemContent('1'));
        expect(response.isItemExpanded('1')).to.equal(false);
      });

      it('should not expand collapsed item when clicking on a disabled item content', () => {
        const response = render({
          items: [{ id: '1', disabled: true, children: [{ id: '1.1' }] }, { id: '2' }],
        });

        expect(response.isItemExpanded('1')).to.equal(false);
        fireEvent.click(response.getItemContent('1'));
        expect(response.isItemExpanded('1')).to.equal(false);
      });

      it('should not collapse expanded item when clicking on a disabled item', () => {
        const response = render({
          items: [{ id: '1', disabled: true, children: [{ id: '1.1' }] }, { id: '2' }],
          defaultExpandedItems: ['1'],
        });

        expect(response.isItemExpanded('1')).to.equal(true);
        fireEvent.click(response.getItemContent('1'));
        expect(response.isItemExpanded('1')).to.equal(true);
      });

      it('should expand collapsed item when clicking on an item label', () => {
        const response = render({
          items: [{ id: '1', children: [{ id: '1.1' }] }, { id: '2' }],
        });

        expect(response.isItemExpanded('1')).to.equal(false);
        fireEvent.click(response.getItemLabel('1'));
        expect(response.isItemExpanded('1')).to.equal(true);
      });

      it('should expand collapsed item when clicking on an item icon container', () => {
        const response = render({
          items: [{ id: '1', children: [{ id: '1.1' }] }, { id: '2' }],
        });

        expect(response.isItemExpanded('1')).to.equal(false);
        fireEvent.click(response.getItemIconContainer('1'));
        expect(response.isItemExpanded('1')).to.equal(true);
      });

      it('should be able to limit the expansion to the icon', function test() {
        // This test is not relevant for the File component.
        // We could create the equivalent test for it,
        // but it's not worth the effort given the complexity of the old behavior override.
        if (!setup.includes('File')) {
          this.skip();
        }

        const CustomFile = React.forwardRef(function MyFile(
          props: FileProps,
          ref: React.Ref<HTMLLIElement>,
        ) {
          const { interactions } = useFileUtils({
            id: props.id,
            children: props.children,
          });

          const handleContentClick: UseFileContentSlotOwnProps['onClick'] = (event) => {
            event.defaultMuiPrevented = true;
            interactions.handleSelection(event);
          };

          const handleIconContainerClick = (event: React.MouseEvent) => {
            interactions.handleExpansion(event);
          };

          return (
            <File
              {...props}
              ref={ref}
              slotProps={{
                content: { onClick: handleContentClick },
                iconContainer: { onClick: handleIconContainerClick },
              }}
            />
          );
        });

        const response = render({
          items: [{ id: '1', children: [{ id: '1.1' }] }, { id: '2' }],
          slots: { item: CustomFile },
        });

        expect(response.isItemExpanded('1')).to.equal(false);
        fireEvent.click(response.getItemContent('1'));
        expect(response.isItemExpanded('1')).to.equal(false);
        fireEvent.click(response.getItemIconContainer('1'));
        expect(response.isItemExpanded('1')).to.equal(true);
      });
    });

    // The `aria-expanded` attribute is used by the `response.isItemExpanded` method.
    // This `describe` only tests basics scenarios, more complex scenarios are tested in this file's other `describe`.
    describe('aria-expanded item attribute', () => {
      it('should have the attribute `aria-expanded=false` if collapsed', () => {
        const response = render({
          items: [{ id: '1', children: [{ id: '1.1' }] }],
        });

        expect(response.getItemRoot('1')).to.have.attribute('aria-expanded', 'false');
      });

      it('should have the attribute `aria-expanded=true` if expanded', () => {
        const response = render({
          items: [{ id: '1', children: [{ id: '1.1' }] }],
          defaultExpandedItems: ['1'],
        });

        expect(response.getItemRoot('1')).to.have.attribute('aria-expanded', 'true');
      });

      it('should not have the attribute `aria-expanded` if no children are present', () => {
        const response = render({
          items: [{ id: '1' }],
        });

        expect(response.getItemRoot('1')).not.to.have.attribute('aria-expanded');
      });
    });

    describe('onItemExpansionToggle prop', () => {
      it('should call the onItemExpansionToggle callback when expanding an item', () => {
        const onItemExpansionToggle = spy();

        const response = render({
          items: [{ id: '1', children: [{ id: '1.1' }] }],
          onItemExpansionToggle,
        });

        fireEvent.click(response.getItemContent('1'));
        expect(onItemExpansionToggle.callCount).to.equal(1);
        expect(onItemExpansionToggle.lastCall.args[1]).to.equal('1');
        expect(onItemExpansionToggle.lastCall.args[2]).to.equal(true);
      });

      it('should call the onItemExpansionToggle callback when collapsing an item', () => {
        const onItemExpansionToggle = spy();

        const response = render({
          items: [{ id: '1', children: [{ id: '1.1' }] }],
          defaultExpandedItems: ['1'],
          onItemExpansionToggle,
        });

        fireEvent.click(response.getItemContent('1'));
        expect(onItemExpansionToggle.callCount).to.equal(1);
        expect(onItemExpansionToggle.lastCall.args[1]).to.equal('1');
        expect(onItemExpansionToggle.lastCall.args[2]).to.equal(false);
      });
    });

    describe('setItemExpansion api method', () => {
      it('should expand a collapsed item when calling the setItemExpansion method with `isExpanded=true`', () => {
        const onItemExpansionToggle = spy();

        const response = render({
          items: [{ id: '1', children: [{ id: '1.1' }] }],
          onItemExpansionToggle,
        });

        act(() => {
          response.apiRef.current.setItemExpansion({} as any, '1', true);
        });

        expect(response.isItemExpanded('1')).to.equal(true);
        expect(onItemExpansionToggle.callCount).to.equal(1);
        expect(onItemExpansionToggle.lastCall.args[1]).to.equal('1');
        expect(onItemExpansionToggle.lastCall.args[2]).to.equal(true);
      });

      it('should collapse an expanded item when calling the setItemExpansion method with `isExpanded=false`', () => {
        const onItemExpansionToggle = spy();

        const response = render({
          items: [{ id: '1', children: [{ id: '1.1' }] }],
          defaultExpandedItems: ['1'],
          onItemExpansionToggle,
        });

        act(() => {
          response.apiRef.current.setItemExpansion({} as any, '1', false);
        });

        expect(response.isItemExpanded('1')).to.equal(false);
        expect(onItemExpansionToggle.callCount).to.equal(1);
        expect(onItemExpansionToggle.lastCall.args[1]).to.equal('1');
        expect(onItemExpansionToggle.lastCall.args[2]).to.equal(false);
      });

      it('should do nothing when calling the setItemExpansion method with `isExpanded=true` on an already expanded item', () => {
        const onItemExpansionToggle = spy();

        const response = render({
          items: [{ id: '1', children: [{ id: '1.1' }] }],
          defaultExpandedItems: ['1'],
          onItemExpansionToggle,
        });

        act(() => {
          response.apiRef.current.setItemExpansion({} as any, '1', true);
        });

        expect(response.isItemExpanded('1')).to.equal(true);
        expect(onItemExpansionToggle.callCount).to.equal(0);
      });

      it('should do nothing when calling the setItemExpansion method with `isExpanded=false` on an already collapsed item', () => {
        const onItemExpansionToggle = spy();

        const response = render({
          items: [{ id: '1', children: [{ id: '1.1' }] }],
          onItemExpansionToggle,
        });

        act(() => {
          response.apiRef.current.setItemExpansion({} as any, '1', false);
        });

        expect(response.isItemExpanded('1')).to.equal(false);
        expect(onItemExpansionToggle.callCount).to.equal(0);
      });
    });
  },
);
