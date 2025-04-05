/**
 * Interface for the Registry Container object.
 * @typedef {object} RegistryContainer
 * @property {CleanupTracking | null} registry - The cleanup tracking registry object or null.
 */

/**
 * Class representing an object to be retained by React.
 */
class ObjectToBeRetainedByReact {}

/**
 * Creates a use instance event handler function.
 * Based on https://github.com/Bnaya/use-dispose-uncommitted/blob/main/src/finalization-registry-based-impl.ts.
 * Check https://github.com/facebook/react/issues/15317 for more information.
 * @param {RegistryContainer} registryContainer - The container holding the cleanup tracking registry.
 * @returns {function} The use instance event handler function.
 */
export function createUseInstanceEventHandler(registryContainer) {
  let cleanupTokensCounter = 0;

  return function useInstanceEventHandler(instance, eventName, handler) {
    /**
     * Represents the signature of the instance.
     * @typedef {object} Signature
     */

    if (registryContainer.registry === null) {
      registryContainer.registry =
        typeof FinalizationRegistry !== 'undefined'
          ? new FinalizationRegistryBasedCleanupTracking()
          : new TimerBasedCleanupTracking();
    }

    const [objectRetainedByReact] = React.useState(new ObjectToBeRetainedByReact());
    const subscription = React.useRef(null);
    const handlerRef = React.useRef();
    handlerRef.current = handler;
    const cleanupTokenRef = React.useRef(null);

    if (!subscription.current && handlerRef.current) {
      /**
       * Enhanced event handler that prevents default MUI behavior.
       * @param {any} params - The event parameters.
       * @param {any} event - The event object.
       */
      const enhancedHandler = (params, event) => {
        if (!event.defaultMuiPrevented) {
          handlerRef.current?.(params, event);
        }
      };

      subscription.current = instance.$$subscribeEvent(eventName, enhancedHandler);

      cleanupTokensCounter += 1;
      cleanupTokenRef.current = { cleanupToken: cleanupTokensCounter };

      registryContainer.registry.register(
        objectRetainedByReact,
        () => {
          subscription.current?.();
          subscription.current = null;
          cleanupTokenRef.current = null;
        },
        cleanupTokenRef.current,
      );
    } else if (!handlerRef.current && subscription.current) {
      subscription.current();
      subscription.current = null;

      if (cleanupTokenRef.current) {
        registryContainer.registry.unregister(cleanupTokenRef.current);
        cleanupTokenRef.current = null;
      }
    }

    React.useEffect(() => {
      if (!subscription.current && handlerRef.current) {
        const enhancedHandler = (params, event) => {
          if (!event.defaultMuiPrevented) {
            handlerRef.current?.(params, event);
          }
        };

        subscription.current = instance.$$subscribeEvent(eventName, enhancedHandler);
      }

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

const registryContainer = { registry: null };

/**
 * Resets the cleanup tracking registry.
 */
export const unstable_resetCleanupTracking = () => {
  registryContainer.registry?.reset();
  registryContainer.registry = null;
};

/**
 * Exports the use instance event handler function.
 */
export const useInstanceEventHandler = createUseInstanceEventHandler(registryContainer);