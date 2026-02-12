import {CleanupTracking, UnregisterToken, UnsubscribeFn} from './CleanupTracking';

// FinalizationRegistry is available in modern JS runtimes but not in ES2020 lib typings.
declare class FinalizationRegistry<T> {
  constructor(callback: (heldValue: T) => void);
  register(target: object, heldValue: T, unregisterToken?: object): void;
  unregister(unregisterToken: object): void;
}

export class FinalizationRegistryBasedCleanupTracking implements CleanupTracking {
  registry = new FinalizationRegistry<UnsubscribeFn>((unsubscribe: UnsubscribeFn) => {
    if (typeof unsubscribe === 'function') {
      unsubscribe();
    }
  });

  register(object: any, unsubscribe: UnsubscribeFn, unregisterToken: UnregisterToken): void {
    this.registry.register(object, unsubscribe, unregisterToken);
  }

  unregister(unregisterToken: UnregisterToken): void {
    this.registry.unregister(unregisterToken);
  }

  // eslint-disable-next-line class-methods-use-this
  reset() {}
}
