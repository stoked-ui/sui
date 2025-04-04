/**
 * Provides an API initialization function for the editor.
 *
 * @template T - The type of data stored in the public API reference.
 * @param inputApiRef A mutable reference to the public API, or undefined if a fallback is used.
 * @returns The initialized public API reference.
 */
export function useEditorApiInitialization<T>(
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
 * Provides the main editor hook.
 *
 * @template TSignatures - The type of signatures used by the plugins.
 * @param props Props for the editor, including slots and other event handlers.
 * @returns An object containing the root properties, editor view props, controls props, timeline props, and file explorer tabs props.
 */
export function useEditorHook<TSignatures = {}>(
  props: any,
): {
  getRootProps: <TOther extends EventHandlers = {}>(otherHandlers: TOther) => React.HTMLAttributes<HTMLDivElement>;
  getEditorViewProps: <TOther extends EventHandlers = {}>(otherHandlers: TOther) => { [key: string]: any };
  getControlsProps: <TOther extends EventHandlers = {}>(otherHandlers: TOther) => { [key: string]: any };
  getTimelineProps: <TOther extends EventHandlers = {}>(otherHandlers: TOther) => { [key: string]: any };
  getFileExplorerTabsProps: <TOther extends EventHandlers = {}>(otherHandlers: TOther) => { [key: string]: any };
  rootRef: React.RefObject<HTMLDivElement>;
  contextValue: EditorContextValue<TSignatures>;
  instance: EditorInstance;
  id: string;
} {
  const {
    publicAPI,
    runItemPlugins,
    instance,
    rootRef,
    settings,
  } = useEditorContext();

  const getRootProps = <TOther extends EventHandlers = {}>(otherHandlers: TOther) => {
    const rootProps: UseEditorRootSlotProps = {
      role: 'editor',
      ...{
        ...props
      },
      ...otherHandlers,
      ref: rootRef,
    };

    return rootProps;
  };

  const getEditorViewProps = <TOther extends EventHandlers = {}>(otherHandlers: TOther) => {
    return {
      ...props,
      ...otherHandlers,
    };
  };

  const getControlsProps = <TOther extends EventHandlers = {}>(otherHandlers: TOther) => {
    return {
      ...props,
      ...otherHandlers,
    };
  };

  const getTimelineProps = <TOther extends EventHandlers = {}>(otherHandlers: TOther) => {
    return {
      ...props,
      ...otherHandlers,
      tracks: publicAPI.tracks ?? [],
      controllers: Controllers,
      ref: settings.timelineRef,
      sx: props.timelineSx,
    };
  };

  const getFileExplorerTabsProps = <TOther extends EventHandlers = {}>(otherHandlers: TOther) => {
    return {
      ...props,
      ...otherHandlers,
      tabs: {
        'Track Files': [] as IMediaFile[],
        'Saved Videos': [] as IMediaFile[]
      },
      sx: { gridArea: 'explorer-tabs'}
    };
  };

  const contextValue = {
    publicAPI,
    runItemPlugins,
    instance,
    rootRef,
  } as EditorContextValue<TSignatures>;

  return {
    getRootProps,
    getEditorViewProps,
    getControlsProps,
    getTimelineProps,
    getFileExplorerTabsProps,
    rootRef,
    contextValue,
    instance,
    id: settings.id,
  };
}