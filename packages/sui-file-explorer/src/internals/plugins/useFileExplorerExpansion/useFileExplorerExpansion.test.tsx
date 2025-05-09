import * as React from 'react';
import {expect} from 'chai';
import {spy} from 'sinon';
import {describeFileExplorer} from 'test/utils/fileExplorer-view/describeFileExplorer';
import {UseFileExplorerExpansionSignature} from '@stoked-ui/file-explorer/internals';
import {act, fireEvent} from '@stoked-ui/internal-test-utils';
import {File, FileProps} from '@stoked-ui/file-explorer/File';
import {UseFileContentSlotOwnProps} from '@stoked-ui/file-explorer/useFile';
import {useFileUtils} from '@stoked-ui/file-explorer/hooks';

/**
 * @description
 * All tests related to keyboard navigation (e.g.: expanding using "Enter" and "ArrowRight")
 * are located in the `useFileExplorerKeyboardNavigation.test.tsx` file.
 */
describeFileExplorer<[UseFileExplorerExpansionSignature]>(
  'useFileExplorerExpansion plugin',
  ({ render, setup }) => {
    /**
     * @description
     * Tests related to model props like expandedItems, defaultExpandedItems, and onExpandedItemsChange.
     */
    describe('model props (expandedItems, defaultExpandedItems, onExpandedItemsChange)', () => {
      /**
       * @description
       * Test case to verify items are not expanded when no default state and no control state are defined.
       */
      it('should not expand items when no default state and no control state are defined', () => {
        const response = render({
          items: [{ id: '1', children: [{ id: '1.1' }] }, { id: '2' }],
        });

        expect(response.isItemExpanded('1')).to.equal(false);
        expect(response.getAllFileIds()).to.deep.equal(['1', '2']);
      });

      // More test cases follow with similar documentation for each scenario
    });

    // More describe blocks with test cases and logic follow
});