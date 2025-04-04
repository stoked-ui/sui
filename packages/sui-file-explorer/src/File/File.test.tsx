import * as React from 'react';
import {createRenderer} from '@stoked-ui/internal-test-utils';
import {File, fileClasses as classes} from '@mui/x-file-list/File';
import {FileListContext} from '@mui/x-file-list/internals/FileListProvider/FileListContext';
import {describeConformance} from 'test/utils/describeConformance';
import {getFakeContextValue} from 'test/utils/file-list/fakeContextValue';
import {describeSlotsConformance} from 'test/utils/describeSlotsConformance';

/**
 * Test suite for the `<File />` component.
 */
describe('<File />', () => {
  const { render } = createRenderer();

  /**
   * Tests conformance of the `<File />` component with MUI's standards.
   * 
   * @example
   * describeConformance(<File id="one" label="one" />, () => ({
   *   classes,
   *   inheritComponent: 'li',
   *   render: (item) => {
   *     return render(
   *       <FileListContext.Provider value={getFakeContextValue()}>{item}</FileListContext.Provider>,
   *     );
   *   },
   *   muiName: 'MuiFile',
   *   refInstanceof: window.HTMLLIElement,
   *   skip: ['reactTestRenderer', 'componentProp', 'componentsProp', 'themeVariants'],
   * }));
   */
  describeConformance(<File id="one" label="one" />, () => ({
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

  /**
   * Tests slot conformance for the `<File />` component.
   * 
   * @example
   * describeSlotsConformance({
   *   render,
   *   getElement: ({ props, slotName }) => (
   *     <FileListContext.Provider
   *       value={getFakeContextValue({ checkboxSelection: slotName === 'checkbox' })}
   *     >
   *       <File id="one" label="one" {...props} />
   *     </FileListContext.Provider>
   *   ),
   *   slots: {
   *     label: { className: classes.label },
   *     iconContainer: { className: classes.iconContainer },
   *     content: { className: classes.content },
   *     checkbox: { className: classes.checkbox },
   *   },
   * });
   */
  describeSlotsConformance({
    render,
    getElement: ({ props, slotName }) => (
      <FileListContext.Provider
        value={getFakeContextValue({ checkboxSelection: slotName === 'checkbox' })}
      >
        <File id="one" label="one" {...props} />
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