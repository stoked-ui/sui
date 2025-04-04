/**
 * File Explorer API Initialization Hook
 *
 * Initializes the file explorer API with the provided input API reference.
 *
 * @param {React.MutableRefObject<T | undefined> | undefined} inputApiRef
 *   The input API reference to initialize with. If null or undefined, a fallback public API reference is used.
 * @returns {T} The initialized file explorer API object.
 */
export function useFileExplorerApiInitialization<T>(
  inputApiRef: React.MutableRefObject<T | undefined> | undefined,
): T {
  const fallbackPublicApiRef = React.useRef({}) as React.MutableRefObject<T>;

  if (inputApiRef) {
    if (inputApiRef.current == null) {
      inputApiRef.current = {} as T;
    }
    return inputApiRef.current;
  }

  return fallbackPublicApiRef.current;
}

/**
 * File Explorer Hook
 *
 * Provides the file explorer functionality, including item and root wrapping, plugin execution, and context value management.
 *
 * @param {any} props
 *   The component props.
 * @returns {Object} An object containing the getRootProps, rootRef, contextValue, instance, and runItemPlugins functions.
 */
export function useFileExplorer<T extends FileExplorerAnyPluginSignature>(
  props: T,
): {
  /**
   * Gets the HTML attributes for the file explorer list element.
   *
   * @param {any} otherHandlers
   *   The additional event handlers to include in the root props.
   * @returns {React.HTMLAttributes<HTMLUListElement> | null}
   */
  getRootPropsGetters: (<TOther extends EventHandlers = {}>(
    otherHandlers: TOther,
  ) => React.HTMLAttributes<HTMLUListElement>)[];

  /**
   * Runs a file explorer plugin with the provided parameters.
   *
   * @param {FileExplorerPlugin<FileExplorerAnyPluginSignature>}
   *   The plugin to run.
   */
  runPlugin: (plugin: FileExplorerPlugin<FileExplorerAnyPluginSignature>) => void;

  /**
   * Gets the HTML attributes for the file explorer list element, including additional props from the provided handlers.
   *
   * @param {any} otherHandlers
   *   The additional event handlers to include in the root props.
   * @returns {React.HTMLAttributes<HTMLUListElement>}
   */
  getRootProps: (
    otherHandlers: any,
  ) => React.HTMLAttributes<HTMLUListElement>;

  /**
   * The file explorer instance.
   *
   * @type {FileExplorerInstance<any>}
   */
  instance: FileExplorerInstance<any>;

  /**
   * The context value for the file explorer hook.
   *
   * @type {{ publicAPI: T, wrapItem: wrapItemFunction, wrapRoot: wrapRootFunction, runItemPlugins: runItemPluginsFunction, rootRef: React.RefCallback<HTMLLIElement> | null }}
   */
  contextValue: {
    /**
     * The public API for the file explorer hook.
     *
     * @type {T}
     */
    publicAPI: T;

    /**
     * Wraps a single item in the file explorer list.
     *
     * @param {FileExplorerAnyPluginSignature} props
     *   The props to wrap.
     * @returns {React.ReactNode | null}
     */
    wrapItem: wrapItemFunction;

    /**
     * Wraps the root element of the file explorer list.
     *
     * @param {React.ReactNode} children
     *   The children to wrap.
     * @returns {React.ReactNode}
     */
    wrapRoot: wrapRootFunction;

    /**
     * Runs a file explorer plugin with the provided parameters.
     *
     * @param {FileExplorerPlugin<FileExplorerAnyPluginSignature>}
     *   The plugin to run.
     * @returns {{ contentRef: React.RefCallback<HTMLElement> | null, rootRef: React.RefCallback<HTMLLIElement> | null, status: UseFileStatus | null }}
     */
    runItemPlugins: runItemPluginsFunction;

    /**
     * The file explorer instance reference.
     *
     * @type {React.RefCallback<HTMLLIElement>}
     */
    rootRef: React.RefCallback<HTMLLIElement>;
  };

  const {
    getRootPropsGetters,
    runPlugin,
    getRootProps,
  } = props;

  return {
    getRootProps,
    runPlugin,
    instance,
  };
}

/**
 * Wraps a single item in the file explorer list.
 *
 * @param {any} id
 *   The ID of the item to wrap.
 * @param {React.ReactNode | any}
 *   The children to wrap.
 * @returns {React.ReactNode}
 */
const wrapItem: FileWrapper<T> = ({ id, children }) => {
  let finalChildren: React.ReactNode = children;
  const itemWrappers.forEach((itemWrapper) => {
    finalChildren = itemWrapper({ id, children: finalChildren, instance });
  });

  return finalChildren;
};

/**
 * Wraps the root element of the file explorer list.
 *
 * @param {any} children
 *   The children to wrap.
 * @returns {React.ReactNode}
 */
const wrapRoot: FileExplorerRootWrapper<T> = ({ children }) => {
  let finalChildren: React.ReactNode = children;
  const rootWrappers.forEach((rootWrapper) => {
    finalChildren = rootWrapper({ children: finalChildren, instance });
  });

  return finalChildren;
};

/**
 * Runs a file explorer plugin with the provided parameters.
 *
 * @param {any} itemPluginProps
 *   The props to pass to the plugin.
 * @returns {{ contentRef: React.RefCallback<HTMLElement> | null, rootRef: React.RefCallback<HTMLLIElement> | null, status: UseFileStatus | null }}
 */
const runItemPluginsFunction = (itemPluginProps: any) => {
  // implementation
};

// use the hook in a component
import React from 'react';

class MyComponent extends React.Component {
  render() {
    const { props } = this;

    return (
      <div>
        {/* render your app here */}
      </div>
    );
  }
}

export default MyComponent;