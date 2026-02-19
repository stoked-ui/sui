//! Browser media loading for video frames and images
//!
//! This module provides functionality to:
//! - Capture video frames from HTMLVideoElement using canvas
//! - Load images from URLs using the Fetch API
//! - Cache loaded images to avoid redundant fetches

use std::collections::HashMap;
use wasm_bindgen::prelude::*;
use wasm_bindgen::JsCast;
use web_sys::{HtmlCanvasElement, HtmlVideoElement, CanvasRenderingContext2d};

/// Browser media loader for video frames and images
pub struct BrowserMediaLoader {
    /// Cache of loaded images: URL -> RGBA pixel data
    image_cache: HashMap<String, Vec<u8>>,
    /// Dimensions of cached images: URL -> (width, height)
    image_dimensions: HashMap<String, (u32, u32)>,
}

impl BrowserMediaLoader {
    /// Create a new browser media loader
    pub fn new() -> Self {
        Self {
            image_cache: HashMap::new(),
            image_dimensions: HashMap::new(),
        }
    }

    /// Capture a single frame from an HTML video element
    ///
    /// # Arguments
    /// * `video_element_id` - The DOM id of the HTMLVideoElement
    ///
    /// # Returns
    /// A tuple of (RGBA pixel data, width, height) or a JavaScript error
    ///
    /// # Process
    /// 1. Get the video element from the DOM
    /// 2. Create a temporary canvas at the video's natural dimensions
    /// 3. Draw the current video frame to the canvas
    /// 4. Extract pixel data using getImageData
    /// 5. Return the pixel data and dimensions
    pub fn capture_video_frame(video_element_id: &str) -> Result<(Vec<u8>, u32, u32), JsValue> {
        // Get window and document
        let window = web_sys::window()
            .ok_or_else(|| JsValue::from_str("Failed to get window"))?;
        let document = window.document()
            .ok_or_else(|| JsValue::from_str("Failed to get document"))?;

        // Get the video element
        let video_element = document
            .get_element_by_id(video_element_id)
            .ok_or_else(|| JsValue::from_str(&format!("Video element not found: {}", video_element_id)))?
            .dyn_into::<HtmlVideoElement>()
            .map_err(|_| JsValue::from_str(&format!("Element {} is not a video element", video_element_id)))?;

        // Check if video has valid dimensions
        let width = video_element.video_width();
        let height = video_element.video_height();

        if width == 0 || height == 0 {
            return Err(JsValue::from_str(&format!(
                "Video element {} has invalid dimensions: {}x{}",
                video_element_id, width, height
            )));
        }

        // Create a temporary canvas to capture the frame
        let canvas = document
            .create_element("canvas")
            .map_err(|e| JsValue::from_str(&format!("Failed to create canvas: {:?}", e)))?
            .dyn_into::<HtmlCanvasElement>()
            .map_err(|_| JsValue::from_str("Failed to cast to HtmlCanvasElement"))?;

        canvas.set_width(width);
        canvas.set_height(height);

        // Get 2D rendering context
        let ctx = canvas
            .get_context("2d")
            .map_err(|e| JsValue::from_str(&format!("Failed to get canvas context: {:?}", e)))?
            .ok_or_else(|| JsValue::from_str("Canvas context is null"))?
            .dyn_into::<CanvasRenderingContext2d>()
            .map_err(|_| JsValue::from_str("Failed to cast to CanvasRenderingContext2d"))?;

        // Draw the video frame to the canvas
        ctx.draw_image_with_html_video_element(&video_element, 0.0, 0.0)
            .map_err(|e| JsValue::from_str(&format!("Failed to draw video frame: {:?}", e)))?;

        // Get the pixel data
        let image_data = ctx
            .get_image_data(0.0, 0.0, width as f64, height as f64)
            .map_err(|e| JsValue::from_str(&format!("Failed to get image data: {:?}", e)))?;

        let pixel_data = image_data.data().to_vec();

        Ok((pixel_data, width, height))
    }

    /// Load an image from a URL (async version)
    ///
    /// Note: This is a placeholder for async image loading using the Fetch API.
    /// For now, we'll use a synchronous cache-based approach where JavaScript
    /// pre-loads images and passes the pixel data.
    ///
    /// # Arguments
    /// * `url` - The URL of the image to load
    ///
    /// # Returns
    /// A tuple of (RGBA pixel data, width, height) or a JavaScript error
    pub async fn load_image_url(_url: &str) -> Result<(Vec<u8>, u32, u32), JsValue> {
        // TODO: Implement async image loading using Fetch API
        // For Phase 2, we'll rely on JavaScript to pre-load images and cache them
        Err(JsValue::from_str(
            "Async image loading not yet implemented. Use cache_image() to pre-load images from JavaScript.",
        ))
    }

    /// Get a cached image by URL
    ///
    /// # Arguments
    /// * `url` - The URL of the cached image
    ///
    /// # Returns
    /// A tuple of (pixel data slice, width, height) if the image is cached, None otherwise
    pub fn get_cached_image(&self, url: &str) -> Option<(&[u8], u32, u32)> {
        let data = self.image_cache.get(url)?;
        let &(width, height) = self.image_dimensions.get(url)?;
        Some((data.as_slice(), width, height))
    }

    /// Cache an image for later use
    ///
    /// This method is intended to be called from JavaScript after loading an image.
    ///
    /// # Arguments
    /// * `url` - The URL of the image
    /// * `data` - RGBA pixel data
    /// * `width` - Image width in pixels
    /// * `height` - Image height in pixels
    pub fn cache_image(&mut self, url: String, data: Vec<u8>, width: u32, height: u32) {
        // Validate that data length matches dimensions
        let expected_len = (width * height * 4) as usize;
        if data.len() != expected_len {
            web_sys::console::error_1(&JsValue::from_str(&format!(
                "Image cache warning: data length {} doesn't match expected {} for {}x{} image at {}",
                data.len(),
                expected_len,
                width,
                height,
                url
            )));
        }

        self.image_dimensions.insert(url.clone(), (width, height));
        self.image_cache.insert(url, data);
    }

    /// Clear the image cache
    pub fn clear_cache(&mut self) {
        self.image_cache.clear();
        self.image_dimensions.clear();
    }

    /// Get the number of cached images
    pub fn cache_size(&self) -> usize {
        self.image_cache.len()
    }

    /// Check if an image URL is cached
    pub fn is_cached(&self, url: &str) -> bool {
        self.image_cache.contains_key(url)
    }
}

impl Default for BrowserMediaLoader {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_media_loader_creation() {
        let loader = BrowserMediaLoader::new();
        assert_eq!(loader.cache_size(), 0);
    }

    #[test]
    fn test_cache_operations() {
        let mut loader = BrowserMediaLoader::new();

        // Cache an image
        let url = "https://example.com/image.png".to_string();
        let data = vec![255u8; 1920 * 1080 * 4]; // 1080p RGBA image
        loader.cache_image(url.clone(), data.clone(), 1920, 1080);

        // Check cache
        assert_eq!(loader.cache_size(), 1);
        assert!(loader.is_cached(&url));

        // Retrieve cached image
        let cached = loader.get_cached_image(&url);
        assert!(cached.is_some());
        let (cached_data, width, height) = cached.unwrap();
        assert_eq!(width, 1920);
        assert_eq!(height, 1080);
        assert_eq!(cached_data.len(), 1920 * 1080 * 4);

        // Clear cache
        loader.clear_cache();
        assert_eq!(loader.cache_size(), 0);
        assert!(!loader.is_cached(&url));
    }

    // WASM-specific tests that require a browser environment
    #[cfg(target_arch = "wasm32")]
    mod wasm_tests {
        use super::*;
        use wasm_bindgen_test::*;

        wasm_bindgen_test_configure!(run_in_browser);

        #[wasm_bindgen_test]
        async fn test_video_frame_capture() {
            // This test requires:
            // 1. A video element in the DOM with id "test-video"
            // 2. The video to be loaded and have valid dimensions
            //
            // Example setup:
            // <video id="test-video" src="test.mp4" autoplay muted></video>

            // Wait for video to load (in real test)
            // let result = BrowserMediaLoader::capture_video_frame("test-video");
            // assert!(result.is_ok());
            // let (data, width, height) = result.unwrap();
            // assert!(width > 0);
            // assert!(height > 0);
            // assert_eq!(data.len(), (width * height * 4) as usize);
        }

        #[wasm_bindgen_test]
        fn test_missing_video_element() {
            // Test that we get appropriate error for missing element
            let result = BrowserMediaLoader::capture_video_frame("non-existent-video");
            assert!(result.is_err());
        }
    }
}
