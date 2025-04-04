import * as React from 'react';
import {expect} from 'chai';
import {spy} from 'sinon';
import {fireEvent} from '@stoked-ui/internal-test-utils';
import {describeFileExplorer} from 'test/utils/fileExplorer/describeFileExplorer';
import {
  UseFileExplorerFilesSignature,
  UseFileExplorerExpansionSignature,
  UseFileExplorerSelectionSignature,
} from '@stoked-ui/file-explorer/internals';

/**
 * Tests for the useFileExplorerFiles plugin.
 */
describe('useFileExplorerFiles plugin', () => {
  /**
   * Props signature for the test component.
   */
  interface TestProps {
    render: jest.Mock;
    renderFromJSX: jest.Mock;
    fileExplorerViewComponentName: string;
    FileExplorerComponent: React.ComponentType<any>;
    FileComponent: React.ComponentType<any>;
  }

  /**
   * Description for the test suite.
   *
   * @param props Test component props.
   */
  describeFileExplorer<
    [UseFileExplorerFilesSignature, UseFileExplorerExpansionSignature, UseFileExplorerSelectionSignature]
  >('useFileExplorerFiles plugin', (props: TestProps) => {
    /**
     * Tests for the useFileExplorerFiles plugin.
     *
     * @param props Test component props.
     */
    describe('tests', () => {
      /**
       * Test that the disabled prop does not add an aria-disabled attribute to enabled items.
       *
       * @param props Test component props.
       */
      it('should not have the attribute `aria-disabled` if disabled is not defined', () => {
        const response = props.render({
          items: [{ id: '1' }, { id: '2', disabled: false }, { id: '3', disabled: true }],
        });

        expect(response.getItemRoot('1')).not.to.have.attribute('aria-disabled');
        expect(response.getItemRoot('2')).not.to.have.attribute('aria-disabled');
        expect(response.getItemRoot('3')).to.have.attribute('aria-disabled');
      });

      /**
       * Test that the disabled prop disables all descendants of a disabled item.
       *
       * @param props Test component props.
       */
      it('should disable all descendants of a disabled item', () => {
        const response = props.render({
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

    /**
     * Test that the defaultExpandedItems prop works correctly.
     *
     * @param props Test component props.
     */
    describe('defaultExpandedItems prop', () => {
      /**
       * Test that an item is marked as not expandable if it has only empty conditional arrays.
       *
       * @param props Test component props.
       */
      it('should mark an item as not expandable if it has only empty conditional arrays', () => {
        const response = props.renderFromJSX(
          <props.FileExplorerComponent defaultExpandedItems={['1']}>
            <props.FileComponent id="1" label="1" data-testid="1">
              {[]}
              {[]}
            </props.FileComponent>
          </props.FileExplorerComponent>,
        );

        expect(response.isItemExpanded('1')).to.equal(false);
      });

      /**
       * Test that an item is marked as expandable if it has two arrays as children, one of which is empty.
       *
       * @param props Test component props.
       */
      it('should mark an item as expandable if it has two array as children, one of which is empty (FileExplorerBasic only)', () => {
        const response = props.renderFromJSX(
          <props.FileExplorerComponent defaultExpandedItems={['1']}>
            <props.FileComponent id="1" label="1" data-testid="1">
              {[]}
              {[<props.FileComponent key="1.1" id="1.1" />]}
            </props.FileComponent>
          </props.FileExplorerComponent>,
        );

        expect(response.isItemExpanded('1')).to.equal(true);
      });

      /**
       * Test that an item is marked as not expandable if it has one array containing an empty array as a child.
       *
       * @param props Test component props.
       */
      it('should mark an item as not expandable if it has one array containing an empty array as a children (FileExplorerBasic only)', () => {
        const response = props.renderFromJSX(
          <props.FileExplorerComponent defaultExpandedItems={['1']}>
            <props.FileComponent id="1" label="1" data-testid="1">
              {[[]]}
            </props.FileComponent>
          </props.FileExplorerComponent>,
        );

        expect(response.isItemExpanded('1')).to.equal(false);
      });
    });

    /**
     * Test that the defaultExpandedItems prop works correctly with descendants.
     *
     * @param props Test component props.
     */
    describe('defaultExpandedItems prop with descendants', () => {
      /**
       * Test that a disabled item disables all of its descendants.
       *
       * @param props Test component props.
       */
      it('should disable all descendants of a disabled item', () => {
        const response = props.render({
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
});