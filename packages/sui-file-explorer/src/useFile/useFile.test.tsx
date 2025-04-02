import * as React from 'react';
import {expect} from 'chai';
import {spy} from 'sinon';
import {act, createEvent, fireEvent, screen} from '@stoked-ui/internal-test-utils';
import {
  describeFileExplorer, DescribeFileExplorerRendererUtils,
} from 'test/utils/fileExplorer-view/describeFileExplorer';
import {
  UseFileExplorerExpansionSignature, UseFileExplorerIconsSignature,
} from '@stoked-ui/file-explorer/internals';
import {fileClasses} from '@stoked-ui/file-explorer/File';

describeFileExplorer<[UseFileExplorerExpansionSignature, UseFileExplorerIconsSignature]>(
  'useFile hook',
  ({
    render,
    renderFromJSX,
    fileComponentName,
    FileComponent,
    fileExplorerViewComponentName,
    FileExplorerComponent,
  }) => {
    describe('role prop', () => {
      it('should have the role="fileexploreritem" on the root slot', () => {
        const response = render({ items: [{ id: '1' }] });

        expect(response.getItemRoot('1')).to.have.attribute('role', 'fileexploreritem');
      });

      it('should have the role "group" on the groupTransition slot if the item is expandable', () => {
        const response = render({
          items: [{ id: '1', children: [{ id: '1.1' }] }],
          defaultExpandedItems: ['1'],
        });

        expect(
          response.getItemRoot('1').querySelector(`.${fileClasses.groupTransition}`),
        ).to.have.attribute('role', 'group');
      });
    });

    describe('onClick prop', () => {
      it('should call onClick when clicked, but not when children are clicked for File', () => {
        const onClick = spy();

        const response = render({
          items: [{ id: '1', children: [{ id: '1.1' }] }],
          defaultExpandedItems: ['1'],
          slotProps: {
            item: {
              onClick,
            },
          },
        });

        fireEvent.click(response.getItemContent('1.1'));
        expect(onClick.callCount).to.equal(fileComponentName === 'File' ? 1 : 2);
        expect(onClick.lastCall.firstArg.target.parentElement.dataset.testid).to.equal('1.1');
      });

      it('should call onClick even when the element is disabled', () => {
        const onClick = spy();

        const response = render({
          items: [{ id: '1', disabled: true }],
          slotProps: {
            item: {
              onClick,
            },
          },
        });

        fireEvent.click(response.getItemContent('1'));
        expect(onClick.callCount).to.equal(1);
      });
    });

    it('should be able to type in a child input', () => {
      const response = render({
        items: [{ id: '1', children: [{ id: '1.1' }] }],
        defaultExpandedItems: ['1'],
        slotProps:
          fileComponentName === 'File'
            ? {
                item: {
                  slots: {
                    label: () => <input type="text" className="icon-input " />,
                  },
                },
              }
            : {
                item: {
                  label: <input type="text" className="icon-input " />,
                },
              },
      });

      const input = response.getItemRoot('1.1').querySelector('.icon-input')!;
      const keydownEvent = createEvent.keyDown(input, {
        key: 'a',
      });

      const handlePreventDefault = spy();
      keydownEvent.preventDefault = handlePreventDefault;
      fireEvent(input, keydownEvent);
      expect(handlePreventDefault.callCount).to.equal(0);
    });

    it('should not focus steal', () => {
      let setActiveItemMounted;
      // a File whose mounted state we can control with `setActiveItemMounted`
      function ConditionallyMountedItem(props) {
        const [mounted, setMounted] = React.useState(true);
        if (props.id === '2') {
          setActiveItemMounted = setMounted;
        }

        if (!mounted) {
          return null;
        }
        return <FileComponent {...props} />;
      }

      let response: DescribeFileExplorerRendererUtils;
      if (fileExplorerViewComponentName === 'FileExplorerBasic') {
        response = renderFromJSX(
          <React.Fragment>
            <button type="button">Some focusable element</button>
            <FileExplorerComponent>
              <ConditionallyMountedItem id="1" label="1" data-testid="1" />
              <ConditionallyMountedItem id="2" label="2" data-testid="2" />
            </FileExplorerComponent>
          </React.Fragment>,
        );
      } else {
        response = renderFromJSX(
          <React.Fragment>
            <button type="button">Some focusable element</button>
            <FileExplorerComponent
              items={[{ id: '1' }, { id: '2' }]}
              slots={{
                item: ConditionallyMountedItem,
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
        response.getItemRoot('2').focus();
      });

      expect(response.getFocusedItemId()).to.equal('2');

      act(() => {
        screen.getByRole('button').focus();
      });

      expect(screen.getByRole('button')).toHaveFocus();

      act(() => {
        setActiveItemMounted(false);
      });
      act(() => {
        setActiveItemMounted(true);
      });

      expect(screen.getByRole('button')).toHaveFocus();
    });
  },
);

