//! # Video Compositor
//!
//! High-performance frame composition library for video rendering.
//!
//! ## Features
//!
//! - Multi-layer image composition
//! - Advanced blending modes
//! - Transform operations (position, scale, rotate, opacity)
//! - Text rendering
//! - Effects (blur, shadows, gradients)
//! - Parallel frame processing
//!
//! ## Example
//!
//! ```no_run
//! use video_compositor::{Compositor, Layer, Transform, BlendMode};
//!
//! let compositor = Compositor::new(1920, 1080)?;
//! let layers = vec![
//!     Layer::image("background.png", Transform::default()),
//!     Layer::image("overlay.png", Transform::new().with_position(100.0, 100.0).with_opacity(0.8)),
//! ];
//! let frame = compositor.compose(&layers)?;
//! frame.save("output.png")?;
//! # Ok::<(), Box<dyn std::error::Error>>(())
//! ```

pub mod animated;
pub mod blend;
pub mod cache;
pub mod compositor;
pub mod effects;
pub mod frame;
pub mod keyframe;
pub mod layer;
pub mod text;
pub mod transform;
pub mod types;

#[cfg(not(target_arch = "wasm32"))]
pub mod video;

pub use animated::{AnimatedLayer, AnimatedTransform};
pub use compositor::Compositor;
pub use blend::BlendMode;
pub use cache::{FrameCache, CacheKey};
pub use effects::{Effect, GradientStop};
pub use frame::Frame;
pub use keyframe::{AnimatedProperty, EasingFunction, Interpolate, Keyframe, StepPosition};
pub use layer::Layer;
pub use text::{TextAlignment, TextRenderer, TextShadow, TextStyle, Stroke};
pub use transform::Transform;
pub use types::{Color, Point, Rect, Size};

/// Result type for compositor operations
pub type Result<T> = std::result::Result<T, Error>;

/// Compositor error types
#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error("Image error: {0}")]
    Image(#[from] image::ImageError),

    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),

    #[error("Invalid dimensions: {0}x{1}")]
    InvalidDimensions(u32, u32),

    #[error("Invalid layer: {0}")]
    InvalidLayer(String),

    #[error("Effect error: {0}")]
    Effect(String),

    #[error("Render error: {0}")]
    Render(String),

    #[error("Invalid transform: {0}")]
    InvalidTransform(String),
}
