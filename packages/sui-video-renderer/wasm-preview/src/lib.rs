//! WASM Preview Renderer
//!
//! Lightweight frame renderer compiled to WebAssembly for browser-based video preview.
//! Provides real-time composition feedback without full video encoding.

use wasm_bindgen::prelude::*;
use web_sys::{CanvasRenderingContext2d, HtmlCanvasElement, ImageData};

use video_compositor::{Compositor, Layer, Transform, BlendMode, Color as CompositorColor};

// Re-export types for TypeScript bindings
use serde::{Deserialize, Serialize};

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
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WasmTransform {
    pub x: f32,
    pub y: f32,
    pub scale_x: f32,
    pub scale_y: f32,
    pub rotation: f32,
    pub opacity: f32,
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

/// Layer data for WASM
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WasmLayer {
    pub id: String,
    #[serde(rename = "type")]
    pub layer_type: String, // "solidColor" | "image" | "text"
    pub color: Option<[u8; 4]>,
    pub transform: WasmTransform,
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

    /// Clear the canvas
    pub fn clear(&self) {
        self.ctx.clear_rect(0.0, 0.0, self.width as f64, self.height as f64);
    }

    /// Get performance metrics
    pub fn get_metrics(&self) -> String {
        serde_json::json!({
            "width": self.width,
            "height": self.height,
            "ready": true
        })
        .to_string()
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
                "lighten" => Some(BlendMode::Lighten),
                "darken" => Some(BlendMode::Darken),
                _ => Some(BlendMode::Normal),
            })
            .unwrap_or(BlendMode::Normal);

        match wasm_layer.layer_type.as_str() {
            "solidColor" => {
                if let Some([r, g, b, a]) = wasm_layer.color {
                    Some(
                        Layer::solid_color(CompositorColor::new(r, g, b, a), transform)
                            .with_blend_mode(blend_mode)
                            .with_z_index(wasm_layer.z_index),
                    )
                } else {
                    None
                }
            }
            _ => {
                error(&format!("Unsupported layer type: {}", wasm_layer.layer_type));
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
        let data_array = js_sys::Uint8ClampedArray::from(data);

        let image_data = ImageData::new_with_u8_clamped_array(data_array, width)?;

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
