/**
 * WASM Preview Renderer exports
 *
 * Browser-based video preview using Rust/WASM compositor
 */

// Export all types
export type {
  BlendMode,
  LayerTransform,
  EasingType,
  StepPosition,
  Keyframe,
  LayerKeyframes,
  LayerType,
  EffectType,
  GradientType,
  GradientStop,
  LayerEffect,
  LayerContent,
  CompositorLayer,
  TimelineConfig,
  TimelineLayerConfig,
  RenderMetrics,
  WasmRendererState,
} from './types';

// Export helper functions
export {
  createDefaultTransform,
  createDefaultLayer,
  createLinearKeyframe,
  createEaseInOutKeyframe,
  createCubicBezierKeyframe,
  createStepsKeyframe,
} from './types';

// Export hook
export { useWasmRenderer } from './useWasmRenderer';

// Export deprecated types (for backwards compatibility)
export type { WasmTransform, WasmLayer } from './useWasmRenderer';

// Export legacy helper functions (for backwards compatibility)
export { createTransform, createSolidColorLayer } from './useWasmRenderer';

// Export demo component
export { WasmPreviewDemo } from './WasmPreviewDemo';
export default WasmPreviewDemo;
