import * as React from 'react';
import { createRenderer } from '@stoked-ui/internal-test-utils';
import {
  FileExplorerBasic,
  fileExplorerBasicClasses as classes
} from '@stoked-ui/file-explorer/FileExplorerBasic';
import { describeConformance } from 'test/utils/describeConformance';

/**
 * Test suite for the FileExplorerBasic component.
 */
describe('<FileExplorerBasic />', () => {
  /**
   * Creates a renderer instance for testing the FileExplorerBasic component.
   */
  const { render } = createRenderer();

  /**
   * Configures conformance testing for the FileExplorerBasic component.
   */
  describeConformance(<FileExplorerBasic />, () => ({
    /**
     * Custom CSS classes for the component.
     */
    classes,
    /**
     * The base element to inherit from when rendering the component.
     */
    inheritComponent: 'ul',
    /**
     * The renderer instance used to test the component.
     */
    render,
    /**
     * Type check to ensure the component is an instance of HTMLUListElement.
     */
    refInstanceof: window.HTMLUListElement,
    /**
     * The name of the MUI component being tested.
     */
    muiName: 'MuiFileExplorerBasic',
    /**
     * An array of test cases that can be skipped.
     */
    skip: ['componentProp', 'componentsProp', 'themeVariants'],
  }));
});