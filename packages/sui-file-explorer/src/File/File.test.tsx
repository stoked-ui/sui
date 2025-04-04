import * as React from 'react';
import {createRenderer} from '@stoked-ui/internal-test-utils';
import {File, fileClasses as classes} from '@mui/x-file-list/File';
import {FileListContext} from '@mui/x-file-list/internals/FileListProvider/FileListContext';
import {describeConformance} from 'test/utils/describeConformance';
import {getFakeContextValue} from 'test/utils/file-list/fakeContextValue';
import {describeSlotsConformance} from 'test/utils/describeSlotsConformance';

/**
 * Test suite for the <File /> component.
 */
describe('<File />', () => {
  const { render } = createRenderer();

  /**
   * Validate that the <File /> component conforms to the expected structure and behavior.
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
   * Test the slot conformance of the <File /> component.
   */
  describeSlotsConformance({
    render,
    /**
     * Returns a test element for the specified slot.
     * 
     * @param {Object} params - The parameters for getting the element.
     * @param {Object} params.props - The properties to apply to the component.
     * @param {string} params.slotName - The name of the slot being tested.
     * @returns {JSX.Element} The rendered element.
     */
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