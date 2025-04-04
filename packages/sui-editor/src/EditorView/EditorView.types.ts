import * as React from 'react';
import {Theme} from '@mui/material/styles';
import {SxProps} from '@mui/system';
import {SlotComponentProps} from '@mui/base/utils';
import { IMediaFile } from "@stoked-ui/media-selector";
import {EditorViewClasses} from './editorViewClasses';



/**
 * Configuration options for the EditorView component.
 */
export interface EditorViewSlots {
  /**
   * Element type to render at the root of the editor view.
   * Defaults to EditorViewRoot.
   */
  root?: React.ElementType;
  
  /**
   * Element type to use as a renderer in the editor view.
   */
  renderer?: React.ElementType;
  
  /**
   * Element type to use for previewing media files in the editor view.
   */
  preview?: React.ElementType;
}

/**
 * Props for each component slot in the EditorView.
 */
export interface EditorViewSlotProps<R extends IMediaFile, Multiple extends boolean | undefined> {
  /**
   * Props for the root element.
   */
  root?: SlotComponentProps<'div', {}, EditorViewProps<R, Multiple>>;
  
  /**
   * Props for the renderer canvas element.
   */
  renderer?: SlotComponentProps<'canvas', {}, {}>;
  
  /**
   * Props for the preview container element.
   */
  preview?: SlotComponentProps<'div', {}, {}>;
}

/**
 * Base props for the EditorView component, extending HTML attributes.
 */
export interface EditorViewPropsBase extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Optional CSS class name to apply to the editor view.
   */
  className?: string;
  
  /**
   * Override or extend the styles applied to the component.
   */
  classes?: Partial<EditorViewClasses>;
  
  /**
   * System prop for defining system overrides and additional CSS styles.
   */
  sx?: SxProps<Theme>;
}

/**
 * Props for the EditorView component, extending the base props with additional slots and slot props.
 */
export interface EditorViewProps<R extends IMediaFile, Multiple extends boolean | undefined>
  extends EditorViewPropsBase {
  /**
   * Configuration options for each component slot in the editor view.
   * Defaults to an empty object.
   */
  slots?: EditorViewSlots;
  
  /**
   * Props used for each component slot in the editor view.
   * Defaults to an empty object.
   */
  slotProps?: EditorViewSlotProps<R, Multiple>;
  
  /**
   * Child elements or components to render within the editor view.
   */
  children?: React.ReactNode;
  
  /**
   * Array of view buttons to display within the editor view.
   */
  viewButtons?: React.ReactElement[];
  
  /**
   * Index at which to make a view button appear on screen.
   */
  viewButtonAppear?: number;
  
  /**
   * Index at which to make a view button enter the visible area.
   */
  viewButtonEnter?: number;
  
  /**
   * Index at which to make a view button exit the visible area.
   */
  viewButtonExit?: number;
  
  /**
   * Unique ID for the editor view instance.
   */
  editorId: string;
}