//! Browser integration tests for WASM preview renderer
//!
//! These tests run in a headless browser via wasm-pack test --headless --chrome.
//! They exercise the PreviewRenderer public API including creation, rendering,
//! error handling, image caching, and stability under repeated operations.

#![cfg(target_arch = "wasm32")]

use wasm_bindgen::JsCast;
use wasm_bindgen_test::*;

wasm_bindgen_test_configure!(run_in_browser);

// Re-import the crate's public wasm_bindgen exports
use wasm_preview::{benchmark_composition, Color, PreviewRenderer};

/// Helper: create an HTMLCanvasElement via the DOM
fn create_test_canvas() -> web_sys::HtmlCanvasElement {
    let window = web_sys::window().expect("should have a window");
    let document = window.document().expect("should have a document");
    document
        .create_element("canvas")
        .expect("should create canvas element")
        .dyn_into::<web_sys::HtmlCanvasElement>()
        .expect("should cast to HtmlCanvasElement")
}

// ---------------------------------------------------------------------------
// 1. test_wasm_initialization - call benchmark_composition to verify the
//    compositor initializes correctly in the WASM environment
// ---------------------------------------------------------------------------
#[wasm_bindgen_test]
fn test_wasm_initialization() {
    // Run a small benchmark to prove the compositor works end-to-end in WASM
    let result = benchmark_composition(64, 64, 2);
    assert!(
        result.is_ok(),
        "benchmark_composition should succeed: {:?}",
        result.err()
    );
    let elapsed = result.unwrap();
    // The elapsed time should be a non-negative number
    assert!(elapsed >= 0.0, "elapsed time should be non-negative");
}

// ---------------------------------------------------------------------------
// 2. test_preview_renderer_creation - create a canvas, create a
//    PreviewRenderer, verify no errors
// ---------------------------------------------------------------------------
#[wasm_bindgen_test]
fn test_preview_renderer_creation() {
    let canvas = create_test_canvas();
    let renderer = PreviewRenderer::new(canvas, 320, 240);
    assert!(
        renderer.is_ok(),
        "PreviewRenderer::new should succeed: {:?}",
        renderer.err()
    );

    // Verify metrics report the correct dimensions
    let metrics_json = renderer.unwrap().get_metrics();
    let metrics: serde_json::Value =
        serde_json::from_str(&metrics_json).expect("metrics should be valid JSON");
    assert_eq!(metrics["width"], 320);
    assert_eq!(metrics["height"], 240);
    assert_eq!(metrics["ready"], true);
    assert_eq!(metrics["cached_images"], 0);
}

// ---------------------------------------------------------------------------
// 3. test_render_solid_color_layer - render a solid red layer, then read
//    back canvas pixels to confirm they are non-transparent
// ---------------------------------------------------------------------------
#[wasm_bindgen_test]
fn test_render_solid_color_layer() {
    let canvas = create_test_canvas();
    let renderer = PreviewRenderer::new(canvas.clone(), 4, 4).expect("renderer creation");

    let layers_json = r#"[{
        "id": "red-bg",
        "type": "solidColor",
        "color": [255, 0, 0, 255],
        "transform": {
            "x": 0.0,
            "y": 0.0,
            "scale_x": 1.0,
            "scale_y": 1.0,
            "rotation": 0.0,
            "opacity": 1.0
        },
        "visible": true,
        "z_index": 0
    }]"#;

    let result = renderer.render_frame(layers_json);
    assert!(
        result.is_ok(),
        "render_frame should succeed for solid color: {:?}",
        result.err()
    );

    // Read back pixels from the canvas to verify something was drawn
    let ctx = canvas
        .get_context("2d")
        .unwrap()
        .unwrap()
        .dyn_into::<web_sys::CanvasRenderingContext2d>()
        .unwrap();

    let image_data = ctx.get_image_data(0.0, 0.0, 4.0, 4.0).unwrap();
    let pixels = image_data.data();

    // Check that the first pixel's alpha channel is non-zero (something was rendered)
    // The compositor may blend differently, but the pixel should not be fully transparent
    let alpha = pixels[3];
    assert!(
        alpha > 0,
        "Canvas should have non-transparent pixels after rendering a solid color layer, got alpha={}",
        alpha
    );

    // Check that the red channel is dominant (since we rendered solid red)
    let r = pixels[0];
    let g = pixels[1];
    let b = pixels[2];
    assert!(
        r > g && r > b,
        "Red channel should dominate for a red solid layer, got r={} g={} b={}",
        r,
        g,
        b
    );
}

// ---------------------------------------------------------------------------
// 4. test_render_frame_at_time - verify the render_frame_at_time method
//    works with a time parameter
// ---------------------------------------------------------------------------
#[wasm_bindgen_test]
fn test_render_frame_at_time() {
    let canvas = create_test_canvas();
    let renderer = PreviewRenderer::new(canvas, 64, 64).expect("renderer creation");

    let layers_json = r#"[{
        "id": "blue-bg",
        "type": "solidColor",
        "color": [0, 0, 255, 255],
        "transform": {
            "x": 0.0,
            "y": 0.0,
            "scale_x": 1.0,
            "scale_y": 1.0,
            "rotation": 0.0,
            "opacity": 1.0
        },
        "visible": true,
        "z_index": 0
    }]"#;

    // Render at time=0ms
    let result = renderer.render_frame_at_time(layers_json, 0.0);
    assert!(
        result.is_ok(),
        "render_frame_at_time(0ms) should succeed: {:?}",
        result.err()
    );

    // Render at time=5000ms (5 seconds)
    let result = renderer.render_frame_at_time(layers_json, 5000.0);
    assert!(
        result.is_ok(),
        "render_frame_at_time(5000ms) should succeed: {:?}",
        result.err()
    );

    // Render at a large time value
    let result = renderer.render_frame_at_time(layers_json, 999999.0);
    assert!(
        result.is_ok(),
        "render_frame_at_time(large) should succeed: {:?}",
        result.err()
    );
}

// ---------------------------------------------------------------------------
// 5. test_free_cleanup - call clear() and verify the renderer can still
//    operate afterwards
// ---------------------------------------------------------------------------
#[wasm_bindgen_test]
fn test_free_cleanup() {
    let canvas = create_test_canvas();
    let renderer = PreviewRenderer::new(canvas.clone(), 32, 32).expect("renderer creation");

    let layers_json = r#"[{
        "id": "green-bg",
        "type": "solidColor",
        "color": [0, 255, 0, 255],
        "transform": {
            "x": 0.0,
            "y": 0.0,
            "scale_x": 1.0,
            "scale_y": 1.0,
            "rotation": 0.0,
            "opacity": 1.0
        },
        "visible": true,
        "z_index": 0
    }]"#;

    // Render, then clear, then render again -- no panics
    let result = renderer.render_frame(layers_json);
    assert!(result.is_ok(), "first render should succeed");

    renderer.clear();

    // After clear, the canvas should be transparent
    let ctx = canvas
        .get_context("2d")
        .unwrap()
        .unwrap()
        .dyn_into::<web_sys::CanvasRenderingContext2d>()
        .unwrap();

    let image_data = ctx.get_image_data(0.0, 0.0, 1.0, 1.0).unwrap();
    let pixels = image_data.data();
    assert_eq!(
        pixels[3], 0,
        "Canvas should be transparent after clear()"
    );

    // Re-render after clear should work fine
    let result = renderer.render_frame(layers_json);
    assert!(result.is_ok(), "render after clear() should succeed");
}

// ---------------------------------------------------------------------------
// 6. test_invalid_layer_type_error - pass an unsupported layer type, verify
//    the renderer returns Ok (unsupported types are silently skipped) but
//    does not panic
// ---------------------------------------------------------------------------
#[wasm_bindgen_test]
fn test_invalid_layer_type_error() {
    let canvas = create_test_canvas();
    let renderer = PreviewRenderer::new(canvas, 32, 32).expect("renderer creation");

    // "sparkle" is not a recognized layer type
    let layers_json = r#"[{
        "id": "bad-layer",
        "type": "sparkle",
        "transform": {
            "x": 0.0,
            "y": 0.0,
            "scale_x": 1.0,
            "scale_y": 1.0,
            "rotation": 0.0,
            "opacity": 1.0
        },
        "visible": true,
        "z_index": 0
    }]"#;

    // The renderer skips unknown layer types (returns None from convert_layer),
    // so render_frame should still succeed without panicking.
    let result = renderer.render_frame(layers_json);
    assert!(
        result.is_ok(),
        "render_frame with unknown layer type should not panic: {:?}",
        result.err()
    );
}

// ---------------------------------------------------------------------------
// 7. test_render_100_frames_no_crash - loop render_frame 100 times with
//    varying parameters, verify no panics or memory issues
// ---------------------------------------------------------------------------
#[wasm_bindgen_test]
fn test_render_100_frames_no_crash() {
    let canvas = create_test_canvas();
    let renderer = PreviewRenderer::new(canvas, 32, 32).expect("renderer creation");

    for i in 0..100u8 {
        let layers_json = format!(
            r#"[{{
                "id": "frame-{}",
                "type": "solidColor",
                "color": [{}, {}, {}, 255],
                "transform": {{
                    "x": 0.0,
                    "y": 0.0,
                    "scale_x": 1.0,
                    "scale_y": 1.0,
                    "rotation": 0.0,
                    "opacity": 1.0
                }},
                "visible": true,
                "z_index": 0
            }}]"#,
            i,
            i,
            255u8.wrapping_sub(i),
            (i.wrapping_mul(2))
        );

        let result = renderer.render_frame(&layers_json);
        assert!(
            result.is_ok(),
            "render_frame iteration {} should succeed: {:?}",
            i,
            result.err()
        );
    }
}

// ---------------------------------------------------------------------------
// 8. test_invalid_json_error - pass malformed JSON, verify an error is
//    returned rather than a panic
// ---------------------------------------------------------------------------
#[wasm_bindgen_test]
fn test_invalid_json_error() {
    let canvas = create_test_canvas();
    let renderer = PreviewRenderer::new(canvas, 32, 32).expect("renderer creation");

    // Completely malformed JSON
    let result = renderer.render_frame("this is not json at all");
    assert!(
        result.is_err(),
        "render_frame with malformed JSON should return Err"
    );

    // Partial / truncated JSON
    let result = renderer.render_frame("[{\"id\": \"broken\", \"type\":");
    assert!(
        result.is_err(),
        "render_frame with truncated JSON should return Err"
    );

    // Valid JSON but wrong shape (object instead of array)
    let result = renderer.render_frame("{\"not\": \"an array\"}");
    assert!(
        result.is_err(),
        "render_frame with wrong JSON shape should return Err"
    );

    // Empty array is valid and should succeed (no layers to render)
    let result = renderer.render_frame("[]");
    assert!(
        result.is_ok(),
        "render_frame with empty layer array should succeed: {:?}",
        result.err()
    );
}

// ---------------------------------------------------------------------------
// 9. test_image_cache_operations - exercise cache_image, is_image_cached,
//    clear_image_cache via the public wasm_bindgen API
// ---------------------------------------------------------------------------
#[wasm_bindgen_test]
fn test_image_cache_operations() {
    let canvas = create_test_canvas();
    let mut renderer = PreviewRenderer::new(canvas, 64, 64).expect("renderer creation");

    let url = "https://example.com/test-image.png";

    // Initially nothing is cached
    assert!(
        !renderer.is_image_cached(url),
        "image should not be cached initially"
    );

    // Cache a 2x2 RGBA image (16 bytes)
    let pixel_data: Vec<u8> = vec![
        255, 0, 0, 255, // red
        0, 255, 0, 255, // green
        0, 0, 255, 255, // blue
        255, 255, 0, 255, // yellow
    ];
    renderer.cache_image(url.to_string(), pixel_data, 2, 2);

    assert!(
        renderer.is_image_cached(url),
        "image should be cached after cache_image()"
    );

    // Metrics should reflect one cached image
    let metrics: serde_json::Value =
        serde_json::from_str(&renderer.get_metrics()).expect("valid metrics JSON");
    assert_eq!(metrics["cached_images"], 1);

    // Clear cache
    renderer.clear_image_cache();
    assert!(
        !renderer.is_image_cached(url),
        "image should not be cached after clear_image_cache()"
    );
}

// ---------------------------------------------------------------------------
// 10. test_render_cached_image_layer - cache an image, then render an image
//     layer that references it
// ---------------------------------------------------------------------------
#[wasm_bindgen_test]
fn test_render_cached_image_layer() {
    let canvas = create_test_canvas();
    let mut renderer = PreviewRenderer::new(canvas, 4, 4).expect("renderer creation");

    // Cache a 4x4 solid magenta image (RGBA: 255,0,255,255 per pixel)
    let pixel_data: Vec<u8> = [255u8, 0, 255, 255].iter().copied().cycle().take(4 * 4 * 4).collect();
    renderer.cache_image(
        "https://example.com/magenta.png".to_string(),
        pixel_data,
        4,
        4,
    );

    let layers_json = r#"[{
        "id": "img-layer",
        "type": "image",
        "image_url": "https://example.com/magenta.png",
        "transform": {
            "x": 0.0,
            "y": 0.0,
            "scale_x": 1.0,
            "scale_y": 1.0,
            "rotation": 0.0,
            "opacity": 1.0
        },
        "visible": true,
        "z_index": 0
    }]"#;

    let result = renderer.render_frame(layers_json);
    assert!(
        result.is_ok(),
        "render_frame with cached image layer should succeed: {:?}",
        result.err()
    );
}

// ---------------------------------------------------------------------------
// 11. test_multiple_layers_z_ordering - render two layers and verify
//     rendering does not error
// ---------------------------------------------------------------------------
#[wasm_bindgen_test]
fn test_multiple_layers_z_ordering() {
    let canvas = create_test_canvas();
    let renderer = PreviewRenderer::new(canvas, 32, 32).expect("renderer creation");

    let layers_json = r#"[
        {
            "id": "bg",
            "type": "solidColor",
            "color": [0, 0, 0, 255],
            "transform": {
                "x": 0.0,
                "y": 0.0,
                "scale_x": 1.0,
                "scale_y": 1.0,
                "rotation": 0.0,
                "opacity": 1.0
            },
            "visible": true,
            "z_index": 0
        },
        {
            "id": "fg",
            "type": "solidColor",
            "color": [255, 255, 255, 128],
            "transform": {
                "x": 0.0,
                "y": 0.0,
                "scale_x": 1.0,
                "scale_y": 1.0,
                "rotation": 0.0,
                "opacity": 0.5
            },
            "visible": true,
            "z_index": 1
        }
    ]"#;

    let result = renderer.render_frame(layers_json);
    assert!(
        result.is_ok(),
        "render_frame with multiple z-ordered layers should succeed: {:?}",
        result.err()
    );
}

// ---------------------------------------------------------------------------
// 12. test_color_type - verify the Color wasm_bindgen type works
// ---------------------------------------------------------------------------
#[wasm_bindgen_test]
fn test_color_type() {
    let c = Color::new(10, 20, 30, 40);
    assert_eq!(c.r, 10);
    assert_eq!(c.g, 20);
    assert_eq!(c.b, 30);
    assert_eq!(c.a, 40);

    let c2 = Color::rgb(100, 150, 200);
    assert_eq!(c2.r, 100);
    assert_eq!(c2.g, 150);
    assert_eq!(c2.b, 200);
    assert_eq!(c2.a, 255, "rgb() should default alpha to 255");
}
