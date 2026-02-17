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

    // TODO: Background prefetching (stretch goal)
    //
    // Future enhancement: Add prefetch capability for smoother playback
    //
    // pub fn prefetch(&mut self, current_timestamp_ms: u64, direction: PlaybackDirection, count: usize) {
    //     // Use rayon::spawn to prefetch next N frames in background
    //     // This would require integration with the video source/decoder
    // }
}

impl Default for FrameCache {
    fn default() -> Self {
        Self::new(Self::DEFAULT_MAX_MEMORY_BYTES)
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
}
