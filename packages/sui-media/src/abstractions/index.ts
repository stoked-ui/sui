/**
 * @stoked-ui/sui-media abstractions
 *
 * Framework-agnostic abstractions that allow media components to integrate with
 * various routing, authentication, payment, queue management, and keyboard shortcut systems.
 *
 * @packageDocumentation
 */

// Router abstraction
export type {
  IRouter,
  NavigationOptions,
} from './Router';
export {
  NoOpRouter,
  noOpRouter,
} from './Router';

// Auth abstraction
export type {
  IAuth,
  IUser,
} from './Auth';
export {
  NoOpAuth,
  noOpAuth,
  createMockAuth,
} from './Auth';

// Payment abstraction
export type {
  IPayment,
  PaymentRequestOptions,
  PaymentRequest,
  PaymentCompleteCallback,
  PaymentVerification,
} from './Payment';
export {
  NoOpPayment,
  noOpPayment,
  createMockPayment,
} from './Payment';

// Queue abstraction
export type {
  IQueue,
  IQueueItem,
} from './Queue';
export {
  NoOpQueue,
  noOpQueue,
  createInMemoryQueue,
} from './Queue';

// Keyboard shortcuts abstraction
export type {
  IKeyboardShortcuts,
  ShortcutHandler,
  ShortcutDefinition,
  OverlayCallback,
} from './KeyboardShortcuts';
export {
  NoOpKeyboardShortcuts,
  noOpKeyboardShortcuts,
  createInMemoryKeyboardShortcuts,
  normalizeKeyString,
  COMMON_MEDIA_SHORTCUTS,
} from './KeyboardShortcuts';
