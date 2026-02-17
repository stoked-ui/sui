import { Controller, IController } from '@stoked-ui/timeline';
import {
  EditorControllerParams,
  EditorGetItemParams,
  EditorPreloadParams,
} from './EditorControllerParams';
import type {
  CompositorLayer,
  LayerTransform,
  BlendMode,
  LayerType,
  LayerContent,
} from '../WasmPreview/types';
import { createDefaultTransform } from '../WasmPreview/types';

/**
 * PreviewRenderer instance interface from WASM
 */
interface PreviewRendererInstance {
  render_frame(layersJson: string): void;
  clear(): void;
  get_metrics(): string;
  free(): void;
}

/**
 * CompositorController manages compositor layers through the enter/update/leave lifecycle.
 * It bridges the gap between the timeline system and the WASM compositor renderer.
 *
 * Key responsibilities:
 * - Convert timeline actions/tracks to compositor layers
 * - Maintain active layers (those currently in the timeline view)
 * - Manage layer transformations and updates
 * - Interface with the WASM PreviewRenderer to render composite frames
 */
class CompositorControl extends Controller<CompositorLayer> implements IController {
  /**
   * Map of active compositor layers (layers currently visible in the timeline)
   * Key: action.id or track.id
   */
  private activeLayers: Map<string, CompositorLayer> = new Map();

  /**
   * Reference to the WASM PreviewRenderer instance
   * Set via setRenderer(), can be null if renderer not yet initialized
   */
  private renderer: PreviewRendererInstance | null = null;

  logging: boolean = false;

  constructor() {
    super({
      id: 'compositor',
      name: 'Compositor',
      color: '#9C27B0',
      colorSecondary: '#BA68C8',
    });
  }

  /**
   * Set the WASM renderer instance
   * @param renderer - PreviewRenderer instance or null to clear
   */
  setRenderer(renderer: PreviewRendererInstance | null): void {
    this.renderer = renderer;
    if (renderer) {
      this.log({ action: { id: 'compositor', name: 'compositor' } as any, time: 0 }, 'Renderer set');
    }
  }

  /**
   * Get the compositor layer for an action/track
   * Returns from cache (activeLayers) if available
   */
  getItem(params: EditorGetItemParams): CompositorLayer {
    const { track, action } = params;
    const layerId = action.id || track.id;

    // Return cached layer if exists
    const cached = this.activeLayers.get(layerId);
    if (cached) {
      return cached;
    }

    // Create new layer from action/track
    const layer = this.actionToCompositorLayer(params);
    this.activeLayers.set(layerId, layer);
    return layer;
  }

  /**
   * Convert an action/track to a CompositorLayer
   * This is a simple inline conversion - will be replaced by actionMapper from 5.3
   */
  private actionToCompositorLayer(params: EditorGetItemParams): CompositorLayer {
    const { action, track } = params;

    // Determine layer type from action/track
    let layerType: LayerType = 'solidColor';
    let content: LayerContent = {
      type: 'solidColor',
      color: [128, 128, 128, 255], // Default gray
    };

    // Try to infer type from track file or action properties
    if (track.file) {
      const mimeType = track.file.type?.toLowerCase() || '';
      if (mimeType.startsWith('video')) {
        layerType = 'video';
        content = {
          type: 'video',
          elementId: track.id, // Use track ID as element ID
        };
      } else if (mimeType.startsWith('image')) {
        layerType = 'image';
        content = {
          type: 'image',
          url: track.file.url || '',
        };
      }
    }

    // Create transform from action properties
    // Use type assertion for optional transform properties
    const actionAny = action as any;
    const transform: LayerTransform = {
      ...createDefaultTransform(),
      x: action.x ?? 0,
      y: action.y ?? 0,
      scaleX: actionAny.scaleX ?? 1,
      scaleY: actionAny.scaleY ?? 1,
      rotation: actionAny.rotation ?? 0,
      opacity: actionAny.opacity ?? 1,
    };

    // Get blend mode (default to 'normal')
    const blendMode: BlendMode = (action.blendMode || track.blendMode || 'normal') as BlendMode;

    // Use z from action if available, otherwise use 0
    const trackAny = track as any;
    const zIndex = action.z ?? trackAny.zIndex ?? 0;

    const layer: CompositorLayer = {
      id: action.id || track.id,
      type: layerType,
      content,
      transform,
      blendMode,
      visible: !track.hidden,
      zIndex,
    };

    return layer;
  }

  /**
   * Preload - no preloading needed for compositor
   * The actual media preloading is handled by media controllers
   */
  async preload(params: EditorPreloadParams): Promise<any> {
    return params.action;
  }

  /**
   * Enter lifecycle - called when an action enters the timeline view
   * Converts action/track to a compositor layer, adds to active layers, and renders
   */
  enter(params: EditorControllerParams): void {
    const { action, track, engine } = params;

    if (!this.isValid(engine, track)) {
      return;
    }

    const layer = this.getItem(params as EditorGetItemParams);
    this.log(params, `enter layer ${layer.id} (${layer.type})`);

    // Add to active layers
    this.activeLayers.set(layer.id, layer);

    // Render the composite
    this.renderComposite();
  }

  /**
   * Update lifecycle - called during playback or scrubbing
   * Updates layer transform based on current time and re-renders
   */
  update(params: EditorControllerParams): void {
    const { action, track, engine, time } = params;

    if (!this.isValid(engine, track)) {
      return;
    }

    const layerId = action.id || track.id;
    const layer = this.activeLayers.get(layerId);

    if (!layer) {
      this.log(params, `update: layer ${layerId} not found in active layers`);
      return;
    }

    // Update transform based on current time
    // For now, just update position - can be extended for keyframe interpolation
    const actionTime = Controller.getActionTime(params);

    // Update transform properties if action has them (use type assertion for optional properties)
    const actionAny = action as any;
    if (action.x !== undefined) layer.transform.x = action.x;
    if (action.y !== undefined) layer.transform.y = action.y;
    if (actionAny.scaleX !== undefined) layer.transform.scaleX = actionAny.scaleX;
    if (actionAny.scaleY !== undefined) layer.transform.scaleY = actionAny.scaleY;
    if (actionAny.rotation !== undefined) layer.transform.rotation = actionAny.rotation;
    if (actionAny.opacity !== undefined) layer.transform.opacity = actionAny.opacity;

    // Update visibility
    layer.visible = !track.hidden;

    this.log(params, `update layer ${layer.id} at time ${time} (actionTime: ${actionTime})`);

    // Re-render composite
    this.renderComposite();
  }

  /**
   * Leave lifecycle - called when an action leaves the timeline view
   * Removes layer from active layers and re-renders
   */
  leave(params: EditorControllerParams): void {
    const { action, track, engine } = params;

    if (!this.isValid(engine, track)) {
      return;
    }

    const layerId = action.id || track.id;
    this.log(params, `leave layer ${layerId}`);

    // Remove from active layers
    this.activeLayers.delete(layerId);

    // Re-render composite without this layer
    this.renderComposite();
  }

  /**
   * Start playback - no-op for compositor, just renders current state
   */
  start(params: EditorControllerParams): void {
    const { track, engine } = params;

    if (!this.isValid(engine, track)) {
      return;
    }

    this.log(params, 'start');
    this.renderComposite();
  }

  /**
   * Stop playback - no-op for compositor
   */
  stop(params: EditorControllerParams): void {
    const { track, engine } = params;

    if (!this.isValid(engine, track)) {
      return;
    }

    this.log(params, 'stop');
  }

  /**
   * Render the composite frame
   * Sorts active layers by z-index, serializes to JSON, and calls WASM renderer
   */
  private renderComposite(): void {
    if (!this.renderer) {
      // Renderer not set yet - this is normal during initialization
      return;
    }

    // Convert active layers map to array and sort by z-index
    const layers = Array.from(this.activeLayers.values()).sort((a, b) => a.zIndex - b.zIndex);

    // Serialize layers to JSON and render
    try {
      const layersJson = JSON.stringify(layers);
      this.renderer.render_frame(layersJson);

      if (this.logging) {
        console.info(`[compositor] Rendered ${layers.length} layers`);
      }
    } catch (error) {
      console.error('[compositor] Render failed:', error);
    }
  }

  /**
   * Cleanup - clear active layers and renderer reference
   */
  destroy(): void {
    this.activeLayers.clear();
    this.renderer = null;
    this.cacheMap = {};
  }
}

export { CompositorControl };
const CompositorController = new CompositorControl();
export default CompositorController;
