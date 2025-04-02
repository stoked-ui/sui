import * as React from 'react';

export interface IncrementByFunc {
  (amount: number): string;
}

export interface IncrementFunc extends IncrementByFunc {
  (): string;
  by: IncrementByFunc;
}

export interface IncIdProps {
  id: string;
  length: number;
  prefix?: string;
}

/**
 * Auto-incrementing Ids used in cases where the outcomes need to be deterministic i.e. hydration
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

  incrementFunc.by = React.useCallback((step: number) => {
    const nextId = String(counterRef.current);
    counterRef.current += step; // Increment counter
    return createId(nextId);
  }, [createId]) as IncrementFunc;


  // Return a function that generates a new ID each time it is called
  return incrementFunc
}

