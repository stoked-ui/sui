import * as React from 'react';
import { createRenderer } from '@stoked-ui/internal-test-utils';
import { File, fileClasses as classes } from '@mui/x-file-list/File';
import { FileListContext } from '@mui/x-file-list/internals/FileListProvider/FileListContext';
import { describeConformance } from 'test/utils/describeConformance';
import { getFakeContextValue } from 'test/utils/file-list/fakeContextValue';
import { describeSlotsConformance } from 'test/utils/describeSlotsConformance';

describe('<File />', () => {
  const { render } = createRenderer();

  describeConformance(<File itemId="one" label="one" />, () => ({
    classes,
    inheritComponent: 'li',
    render: (item) => {
      return render(
        <FileListContext.Provider value={getFakeContextValue()}>{item}</FileListContext.Provider>,
      );
    },
    muiName: 'MuiFile',
    refInstanceof: window.HTMLLIElement,
    skip: ['reactTestRenderer', 'componentProp', 'componentsProp', 'themeVariants'],
  }));

  describeSlotsConformance({
    render,
    getElement: ({ props, slotName }) => (
      <FileListContext.Provider
        value={getFakeContextValue({ checkboxSelection: slotName === 'checkbox' })}
      >
        <File itemId="one" label="one" {...props} />
      </FileListContext.Provider>
    ),
    slots: {
      label: { className: classes.label },
      iconContainer: { className: classes.iconContainer },
      content: { className: classes.content },
      checkbox: { className: classes.checkbox },
    },
  });
});
