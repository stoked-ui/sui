/* tslint:disable */
/* eslint-disable */

/**
 * Color representation for WASM
 */
export class Color {
    free(): void;
    [Symbol.dispose](): void;
    constructor(r: number, g: number, b: number, a: number);
    static rgb(r: number, g: number, b: number): Color;
    a: number;
    b: number;
    g: number;
    r: number;
}

/**
 * Preview renderer that runs in the browser
 */
export class PreviewRenderer {
    free(): void;
    [Symbol.dispose](): void;
    /**
     * Cache an image for use in image layers
     *
     * This method should be called from JavaScript after loading an image.
     * The pixel data must be in RGBA format.
     *
     * # Arguments
     * * `url` - The URL of the image
     * * `data` - RGBA pixel data (Uint8Array from JavaScript)
     * * `width` - Image width in pixels
     * * `height` - Image height in pixels
     */
    cache_image(url: string, data: Uint8Array, width: number, height: number): void;
    /**
     * Clear the canvas
     */
    clear(): void;
    /**
     * Clear the image cache
     */
    clear_image_cache(): void;
    /**
     * Get performance metrics
     */
    get_metrics(): string;
    /**
     * Check if an image URL is cached
     */
    is_image_cached(url: string): boolean;
    /**
     * Create a new preview renderer
     */
    constructor(canvas: HTMLCanvasElement, width: number, height: number);
    /**
     * Render a frame from layer data (JSON string)
     */
    render_frame(layers_json: string): void;
    /**
     * Render a frame at a specific time (for timeline scrubbing)
     *
     * This accepts a time in milliseconds and layer data as JSON.
     * The time can be used by the caller to set video element positions
     * before calling this method.
     */
    render_frame_at_time(layers_json: string, _time_ms: number): void;
}

/**
 * Benchmark function for testing WASM performance
 */
export function benchmark_composition(width: number, height: number, layer_count: number): number;

/**
 * Initialize WASM module with panic hook for better error messages
 */
export function init(): void;
