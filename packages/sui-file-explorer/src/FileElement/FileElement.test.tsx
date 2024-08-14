import * as React from 'react';
import { expect } from 'chai';
import PropTypes from 'prop-types';
import { createRenderer } from '@stoked-ui/internal-test-utils';
import { FileElement, fileElementClasses as classes } from '@mui/x-tree-view/FileElement';
import {
  FileExplorerContext
} from '@mui/x-tree-view/internals/FileExplorerProvider/FileExplorerContext';
import { describeConformance } from 'test/utils/describeConformance';
import { describeFileExplorer } from 'test/utils/tree-view/describeFileExplorer';
import { getFakeContextValue } from 'test/utils/tree-view/fakeContextValue';

describeFileExplorer<[]>('FileElement component', ({ render, fileElementComponentName }) => {
  describe('ContentComponent / ContentProps props (FileElement only)', () => {
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

    it('should render FileElement when itemId prop is escaping characters without throwing an error', function test() {
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

describe('<FileElement />', () => {
  const { render } = createRenderer();

  describeConformance(<FileElement itemId="one" label="one" />, () => ({
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

  describe('PropTypes warnings', () => {
    beforeEach(() => {
      PropTypes.resetWarningCache();
    });

    it('should warn if an onFocus callback is supplied', () => {
      expect(() => {
        PropTypes.checkPropTypes(
          FileElement.propTypes,
          { itemId: 'one', onFocus: () => {} },
          'prop',
          'FileElement',
        );
      }).toErrorDev('Failed prop type: The prop `onFocus` is not supported.');
    });

    it('should warn if an `ContentComponent` that does not hold a ref is used', () => {
      expect(() => {
        PropTypes.checkPropTypes(
          FileElement.propTypes,
          { itemId: 'one', ContentComponent: () => {} },
          'prop',
          'FileElement',
        );
      }).toErrorDev('Expected an element type that can hold a ref.');
    });
  });
});
