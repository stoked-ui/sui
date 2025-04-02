import * as React from 'react';

/**
 * Interface for a function that increments by a given amount.
 */
export interface IncrementByFunc {
  /**
   * Returns a string after adding the specified amount to an input number.
   *
   * @param {number} amount - The amount to increment by.
   * @returns {string} A new string representing the incremented value.
   */
  (amount: number): string;
}

/**
 * Interface for a function that increments based on a counter or by a specified step.
 */
export interface IncrementFunc extends IncrementByFunc {
  /**
   * Returns a new string after incrementing the counter.
   *
   * @returns {string} A new string representing the incremented value.
   */
  (): string;
  /**
   * An optional function that increments the counter by a given step amount.
   *
   * @param {number} step - The amount to increment the counter by.
   * @returns {string} A new string representing the incremented value.
   */
  by: IncrementByFunc;
}

/**
 * Props for the useIncId hook.
 */
export interface IncIdProps {
  /**
   * The ID prefix used in the generated IDs.
   */
  id: string;
  /**
   * The length of the generated IDs.
   */
  length: number;
  /**
   * An optional prefix to be added to the generated IDs.
   */
  prefix?: string;
}

/**
 * Auto-incrementing Ids hook.
 *
 * Returns a function that generates a new ID each time it is called, with an option
 * to increment the counter by a specified step amount.
 *
 * @param {IncIdProps|string} props - The props for the useIncId hook.
 * @returns {function()} A function that generates a new ID each time it is called.
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
   * Creates a new ID by appending a value to the current ID.
   *
   * @param {string} val - The value to append to the ID.
   * @returns {string} A new string representing the updated ID.
   */
  const createId = React.useCallback(
    (val: string) => {
      return `${incrementId}-${val.padStart(length, '0')}`;
    },
    [incrementId, length]
  );

  /**
   * A reference to a counter used to track increments.
   */
  const counterRef = React.useRef(0);

  /**
   * Creates a new ID by incrementing the counter and appending the value.
   *
   * @returns {string} A new string representing the updated ID.
   */
  const incrementFunc: IncrementFunc = (React.useCallback(() => {
    const nextId = String(counterRef.current);
    counterRef.current += 1; // Increment counter
    return createId(nextId);
  }, [createId])) as IncrementFunc;

  /**
   * Creates a new ID by incrementing the counter and appending the value, with an option to specify the step amount.
   *
   * @param {number} step - The amount to increment the counter by.
   * @returns {string} A new string representing the updated ID.
   */
  incrementFunc.by = React.useCallback((step: number) => {
    const nextId = String(counterRef.current);
    counterRef.current += step; // Increment counter
    return createId(nextId);
  }, [createId]) as IncrementFunc;

  /**
   * Returns a function that generates a new ID each time it is called, with an option to increment the counter by a specified step amount.
   *
   * @returns {function()} A function that generates a new ID each time it is called.
   */
  return incrementFunc
}