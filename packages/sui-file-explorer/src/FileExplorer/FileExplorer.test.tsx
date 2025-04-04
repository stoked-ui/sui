import * as React from 'react';
import { createRenderer } from '@stoked-ui/internal-test-utils';
import {
  FileExplorer, 
  fileExplorerClasses as classes
} from '@stoked-ui/file-explorer/FileExplorer';

/**
 * Test suite for the FileExplorer component.
 */
describe('<FileExplorer />', () => {
  const { render } = createRenderer();

  /**
   * Conformance tests for the FileExplorer component.
   */
  describeConformance(<FileExplorer items={[]} />, () => ({
    /**
     * Classes used by the component.
     */
    classes,
    /**
     * InheritComponent to set the base element of the component.
     */
    inheritComponent: 'ul',
    /**
     * Render function for the component.
     */
    render,
    /**
     * Expected instanceof type for the ref.
     */
    refInstanceof: window.HTMLUListElement,
    /**
     * Material-UI name for the component.
     */
    muiName: 'MuiFileExplorer',
    /**
     * Skip certain tests to avoid unnecessary complexity.
     */
    skip: ['componentProp', 'componentsProp', 'themeVariants'],
  }));
});