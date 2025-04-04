/**
 * @fileoverview FileExplorer hook parameters
 *
 * This file contains the default props for the UseFile hook.
 */

import * as React from 'react';
import { MediaType } from '@stoked-ui/media-selector'
import {FileId} from '../models';
import {MuiCancellableEventHandler} from '../internals/models/MuiCancellableEvent';
import {FileExplorerPublicAPI} from '../internals/models';
import {UseFileMinimalPlugins, UseFileOptionalPlugins} from '../internals/models/plugin.types';
import {UseFileStatus} from '../internals/models/UseFileStatus';

/**
 * @interface UseFileParameters
 *
 * @description Parameters for the UseFile hook.
 *
 * @property {string} [id] - The id attribute of the item. If not provided, it will be generated.
 * @property {boolean} [disabled=false] - If true, the item is disabled.
 * @property {React.Ref<HTMLLIElement>} [rootRef] - The root element ref of the item.
 * @property {React.ReactNode} [children] - The content of the component.
 * @property {MediaType} [mediaType] - The media type of the file.
 * @property {string} [type] - The type of the file.
 * @property {number} [size] - The size of the file.
 * @property {number} [lastModified] - The last modified date of the file.
 * @property {string} [name] - The name of the file.
 */
export interface UseFileParameters {
  id?: string;
  disabled?: boolean;
  rootRef?: React.Ref<HTMLLIElement>;
  children?: React.ReactNode;
  mediaType?: MediaType;
  type?: string;
  size?: number;
  lastModified?: number;
  name?: string;
}

/**
 * @interface UseFileReturnValue
 *
 * @description Return value of the UseFile hook.
 *
 * @property {UseFileRootSlotProps} [getRootProps] - Props for the root slot.
 * @property {UseFileContentSlotProps} [getContentProps] - Props for the content slot.
 * @property {UseFileLabelSlotProps} [getLabelProps] - Props for the label slot.
 * @property {UseFileCheckboxSlotProps} [getCheckboxProps] - Props for the checkbox slot.
 * @property {UseFileIconContainerSlotProps} [getIconContainerProps] - Props for the iconContainer slot.
 * @property {UseFileGroupTransitionSlotProps} [getGroupTransitionProps] - Props for the GroupTransition slot.
 * @property {React.RefCallback<HTMLLIElement> | null} [rootRef] - A ref to the component's root DOM element.
 * @property {UseFileStatus} [status] - The current status of the item.
 * @property {FileExplorerPublicAPI<UseFileMinimalPlugins, UseFileOptionalPlugins>} [publicAPI] - The object that allows FileExplorer View manipulation.
 */
export interface UseFileReturnValue<TSignatures extends UseFileMinimalPlugins, TOptionalSignatures extends UseFileOptionalPlugins> {
  /**
   * @description Resolver for the root slot's props.
   *
   * @param {ExternalProps} externalProps Additional props for the root slot
   * @returns {UseFileRootSlotProps<ExternalProps>} Props that should be spread on the root slot
   */
  getRootProps: <ExternalProps extends Record<string, any> = {}>(
    externalProps?: ExternalProps,
  ) => UseFileRootSlotProps<ExternalProps>;

  /**
   * @description Resolver for the content slot's props.
   *
   * @param {ExternalProps} externalProps Additional props for the content slot
   * @returns {UseFileContentSlotProps<ExternalProps>} Props that should be spread on the content
   *   slot
   */
  getContentProps: <ExternalProps extends Record<string, any> = {}>(
    externalProps?: ExternalProps,
  ) => UseFileContentSlotProps<ExternalProps>;

  /**
   * @description Resolver for the label slot's props.
   *
   * @param {ExternalProps} externalProps Additional props for the label slot
   * @returns {UseFileLabelSlotProps<ExternalProps>} Props that should be spread on the label slot
   */
  getLabelProps: <ExternalProps extends Record<string, any> = {}>(
    externalProps?: ExternalProps,
  ) => UseFileLabelSlotProps<ExternalProps>;

  /**
   * @description Resolver for the checkbox slot's props.
   *
   * @param {ExternalProps} externalProps Additional props for the checkbox slot
   * @returns {UseFileCheckboxSlotProps<ExternalProps>} Props that should be spread on the checkbox
   *   slot
   */
  getCheckboxProps: <ExternalProps extends Record<string, any> = {}>(
    externalProps?: ExternalProps,
  ) => UseFileCheckboxSlotProps<ExternalProps>;

  /**
   * @description Resolver for the iconContainer slot's props.
   *
   * @param {ExternalProps} externalProps Additional props for the iconContainer slot
   * @returns {UseFileIconContainerSlotProps<ExternalProps>} Props that should be spread on the
   *   iconContainer slot
   */
  getIconContainerProps: <ExternalProps extends Record<string, any> = {}>(
    externalProps?: ExternalProps,
  ) => UseFileIconContainerSlotProps<ExternalProps>;

  /**
   * @description Resolver for the GroupTransition slot's props.
   *
   * @param {ExternalProps} externalProps Additional props for the GroupTransition slot
   * @returns {UseFileGroupTransitionSlotProps<ExternalProps>} Props that should be spread on the
   *   GroupTransition slot
   */
  getGroupTransitionProps: <ExternalProps extends Record<string, any> = {}>(
    externalProps?: ExternalProps,
  ) => UseFileGroupTransitionSlotProps<ExternalProps>;

  /**
   * @description A ref to the component's root DOM element.
   */
  rootRef: React.RefCallback<HTMLLIElement> | null;

  /**
   * @description The current status of the item.
   */
  status: UseFileStatus;

  /**
   * @description The object that allows FileExplorer View manipulation.
   */
  publicAPI: FileExplorerPublicAPI<TSignatures, TOptionalSignatures>;
}

/**
 * @interface UseFileRootSlotProps
 *
 * @property {UseFileParameters} [props] - Props for the root slot.
 */
export interface UseFileRootSlotProps<ExternalProps extends Record<string, any> = {}> {
  props?: UseFileParameters;
}

/**
 * @interface UseFileContentSlotProps
 *
 * @property {UseFileParameters} [props] - Props for the content slot.
 */
export interface UseFileContentSlotProps<ExternalProps extends Record<string, any> = {}> {
  props?: UseFileParameters;
}

/**
 * @interface UseFileLabelSlotProps
 *
 * @property {UseFileParameters} [props] - Props for the label slot.
 */
export interface UseFileLabelSlotProps<ExternalProps extends Record<string, any> = {}> {
  props?: UseFileParameters;
}

/**
 * @interface UseFileCheckboxSlotProps
 *
 * @property {UseFileParameters} [props] - Props for the checkbox slot.
 */
export interface UseFileCheckboxSlotProps<ExternalProps extends Record<string, any> = {}> {
  props?: UseFileParameters;
}

/**
 * @interface UseFileIconContainerSlotProps
 *
 * @property {UseFileParameters} [props] - Props for the iconContainer slot.
 */
export interface UseFileIconContainerSlotProps<ExternalProps extends Record<string, any> = {}> {
  props?: UseFileParameters;
}

/**
 * @interface UseFileGroupTransitionSlotProps
 *
 * @property {UseFileParameters} [props] - Props for the GroupTransition slot.
 */
export interface UseFileGroupTransitionSlotProps<ExternalProps extends Record<string, any> = {}> {
  props?: UseFileParameters;
}