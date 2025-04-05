/**
 * Represents the instance of the UseEditorMetadata plugin.
 * @typedef {object} UseEditorMetadataInstance
 * @property {function} onKeyDown - Event handler for key down events.
 */

/**
 * Represents the parameters for the UseEditorMetadata plugin.
 * @typedef {object} UseEditorMetadataParameters
 * @property {EditorFile} [file] - The EditorFile associated with the metadata.
 * @property {string} [url] - The URL associated with the metadata.
 */

/**
 * Represents the defaultized parameters for the UseEditorMetadata plugin.
 * @typedef {object} UseEditorMetadataDefaultizedParameters
 * @property {EditorFile} file - The defaultized EditorFile.
 * @property {string} url - The defaultized URL.
 */

/**
 * Represents the signature for the UseEditorMetadata plugin.
 * @typedef {object} UseEditorMetadataSignature
 * @property {UseEditorMetadataParameters} params - The parameters for the plugin.
 * @property {UseEditorMetadataDefaultizedParameters} defaultizedParams - The defaultized parameters for the plugin.
 * @property {UseEditorMetadataInstance} instance - The instance of the plugin.
 * @property {UseEditorMetadataDefaultizedParameters} contextValue - The context value for the plugin.
 * @property {UseEditorKeyboardSignature[]} dependencies - The dependencies of the plugin.
 */

import type { ITimelineAction, ITimelineTrack } from '@stoked-ui/timeline';
import EditorFile from '../../../EditorFile/EditorFile';
import type { DefaultizedProps, EditorPluginSignature } from '../../models';
import { UseEditorKeyboardSignature } from '../useEditorKeyboard';

/**
 * Represents the UseEditorMetadataInstance interface.
 * @interface
 * @description Instance of the UseEditorMetadata plugin.
 */
export interface UseEditorMetadataInstance {
    /**
     * Event handler for key down events.
     * @param {any} event - The key down event.
     * @param {ITimelineAction} action - The timeline action associated with the event.
     * @returns {void}
     */
    onKeyDown: (event: any, action: ITimelineAction) => void;
}

/**
 * Represents the UseEditorMetadataParameters interface.
 * @interface
 * @description Parameters for the UseEditorMetadata plugin.
 */
export interface UseEditorMetadataParameters {
    file?: EditorFile; // The EditorFile associated with the metadata.
    url?: string; // The URL associated with the metadata.
}

/**
 * Represents the UseEditorMetadataDefaultizedParameters type.
 * @typedef {DefaultizedProps<UseEditorMetadataParameters, 'file' | 'url'>} UseEditorMetadataDefaultizedParameters
 */

/**
 * Represents the UseEditorMetadataSignature type.
 * @typedef {EditorPluginSignature<{
 *     params: UseEditorMetadataParameters;
 *     defaultizedParams: UseEditorMetadataDefaultizedParameters;
 *     instance: UseEditorMetadataInstance;
 *     contextValue: UseEditorMetadataDefaultizedParameters;
 *     dependencies: [UseEditorKeyboardSignature];
 * }>} UseEditorMetadataSignature
 */