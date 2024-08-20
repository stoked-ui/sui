import * as React from 'react';
import useForkRef from '@mui/utils/useForkRef';
import { EventHandlers } from '@mui/base/utils';
import {
  VideoEditorAnyPluginSignature,
  VideoEditorInstance,
  VideoEditorPlugin,
  MergeSignaturesProperty,
  VideoEditorPublicAPI,
  ConvertSignaturesIntoPlugins,
} from '../models';
import {
  UseVideoEditorBaseProps,
  UseVideoEditorParameters,
  UseVideoEditorReturnValue,
  UseVideoEditorRootSlotProps,
} from './useVideoEditor.types';
import { useVideoEditorModels } from './useVideoEditorModels';
import { VideoEditorContextValue, VideoPluginsRunner } from '../VideoEditorProvider';
import { VIDEO_EDITOR_CORE_PLUGINS, VideoEditorCorePluginSignatures } from '../corePlugins';
import { extractPluginParamsFromProps } from './extractPluginParamsFromProps';

export function useVideoEditorApiInitialization<T>(
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

export const useVideoEditor = <
  TSignatures extends readonly VideoEditorAnyPluginSignature[],
  TProps extends Partial<UseVideoEditorBaseProps<TSignatures>>,
>({
    plugins: inPlugins,
    rootRef,
    props,
  }: UseVideoEditorParameters<TSignatures, TProps>): UseVideoEditorReturnValue<TSignatures> => {
  type TSignaturesWithCorePluginSignatures = readonly [
    ...VideoEditorCorePluginSignatures,
    ...TSignatures,
  ];
  const plugins = [
    ...VIDEO_EDITOR_CORE_PLUGINS,
    ...inPlugins,
  ] as unknown as ConvertSignaturesIntoPlugins<TSignaturesWithCorePluginSignatures>;

  const { pluginParams, forwardedProps, apiRef, experimentalFeatures, slots, slotProps } =
    extractPluginParamsFromProps<TSignatures, typeof props>({
      plugins,
      props,
    });

  const models = useVideoEditorModels<TSignatures>(plugins, pluginParams);
  const instanceRef = React.useRef({} as VideoEditorInstance<TSignatures>);
  const instance = instanceRef.current as VideoEditorInstance<TSignatures>;

  const publicAPI = useVideoEditorApiInitialization<VideoEditorPublicAPI<TSignatures>>(apiRef);

  const innerRootRef: React.RefObject<HTMLDivElement> = React.useRef(null);
  const handleRootRef = useForkRef(innerRootRef, rootRef);

  const [state, setState] = React.useState(() => {
    const temp = {} as MergeSignaturesProperty<TSignaturesWithCorePluginSignatures, 'state'>;
    plugins.forEach((plugin) => {
      if (plugin.getInitialState) {
        Object.assign(temp, plugin.getInitialState(pluginParams));
      }
    });

    return temp;
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
    instance: instance as VideoEditorInstance<any>,
    rootRef: innerRootRef,
  } as VideoEditorContextValue<TSignatures>;

  const rootPropsGetters: (<TOther extends EventHandlers = {}>(
    otherHandlers: TOther,
  ) => React.HTMLAttributes<HTMLDivElement>)[] = [];
  const runPlugin = (plugin: VideoEditorPlugin<VideoEditorAnyPluginSignature>) => {
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
    const rootProps: UseVideoEditorRootSlotProps = {
      role: 'video-editor',
      ...forwardedProps,
      ...otherHandlers,
      ref: handleRootRef,
    };

    rootPropsGetters.forEach((rootPropsGetter) => {
      Object.assign(rootProps, rootPropsGetter(otherHandlers));
    });

    return rootProps;
  };

  const getViewSpaceProps = <TOther extends EventHandlers = {}>(
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
    getViewSpaceProps,
    getControlsProps,
    getTimelineProps,
    getBottomLeftProps,
    getBottomRightProps,
    rootRef: handleRootRef,
    contextValue,
    instance,
  };
};
