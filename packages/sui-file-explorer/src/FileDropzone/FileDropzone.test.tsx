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

