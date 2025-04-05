import * as React from 'react';
import { expect } from 'chai';
import { spy } from 'sinon';
import { describeFileExplorer } from 'test/utils/file-list/describeFileExplorer';
import { UseFileExplorerExpansionSignature } from '@mui/x-file-list/internals';
import { act, fireEvent } from '@stoked-ui/internal-test-utils';
import { File, FileProps } from '@mui/x-file-list/File';
import { UseFileContentSlotOwnProps } from '@mui/x-file-list/useFile';
import { useFileUtils } from '@mui/x-file-list/hooks';

/**
 * All tests related to keyboard navigation (e.g.: expanding using "Enter" and "ArrowRight")
 * are located in the `useFileExplorerKeyboardNavigation.test.tsx` file.
 */
describeFileExplorer<[UseFileExplorerExpansionSignature]>(
  'useFileExplorerExpansion plugin',
  ({ render, setup }) => {
    /**
     * @description
     * Tests the model props related to item expansion.
     */
    describe('model props (expandedItems, defaultExpandedItems, onExpandedItemsChange)', () => {
      /**
       * @description
       * Tests the behavior when no default state and no control state are defined.
       */
      it('should not expand items when no default state and no control state are defined', () => {
        const response = render({
          items: [{ id: '1', children: [{ id: '1.1' }] }, { id: '2' }],
        });

        expect(response.isItemExpanded('1')).to.equal(false);
        expect(response.getAllFileIds()).to.deep.equal(['1', '2']);
      });

      // More test cases follow...
    });

    // More describe blocks and test cases...
  },
);