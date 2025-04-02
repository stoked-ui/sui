import * as React from 'react';
import { createRenderer } from '@stoked-ui/internal-test-utils';
import {
  FileExplorer,
  fileExplorerClasses as classes
} from '@stoked-ui/file-explorer/FileExplorer';
import { describeConformance } from 'test/utils/describeConformance';

describe('<FileExplorer />', () => {
  const { render } = createRenderer();

  describeConformance(<FileExplorer items={[]} />, () => ({
    classes,
    inheritComponent: 'ul',
    render,
    refInstanceof: window.HTMLUListElement,
    muiName: 'MuiFileExplorer',
    skip: ['componentProp', 'componentsProp', 'themeVariants'],
  }));
});

