import * as React from 'react';
/**
 * Import necessary dependencies for testing and rendering.
 */

import {createRenderer} from '@stoked-ui/internal-test-utils';
/**
 * @typedef {object} Renderer
 * @property {function} render - A function to render components.
 */
import {File, fileClasses as classes} from '@mui/x-file-list/File';
/**
 * File component with classes and props for testing.
 */

import {FileListContext} from '@mui/x-file-list/internals/FileListProvider/FileListContext';
/**
 * File list context provider for rendering files.
 */

import {describeConformance} from 'test/utils/describeConformance';
/**
 * Describe conformance tests for components.
 *
 * @param {function} component - A component to test conformance.
 */
import {getFakeContextValue} from 'test/utils/file-list/fakeContextValue';
/**
 * Fake context value generator for file list testing.
 */

import {describeSlotsConformance} from 'test/utils/describeSlotsConformance';
/**
 * Describe slots conformance tests for components.
 *
 * @param {function} render - A function to render components.
 */
 
describe('<File />', () => {
  /**
   * Create a renderer instance for testing.
   */
  const { render } = createRenderer();

  describeConformance(
    /**
     * Render the File component with props and context value.
     */
    <File id="one" label="one" />,
    () => ({
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
    })
  );

  describeSlotsConformance(
    /**
     * Render the File component with slots and context value.
     */
    {
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
    }
  );
});