/**
 * @module Exports
 *
 * @description This module exports the EditorProvider component and its related types.
 */

export { EditorProvider } from './EditorProvider';

/**
 * @typedef {Object} EditorProviderProps
 * 
 * @property {object} [context] - The editor context value.
 * @property {Function} [pluginsRunner] - A function to run video plugins.
 */

/**
 * @typedef {Object} EditorContextValue
 * 
 * @property {string} id - The editor ID.
 * @property {Array<string>} plugins - An array of plugin IDs.
 */

export type {
  EditorProviderProps,
  EditorContextValue,
  VideoPluginsRunner,
} from './EditorProvider.types';