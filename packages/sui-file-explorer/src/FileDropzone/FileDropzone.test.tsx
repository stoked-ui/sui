/**
 * React component for a drop zone for files.
 *
 * @description This component provides a drop zone for files.
 *
 * @param {object} props - The props for the FileDropzone component.
 * @property {object} classes - The CSS classes for styling.
 * @property {string} classes.root - The root class name.
 * @property {string} classes.hidden - The hidden class name.
 *
 * @returns {JSX.Element} React component
 *
 * @example
 * <FileDropzone classes={classes} />
 *
 * @fires FileDropzone#onChange
 * @see createRenderer
 */

import * as React from 'react';
import { createRenderer } from '@stoked-ui/internal-test-utils';
import {
  FileDropzone,
  fileDropzoneClasses as classes
} from '@stoked-ui/file-explorer/FileDropzone';
import { describeConformance } from 'test/utils/describeConformance';

describe('ee<FileDropzone />', () => {
  const { render } = createRenderer();

  describeConformance(<FileDropzone />, () => ({
    classes,
    inheritComponent: 'ul',
    render,
    refInstanceof: window.HTMLUListElement,
    muiName: 'MuiFileDropzone',
    skip: ['componentProp', 'componentsProp', 'themeVariants'],
  }));
});