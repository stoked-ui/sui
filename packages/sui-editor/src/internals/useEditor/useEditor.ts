import * as React from 'react';
import useForkRef from '@mui/utils/useForkRef';
import {EventHandlers} from '@mui/base/utils';
import {
  ConvertSignaturesIntoPlugins,
  EditorAnyPluginSignature,
  EditorInstance,
  EditorPlugin,
  EditorPublicAPI,
  MergeSignaturesProperty,
} from '../models';
import {
  UseEditorBaseProps, UseEditorParameters, UseEditorReturnValue, UseEditorRootSlotProps,
} from './useEditor.types';
import {useEditorModels} from './useEditorModels';
import {EditorContextValue, VideoPluginsRunner} from '../EditorProvider';
import {EditorCorePluginSignatures, VIDEO_EDITOR_CORE_PLUGINS} from '../corePlugins';
import {extractPluginParamsFromProps} from './extractPluginParamsFromProps';
import {MediaControllers} from "@stoked-ui/media-selector";

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

export const useEditor = <
  TSignatures extends readonly EditorAnyPluginSignature[],
  TProps extends Partial<UseEditorBaseProps<TSignatures>>,
>({
    plugins: inPlugins,
    rootRef,
    props,
  }: UseEditorParameters<TSignatures, TProps>): UseEditorReturnValue<TSignatures> => {
  type TSignaturesWithCorePluginSignatures = readonly [...EditorCorePluginSignatures, ...TSignatures,];
  const plugins = [...VIDEO_EDITOR_CORE_PLUGINS, ...inPlugins,] as unknown as ConvertSignaturesIntoPlugins<TSignaturesWithCorePluginSignatures>;

  const {
    pluginParams,
    forwardedProps,
    apiRef,
    experimentalFeatures,
    slots,
    slotProps
  } = extractPluginParamsFromProps<TSignatures, TProps>({
    plugins, props,
  });

  const models = useEditorModels<TSignatures>(plugins, pluginParams);
  const instanceRef = React.useRef({} as EditorInstance<TSignatures>);
  const instance = instanceRef.current as EditorInstance<TSignatures>;

  const publicAPI = useEditorApiInitialization<EditorPublicAPI<TSignatures>>(apiRef);

  const innerRootRef: React.RefObject<HTMLDivElement> = React.useRef(null);
  const handleRootRef = useForkRef(innerRootRef, rootRef);

  const [state, setState] = React.useState(() => {
    try {
      const temp = {} as MergeSignaturesProperty<TSignaturesWithCorePluginSignatures, 'state'>;
      plugins.forEach((plugin) => {
        if (plugin.getInitialState) {
          Object.assign(temp, plugin.getInitialState(pluginParams));
        }
      });
      return temp;
    } catch (ex) {
      console.log('ex', ex)
      throw ex;
    }

  });

  const runItemPlugins: VideoPluginsRunner = (itemPluginProps) => {
    let finalRootRef: React.RefCallback<HTMLDivElement> | null = null;
    let finalContentRef: React.RefCallback<HTMLDivElement> | null = null;

    plugins.forEach((plugin) => {
      if (!plugin.itemPlugin) {
        return;
      }

      const itemPluginResponse = plugin.itemPlugin({
        props: itemPluginProps,
        rootRef: finalRootRef,
        contentRef: finalContentRef,
      });
      if (itemPluginResponse.rootRef) {
        finalRootRef = itemPluginResponse.rootRef;
      }
      if (itemPluginResponse?.contentRef) {
        finalContentRef = itemPluginResponse.contentRef;
      }
    });

    return {
      contentRef: finalContentRef,
      rootRef: finalRootRef,
    };
  };

  const contextValue = {
    publicAPI,
    runItemPlugins,
    instance: instance as EditorInstance<any>,
    rootRef: innerRootRef,
  } as EditorContextValue<TSignatures>;

  const rootPropsGetters: (<TOther extends EventHandlers = {}>(
    otherHandlers: TOther,
  ) => React.HTMLAttributes<HTMLDivElement>)[] = [];
  const runPlugin = (plugin: EditorPlugin<EditorAnyPluginSignature>) => {
    const pluginResponse = plugin({
      instance,
      params: pluginParams,
      slots,
      slotProps,
      experimentalFeatures,
      state,
      setState,
      rootRef: innerRootRef,
      models,
      plugins,
    });

    if (pluginResponse.getRootProps) {
      rootPropsGetters.push(pluginResponse.getRootProps);
    }

    if (pluginResponse.publicAPI) {
      Object.assign(publicAPI, pluginResponse.publicAPI);
    }

    if (pluginResponse.instance) {
      Object.assign(instance, pluginResponse.instance);
    }

    if (pluginResponse.contextValue) {
      Object.assign(contextValue, pluginResponse.contextValue);
    }
  };

  plugins.forEach(runPlugin);

  const getRootProps = <TOther extends EventHandlers = {}>(
    otherHandlers: TOther = {} as TOther,
  ) => {
    const rootProps: UseEditorRootSlotProps = {
      role: 'editor',
      ...forwardedProps,
      ...otherHandlers,
      ref: handleRootRef,
    };

    rootPropsGetters.forEach((rootPropsGetter) => {
      Object.assign(rootProps, rootPropsGetter(otherHandlers));
    });

    return rootProps;
  };

  const getEditorViewProps = <TOther extends EventHandlers = {}>(
    otherHandlers: TOther = {} as TOther,
  ) => {

    return {
      ...forwardedProps,
      ...otherHandlers,
    };
  };

  const getControlsProps = <TOther extends EventHandlers = {}>(
    otherHandlers: TOther = {} as TOther,
  ) => {
    return {
      ...forwardedProps,
      ...otherHandlers,
    };
  };

  const getTimelineProps = <TOther extends EventHandlers = {}>(
    otherHandlers: TOther = {} as TOther,
  ) => {
    return {
      ...forwardedProps,
      ...otherHandlers,
      tracks: contextValue.tracks ?? [],
      actionTypes: MediaControllers,
    };
  };

  const getBottomLeftProps = <TOther extends EventHandlers = {}>(
    otherHandlers: TOther = {} as TOther,
  ) => {
    return {
      ...forwardedProps,
      ...otherHandlers,
    };
  };

  const getBottomRightProps = <TOther extends EventHandlers = {}>(
    otherHandlers: TOther = {} as TOther,
  ) => {
    return {
      ...forwardedProps,
      ...otherHandlers,
    };
  };

  return {
    getRootProps,
    getEditorViewProps,
    getControlsProps,
    getTimelineProps,
    getBottomLeftProps,
    getBottomRightProps,
    rootRef: handleRootRef,
    contextValue,
    instance,
  };
};
