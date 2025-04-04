import * as React from 'react';
import {EditorContextValue} from './EditorProvider.types';

/**
 * Provides a context for the editor component.
 *
 * The EditorContext is used to share data between components in the editor.
 * It can be imported and used by child components to access shared data.
 */

export const EditorContext = React.createContext<EditorContextValue<any, []> | null>(null);