import * as React from 'react';
import useForkRef from '@mui/utils/useForkRef';
import {EventHandlers} from '@mui/base/utils';
import {
  ConvertSignaturesIntoPlugins,
  FileExplorerAnyPluginSignature,
  FileExplorerInstance,
  FileExplorerPlugin,
  FileExplorerPublicAPI,
  FileExplorerRootWrapper,
  FileWrapper,
  MergeSignaturesProperty,
} from '../models';
import {
  UseFileExplorerBaseProps,
  UseFileExplorerParameters,
  UseFileExplorerReturnValue,
  UseFileExplorerRootSlotProps,
} from './useFileExplorer.types';
import {useFileExplorerModels} from './useFileExplorerModels';
import {FileExplorerContextValue, FilePluginsRunner} from '../FileExplorerProvider';
import {FILE_EXPLORER_VIEW_CORE_PLUGINS, FileExplorerCorePluginSignatures} from '../corePlugins';
import {extractPluginParamsFromProps} from './extractPluginParamsFromProps';
import {UseFileStatus} from '../models/UseFileStatus';
import {FileBase} from "../../models";

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

export const useFileExplorer = <
  TSignatures extends readonly FileExplorerAnyPluginSignature[],
  TProps extends Partial<UseFileExplorerBaseProps<TSignatures>>,
>({
  plugins: inPlugins,
  rootRef,
  props,
}: UseFileExplorerParameters<TSignatures, TProps>): UseFileExplorerReturnValue<TSignatures> => {
  type TSignaturesWithCorePluginSignatures = readonly [
    ...FileExplorerCorePluginSignatures,
    ...TSignatures,
  ];
  const plugins = [
    ...FILE_EXPLORER_VIEW_CORE_PLUGINS,
    ...inPlugins,
  ] as unknown as ConvertSignaturesIntoPlugins<TSignaturesWithCorePluginSignatures>;

  if ('dndInternal' in props && 'dndTrash' in props && 'items' in props) {
    props.items = [...(props?.items ?? []) as FileBase[], {
      id: 'trash',
      label: 'Trash',
      type: 'folder',
      size: 0,
      lastModified: Date.now(),
    }]
  }

  const { pluginParams, forwardedProps, apiRef, experimentalFeatures, slots, slotProps } =
    extractPluginParamsFromProps<TSignatures, typeof props>({
      plugins,
      props,
    });

  const models = useFileExplorerModels<TSignatures>(plugins, pluginParams);
  const instanceRef = React.useRef({} as FileExplorerInstance<TSignatures>);
  const instance = instanceRef.current as FileExplorerInstance<TSignatures>;

  const publicAPI = useFileExplorerApiInitialization<FileExplorerPublicAPI<TSignatures>>(apiRef);

  const innerRootRef: React.RefObject<HTMLUListElement> = React.useRef(null);
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

  const itemWrappers = plugins
    .map((plugin) => plugin.wrapItem)
    .filter((wrapItem): wrapItem is FileWrapper<any> => !!wrapItem);
  const wrapItem: FileWrapper<TSignatures> = ({ itemId, children }) => {
    let finalChildren: React.ReactNode = children;
    itemWrappers.forEach((itemWrapper) => {
      finalChildren = itemWrapper({ itemId, children: finalChildren, instance });
    });

    return finalChildren;
  };

  const rootWrappers = plugins
    .map((plugin) => plugin.wrapRoot)
    .filter((wrapRoot): wrapRoot is FileExplorerRootWrapper<any> => !!wrapRoot)
    // The wrappers are reversed to ensure that the first wrapper is the outermost one.
    .reverse();
  const wrapRoot: FileExplorerRootWrapper<TSignatures> = ({ children }) => {
    let finalChildren: React.ReactNode = children;
    rootWrappers.forEach((rootWrapper) => {
      finalChildren = rootWrapper({ children: finalChildren, instance });
    });

    return finalChildren;
  };

  const runItemPlugins: FilePluginsRunner = (itemPluginProps) => {
    let finalRootRef: React.RefCallback<HTMLLIElement> | null = null;
    let finalContentRef: React.RefCallback<HTMLElement> | null = null;
    let finalStatus: UseFileStatus | null = null;
    plugins.forEach((plugin) => {
      if (!plugin.itemPlugin) {
        return;
      }

      const itemPluginResponse = plugin.itemPlugin({
        props: itemPluginProps,
        rootRef: finalRootRef,
        contentRef: finalContentRef,
        instance,
        status: finalStatus
      });
      if (itemPluginResponse?.rootRef) {
        finalRootRef = itemPluginResponse.rootRef;
      }
      if (itemPluginResponse?.contentRef) {
        finalContentRef = itemPluginResponse.contentRef;
      }
      if (itemPluginResponse?.status) {
        finalStatus = {...finalStatus, ...itemPluginResponse.status};
      }

    });

    return {
      contentRef: finalContentRef,
      rootRef: finalRootRef,
      status: finalStatus
    };
  };

  const contextValue = {
    publicAPI,
    wrapItem,
    wrapRoot,
    runItemPlugins,
    instance: instance as FileExplorerInstance<any>,
    rootRef: innerRootRef,
  } as FileExplorerContextValue<TSignatures>;

  const rootPropsGetters: (<TOther extends EventHandlers = {}>(
    otherHandlers: TOther,
  ) => React.HTMLAttributes<HTMLUListElement>)[] = [];
  const runPlugin = (plugin: FileExplorerPlugin<FileExplorerAnyPluginSignature>) => {
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
    const rootProps: UseFileExplorerRootSlotProps = {
      role: 'fileExplorer',
      ...forwardedProps,
      ...otherHandlers,
      ref: handleRootRef,
    };

    rootPropsGetters.forEach((rootPropsGetter) => {
      Object.assign(rootProps, rootPropsGetter(otherHandlers));
    });

    return rootProps;
  };

  return {
    getRootProps,
    rootRef: handleRootRef,
    contextValue,
    instance,
  };
};
