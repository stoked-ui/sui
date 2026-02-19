/**
 * TypeScript type definitions for WASM video renderer
 *
 * These types match the Rust WASM bindings in packages/sui-video-renderer/wasm-preview
 * and provide full type safety for the browser-based video preview renderer.
 */

/**
 * Blend modes determine how layers combine during composition
 *
 * Matches the Rust `BlendMode` enum in compositor/src/blend.rs
 */
export type BlendMode =
  | 'normal'
  | 'multiply'
  | 'screen'
  | 'overlay'
  | 'add'
  | 'subtract'
  | 'lighten'
  | 'darken'
  | 'softLight'
  | 'hardLight'
  | 'colorDodge'
  | 'colorBurn'
  | 'difference'
  | 'exclusion'
  | 'hue'
  | 'saturation'
  | 'color'
  | 'luminosity';

/**
 * Layer transformation parameters
 *
 * Matches the Rust `WasmTransform` struct with additional anchor and skew properties.
 * Uses camelCase for TypeScript convention (Rust uses snake_case).
 */
export interface LayerTransform {
  /** X position in pixels */
  x: number;
  /** Y position in pixels */
  y: number;
  /** X scale factor (1.0 = 100%) */
  scaleX: number;
  /** Y scale factor (1.0 = 100%) */
  scaleY: number;
  /** Rotation in radians */
  rotation: number;
  /** Opacity (0.0 = transparent, 1.0 = opaque) */
  opacity: number;
  /** X anchor point for transforms (0.0-1.0, default 0.5 = center) */
  anchorX: number;
  /** Y anchor point for transforms (0.0-1.0, default 0.5 = center) */
  anchorY: number;
  /** X skew in radians */
  skewX: number;
  /** Y skew in radians */
  skewY: number;
}

/**
 * Easing functions for keyframe animation
 *
 * Matches the Rust `EasingFunction` enum in compositor/src/keyframe.rs
 */
export type EasingType =
  | 'linear'
  | 'easeIn'
  | 'easeOut'
  | 'easeInOut'
  | 'cubicBezier'
  | 'steps'
  | 'hold';

/**
 * Position where step change occurs (for steps easing)
 */
export type StepPosition = 'start' | 'end';

/**
 * Generic keyframe for animating any property value
 *
 * Matches the Rust `Keyframe<T>` struct
 *
 * @template T - The type of value being animated
 */
export interface Keyframe<T> {
  /** Time in milliseconds when this keyframe occurs */
  timeMs: number;
  /** Value at this keyframe */
  value: T;
  /** Easing function to use when interpolating TO this keyframe */
  easing: EasingType;
  /** Control points for cubic bezier easing [x1, y1, x2, y2] (0.0-1.0 range) */
  cubicBezierParams?: [number, number, number, number];
  /** Number of discrete steps (for steps easing) */
  stepCount?: number;
  /** Position where step change occurs (for steps easing) */
  stepPosition?: StepPosition;
}

/**
 * Keyframe collections for animatable layer properties
 *
 * Each property can have its own timeline of keyframes.
 * Matches the Rust `AnimatedLayer` keyframe structure.
 */
export interface LayerKeyframes {
  /** X position keyframes */
  positionX?: Keyframe<number>[];
  /** Y position keyframes */
  positionY?: Keyframe<number>[];
  /** X scale keyframes */
  scaleX?: Keyframe<number>[];
  /** Y scale keyframes */
  scaleY?: Keyframe<number>[];
  /** Rotation keyframes (in radians) */
  rotation?: Keyframe<number>[];
  /** Opacity keyframes (0.0-1.0) */
  opacity?: Keyframe<number>[];
  /** X anchor keyframes (0.0-1.0) */
  anchorX?: Keyframe<number>[];
  /** Y anchor keyframes (0.0-1.0) */
  anchorY?: Keyframe<number>[];
}

/**
 * Layer type discriminator
 *
 * Matches the Rust layer type enum
 */
export type LayerType = 'solidColor' | 'image' | 'video' | 'text';

/**
 * Effect types available for layers
 */
export type EffectType = 'blur' | 'shadow' | 'gradient' | 'colorFilter';

/**
 * Gradient type for gradient effects
 */
export type GradientType = 'linear' | 'radial';

/**
 * Color stop for gradient effects
 */
export interface GradientStop {
  /** Position along gradient (0.0-1.0) */
  position: number;
  /** RGBA color [r, g, b, a] (0-255 range) */
  color: [number, number, number, number];
}

/**
 * Layer effect definition
 *
 * Different effect types use different subsets of these properties.
 * Matches the Rust effects system in compositor/src/effects.rs
 */
export interface LayerEffect {
  /** Type of effect */
  type: EffectType;

  // Blur effect properties
  /** Blur radius in pixels (for blur effect) */
  blurRadius?: number;

  // Shadow effect properties
  /** Shadow X offset in pixels (for shadow effect) */
  shadowOffsetX?: number;
  /** Shadow Y offset in pixels (for shadow effect) */
  shadowOffsetY?: number;
  /** Shadow blur radius in pixels (for shadow effect) */
  shadowBlur?: number;
  /** Shadow color RGBA [r, g, b, a] (for shadow effect) */
  shadowColor?: [number, number, number, number];

  // Gradient effect properties
  /** Gradient type (for gradient effect) */
  gradientType?: GradientType;
  /** Color stops (for gradient effect) */
  gradientStops?: GradientStop[];

  // Color filter properties
  /** Brightness multiplier (1.0 = normal, for colorFilter effect) */
  brightness?: number;
  /** Contrast multiplier (1.0 = normal, for colorFilter effect) */
  contrast?: number;
  /** Saturation multiplier (1.0 = normal, 0.0 = grayscale, for colorFilter effect) */
  saturation?: number;
}

/**
 * Layer content - discriminated union based on layer type
 *
 * Matches the Rust `WasmLayer` content structure
 */
export type LayerContent =
  | {
      type: 'solidColor';
      /** RGBA color [r, g, b, a] (0-255 range) */
      color: [number, number, number, number];
    }
  | {
      type: 'image';
      /** Image URL (must be pre-cached via cache_image) */
      url: string;
    }
  | {
      type: 'video';
      /** HTML video element ID for frame extraction */
      elementId: string;
    }
  | {
      type: 'text';
      /** Text content to render */
      text: string;
      /** Font family (default: system font) */
      fontFamily?: string;
      /** Font size in pixels (default: 16) */
      fontSize?: number;
      /** Text color RGBA [r, g, b, a] (default: white) */
      color?: [number, number, number, number];
    };

/**
 * Complete layer definition with all properties
 *
 * Matches the Rust compositor Layer + AnimatedLayer structure
 */
export interface CompositorLayer {
  /** Unique identifier for this layer */
  id: string;
  /** Layer type (determines which content fields are used) */
  type: LayerType;
  /** Layer content (type-specific) */
  content: LayerContent;
  /** Transform parameters (position, scale, rotation, etc.) */
  transform: LayerTransform;
  /** Optional effects to apply to this layer */
  effects?: LayerEffect[];
  /** Blend mode for compositing */
  blendMode: BlendMode;
  /** Whether this layer is visible */
  visible: boolean;
  /** Z-index for layer ordering (higher = on top) */
  zIndex: number;
  /** Optional keyframe animations */
  keyframes?: LayerKeyframes;
}

/**
 * Timeline configuration
 *
 * Matches the Rust `Timeline` configuration
 */
export interface TimelineConfig {
  /** Total duration in milliseconds */
  durationMs: number;
  /** Frames per second */
  fps: number;
  /** Output width in pixels */
  width: number;
  /** Output height in pixels */
  height: number;
}

/**
 * Layer with timeline bounds
 *
 * Matches the Rust `TimelineLayer` struct
 */
export interface TimelineLayerConfig {
  /** The layer definition */
  layer: CompositorLayer;
  /** When this layer becomes active (milliseconds) */
  startMs: number;
  /** When this layer becomes inactive (milliseconds) */
  endMs: number;
  /** Whether this layer is enabled */
  enabled: boolean;
}

/**
 * Performance metrics from the WASM renderer
 *
 * Returned by get_metrics() method
 */
export interface RenderMetrics {
  /** Canvas width in pixels */
  width: number;
  /** Canvas height in pixels */
  height: number;
  /** Whether the renderer is ready */
  ready: boolean;
  /** Number of cached images */
  cachedImages: number;
  /** Last frame render time in milliseconds */
  lastFrameTime?: number;
  /** Current frames per second */
  fps?: number;
  /** Memory usage in bytes (if available) */
  memoryUsage?: number;
}

/**
 * State returned by useWasmRenderer hook
 */
export interface WasmRendererState {
  /** Whether the WASM module is loading */
  isLoading: boolean;
  /** Error if loading or rendering failed */
  error: Error | null;
  /** Current performance metrics */
  metrics: RenderMetrics | null;
}

/**
 * Create a default layer transform with identity values
 *
 * @returns Default transform (position 0,0, scale 1,1, no rotation, full opacity)
 */
export function createDefaultTransform(): LayerTransform {
  return {
    x: 0,
    y: 0,
    scaleX: 1,
    scaleY: 1,
    rotation: 0,
    opacity: 1,
    anchorX: 0.5,
    anchorY: 0.5,
    skewX: 0,
    skewY: 0,
  };
}

/**
 * Create a default layer of the specified type
 *
 * @param type - The type of layer to create
 * @param id - Optional layer ID (auto-generated if not provided)
 * @returns A new layer with default values
 */
export function createDefaultLayer(type: LayerType, id?: string): CompositorLayer {
  const baseLayer: Omit<CompositorLayer, 'content'> = {
    id: id || Math.random().toString(36).substring(7),
    type,
    transform: createDefaultTransform(),
    blendMode: 'normal',
    visible: true,
    zIndex: 0,
  };

  // Create type-specific content
  let content: LayerContent;
  switch (type) {
    case 'solidColor':
      content = {
        type: 'solidColor',
        color: [255, 255, 255, 255],
      };
      break;
    case 'image':
      content = {
        type: 'image',
        url: '',
      };
      break;
    case 'video':
      content = {
        type: 'video',
        elementId: '',
      };
      break;
    case 'text':
      content = {
        type: 'text',
        text: 'Text Layer',
        fontFamily: 'system-ui',
        fontSize: 16,
        color: [255, 255, 255, 255],
      };
      break;
  }

  return {
    ...baseLayer,
    content,
  };
}

/**
 * Helper to create a linear keyframe
 *
 * @param timeMs - Time in milliseconds
 * @param value - Value at this time
 * @returns A new linear keyframe
 */
export function createLinearKeyframe<T>(timeMs: number, value: T): Keyframe<T> {
  return {
    timeMs,
    value,
    easing: 'linear',
  };
}

/**
 * Helper to create an ease-in-out keyframe
 *
 * @param timeMs - Time in milliseconds
 * @param value - Value at this time
 * @returns A new ease-in-out keyframe
 */
export function createEaseInOutKeyframe<T>(timeMs: number, value: T): Keyframe<T> {
  return {
    timeMs,
    value,
    easing: 'easeInOut',
  };
}

/**
 * Helper to create a cubic bezier keyframe
 *
 * @param timeMs - Time in milliseconds
 * @param value - Value at this time
 * @param x1 - First control point X (0.0-1.0)
 * @param y1 - First control point Y (0.0-1.0)
 * @param x2 - Second control point X (0.0-1.0)
 * @param y2 - Second control point Y (0.0-1.0)
 * @returns A new cubic bezier keyframe
 */
export function createCubicBezierKeyframe<T>(
  timeMs: number,
  value: T,
  x1: number,
  y1: number,
  x2: number,
  y2: number
): Keyframe<T> {
  return {
    timeMs,
    value,
    easing: 'cubicBezier',
    cubicBezierParams: [x1, y1, x2, y2],
  };
}

/**
 * Helper to create a steps keyframe
 *
 * @param timeMs - Time in milliseconds
 * @param value - Value at this time
 * @param stepCount - Number of discrete steps
 * @param stepPosition - Where step change occurs ('start' or 'end')
 * @returns A new steps keyframe
 */
export function createStepsKeyframe<T>(
  timeMs: number,
  value: T,
  stepCount: number,
  stepPosition: StepPosition = 'end'
): Keyframe<T> {
  return {
    timeMs,
    value,
    easing: 'steps',
    stepCount,
    stepPosition,
  };
}
