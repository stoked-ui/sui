import * as React from 'react';
import { createRenderer } from '@stoked-ui/internal-test-utils';
import {
  FileDropzone, 
  fileDropzoneClasses as classes
} from '@stoked-ui/file-explorer/FileDropzone';

/**
 * Test suite for the FileDropzone component.
 */
describe('FileDropzone', () => {
  /**
   * Renderer instance for testing.
   */
  const { render } = createRenderer();

  /**
   * Conformance tests for the FileDropzone component.
   */
  describeConformance(<FileDropzone />, () => ({
    /**
     * CSS classes used by the component.
     */
    classes,
    /**
     * The parent element to inherit from.
     */
    inheritComponent: 'ul',
    /**
     * Render function for the component.
     */
    render,
    /**
     * Expected type of ref instance returned by the component.
     */
    refInstanceof: window.HTMLUListElement,
    /**
     * Material UI name of the component.
     */
    muiName: 'MuiFileDropzone',
    /**
     * Skip certain conformance tests.
     */
    skip: ['componentProp', 'componentsProp', 'themeVariants'],
  }));
});