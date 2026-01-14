/**
 * RenderEngine
 *
 * Canvas-based video rendering engine for .sue manifests.
 * Renders frames deterministically for video encoding.
 */
class RenderEngine {
  constructor(manifest, canvas) {
    this.manifest = manifest;
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', {
      alpha: true,
      willReadFrequently: true
    });
    this.currentTime = 0;
    this.fps = manifest.fps || 60;

    // Media element caches
    this.videoElements = new Map();
    this.imageElements = new Map();
    this.loadedAssets = new Set();

    // Performance tracking
    this.frameCount = 0;
    this.renderTimes = [];

    // Set canvas size
    this.canvas.width = manifest.width;
    this.canvas.height = manifest.height;
  }

  /**
   * Initialize render engine and preload all media assets
   */
  async init() {
    console.log('Initializing render engine...');
    console.log(`Canvas: ${this.canvas.width}x${this.canvas.height} @ ${this.fps}fps`);

    await this.loadAssets();
    console.log('Render engine initialized');
  }

  /**
   * Preload all media assets (videos, images)
   */
  async loadAssets() {
    const loadPromises = [];

    for (const track of this.manifest.tracks) {
      if (track.controllerName === 'video') {
        loadPromises.push(this.loadVideo(track));
      } else if (track.controllerName === 'image') {
        loadPromises.push(this.loadImage(track));
      }
    }

    await Promise.all(loadPromises);
    console.log(`Loaded ${this.loadedAssets.size} assets`);
  }

  /**
   * Load video element
   */
  async loadVideo(track) {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'auto';
      video.muted = true;
      video.playsInline = true;

      video.addEventListener('loadeddata', () => {
        console.log(`Video loaded: ${track.name} (${video.videoWidth}x${video.videoHeight})`);
        this.videoElements.set(track.id, video);
        this.loadedAssets.add(track.id);
        resolve();
      });

      video.addEventListener('error', (e) => {
        console.error(`Failed to load video: ${track.url}`, e);
        reject(new Error(`Failed to load video: ${track.url}`));
      });

      video.src = track.url;
      video.load();
    });
  }

  /**
   * Load image element
   */
  async loadImage(track) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        console.log(`Image loaded: ${track.name} (${img.width}x${img.height})`);
        this.imageElements.set(track.id, img);
        this.loadedAssets.add(track.id);
        resolve();
      };

      img.onerror = (e) => {
        console.error(`Failed to load image: ${track.url}`, e);
        reject(new Error(`Failed to load image: ${track.url}`));
      };

      img.src = track.url;
    });
  }

  /**
   * Render a single frame at the specified time
   *
   * @param {number} time - Time in seconds
   * @returns {string} - Base64 encoded PNG data URL
   */
  renderFrame(time) {
    const startTime = performance.now();

    this.currentTime = time;

    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw background
    this.drawBackground();

    // Get active actions at this time
    const activeActions = this.getActiveActions(time);

    // Draw each layer
    for (const action of activeActions) {
      this.drawAction(action);
    }

    // Track performance
    const renderTime = performance.now() - startTime;
    this.renderTimes.push(renderTime);
    this.frameCount++;

    if (this.frameCount % 60 === 0) {
      const avgTime = this.renderTimes.reduce((a, b) => a + b, 0) / this.renderTimes.length;
      console.log(`Rendered ${this.frameCount} frames, avg: ${avgTime.toFixed(2)}ms/frame`);
      this.renderTimes = [];
    }

    // Return frame data as PNG
    return this.canvas.toDataURL('image/png');
  }

  /**
   * Draw background color or transparency
   */
  drawBackground() {
    if (this.manifest.backgroundColor !== 'transparent') {
      this.ctx.fillStyle = this.manifest.backgroundColor;
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  /**
   * Get all active actions at the specified time, sorted by z-order
   */
  getActiveActions(time) {
    const active = [];

    for (const track of this.manifest.tracks) {
      for (const action of track.actions) {
        if (time >= action.start && time <= action.end) {
          active.push({
            ...action,
            trackId: track.id,
            trackType: track.controllerName,
            trackUrl: track.url
          });
        }
      }
    }

    // Sort by z-order (lower z drawn first)
    return active.sort((a, b) => a.z - b.z);
  }

  /**
   * Draw a single action (timeline item)
   */
  drawAction(action) {
    const localTime = this.calculateLocalTime(action);

    // Save context state
    this.ctx.save();

    // Apply opacity
    const opacity = action.opacity !== undefined ? action.opacity : 1.0;
    this.ctx.globalAlpha = opacity;

    // Apply blend mode
    this.ctx.globalCompositeOperation = action.blendMode || 'source-over';

    // Draw based on track type
    if (action.trackType === 'video') {
      this.drawVideo(action, localTime);
    } else if (action.trackType === 'image') {
      this.drawImage(action);
    }

    // Restore context state
    this.ctx.restore();
  }

  /**
   * Calculate local time within an action (accounting for trimStart)
   */
  calculateLocalTime(action) {
    const timeIntoAction = this.currentTime - action.start;
    const trimStart = action.trimStart || 0;
    return timeIntoAction + trimStart;
  }

  /**
   * Draw video element
   */
  drawVideo(action, localTime) {
    const video = this.videoElements.get(action.trackId);
    if (!video) {
      console.warn(`Video not found: ${action.trackId}`);
      return;
    }

    // Seek to correct time
    if (Math.abs(video.currentTime - localTime) > 0.1) {
      video.currentTime = localTime;
    }

    // Calculate position based on fit mode
    const fit = this.calculateFitPosition(
      video.videoWidth,
      video.videoHeight,
      this.canvas.width,
      this.canvas.height,
      action.fit || 'fill'
    );

    // Apply transforms if specified
    if (action.x !== undefined || action.y !== undefined || action.rotation !== undefined || action.scale !== undefined) {
      this.applyTransforms(action, fit);
    }

    // Draw video frame
    try {
      this.ctx.drawImage(video, fit.x, fit.y, fit.w, fit.h);
    } catch (e) {
      console.warn(`Failed to draw video frame at ${localTime}s:`, e.message);
    }
  }

  /**
   * Draw image element
   */
  drawImage(action) {
    const img = this.imageElements.get(action.trackId);
    if (!img) {
      console.warn(`Image not found: ${action.trackId}`);
      return;
    }

    // Calculate position based on fit mode
    const fit = this.calculateFitPosition(
      img.width,
      img.height,
      this.canvas.width,
      this.canvas.height,
      action.fit || 'fill'
    );

    // Apply transforms if specified
    if (action.x !== undefined || action.y !== undefined || action.rotation !== undefined || action.scale !== undefined) {
      this.applyTransforms(action, fit);
    }

    // Draw image
    this.ctx.drawImage(img, fit.x, fit.y, fit.w, fit.h);
  }

  /**
   * Apply transforms (position, rotation, scale)
   */
  applyTransforms(action, fit) {
    const centerX = fit.x + fit.w / 2;
    const centerY = fit.y + fit.h / 2;

    // Translate to center
    this.ctx.translate(centerX, centerY);

    // Apply rotation
    if (action.rotation !== undefined) {
      this.ctx.rotate((action.rotation * Math.PI) / 180);
    }

    // Apply scale
    if (action.scale !== undefined) {
      this.ctx.scale(action.scale, action.scale);
    }

    // Translate back
    this.ctx.translate(-centerX, -centerY);

    // Apply position offset
    if (action.x !== undefined || action.y !== undefined) {
      const offsetX = action.x || 0;
      const offsetY = action.y || 0;
      this.ctx.translate(offsetX, offsetY);
    }
  }

  /**
   * Calculate fit position for media element
   */
  calculateFitPosition(srcW, srcH, dstW, dstH, fit) {
    switch (fit) {
      case 'fill':
        return { x: 0, y: 0, w: dstW, h: dstH };

      case 'contain': {
        const scale = Math.min(dstW / srcW, dstH / srcH);
        const w = srcW * scale;
        const h = srcH * scale;
        return {
          x: (dstW - w) / 2,
          y: (dstH - h) / 2,
          w,
          h
        };
      }

      case 'cover': {
        const scale = Math.max(dstW / srcW, dstH / srcH);
        const w = srcW * scale;
        const h = srcH * scale;
        return {
          x: (dstW - w) / 2,
          y: (dstH - h) / 2,
          w,
          h
        };
      }

      case 'none':
      default:
        return {
          x: (dstW - srcW) / 2,
          y: (dstH - srcH) / 2,
          w: srcW,
          h: srcH
        };
    }
  }

  /**
   * Get canvas RGBA buffer directly
   * More efficient than base64 PNG for streaming to FFmpeg
   */
  getFrameBuffer() {
    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    return imageData.data; // Uint8ClampedArray of RGBA values
  }
}

// Expose to window for Puppeteer
window.renderEngine = null;

/**
 * Initialize render engine with manifest
 */
window.initRenderEngine = async function(manifest) {
  const canvas = document.getElementById('render-canvas');
  window.renderEngine = new RenderEngine(manifest, canvas);
  await window.renderEngine.init();
  return { status: 'initialized', assetCount: window.renderEngine.loadedAssets.size };
};

/**
 * Render frame at specific time
 */
window.renderFrameAtTime = function(time) {
  if (!window.renderEngine) {
    throw new Error('Render engine not initialized');
  }
  return window.renderEngine.renderFrame(time);
};

/**
 * Get raw RGBA frame buffer
 */
window.getFrameBuffer = function(time) {
  if (!window.renderEngine) {
    throw new Error('Render engine not initialized');
  }
  window.renderEngine.renderFrame(time);
  return window.renderEngine.getFrameBuffer();
};

console.log('Render engine loaded and ready');
