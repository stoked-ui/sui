import * as React from 'react';

/**
 * Represents a function that increments by a specified amount and returns a string.
 * @typedef {function} IncrementByFunc
 * @param {number} amount - The amount by which to increment
 * @returns {string} The resulting string after incrementing
 */

/**
 * Represents a function that increments and returns a string.
 * @typedef {function} IncrementFunc
 * @property {IncrementByFunc} by - Function to increment by a specified amount
 * @returns {string} The resulting string after incrementing
 */

/**
 * Represents the properties for generating auto-incrementing IDs.
 * @typedef {Object} IncIdProps
 * @property {string} id - The base ID
 * @property {number} length - The length of the generated ID
 * @property {string} [prefix] - Optional prefix for the generated ID
 */

/**
 * Auto-incrementing Ids used in cases where the outcomes need to be deterministic i.e. hydration
 * @param {IncIdProps | string} props - The properties for generating the auto-incrementing IDs
 * @returns {function} A function that generates a new ID each time it is called
 */
export default function useIncId(props?: IncIdProps | string): () => string {
  const defaultProps = { length: 3 };
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
   * Creates a new ID based on the current incrementId and a value.
   * @param {string} val - The value to append to the ID
   * @returns {string} The generated ID
   */
  const createId = React.useCallback(
    (val: string) => {
      return `${incrementId}-${val.padStart(length, '0')}`;
    },
    [incrementId, length]
  );

  // Create a counter to track increments
  const counterRef = React.useRef(0);

  const incrementFunc: IncrementFunc = (React.useCallback(() => {
    const nextId = String(counterRef.current);
    counterRef.current += 1; // Increment counter
    return createId(nextId);
  }, [createId])) as IncrementFunc;

  /**
   * Increments the counter by a specified step and generates a new ID.
   * @param {number} step - The amount to increment the counter by
   * @returns {string} The generated ID after incrementing
   */
  incrementFunc.by = React.useCallback((step: number) => {
    const nextId = String(counterRef.current);
    counterRef.current += step; // Increment counter
    return createId(nextId);
  }, [createId]) as IncrementFunc;

  // Return a function that generates a new ID each time it is called
  return incrementFunc;
}