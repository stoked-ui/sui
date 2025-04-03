import * as React from 'react';

/**
 * Interface for functions that can be used to increment an ID.
 */
export interface IncrementByFunc {
  /**
   * Takes an amount and returns a string representing the incremented ID.
   * @param {number} amount - The amount to add to the base ID.
   * @returns {string} - The incremented ID as a string.
   */
  (amount: number): string;
}

/**
 * Interface that extends IncrementByFunc, allowing for an overridden base function and
 * a reference to a by-function.
 */
export interface IncrementFunc extends IncrementByFunc {
  /**
   * Generates the next unique ID without any incrementing.
   * @returns {string} - The base ID as a string.
   */
  (): string;
  /**
   * A function that increments the current ID by a specified amount.
   * @param {number} step - The amount to add to the base ID.
   * @returns {string} - The incremented ID as a string.
   */
  by: IncrementByFunc;
}

/**
 * Props for the useIncId hook.
 */
export interface IncIdProps {
  /**
   * The ID of the current increment, which can be optional or explicitly provided.
   * @default ''
   */
  id: string;
  /**
   * The length of the base ID (e.g., how many digits).
   * @default 3
   */
  length: number;
  /**
   * An optional prefix to add before the incrementing part of the ID.
   */
  prefix?: string;
}

/**
 * A hook that generates unique IDs for use in cases where deterministic outcomes are required,
 * such as hydration. The base ID can be optionally provided or automatically generated.
 */
export default function useIncId(props?: IncIdProps | string): () => string {
  const defaultProps = { length: 3 };

  // Check if props is a string, if so convert it to the correct type
  if (typeof props === 'string') {
    props = {
      ...defaultProps,
      id: props as string,
    };
  } else {
    props = {
      ...defaultProps,
      ...props as IncIdProps,
    };
  }

  const { id, length, prefix } = props;
  const incrementId = prefix ? `${prefix}-${id}` : id;

  /**
   * Creates a new ID by appending the given value and padding it with leading zeros.
   */
  const createId = React.useCallback(
    (val: string) => {
      return `${incrementId}-${val.padStart(length, '0')}`;
    },
    [incrementId, length]
  );

  // Create a counter to track increments
  const counterRef = React.useRef(0);

  /**
   * Generates the next unique ID by incrementing the current value and appending it to the base ID.
   */
  const incrementFunc: IncrementFunc = (React.useCallback(() => {
    const nextId = String(counterRef.current);
    counterRef.current += 1; // Increment counter
    return createId(nextId);
  }, [createId])) as IncrementFunc;

  /**
   * Generates the next unique ID by incrementing the current value and appending it to the base ID.
   */
  incrementFunc.by = React.useCallback((step: number) => {
    const nextId = String(counterRef.current);
    counterRef.current += step; // Increment counter
    return createId(nextId);
  }, [createId]) as IncrementFunc;

  /**
   * Return a function that generates a new ID each time it is called.
   */
  return incrementFunc;
}