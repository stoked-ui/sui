import '@testing-library/jest-dom';

// Define jest types for setup file
declare const jest: {
  fn: (implementation?: (...args: any[]) => any) => any;
};

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
} as any;

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
} as any;

// Mock HTMLMediaElement methods
window.HTMLMediaElement.prototype.load = () => {
  /* do nothing */
};
window.HTMLMediaElement.prototype.play = () => {
  return Promise.resolve();
};
window.HTMLMediaElement.prototype.pause = () => {
  /* do nothing */
};

// Mock HTMLVideoElement
window.HTMLVideoElement.prototype.requestFullscreen = () => {
  return Promise.resolve();
};

// Mock console methods to reduce noise in tests
(global as any).console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
};

// Set up default fetch mock
(global as any).fetch = jest.fn();
