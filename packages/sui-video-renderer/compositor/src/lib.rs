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
//! let compositor = Compositor::new(1920, 1080);
//! let layers = vec![
//!     Layer::image("background.png", Transform::default()),
//!     Layer::image("overlay.png", Transform::new(100, 100, 0.8)),
//! ];
//! let frame = compositor.compose(&layers)?;
//! frame.save("output.png")?;
//! # Ok::<(), Box<dyn std::error::Error>>(())
//! ```

pub mod blend;
pub mod compositor;
pub mod effects;
pub mod frame;
pub mod layer;
pub mod transform;
pub mod types;

pub use compositor::Compositor;
pub use blend::BlendMode;
pub use effects::Effect;
pub use frame::Frame;
pub use layer::Layer;
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
}
