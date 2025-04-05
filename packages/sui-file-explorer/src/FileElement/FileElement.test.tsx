/**
 * FileElement component for displaying file elements in a tree view.
 * @module FileElement
 */

import * as React from 'react';
import { expect } from 'chai';
import PropTypes from 'prop-types';
import { createRenderer } from '@stoked-ui/internal-test-utils';
import { FileElement, fileElementClasses as classes } from '@mui/x-tree-view/FileElement';
import { FileExplorerContext } from '@mui/x-tree-view/internals/FileExplorerProvider/FileExplorerContext';
import { describeConformance } from 'test/utils/describeConformance';
import { describeFileExplorer } from 'test/utils/tree-view/describeFileExplorer';
import { getFakeContextValue } from 'test/utils/tree-view/fakeContextValue';

/**
 * Test suite for the FileElement component.
 * @param {React.ReactNode} children - The children to be rendered within the FileElement component.
 */
describeFileExplorer<[]>('FileElement component', ({ render, fileElementComponentName }) => {
  /**
   * Tests for the ContentComponent / ContentProps props in the FileElement component.
   */
  describe('ContentComponent / ContentProps props (FileElement only)', () => {
    /**
     * Test to ensure the ContentComponent prop is used when defined.
     */
    it('should use the ContentComponent prop when defined', function test() {
      if (fileElementComponentName === 'FileElement2') {
        this.skip();
      }

      const ContentComponent = React.forwardRef((props: any, ref: React.Ref<HTMLDivElement>) => (
        <div className={props.classes.root} ref={ref}>
          MOCK CONTENT COMPONENT
        </div>
      ));

      const response = render({
        items: [{ id: '1' }],
        slotProps: { item: { ContentComponent } },
      });

      expect(response.getItemContent('1').textContent).to.equal('MOCK CONTENT COMPONENT');
    });

    /**
     * Test to ensure the ContentProps prop is used when defined.
     */
    it('should use the ContentProps prop when defined', function test() {
      if (fileElementComponentName === 'FileElement2') {
        this.skip();
      }

      const ContentComponent = React.forwardRef((props: any, ref: React.Ref<HTMLDivElement>) => (
        <div className={props.classes.root} ref={ref}>
          {props.customProp}
        </div>
      ));

      const response = render({
        items: [{ id: '1' }],
        slotProps: { item: { ContentComponent, ContentProps: { customProp: 'ABCDEF' } as any } },
      });

      expect(response.getItemContent('1').textContent).to.equal('ABCDEF');
    });

    /**
     * Test to render FileElement when id prop is escaping characters without throwing an error.
     */
    it('should render FileElement when id prop is escaping characters without throwing an error', function test() {
      if (fileElementComponentName === 'FileElement2') {
        this.skip();
      }

      const response = render({
        items: [{ id: 'C:\\\\', label: 'ABCDEF' }],
      });

      expect(response.getItemContent('C:\\\\').textContent).to.equal('ABCDEF');
    });
  });
});

/**
 * Main description of the FileElement component.
 */
describe('<FileElement />', () => {
  const { render } = createRenderer();

  /**
   * Test suite to check conformance of FileElement component.
   */
  describeConformance(<FileElement id="one" label="one" />, () => ({
    classes,
    inheritComponent: 'li',
    render: (item) => {
      return render(
        <FileExplorerContext.Provider value={getFakeContextValue()}>{item}</FileExplorerContext.Provider>,
      );
    },
    muiName: 'MuiFileElement',
    refInstanceof: window.HTMLLIElement,
    skip: ['componentProp', 'componentsProp', 'themeVariants'],
  }));

  /**
   * Test suite for PropTypes warnings.
   */
  describe('PropTypes warnings', () => {
    /**
     * Reset warning cache before each test.
     */
    beforeEach(() => {
      PropTypes.resetWarningCache();
    });

    /**
     * Test to check warning if an onFocus callback is supplied.
     */
    it('should warn if an onFocus callback is supplied', () => {
      expect(() => {
        PropTypes.checkPropTypes(
          FileElement.propTypes,
          { id: 'one', onFocus: () => {} },
          'prop',
          'FileElement',
        );
      }).toErrorDev('Failed prop type: The prop `onFocus` is not supported.');
    });

    /**
     * Test to check warning if an `ContentComponent` that does not hold a ref is used.
     */
    it('should warn if an `ContentComponent` that does not hold a ref is used', () => {
      expect(() => {
        PropTypes.checkPropTypes(
          FileElement.propTypes,
          { id: 'one', ContentComponent: () => {} },
          'prop',
          'FileElement',
        );
      }).toErrorDev('Expected an element type that can hold a ref.');
    });
  });
});