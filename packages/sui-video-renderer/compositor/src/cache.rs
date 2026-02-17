//! # Frame Cache
//!
//! LRU-based frame caching system with memory budget management.
//!
//! The cache stores decoded frames to avoid redundant decoding during timeline
//! scrubbing and playback. It uses an LRU (Least Recently Used) eviction policy
//! and tracks memory usage to stay within a configurable budget.
//!
//! ## Example
//!
//! ```no_run
//! use video_compositor::{FrameCache, CacheKey};
//! use image::RgbaImage;
//!
//! // Create a cache with 512MB budget
//! let mut cache = FrameCache::new(512 * 1024 * 1024);
//!
//! // Insert a frame
//! let key = CacheKey {
//!     source_id: "video1".to_string(),
//!     timestamp_ms: 1000,
//! };
//! let frame = RgbaImage::new(1920, 1080);
//! cache.insert(key.clone(), frame);
//!
//! // Retrieve the frame
//! if let Some(cached_frame) = cache.get(&key) {
//!     // Frame is shared via Arc - no copying needed
//!     println!("Cache hit!");
//! }
//! ```

use std::sync::Arc;
use std::collections::hash_map::DefaultHasher;
use std::hash::{Hash, Hasher};
use std::time::Instant;
use image::RgbaImage;
use lru::LruCache;

/// Cache key identifying a unique frame in the cache.
///
/// Combines source identifier and timestamp to uniquely identify frames
/// across multiple video sources.
#[derive(Hash, Eq, PartialEq, Clone, Debug)]
pub struct CacheKey {
    /// Unique identifier for the video source
    pub source_id: String,
    /// Frame timestamp in milliseconds
    pub timestamp_ms: u64,
}

/// LRU frame cache with memory budget management.
///
/// Caches decoded video frames to avoid redundant decoding operations.
/// Uses LRU eviction when memory budget is exceeded.
///
/// ## Memory Management
///
/// Each frame's memory usage is calculated as: `width * height * 4 bytes`
/// (RGBA format). When the total memory usage exceeds the budget, the least
/// recently used frames are evicted.
///
/// ## Thread Safety
///
/// Frames are wrapped in `Arc<RgbaImage>` to allow efficient sharing across
/// threads without copying.
pub struct FrameCache {
    /// LRU cache storing frames
    cache: LruCache<CacheKey, Arc<RgbaImage>>,
    /// Maximum allowed memory usage in bytes
    max_memory_bytes: usize,
    /// Current memory usage in bytes
    current_memory_bytes: usize,
}

impl FrameCache {
    /// Default cache size: 512MB (enough for ~60 frames at 1080p)
    pub const DEFAULT_MAX_MEMORY_BYTES: usize = 512 * 1024 * 1024;

    /// Creates a new frame cache with the specified memory budget.
    ///
    /// # Arguments
    ///
    /// * `max_memory_bytes` - Maximum memory budget in bytes
    ///
    /// # Example
    ///
    /// ```no_run
    /// use video_compositor::FrameCache;
    ///
    /// // Create cache with 512MB budget
    /// let cache = FrameCache::new(512 * 1024 * 1024);
    /// ```
    pub fn new(max_memory_bytes: usize) -> Self {
        // LRU cache with unbounded capacity - we manage eviction manually via memory budget
        let cache = LruCache::unbounded();

        Self {
            cache,
            max_memory_bytes,
            current_memory_bytes: 0,
        }
    }

    /// Retrieves a frame from the cache.
    ///
    /// Updates the LRU order, marking this frame as recently used.
    ///
    /// # Arguments
    ///
    /// * `key` - Cache key identifying the frame
    ///
    /// # Returns
    ///
    /// `Some(Arc<RgbaImage>)` if the frame is cached, `None` otherwise.
    pub fn get(&mut self, key: &CacheKey) -> Option<Arc<RgbaImage>> {
        self.cache.get(key).cloned()
    }

    /// Inserts a frame into the cache.
    ///
    /// If inserting this frame would exceed the memory budget, least recently
    /// used frames are evicted first. The frame is wrapped in an `Arc` for
    /// efficient sharing.
    ///
    /// # Arguments
    ///
    /// * `key` - Cache key identifying the frame
    /// * `frame` - The frame to cache
    pub fn insert(&mut self, key: CacheKey, frame: RgbaImage) {
        let frame_size = Self::calculate_frame_size(&frame);
        let frame_arc = Arc::new(frame);

        // If key already exists, remove old entry first to update memory accounting
        if let Some(old_frame) = self.cache.peek(&key) {
            let old_size = Self::calculate_frame_size(old_frame);
            self.current_memory_bytes = self.current_memory_bytes.saturating_sub(old_size);
        }

        self.cache.put(key, frame_arc);
        self.current_memory_bytes += frame_size;

        // Evict if over budget
        self.evict_to_budget();
    }

    /// Returns the current memory usage in bytes.
    pub fn memory_usage(&self) -> usize {
        self.current_memory_bytes
    }

    /// Clears all frames from the cache.
    pub fn clear(&mut self) {
        self.cache.clear();
        self.current_memory_bytes = 0;
    }

    /// Evicts frames until memory usage is within budget.
    ///
    /// Removes the least recently used frames first. This is automatically
    /// called after each insert, but can also be called manually if the
    /// budget is reduced.
    pub fn evict_to_budget(&mut self) {
        while self.current_memory_bytes > self.max_memory_bytes {
            if let Some((_, frame)) = self.cache.pop_lru() {
                let frame_size = Self::calculate_frame_size(&frame);
                self.current_memory_bytes = self.current_memory_bytes.saturating_sub(frame_size);
            } else {
                // Cache is empty
                break;
            }
        }
    }

    /// Returns the number of frames in the cache.
    pub fn len(&self) -> usize {
        self.cache.len()
    }

    /// Returns `true` if the cache is empty.
    pub fn is_empty(&self) -> bool {
        self.cache.len() == 0
    }

    /// Updates the maximum memory budget.
    ///
    /// If the new budget is lower than current usage, frames will be evicted
    /// to meet the new budget.
    ///
    /// # Arguments
    ///
    /// * `max_memory_bytes` - New maximum memory budget in bytes
    pub fn set_max_memory(&mut self, max_memory_bytes: usize) {
        self.max_memory_bytes = max_memory_bytes;
        self.evict_to_budget();
    }

    /// Returns the maximum memory budget in bytes.
    pub fn max_memory(&self) -> usize {
        self.max_memory_bytes
    }

    /// Calculates the memory size of a frame in bytes.
    ///
    /// Formula: width * height * 4 (RGBA format)
    fn calculate_frame_size(frame: &RgbaImage) -> usize {
        (frame.width() * frame.height() * 4) as usize
    }

}

impl Default for FrameCache {
    fn default() -> Self {
        Self::new(Self::DEFAULT_MAX_MEMORY_BYTES)
    }
}

/// Cache key for composed frames based on layer state hash.
///
/// This key represents the complete state of all layers that contribute
/// to a composed output frame, including layer IDs, transform values,
/// blend modes, and z-indices.
#[derive(Hash, Eq, PartialEq, Clone, Debug)]
pub struct ComposedFrameCacheKey {
    /// Hash of all layer states
    pub state_hash: u64,
}

impl ComposedFrameCacheKey {
    /// Create a new cache key from layer state.
    ///
    /// The key is generated by hashing all layer properties that affect
    /// the final composed output. This includes:
    /// - Layer IDs
    /// - Transform values (position, scale, rotation, etc.)
    /// - Blend modes
    /// - Z-indices
    /// - Visibility flags
    ///
    /// # Type Parameters
    ///
    /// * `T` - Any type that implements Hash (typically layer data)
    pub fn from_state<T: Hash>(state: &T) -> Self {
        let mut hasher = DefaultHasher::new();
        state.hash(&mut hasher);
        Self {
            state_hash: hasher.finish(),
        }
    }
}

/// LRU cache for fully composed output frames.
///
/// This cache stores complete composed frames based on layer state.
/// When all layers are identical to a previous compose call, the cached
/// result is returned instead of re-composing.
///
/// ## Usage
///
/// ```no_run
/// use video_compositor::{ComposedFrameCache, ComposedFrameCacheKey};
/// use image::RgbaImage;
///
/// let mut cache = ComposedFrameCache::new(256 * 1024 * 1024);
///
/// // Create a key from layer state (any hashable type)
/// let state_data = ("layer_id_1", "layer_id_2");
/// let key = ComposedFrameCacheKey::from_state(&state_data);
///
/// // Check cache before composing
/// if let Some(frame) = cache.get(&key) {
///     // Use cached frame
/// } else {
///     // Compose frame and cache it
///     let frame = RgbaImage::new(1920, 1080);
///     cache.insert(key, frame);
/// }
/// ```
pub struct ComposedFrameCache {
    /// Underlying LRU cache
    cache: LruCache<ComposedFrameCacheKey, Arc<RgbaImage>>,
    /// Maximum allowed memory usage in bytes
    max_memory_bytes: usize,
    /// Current memory usage in bytes
    current_memory_bytes: usize,
}

impl ComposedFrameCache {
    /// Default cache size: 256MB
    pub const DEFAULT_MAX_MEMORY_BYTES: usize = 256 * 1024 * 1024;

    /// Creates a new composed frame cache with the specified memory budget.
    pub fn new(max_memory_bytes: usize) -> Self {
        Self {
            cache: LruCache::unbounded(),
            max_memory_bytes,
            current_memory_bytes: 0,
        }
    }

    /// Retrieves a composed frame from the cache.
    pub fn get(&mut self, key: &ComposedFrameCacheKey) -> Option<Arc<RgbaImage>> {
        self.cache.get(key).cloned()
    }

    /// Inserts a composed frame into the cache.
    ///
    /// Evicts least recently used frames if memory budget is exceeded.
    pub fn insert(&mut self, key: ComposedFrameCacheKey, frame: RgbaImage) {
        let frame_size = Self::calculate_frame_size(&frame);
        let frame_arc = Arc::new(frame);

        // Remove old entry if key exists
        if let Some(old_frame) = self.cache.peek(&key) {
            let old_size = Self::calculate_frame_size(old_frame);
            self.current_memory_bytes = self.current_memory_bytes.saturating_sub(old_size);
        }

        self.cache.put(key, frame_arc);
        self.current_memory_bytes += frame_size;

        // Evict if over budget
        self.evict_to_budget();
    }

    /// Returns the current memory usage in bytes.
    pub fn memory_usage(&self) -> usize {
        self.current_memory_bytes
    }

    /// Clears all frames from the cache.
    pub fn clear(&mut self) {
        self.cache.clear();
        self.current_memory_bytes = 0;
    }

    /// Evicts frames until memory usage is within budget.
    fn evict_to_budget(&mut self) {
        while self.current_memory_bytes > self.max_memory_bytes {
            if let Some((_, frame)) = self.cache.pop_lru() {
                let frame_size = Self::calculate_frame_size(&frame);
                self.current_memory_bytes = self.current_memory_bytes.saturating_sub(frame_size);
            } else {
                break;
            }
        }
    }

    /// Returns the number of frames in the cache.
    pub fn len(&self) -> usize {
        self.cache.len()
    }

    /// Returns `true` if the cache is empty.
    pub fn is_empty(&self) -> bool {
        self.cache.len() == 0
    }

    /// Calculates the memory size of a frame in bytes.
    fn calculate_frame_size(frame: &RgbaImage) -> usize {
        (frame.width() * frame.height() * 4) as usize
    }
}

impl Default for ComposedFrameCache {
    fn default() -> Self {
        Self::new(Self::DEFAULT_MAX_MEMORY_BYTES)
    }
}

/// Playback direction for predictive prefetching.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum PlaybackDirection {
    /// Playing forward
    Forward,
    /// Playing backward
    Backward,
    /// Stationary or unknown
    Unknown,
}

/// Predictive frame prefetcher.
///
/// Tracks playhead position and direction to predict which frames
/// will be needed next, allowing pre-population of the cache for
/// smoother playback.
///
/// ## Example
///
/// ```no_run
/// use video_compositor::Prefetcher;
///
/// let mut prefetcher = Prefetcher::new(10); // Prefetch next 10 frames
///
/// // Track playhead movement
/// prefetcher.track_position(0.0);
/// prefetcher.track_position(16.66);  // ~60fps forward
/// prefetcher.track_position(33.33);
///
/// // Get suggested frames to prefetch
/// if let Some((direction, timestamps)) = prefetcher.predict_next_frames(50.0) {
///     // Prefetch these timestamps in background
/// }
/// ```
pub struct Prefetcher {
    /// Number of frames to prefetch
    prefetch_count: usize,
    /// Recent timestamp history for direction detection
    timestamp_history: Vec<f64>,
    /// Maximum history size
    max_history_size: usize,
    /// Last prefetched timestamps
    last_prefetched: Vec<f64>,
}

impl Prefetcher {
    /// Default number of frames to prefetch
    pub const DEFAULT_PREFETCH_COUNT: usize = 10;

    /// Creates a new prefetcher.
    ///
    /// # Arguments
    ///
    /// * `prefetch_count` - Number of frames to prefetch (default: 10)
    pub fn new(prefetch_count: usize) -> Self {
        Self {
            prefetch_count,
            timestamp_history: Vec::with_capacity(5),
            max_history_size: 5,
            last_prefetched: Vec::new(),
        }
    }

    /// Track a playhead position.
    ///
    /// Call this method each time the playhead moves to help the
    /// prefetcher predict the direction and speed of playback.
    pub fn track_position(&mut self, timestamp_ms: f64) {
        self.timestamp_history.push(timestamp_ms);

        // Keep only recent history
        if self.timestamp_history.len() > self.max_history_size {
            self.timestamp_history.remove(0);
        }
    }

    /// Predict the next frames to prefetch based on playhead movement.
    ///
    /// Returns the detected direction and a list of timestamps to prefetch,
    /// or None if there's insufficient history to predict.
    ///
    /// # Arguments
    ///
    /// * `current_timestamp_ms` - Current playhead position
    ///
    /// # Returns
    ///
    /// `Some((direction, timestamps))` if prediction is possible, `None` otherwise.
    pub fn predict_next_frames(&mut self, current_timestamp_ms: f64) -> Option<(PlaybackDirection, Vec<f64>)> {
        if self.timestamp_history.len() < 2 {
            return None;
        }

        // Detect direction from recent history
        let direction = self.detect_direction();

        if direction == PlaybackDirection::Unknown {
            return None;
        }

        // Calculate average frame delta
        let avg_delta = self.calculate_average_delta();

        if avg_delta.abs() < 0.001 {
            return None;
        }

        // Generate prefetch timestamps
        let mut timestamps = Vec::with_capacity(self.prefetch_count);
        for i in 1..=self.prefetch_count {
            let next_timestamp = current_timestamp_ms + (avg_delta * i as f64);
            timestamps.push(next_timestamp.max(0.0)); // Don't prefetch negative timestamps
        }

        self.last_prefetched = timestamps.clone();

        Some((direction, timestamps))
    }

    /// Detect playback direction from timestamp history.
    fn detect_direction(&self) -> PlaybackDirection {
        if self.timestamp_history.len() < 2 {
            return PlaybackDirection::Unknown;
        }

        let mut forward_count = 0;
        let mut backward_count = 0;

        for i in 1..self.timestamp_history.len() {
            let delta = self.timestamp_history[i] - self.timestamp_history[i - 1];
            if delta > 0.0 {
                forward_count += 1;
            } else if delta < 0.0 {
                backward_count += 1;
            }
        }

        if forward_count > backward_count {
            PlaybackDirection::Forward
        } else if backward_count > forward_count {
            PlaybackDirection::Backward
        } else {
            PlaybackDirection::Unknown
        }
    }

    /// Calculate average time delta between recent frames.
    fn calculate_average_delta(&self) -> f64 {
        if self.timestamp_history.len() < 2 {
            return 0.0;
        }

        let mut sum = 0.0;
        let mut count = 0;

        for i in 1..self.timestamp_history.len() {
            sum += self.timestamp_history[i] - self.timestamp_history[i - 1];
            count += 1;
        }

        if count > 0 {
            sum / count as f64
        } else {
            0.0
        }
    }

    /// Clear tracking history.
    pub fn clear(&mut self) {
        self.timestamp_history.clear();
        self.last_prefetched.clear();
    }

    /// Get the last prefetched timestamps.
    pub fn last_prefetched(&self) -> &[f64] {
        &self.last_prefetched
    }
}

impl Default for Prefetcher {
    fn default() -> Self {
        Self::new(Self::DEFAULT_PREFETCH_COUNT)
    }
}

/// Scrubbing detector for adaptive resolution scaling.
///
/// Detects when the playhead is being scrubbed rapidly (many setTime calls
/// per second) and suggests rendering at reduced resolution for better
/// performance.
///
/// ## Example
///
/// ```no_run
/// use video_compositor::ScrubbingDetector;
///
/// let mut detector = ScrubbingDetector::new();
///
/// // Track each setTime call
/// detector.track_call();
/// detector.track_call();
/// // ... many rapid calls ...
///
/// // Check if we should use reduced resolution
/// if detector.is_scrubbing() {
///     let scale = detector.suggested_resolution_scale();
///     // Render at scale * normal_resolution
/// }
/// ```
pub struct ScrubbingDetector {
    /// Recent call timestamps
    call_times: Vec<Instant>,
    /// Window size for measuring call rate (milliseconds)
    window_ms: u64,
    /// Threshold calls per second to consider scrubbing
    scrubbing_threshold: f64,
    /// Resolution scale to use during scrubbing
    scrubbing_resolution_scale: f32,
}

impl ScrubbingDetector {
    /// Default window size: 1 second
    pub const DEFAULT_WINDOW_MS: u64 = 1000;

    /// Default scrubbing threshold: 30 calls/second
    pub const DEFAULT_SCRUBBING_THRESHOLD: f64 = 30.0;

    /// Default resolution scale during scrubbing: 50%
    pub const DEFAULT_SCRUBBING_SCALE: f32 = 0.5;

    /// Creates a new scrubbing detector with default settings.
    pub fn new() -> Self {
        Self {
            call_times: Vec::with_capacity(100),
            window_ms: Self::DEFAULT_WINDOW_MS,
            scrubbing_threshold: Self::DEFAULT_SCRUBBING_THRESHOLD,
            scrubbing_resolution_scale: Self::DEFAULT_SCRUBBING_SCALE,
        }
    }

    /// Creates a scrubbing detector with custom settings.
    ///
    /// # Arguments
    ///
    /// * `scrubbing_threshold` - Calls per second threshold for scrubbing detection
    /// * `resolution_scale` - Resolution scale factor during scrubbing (0.0-1.0)
    pub fn with_settings(scrubbing_threshold: f64, resolution_scale: f32) -> Self {
        Self {
            call_times: Vec::with_capacity(100),
            window_ms: Self::DEFAULT_WINDOW_MS,
            scrubbing_threshold,
            scrubbing_resolution_scale: resolution_scale.clamp(0.1, 1.0),
        }
    }

    /// Track a setTime call.
    ///
    /// Call this method each time the playhead position is updated
    /// to help detect scrubbing behavior.
    pub fn track_call(&mut self) {
        let now = Instant::now();
        self.call_times.push(now);

        // Clean up old entries outside the window
        self.cleanup_old_calls();
    }

    /// Remove calls older than the tracking window.
    fn cleanup_old_calls(&mut self) {
        if self.call_times.is_empty() {
            return;
        }

        let now = Instant::now();
        let window_duration = std::time::Duration::from_millis(self.window_ms);

        // Remove calls older than the window
        self.call_times.retain(|&time| {
            now.duration_since(time) <= window_duration
        });
    }

    /// Calculate current call rate (calls per second).
    pub fn call_rate(&mut self) -> f64 {
        self.cleanup_old_calls();

        if self.call_times.is_empty() {
            return 0.0;
        }

        // Calculate calls per second over the window
        let calls_in_window = self.call_times.len() as f64;
        let window_seconds = self.window_ms as f64 / 1000.0;

        calls_in_window / window_seconds
    }

    /// Check if currently scrubbing.
    ///
    /// Returns `true` if the call rate exceeds the scrubbing threshold.
    pub fn is_scrubbing(&mut self) -> bool {
        self.call_rate() >= self.scrubbing_threshold
    }

    /// Get the suggested resolution scale factor.
    ///
    /// Returns the scrubbing scale if scrubbing is detected,
    /// otherwise returns 1.0 (full resolution).
    pub fn suggested_resolution_scale(&mut self) -> f32 {
        if self.is_scrubbing() {
            self.scrubbing_resolution_scale
        } else {
            1.0
        }
    }

    /// Clear all tracking data.
    pub fn clear(&mut self) {
        self.call_times.clear();
    }

    /// Get the number of calls in the current window.
    pub fn calls_in_window(&mut self) -> usize {
        self.cleanup_old_calls();
        self.call_times.len()
    }
}

impl Default for ScrubbingDetector {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    /// Creates a test frame with the specified dimensions
    fn create_test_frame(width: u32, height: u32) -> RgbaImage {
        RgbaImage::new(width, height)
    }

    /// Creates a test cache key
    fn create_test_key(source_id: &str, timestamp_ms: u64) -> CacheKey {
        CacheKey {
            source_id: source_id.to_string(),
            timestamp_ms,
        }
    }

    #[test]
    fn test_new_cache_is_empty() {
        let cache = FrameCache::new(1024 * 1024);
        assert_eq!(cache.len(), 0);
        assert!(cache.is_empty());
        assert_eq!(cache.memory_usage(), 0);
    }

    #[test]
    fn test_insert_and_get() {
        let mut cache = FrameCache::new(10 * 1024 * 1024);
        let key = create_test_key("video1", 1000);
        let frame = create_test_frame(100, 100);

        cache.insert(key.clone(), frame);

        assert_eq!(cache.len(), 1);
        assert!(!cache.is_empty());
        assert!(cache.get(&key).is_some());
    }

    #[test]
    fn test_cache_miss() {
        let mut cache = FrameCache::new(10 * 1024 * 1024);
        let key = create_test_key("video1", 1000);

        assert!(cache.get(&key).is_none());
    }

    #[test]
    fn test_memory_tracking() {
        let mut cache = FrameCache::new(10 * 1024 * 1024);
        let key = create_test_key("video1", 1000);

        // 100x100 RGBA = 40,000 bytes
        let frame = create_test_frame(100, 100);
        cache.insert(key, frame);

        assert_eq!(cache.memory_usage(), 40_000);
    }

    #[test]
    fn test_memory_tracking_multiple_frames() {
        let mut cache = FrameCache::new(10 * 1024 * 1024);

        // Insert first frame: 100x100 = 40,000 bytes
        cache.insert(create_test_key("video1", 1000), create_test_frame(100, 100));
        assert_eq!(cache.memory_usage(), 40_000);

        // Insert second frame: 200x200 = 160,000 bytes
        cache.insert(create_test_key("video1", 2000), create_test_frame(200, 200));
        assert_eq!(cache.memory_usage(), 200_000);

        // Insert third frame: 50x50 = 10,000 bytes
        cache.insert(create_test_key("video2", 1000), create_test_frame(50, 50));
        assert_eq!(cache.memory_usage(), 210_000);
    }

    #[test]
    fn test_lru_eviction() {
        // Budget: 100,000 bytes (can fit 2.5 frames of 100x100)
        let mut cache = FrameCache::new(100_000);

        let key1 = create_test_key("video1", 1000);
        let key2 = create_test_key("video1", 2000);
        let key3 = create_test_key("video1", 3000);

        // Insert 3 frames (40,000 bytes each)
        cache.insert(key1.clone(), create_test_frame(100, 100));
        cache.insert(key2.clone(), create_test_frame(100, 100));
        cache.insert(key3.clone(), create_test_frame(100, 100));

        // Should have evicted oldest frame (key1) to stay under budget
        assert!(cache.get(&key1).is_none(), "Oldest frame should be evicted");
        assert!(cache.get(&key2).is_some(), "Middle frame should remain");
        assert!(cache.get(&key3).is_some(), "Newest frame should remain");
        assert!(cache.memory_usage() <= 100_000, "Should be under budget");
    }

    #[test]
    fn test_lru_order_update_on_get() {
        let mut cache = FrameCache::new(100_000);

        let key1 = create_test_key("video1", 1000);
        let key2 = create_test_key("video1", 2000);
        let key3 = create_test_key("video1", 3000);

        // Insert 2 frames
        cache.insert(key1.clone(), create_test_frame(100, 100));
        cache.insert(key2.clone(), create_test_frame(100, 100));

        // Access key1 to make it recently used
        let _ = cache.get(&key1);

        // Insert third frame, should evict key2 (not key1)
        cache.insert(key3.clone(), create_test_frame(100, 100));

        assert!(cache.get(&key1).is_some(), "Recently accessed frame should remain");
        assert!(cache.get(&key2).is_none(), "Least recently used frame should be evicted");
        assert!(cache.get(&key3).is_some(), "Newest frame should remain");
    }

    #[test]
    fn test_clear() {
        let mut cache = FrameCache::new(10 * 1024 * 1024);

        cache.insert(create_test_key("video1", 1000), create_test_frame(100, 100));
        cache.insert(create_test_key("video1", 2000), create_test_frame(100, 100));

        assert_eq!(cache.len(), 2);
        assert_eq!(cache.memory_usage(), 80_000);

        cache.clear();

        assert_eq!(cache.len(), 0);
        assert!(cache.is_empty());
        assert_eq!(cache.memory_usage(), 0);
    }

    #[test]
    fn test_arc_sharing() {
        let mut cache = FrameCache::new(10 * 1024 * 1024);
        let key = create_test_key("video1", 1000);
        let frame = create_test_frame(100, 100);

        cache.insert(key.clone(), frame);

        let frame1 = cache.get(&key).unwrap();
        let frame2 = cache.get(&key).unwrap();

        // Both references should point to the same Arc
        assert_eq!(Arc::strong_count(&frame1), Arc::strong_count(&frame2));
        assert_eq!(Arc::ptr_eq(&frame1, &frame2), true);
    }

    #[test]
    fn test_replace_existing_key() {
        let mut cache = FrameCache::new(10 * 1024 * 1024);
        let key = create_test_key("video1", 1000);

        // Insert small frame
        cache.insert(key.clone(), create_test_frame(100, 100));
        assert_eq!(cache.memory_usage(), 40_000);
        assert_eq!(cache.len(), 1);

        // Replace with larger frame
        cache.insert(key.clone(), create_test_frame(200, 200));
        assert_eq!(cache.memory_usage(), 160_000);
        assert_eq!(cache.len(), 1);
    }

    #[test]
    fn test_set_max_memory_triggers_eviction() {
        let mut cache = FrameCache::new(200_000);

        // Insert 3 frames (40,000 bytes each = 120,000 total)
        let key1 = create_test_key("video1", 1000);
        let key2 = create_test_key("video1", 2000);
        let key3 = create_test_key("video1", 3000);

        cache.insert(key1.clone(), create_test_frame(100, 100));
        cache.insert(key2.clone(), create_test_frame(100, 100));
        cache.insert(key3.clone(), create_test_frame(100, 100));

        assert_eq!(cache.len(), 3);

        // Reduce budget to 100,000 bytes (should evict 1 frame)
        cache.set_max_memory(100_000);

        assert!(cache.len() <= 2, "Should have evicted at least 1 frame");
        assert!(cache.memory_usage() <= 100_000, "Should be under new budget");
    }

    #[test]
    fn test_max_memory_getter() {
        let cache = FrameCache::new(512 * 1024);
        assert_eq!(cache.max_memory(), 512 * 1024);
    }

    #[test]
    fn test_default_cache() {
        let cache = FrameCache::default();
        assert_eq!(cache.max_memory(), FrameCache::DEFAULT_MAX_MEMORY_BYTES);
        assert!(cache.is_empty());
    }

    #[test]
    fn test_evict_to_budget_manual_call() {
        let mut cache = FrameCache::new(200_000);

        // Insert frames
        cache.insert(create_test_key("video1", 1000), create_test_frame(100, 100));
        cache.insert(create_test_key("video1", 2000), create_test_frame(100, 100));
        cache.insert(create_test_key("video1", 3000), create_test_frame(100, 100));

        // Manually reduce budget
        cache.max_memory_bytes = 100_000;

        // Manually trigger eviction
        cache.evict_to_budget();

        assert!(cache.memory_usage() <= 100_000);
    }

    #[test]
    fn test_large_frame_eviction() {
        // Small budget: 50,000 bytes
        let mut cache = FrameCache::new(50_000);

        // Try to insert a frame larger than budget (100x100 = 40,000 bytes)
        let key1 = create_test_key("video1", 1000);
        cache.insert(key1.clone(), create_test_frame(100, 100));

        // Should succeed - frame fits
        assert!(cache.get(&key1).is_some());

        // Insert a huge frame (200x200 = 160,000 bytes, larger than budget)
        let key2 = create_test_key("video1", 2000);
        cache.insert(key2.clone(), create_test_frame(200, 200));

        // First frame should be evicted, and we're left with just the large frame
        // (even though it exceeds budget, we don't evict on insert of the same item)
        assert!(cache.get(&key1).is_none(), "Small frame should be evicted");
    }

    #[test]
    fn test_multiple_sources() {
        let mut cache = FrameCache::new(500_000);

        // Insert frames from different sources
        cache.insert(create_test_key("video1", 1000), create_test_frame(100, 100));
        cache.insert(create_test_key("video2", 1000), create_test_frame(100, 100));
        cache.insert(create_test_key("video3", 1000), create_test_frame(100, 100));

        // All frames should coexist
        assert_eq!(cache.len(), 3);
        assert!(cache.get(&create_test_key("video1", 1000)).is_some());
        assert!(cache.get(&create_test_key("video2", 1000)).is_some());
        assert!(cache.get(&create_test_key("video3", 1000)).is_some());
    }

    // ComposedFrameCache tests
    mod composed_frame_cache_tests {
        use super::*;

        #[test]
        fn test_composed_cache_key_same_state() {
            let state1 = vec!["layer1", "layer2"];
            let state2 = vec!["layer1", "layer2"];

            let key1 = ComposedFrameCacheKey::from_state(&state1);
            let key2 = ComposedFrameCacheKey::from_state(&state2);

            assert_eq!(key1, key2, "Same state should produce same key");
        }

        #[test]
        fn test_composed_cache_key_different_state() {
            let state1 = vec!["layer1", "layer2"];
            let state2 = vec!["layer1", "layer3"];

            let key1 = ComposedFrameCacheKey::from_state(&state1);
            let key2 = ComposedFrameCacheKey::from_state(&state2);

            assert_ne!(key1, key2, "Different state should produce different keys");
        }

        #[test]
        fn test_composed_cache_new_is_empty() {
            let cache = ComposedFrameCache::new(1024 * 1024);
            assert_eq!(cache.len(), 0);
            assert!(cache.is_empty());
            assert_eq!(cache.memory_usage(), 0);
        }

        #[test]
        fn test_composed_cache_insert_and_get() {
            let mut cache = ComposedFrameCache::new(10 * 1024 * 1024);
            let state = vec!["layer1", "layer2"];
            let key = ComposedFrameCacheKey::from_state(&state);
            let frame = create_test_frame(100, 100);

            cache.insert(key.clone(), frame);

            assert_eq!(cache.len(), 1);
            assert!(!cache.is_empty());
            assert!(cache.get(&key).is_some());
        }

        #[test]
        fn test_composed_cache_hit_returns_cached() {
            let mut cache = ComposedFrameCache::new(10 * 1024 * 1024);
            let state = vec!["layer1", "layer2"];
            let key = ComposedFrameCacheKey::from_state(&state);
            let frame = create_test_frame(100, 100);

            cache.insert(key.clone(), frame);

            // Cache hit should return the same frame
            let cached = cache.get(&key);
            assert!(cached.is_some(), "Should have cached frame");

            // Verify it's the same Arc
            let cached1 = cache.get(&key).unwrap();
            let cached2 = cache.get(&key).unwrap();
            assert!(Arc::ptr_eq(&cached1, &cached2), "Should return same Arc");
        }

        #[test]
        fn test_composed_cache_miss_on_changed_state() {
            let mut cache = ComposedFrameCache::new(10 * 1024 * 1024);
            let state1 = vec!["layer1", "layer2"];
            let state2 = vec!["layer1", "layer3"]; // Different state

            let key1 = ComposedFrameCacheKey::from_state(&state1);
            let frame = create_test_frame(100, 100);

            cache.insert(key1, frame);

            // Different state should produce cache miss
            let key2 = ComposedFrameCacheKey::from_state(&state2);
            assert!(cache.get(&key2).is_none(), "Changed state should miss cache");
        }

        #[test]
        fn test_composed_cache_eviction() {
            // Budget: 100,000 bytes (can fit 2.5 frames of 100x100)
            let mut cache = ComposedFrameCache::new(100_000);

            let state1 = vec!["layer1"];
            let state2 = vec!["layer2"];
            let state3 = vec!["layer3"];

            let key1 = ComposedFrameCacheKey::from_state(&state1);
            let key2 = ComposedFrameCacheKey::from_state(&state2);
            let key3 = ComposedFrameCacheKey::from_state(&state3);

            // Insert 3 frames (40,000 bytes each)
            cache.insert(key1.clone(), create_test_frame(100, 100));
            cache.insert(key2.clone(), create_test_frame(100, 100));
            cache.insert(key3.clone(), create_test_frame(100, 100));

            // Should have evicted oldest frame
            assert!(cache.get(&key1).is_none(), "Oldest frame should be evicted");
            assert!(cache.get(&key2).is_some(), "Middle frame should remain");
            assert!(cache.get(&key3).is_some(), "Newest frame should remain");
            assert!(cache.memory_usage() <= 100_000, "Should be under budget");
        }

        #[test]
        fn test_composed_cache_clear() {
            let mut cache = ComposedFrameCache::new(10 * 1024 * 1024);
            let key = ComposedFrameCacheKey::from_state(&vec!["layer1"]);

            cache.insert(key.clone(), create_test_frame(100, 100));
            assert_eq!(cache.len(), 1);

            cache.clear();

            assert_eq!(cache.len(), 0);
            assert!(cache.is_empty());
            assert_eq!(cache.memory_usage(), 0);
        }
    }

    // Prefetcher tests
    mod prefetcher_tests {
        use super::*;

        #[test]
        fn test_prefetcher_new() {
            let prefetcher = Prefetcher::new(10);
            assert_eq!(prefetcher.prefetch_count, 10);
            assert!(prefetcher.timestamp_history.is_empty());
        }

        #[test]
        fn test_prefetcher_insufficient_history() {
            let mut prefetcher = Prefetcher::new(10);
            prefetcher.track_position(0.0);

            // Not enough history to predict
            assert!(prefetcher.predict_next_frames(16.66).is_none());
        }

        #[test]
        fn test_prefetcher_forward_direction() {
            let mut prefetcher = Prefetcher::new(10);

            // Simulate forward playback at ~60fps
            prefetcher.track_position(0.0);
            prefetcher.track_position(16.66);
            prefetcher.track_position(33.33);
            prefetcher.track_position(50.0);

            let result = prefetcher.predict_next_frames(66.66);
            assert!(result.is_some());

            let (direction, timestamps) = result.unwrap();
            assert_eq!(direction, PlaybackDirection::Forward);
            assert_eq!(timestamps.len(), 10);

            // Timestamps should be increasing
            for i in 1..timestamps.len() {
                assert!(timestamps[i] > timestamps[i - 1]);
            }
        }

        #[test]
        fn test_prefetcher_backward_direction() {
            let mut prefetcher = Prefetcher::new(5);

            // Simulate backward playback
            prefetcher.track_position(100.0);
            prefetcher.track_position(83.33);
            prefetcher.track_position(66.66);
            prefetcher.track_position(50.0);

            let result = prefetcher.predict_next_frames(33.33);
            assert!(result.is_some());

            let (direction, timestamps) = result.unwrap();
            assert_eq!(direction, PlaybackDirection::Backward);
            assert_eq!(timestamps.len(), 5);

            // Timestamps should be decreasing (but no negative values)
            for i in 1..timestamps.len() {
                assert!(timestamps[i] <= timestamps[i - 1] || timestamps[i] == 0.0);
            }
        }

        #[test]
        fn test_prefetcher_clear() {
            let mut prefetcher = Prefetcher::new(10);
            prefetcher.track_position(0.0);
            prefetcher.track_position(16.66);

            prefetcher.clear();

            assert!(prefetcher.timestamp_history.is_empty());
            assert!(prefetcher.last_prefetched.is_empty());
        }

        #[test]
        fn test_prefetcher_no_negative_timestamps() {
            let mut prefetcher = Prefetcher::new(10);

            // Simulate backward playback starting near zero
            prefetcher.track_position(50.0);
            prefetcher.track_position(33.33);
            prefetcher.track_position(16.66);

            let result = prefetcher.predict_next_frames(0.0);

            if let Some((_, timestamps)) = result {
                // All timestamps should be >= 0
                for ts in timestamps {
                    assert!(ts >= 0.0, "Timestamp should not be negative: {}", ts);
                }
            }
        }
    }

    // ScrubbingDetector tests
    mod scrubbing_detector_tests {
        use super::*;
        use std::thread;
        use std::time::Duration;

        #[test]
        fn test_scrubbing_detector_new() {
            let detector = ScrubbingDetector::new();
            assert!(detector.call_times.is_empty());
        }

        #[test]
        fn test_scrubbing_detector_not_scrubbing_initially() {
            let mut detector = ScrubbingDetector::new();
            assert!(!detector.is_scrubbing());
            assert_eq!(detector.suggested_resolution_scale(), 1.0);
        }

        #[test]
        fn test_scrubbing_detector_detects_high_call_rate() {
            let mut detector = ScrubbingDetector::with_settings(10.0, 0.5);

            // Make 20 calls rapidly (should exceed 10 calls/sec threshold)
            for _ in 0..20 {
                detector.track_call();
            }

            assert!(detector.is_scrubbing(), "Should detect scrubbing with high call rate");
            assert_eq!(detector.suggested_resolution_scale(), 0.5);
        }

        #[test]
        fn test_scrubbing_detector_normal_playback() {
            let mut detector = ScrubbingDetector::with_settings(30.0, 0.5);

            // Make a few calls (below threshold)
            for _ in 0..5 {
                detector.track_call();
                thread::sleep(Duration::from_millis(50)); // 20 calls/sec max
            }

            // Should not be scrubbing (20 calls/sec < 30 threshold)
            assert!(!detector.is_scrubbing(), "Should not detect scrubbing at normal rate");
            assert_eq!(detector.suggested_resolution_scale(), 1.0);
        }

        #[test]
        fn test_scrubbing_detector_cleanup_old_calls() {
            let mut detector = ScrubbingDetector::new();

            // Make some calls
            detector.track_call();
            detector.track_call();

            // Manually set old timestamp to force cleanup
            if !detector.call_times.is_empty() {
                detector.call_times[0] = Instant::now() - Duration::from_secs(2);
            }

            // Cleanup should remove old calls
            detector.cleanup_old_calls();

            // Should have removed the old call
            assert_eq!(detector.call_times.len(), 1);
        }

        #[test]
        fn test_scrubbing_detector_clear() {
            let mut detector = ScrubbingDetector::new();

            detector.track_call();
            detector.track_call();

            detector.clear();

            assert!(detector.call_times.is_empty());
            assert_eq!(detector.calls_in_window(), 0);
        }

        #[test]
        fn test_scrubbing_detector_call_rate_calculation() {
            let mut detector = ScrubbingDetector::new();

            // Make 10 calls
            for _ in 0..10 {
                detector.track_call();
            }

            let rate = detector.call_rate();

            // With 1 second window and 10 calls, rate should be ~10 calls/sec
            assert!(rate >= 9.0 && rate <= 11.0, "Call rate should be ~10/sec, got {}", rate);
        }

        #[test]
        fn test_scrubbing_detector_custom_settings() {
            let detector = ScrubbingDetector::with_settings(50.0, 0.25);

            assert_eq!(detector.scrubbing_threshold, 50.0);
            assert_eq!(detector.scrubbing_resolution_scale, 0.25);
        }

        #[test]
        fn test_scrubbing_detector_scale_clamping() {
            let detector = ScrubbingDetector::with_settings(30.0, 2.0); // Try to set > 1.0

            // Should be clamped to 1.0
            assert_eq!(detector.scrubbing_resolution_scale, 1.0);
        }
    }
}
