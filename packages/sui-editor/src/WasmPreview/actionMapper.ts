/**
 * Action Mapper - Maps editor actions/tracks to WASM compositor layers
 *
 * This module bridges the editor's action/track system with the WASM compositor,
 * converting editor properties to compositor layer definitions.
 */

import type { CompositorLayer, LayerContent, BlendMode as WasmBlendMode } from './types';
import { createDefaultTransform } from './types';
import type { IEditorAction, BlendMode as EditorBlendMode, Fit } from '../EditorAction/EditorAction';
import type { IEditorTrack } from '../EditorTrack/EditorTrack';
import type { IEditorEngine } from '../EditorEngine/EditorEngine.types';

/**
 * Map editor blend mode to WASM compositor blend mode
 *
 * Editor uses CSS-style names (kebab-case), WASM uses camelCase
 */
function mapBlendMode(editorBlendMode?: EditorBlendMode): WasmBlendMode {
  if (!editorBlendMode) {
    return 'normal';
  }

  const mapping: Record<string, WasmBlendMode> = {
    'normal': 'normal',
    'multiply': 'multiply',
    'screen': 'screen',
    'overlay': 'overlay',
    'darken': 'darken',
    'lighten': 'lighten',
    'color-dodge': 'colorDodge',
    'color-burn': 'colorBurn',
    'hard-light': 'hardLight',
    'soft-light': 'softLight',
    'difference': 'difference',
    'exclusion': 'exclusion',
    'hue': 'hue',
    'saturation': 'saturation',
    'color': 'color',
    'luminosity': 'luminosity',
  };

  return mapping[editorBlendMode] || 'normal';
}

/**
 * Calculate scale transform based on fit mode
 *
 * Implements CSS object-fit behavior for video/image content
 *
 * @param sourceWidth - Original content width
 * @param sourceHeight - Original content height
 * @param renderWidth - Target render width
 * @param renderHeight - Target render height
 * @param fit - Fit mode ('fill', 'contain', 'cover', 'none')
 * @returns Scale factors for x and y
 */
export function calculateFitTransform(
  sourceWidth: number,
  sourceHeight: number,
  renderWidth: number,
  renderHeight: number,
  fit: Fit
): { scaleX: number; scaleY: number } {
  // Avoid division by zero
  if (sourceWidth === 0 || sourceHeight === 0) {
    return { scaleX: 1, scaleY: 1 };
  }

  switch (fit) {
    case 'fill':
      // Stretch to fill - may distort aspect ratio
      return {
        scaleX: renderWidth / sourceWidth,
        scaleY: renderHeight / sourceHeight,
      };

    case 'contain':
      // Scale to fit inside, maintaining aspect ratio
      {
        const scale = Math.min(
          renderWidth / sourceWidth,
          renderHeight / sourceHeight
        );
        return { scaleX: scale, scaleY: scale };
      }

    case 'cover':
      // Scale to cover, maintaining aspect ratio (may crop)
      {
        const scale = Math.max(
          renderWidth / sourceWidth,
          renderHeight / sourceHeight
        );
        return { scaleX: scale, scaleY: scale };
      }

    case 'none':
    default:
      // No scaling
      return { scaleX: 1, scaleY: 1 };
  }
}

/**
 * Convert editor action/track to WASM compositor layer
 *
 * Maps editor properties to compositor layer properties, handling different
 * track types (video, image, text, audio).
 *
 * @param action - The editor action to convert
 * @param track - The editor track containing this action
 * @param engine - The editor engine (provides render dimensions)
 * @returns CompositorLayer or null if the track type is audio (no visual)
 */
export function actionToWasmLayer(
  action: IEditorAction,
  track: IEditorTrack,
  engine: IEditorEngine
): CompositorLayer | null {
  const controllerType = track.controller?.id || 'video';

  // Audio tracks have no visual representation
  if (controllerType === 'audio') {
    return null;
  }

  // Determine layer type from controller
  let layerType: 'video' | 'image' | 'text';
  let content: LayerContent;

  switch (controllerType) {
    case 'video':
      layerType = 'video';
      content = {
        type: 'video',
        elementId: track.id,
      };
      break;

    case 'image':
      layerType = 'image';
      content = {
        type: 'image',
        url: track.file?.url || '',
      };
      break;

    case 'text':
      layerType = 'text';
      // Extract text properties from action
      content = {
        type: 'text',
        text: action.name || 'Text',
        fontFamily: 'system-ui',
        fontSize: 16,
        color: [255, 255, 255, 255],
      };
      break;

    default:
      // Unknown controller type - treat as image
      layerType = 'image';
      content = {
        type: 'image',
        url: track.file?.url || '',
      };
  }

  // Build transform from action properties
  const transform = createDefaultTransform();

  // Position
  transform.x = action.x ?? 0;
  transform.y = action.y ?? 0;

  // Calculate scale based on fit mode
  const sourceWidth = action.width || 1920;
  const sourceHeight = action.height || 1080;
  const renderWidth = engine.renderWidth;
  const renderHeight = engine.renderHeight;
  const fit = action.fit || 'none';

  const { scaleX, scaleY } = calculateFitTransform(
    sourceWidth,
    sourceHeight,
    renderWidth,
    renderHeight,
    fit
  );

  transform.scaleX = scaleX;
  transform.scaleY = scaleY;

  // Rotation (default to 0)
  transform.rotation = 0;

  // Opacity - check action.style first, then default to 1
  if (action.style?.opacity !== undefined) {
    // CSS opacity is 0-1, same as compositor
    transform.opacity = typeof action.style.opacity === 'string'
      ? parseFloat(action.style.opacity)
      : action.style.opacity;
  } else {
    transform.opacity = 1;
  }

  // Blend mode - prefer action blend mode, fall back to track blend mode
  const blendMode = mapBlendMode(action.blendMode || track.blendMode);

  // Z-index from action.z
  const zIndex = action.z ?? 0;

  // Visibility - track can be hidden
  const visible = !track.hidden;

  // Build the compositor layer
  const layer: CompositorLayer = {
    id: action.id,
    type: layerType,
    content,
    transform,
    blendMode,
    visible,
    zIndex,
  };

  return layer;
}
