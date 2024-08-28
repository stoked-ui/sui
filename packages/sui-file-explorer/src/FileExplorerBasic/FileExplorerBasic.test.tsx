import * as React from 'react';
import { createRenderer } from '@stoked-ui/internal-test-utils';
import {
  FileExplorerBasic,
  fileExplorerBasicClasses as classes
} from '@stoked-ui/file-explorer/FileExplorerBasic';
import { describeConformance } from 'test/utils/describeConformance';

describe('<FileExplorerBasic />', () => {
  const { render } = createRenderer();

  describeConformance(<FileExplorerBasic />, () => ({
    classes,
    inheritComponent: 'ul',
    render,
    refInstanceof: window.HTMLUListElement,
    muiName: 'MuiFileExplorerBasic',
    skip: ['componentProp', 'componentsProp', 'themeVariants'],
  }));
});
