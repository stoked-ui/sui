import * as React from 'react';
import {EventHandlers} from '@mui/base/utils';
import type {FileExplorerContextValue} from '../FileExplorerProvider';
import {
  ConvertSignaturesIntoPlugins,
  FileExplorerAnyPluginSignature,
  FileExplorerExperimentalFeatures,
  FileExplorerInstance,
  FileExplorerPublicAPI,
  MergeSignaturesProperty,
} from '../models';

/**
 * Parameters for the `UseFileExplorer` hook.
 *
 * @template TSignatures - The type of plugin signatures to use.
 * @template TProps - The types of props to pass to the component.
 */
export interface UseFileExplorerParameters<
  TSignatures extends readonly FileExplorerAnyPluginSignature[],
  TProps extends Partial<UseFileExplorerBaseProps<TSignatures>>,
> {
  /**
   * The plugins to use for file exploration.
   *
   * @type {ConvertSignaturesIntoPlugins<TSignatures>}
   */
  plugins: ConvertSignaturesIntoPlugins<TSignatures>;
  /**
   * The root reference for the component, if provided.
   *
   * @type {React.Ref<HTMLUListElement> | undefined}
   */
  rootRef?: React.Ref<HTMLUListElement> | undefined;
  /**
   * The props to pass to the component.
   *
   * @type {TProps}
   */
  props: TProps; // Omit<MergeSignaturesProperty<TSignatures, 'params'>, keyof UseFileExplorerBaseParameters<any>>
}

/**
 * Base props for the `UseFileExplorer` hook.
 *
 * @template TSignatures - The type of plugin signatures to use.
 */
export interface UseFileExplorerBaseProps<TSignatures extends readonly FileExplorerAnyPluginSignature[]> {
  /**
   * The API reference for the component, if provided.
   *
   * @type {React.MutableRefObject<FileExplorerPublicAPI<TSignatures> | undefined> | undefined}
   */
  apiRef: React.MutableRefObject<FileExplorerPublicAPI<TSignatures> | undefined> | undefined;
  /**
   * The slots props to pass to the component.
   *
   * @type {MergeSignaturesProperty<TSignatures, 'slots'>}
   */
  slots: MergeSignaturesProperty<TSignatures, 'slots'>;
  /**
   * The slot props to pass to the component.
   *
   * @type {MergeSignaturesProperty<TSignatures, 'slotProps'>}
   */
  slotProps: MergeSignaturesProperty<TSignatures, 'slotProps'>;
  /**
   * The experimental features to enable for the component.
   *
   * @type {FileExplorerExperimentalFeatures<TSignatures>}
   */
  experimentalFeatures: FileExplorerExperimentalFeatures<TSignatures>;
}

/**
 * Props for the root slot of the `UseFileExplorer` hook.
 *
 * @template TOther - Additional event handlers to pass to the component.
 */
export interface UseFileExplorerRootSlotProps
  extends Pick<
    React.HTMLAttributes<HTMLUListElement>,
    'onFocus' | 'onBlur' | 'onKeyDown' | 'id' | 'aria-multiselectable' | 'role' | 'tabIndex'
  > {
  /**
   * The reference to the root element.
   *
   * @type {React.Ref<HTMLUListElement>}
   */
  ref: React.Ref<HTMLUListElement>;
}

/**
 * Return values from the `UseFileExplorer` hook.
 *
 * @template TSignatures - The type of plugin signatures to use.
 */
export interface UseFileExplorerReturnValue<TSignatures extends readonly FileExplorerAnyPluginSignature[]> {
  /**
   * A function to get the root props for the component.
   *
   * @param otherHandlers - Additional event handlers to pass to the component (optional).
   * @returns {UseFileExplorerRootSlotProps}
   */
  getRootProps: <TOther extends EventHandlers = {}>(
    otherHandlers?: TOther,
  ) => UseFileExplorerRootSlotProps;
  /**
   * A reference to the root element, if available.
   *
   * @type {React.RefCallback<HTMLUListElement> | null}
   */
  rootRef: React.RefCallback<HTMLUListElement> | null;
  /**
   * The context value for the component.
   *
   * @type {FileExplorerContextValue<TSignatures>}
   */
  contextValue: FileExplorerContextValue<TSignatures>;
  /**
   * An instance of the `FileExplorerInstance` class.
   *
   * @type {FileExplorerInstance<TSignatures>}
   */
  instance: FileExplorerInstance<TSignatures>;
}