//! WASM Preview Renderer
//!
//! Lightweight frame renderer compiled to WebAssembly for browser-based video preview.
//! Provides real-time composition feedback without full video encoding.

use wasm_bindgen::prelude::*;
use web_sys::{CanvasRenderingContext2d, HtmlCanvasElement, ImageData};

use video_compositor::{Compositor, Layer, Transform, BlendMode, Color as CompositorColor};

// Re-export types for TypeScript bindings
use serde::{Deserialize, Serialize};

mod video;
use video::BrowserMediaLoader;

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);

    #[wasm_bindgen(js_namespace = console)]
    fn error(s: &str);
}

/// Initialize WASM module with panic hook for better error messages
#[wasm_bindgen(start)]
pub fn init() {
    console_error_panic_hook::set_once();
    log("WASM Preview Renderer initialized");
}

/// Color representation for WASM
#[wasm_bindgen]
#[derive(Debug, Clone, Copy)]
pub struct Color {
    pub r: u8,
    pub g: u8,
    pub b: u8,
    pub a: u8,
}

#[wasm_bindgen]
impl Color {
    #[wasm_bindgen(constructor)]
    pub fn new(r: u8, g: u8, b: u8, a: u8) -> Self {
        Self { r, g, b, a }
    }

    pub fn rgb(r: u8, g: u8, b: u8) -> Self {
        Self::new(r, g, b, 255)
    }
}

impl From<Color> for CompositorColor {
    fn from(c: Color) -> Self {
        CompositorColor::new(c.r, c.g, c.b, c.a)
    }
}

/// Transform parameters for WASM
///
/// Uses `#[serde(rename_all = "camelCase")]` so that JSON field names from
/// TypeScript (camelCase) map to Rust field names (snake_case) automatically.
/// For example: JSON `"scaleX"` → Rust `scale_x`.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct WasmTransform {
    pub x: f32,
    pub y: f32,
    pub scale_x: f32,
    pub scale_y: f32,
    pub rotation: f32,
    pub opacity: f32,
    /// Anchor point X (0.0–1.0). TypeScript sends this; ignored by compositor
    /// but must be accepted to avoid serde errors.
    #[serde(default)]
    pub anchor_x: f32,
    /// Anchor point Y (0.0–1.0). TypeScript sends this; ignored by compositor
    /// but must be accepted to avoid serde errors.
    #[serde(default)]
    pub anchor_y: f32,
    /// Skew X in radians. TypeScript sends this; ignored by compositor for now.
    #[serde(default)]
    pub skew_x: f32,
    /// Skew Y in radians. TypeScript sends this; ignored by compositor for now.
    #[serde(default)]
    pub skew_y: f32,
}

impl Default for WasmTransform {
    fn default() -> Self {
        Self {
            x: 0.0,
            y: 0.0,
            scale_x: 1.0,
            scale_y: 1.0,
            rotation: 0.0,
            opacity: 1.0,
            anchor_x: 0.5,
            anchor_y: 0.5,
            skew_x: 0.0,
            skew_y: 0.0,
        }
    }
}

impl From<&WasmTransform> for Transform {
    fn from(t: &WasmTransform) -> Self {
        Transform::new()
            .with_position(t.x, t.y)
            .with_scale_xy(t.scale_x, t.scale_y)
            .with_rotation(t.rotation)
            .with_opacity(t.opacity)
    }
}

/// Layer content — discriminated union matching the TypeScript `LayerContent` type.
///
/// TypeScript sends a `content` object with a `type` discriminant:
///   - `{ type: "solidColor", color: [r, g, b, a] }`
///   - `{ type: "image", url: "..." }`
///   - `{ type: "video", elementId: "..." }`
///   - `{ type: "text", text: "...", fontFamily?: "...", fontSize?: 16, color?: [r,g,b,a] }`
///
/// `#[serde(tag = "type", rename_all = "camelCase")]` matches the `type` field value.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "camelCase")]
pub enum WasmLayerContent {
    SolidColor {
        color: [u8; 4],
    },
    Image {
        url: String,
    },
    Video {
        /// HTML video element ID for frame capture. TypeScript field is `elementId`.
        #[serde(rename = "elementId")]
        element_id: String,
    },
    Text {
        text: String,
        #[serde(default, rename = "fontFamily")]
        font_family: Option<String>,
        #[serde(default, rename = "fontSize")]
        font_size: Option<f32>,
        #[serde(default)]
        color: Option<[u8; 4]>,
    },
}

/// Layer data for WASM
///
/// Uses `#[serde(rename_all = "camelCase")]` to accept the camelCase JSON that
/// TypeScript's `JSON.stringify()` produces from `CompositorLayer`:
///   - `"blendMode"` → `blend_mode`
///   - `"zIndex"` → `z_index`
///
/// The `content` field is a nested object matching the TypeScript `LayerContent`
/// discriminated union (rather than the old flat fields).
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct WasmLayer {
    pub id: String,
    /// Layer type discriminant: "solidColor" | "image" | "video" | "text".
    /// The `type` JSON field is also present inside `content`; this top-level
    /// field is kept for quick access and tagged with `rename = "type"`.
    #[serde(rename = "type")]
    pub layer_type: String,
    /// Nested content object from TypeScript `LayerContent`.
    pub content: WasmLayerContent,
    pub transform: WasmTransform,
    #[serde(default)]
    pub blend_mode: Option<String>,
    pub visible: bool,
    pub z_index: i32,
}

/// Preview renderer that runs in the browser
#[wasm_bindgen]
pub struct PreviewRenderer {
    compositor: Compositor,
    canvas: HtmlCanvasElement,
    ctx: CanvasRenderingContext2d,
    width: u32,
    height: u32,
    media_loader: BrowserMediaLoader,
}

#[wasm_bindgen]
impl PreviewRenderer {
    /// Create a new preview renderer
    #[wasm_bindgen(constructor)]
    pub fn new(canvas: HtmlCanvasElement, width: u32, height: u32) -> Result<PreviewRenderer, JsValue> {
        // Set canvas dimensions
        canvas.set_width(width);
        canvas.set_height(height);

        // Get 2D context
        let ctx = canvas
            .get_context("2d")?
            .ok_or("Failed to get 2d context")?
            .dyn_into::<CanvasRenderingContext2d>()?;

        // Create compositor
        let compositor = Compositor::new(width, height)
            .map_err(|e| JsValue::from_str(&format!("Failed to create compositor: {}", e)))?;

        log(&format!(
            "PreviewRenderer created: {}x{}",
            width, height
        ));

        Ok(Self {
            compositor,
            canvas,
            ctx,
            width,
            height,
            media_loader: BrowserMediaLoader::new(),
        })
    }

    /// Render a frame from layer data (JSON string)
    pub fn render_frame(&self, layers_json: &str) -> Result<(), JsValue> {
        // Parse layers from JSON
        let wasm_layers: Vec<WasmLayer> = serde_json::from_str(layers_json)
            .map_err(|e| JsValue::from_str(&format!("Failed to parse layers: {}", e)))?;

        // Convert to compositor layers
        let layers: Vec<Layer> = wasm_layers
            .iter()
            .filter_map(|l| self.convert_layer(l))
            .collect();

        // Compose frame
        let frame = self
            .compositor
            .compose(&layers)
            .map_err(|e| JsValue::from_str(&format!("Composition failed: {}", e)))?;

        // Render to canvas
        self.render_to_canvas(&frame)?;

        Ok(())
    }

    /// Render a frame at a specific time (for timeline scrubbing)
    ///
    /// This accepts a time in milliseconds and layer data as JSON.
    /// The time can be used by the caller to set video element positions
    /// before calling this method.
    pub fn render_frame_at_time(&self, layers_json: &str, _time_ms: f64) -> Result<(), JsValue> {
        // Time is used by the JavaScript caller to seek video elements
        // before passing the layer data here. The compositor itself is
        // stateless with respect to time.
        self.render_frame(layers_json)
    }

    /// Clear the canvas
    pub fn clear(&self) {
        self.ctx.clear_rect(0.0, 0.0, self.width as f64, self.height as f64);
    }

    /// Get performance metrics
    pub fn get_metrics(&self) -> String {
        serde_json::json!({
            "width": self.width,
            "height": self.height,
            "ready": true,
            "cached_images": self.media_loader.cache_size()
        })
        .to_string()
    }

    /// Cache an image for use in image layers
    ///
    /// This method should be called from JavaScript after loading an image.
    /// The pixel data must be in RGBA format.
    ///
    /// # Arguments
    /// * `url` - The URL of the image
    /// * `data` - RGBA pixel data (Uint8Array from JavaScript)
    /// * `width` - Image width in pixels
    /// * `height` - Image height in pixels
    pub fn cache_image(&mut self, url: String, data: Vec<u8>, width: u32, height: u32) {
        self.media_loader.cache_image(url, data, width, height);
    }

    /// Clear the image cache
    pub fn clear_image_cache(&mut self) {
        self.media_loader.clear_cache();
    }

    /// Check if an image URL is cached
    pub fn is_image_cached(&self, url: &str) -> bool {
        self.media_loader.is_cached(url)
    }
}

impl PreviewRenderer {
    /// Convert WasmLayer to compositor Layer
    fn convert_layer(&self, wasm_layer: &WasmLayer) -> Option<Layer> {
        if !wasm_layer.visible {
            return None;
        }

        let transform = Transform::from(&wasm_layer.transform);

        let blend_mode = wasm_layer
            .blend_mode
            .as_ref()
            .and_then(|s| match s.as_str() {
                "multiply" => Some(BlendMode::Multiply),
                "screen" => Some(BlendMode::Screen),
                "overlay" => Some(BlendMode::Overlay),
                "add" => Some(BlendMode::Add),
                "subtract" => Some(BlendMode::Subtract),
                "lighten" => Some(BlendMode::Lighten),
                "darken" => Some(BlendMode::Darken),
                "softLight" => Some(BlendMode::SoftLight),
                "hardLight" => Some(BlendMode::HardLight),
                "colorDodge" => Some(BlendMode::ColorDodge),
                "colorBurn" => Some(BlendMode::ColorBurn),
                "difference" => Some(BlendMode::Difference),
                "exclusion" => Some(BlendMode::Exclusion),
                "hue" => Some(BlendMode::Hue),
                "saturation" => Some(BlendMode::Saturation),
                "color" => Some(BlendMode::Color),
                "luminosity" => Some(BlendMode::Luminosity),
                _ => Some(BlendMode::Normal),
            })
            .unwrap_or(BlendMode::Normal);

        match &wasm_layer.content {
            WasmLayerContent::SolidColor { color: [r, g, b, a] } => {
                Some(
                    Layer::solid_color(CompositorColor::new(*r, *g, *b, *a), transform)
                        .with_blend_mode(blend_mode)
                        .with_z_index(wasm_layer.z_index),
                )
            }
            WasmLayerContent::Video { element_id } => {
                // Capture video frame from HTMLVideoElement
                match BrowserMediaLoader::capture_video_frame(element_id) {
                    Ok((pixel_data, width, height)) => {
                        Some(
                            Layer::image_data(pixel_data, width, height, transform)
                                .with_blend_mode(blend_mode)
                                .with_z_index(wasm_layer.z_index),
                        )
                    }
                    Err(e) => {
                        error(&format!(
                            "Failed to capture video frame from '{}': {:?}",
                            element_id, e
                        ));
                        None
                    }
                }
            }
            WasmLayerContent::Image { url } => {
                // Load image from cache (must be pre-loaded by JavaScript)
                match self.media_loader.get_cached_image(url) {
                    Some((pixel_data, width, height)) => {
                        Some(
                            Layer::image_data(pixel_data.to_vec(), width, height, transform)
                                .with_blend_mode(blend_mode)
                                .with_z_index(wasm_layer.z_index),
                        )
                    }
                    None => {
                        // Warn and skip rather than throwing — image may not be cached yet.
                        // CompositorController should call cache_image() on layer enter.
                        web_sys::console::warn_1(&JsValue::from_str(&format!(
                            "[compositor] Image not found in cache: '{}'. Call cache_image() before rendering. Skipping layer.",
                            url
                        )));
                        None
                    }
                }
            }
            WasmLayerContent::Text { .. } => {
                // Text rendering is not yet supported in the WASM compositor preview
                error("Text layers are not yet supported in WASM preview renderer");
                None
            }
        }
    }

    /// Render composed frame to canvas
    fn render_to_canvas(&self, frame: &video_compositor::Frame) -> Result<(), JsValue> {
        let image_data = frame.image();
        let (width, height) = image_data.dimensions();

        // Convert RGBA image to ImageData
        let data = image_data.as_raw();

        let image_data = ImageData::new_with_u8_clamped_array_and_sh(
            wasm_bindgen::Clamped(data.as_slice()),
            width,
            height
        )?;

        // Draw to canvas
        self.ctx.put_image_data(&image_data, 0.0, 0.0)?;

        Ok(())
    }
}

/// Benchmark function for testing WASM performance
#[wasm_bindgen]
pub fn benchmark_composition(width: u32, height: u32, layer_count: u32) -> Result<f64, JsValue> {
    let compositor = Compositor::new(width, height)
        .map_err(|e| JsValue::from_str(&format!("Failed to create compositor: {}", e)))?;

    // Create test layers
    let layers: Vec<Layer> = (0..layer_count)
        .map(|i| {
            Layer::solid_color(
                CompositorColor::new(
                    ((i * 37) % 256) as u8,
                    ((i * 73) % 256) as u8,
                    ((i * 137) % 256) as u8,
                    255,
                ),
                Transform::new()
                    .with_position((i * 50) as f32, (i * 50) as f32)
                    .with_scale(0.5)
                    .with_opacity(0.8),
            )
            .with_z_index(i as i32)
        })
        .collect();

    // Benchmark composition
    let start = js_sys::Date::now();
    let _frame = compositor
        .compose(&layers)
        .map_err(|e| JsValue::from_str(&format!("Composition failed: {}", e)))?;
    let end = js_sys::Date::now();

    Ok(end - start)
}
