import * as React from 'react';
import { CleanupTracking, UnregisterToken } from '../utils/cleanupTracking/CleanupTracking';
import { TimerBasedCleanupTracking } from '../utils/cleanupTracking/TimerBasedCleanupTracking';
import {
  FinalizationRegistryBasedCleanupTracking
} from '../utils/cleanupTracking/FinalizationRegistryBasedCleanupTracking';
import { FileExplorerAnyPluginSignature, FileExplorerUsedEvents } from '../models';
import { FileExplorerEventListener } from '../models/events';
import {
  UseFileExplorerInstanceEventsInstance
} from '../corePlugins/useFileExplorerInstanceEvents/useFileExplorerInstanceEvents.types';

/**
 * A container for registry-related data.
 */
interface RegistryContainer {
  /**
   * The cleanup tracking registry.
   */
  registry: CleanupTracking | null;
}

/**
 * This class is used to make it easier to detect in heap snapshots by name.
 */
class ObjectToBeRetainedByReact {}

/**
 * Creates a useInstanceEventHandler function for the given registry container.
 * 
 * @param registryContainer - The registry container to be used.
 * @returns A function that returns a useInstanceEventHandler function.
 */
export function createUseInstanceEventHandler(registryContainer: RegistryContainer) {
  let cleanupTokensCounter = 0;

  return function useInstanceEventHandler<
    Instance extends UseFileExplorerInstanceEventsInstance & {
      $$signature: FileExplorerAnyPluginSignature;
    },
    E extends keyof FileExplorerUsedEvents<Instance['$$signature']>,
  >(
    instance: Instance,
    eventName: E,
    handler: FileExplorerEventListener<FileExplorerUsedEvents<Instance['$$signature']>[E]>,
  ) {
    type Signature = Instance['$$signature'];

    if (registryContainer.registry === null) {
      registryContainer.registry =
        typeof FinalizationRegistry !== 'undefined'
          ? new FinalizationRegistryBasedCleanupTracking()
          : new TimerBasedCleanupTracking();
    }

    const [objectRetainedByReact] = React.useState(new ObjectToBeRetainedByReact());
    const subscription = React.useRef<(() => void) | null>(null);
    const handlerRef = React.useRef<
      FileExplorerEventListener<FileExplorerUsedEvents<Signature>[E]> | undefined
    >();
    handlerRef.current = handler;
    const cleanupTokenRef = React.useRef<UnregisterToken | null>(null);

    if (!subscription.current && handlerRef.current) {
      /**
       * The enhanced event handler that wraps the original handler and removes it after use.
       */
      const enhancedHandler: FileExplorerEventListener<FileExplorerUsedEvents<Signature>[E]> = (
        params,
        event,
      ) => {
        if (!event.defaultMuiPrevented) {
          handlerRef.current?.(params, event);
        }
      };

      subscription.current = instance.$$subscribeEvent(eventName as string, enhancedHandler);

      cleanupTokensCounter += 1;
      cleanupTokenRef.current = { cleanupToken: cleanupTokensCounter };

      registryContainer.registry.register(
        objectRetainedByReact, // The callback below will be called once this reference stops being retained
        () => {
          subscription.current?.();
          subscription.current = null;
          cleanupTokenRef.current = null;
        },
        cleanupTokenRef.current,
      );
    } else if (!handlerRef.current && subscription.current) {
      /**
       * Removes the event listener and unregisters the cleanup token.
       */
      subscription.current();
      subscription.current = null;

      if (cleanupTokenRef.current) {
        registryContainer.registry.unregister(cleanupTokenRef.current);
        cleanupTokenRef.current = null;
      }
    }

    React.useEffect(() => {
      /**
       * This effect is called when the useInstanceEventHandler function is used.
       */
      if (!subscription.current && handlerRef.current) {
        const enhancedHandler: FileExplorerEventListener<FileExplorerUsedEvents<Signature>[E]> = (
          params,
          event,
        ) => {
          if (!event.defaultMuiPrevented) {
            handlerRef.current?.(params, event);
          }
        };

        subscription.current = instance.$$subscribeEvent(eventName as string, enhancedHandler);
      }

      /**
       * Unregisters the cleanup token when the effect is unmounted.
       */
      if (cleanupTokenRef.current && registryContainer.registry) {
        registryContainer.registry.unregister(cleanupTokenRef.current);
        cleanupTokenRef.current = null;
      }

      return () => {
        subscription.current?.();
        subscription.current = null;
      };
    }, [instance, eventName]);
  };
}

/**
 * The registry container used by the useInstanceEventHandler function.
 */
const registryContainer: RegistryContainer = { registry: null };

/**
 * Resets the cleanup tracking for the given registry container.
 */
export const unstable_resetCleanupTracking = () => {
  registryContainer.registry?.reset();
  registryContainer.registry = null;
};

/**
 * Returns a useInstanceEventHandler function for the given registry container.
 */
export const useInstanceEventHandler = createUseInstanceEventHandler(registryContainer);