/**
 * Window interface extensions for render engine
 */

interface RenderEngine {
  renderFrame(time: number): string;
  getFrameBuffer(time: number): Uint8ClampedArray;
}

declare global {
  interface Window {
    renderEngine: RenderEngine | null;
    initRenderEngine(manifest: any): Promise<{ status: string; assetCount: number }>;
    renderFrameAtTime(time: number): string;
    getFrameBuffer(time: number): number[];
  }
}

export {};
