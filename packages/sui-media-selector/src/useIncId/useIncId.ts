import * as React from 'react';

interface IncrementByFunc {
  (amount: number): string;
}

interface IncrementFunc extends IncrementByFunc{
  (): string;
  by: IncrementByFunc;
}

/**
 * Auto-incrementing Ids used in cases where the outcomes need to be deterministic i.e. hydration
 */
export default function useIncId(id: string, length: number = 3, prefix?: string, initialValue: number = 1, step: number = 1): IncrementFunc {
  const incrementId = prefix ? `${prefix}-${id}` : id;
  const createId = (val: number) => {
    return `${incrementId}-${String(val).padStart(length, "0")}`;
  }
  const [value, setValue] = React.useState(initialValue);
  return React.useMemo(() => {

    const incrementFunc = () => {
      setValue(v => v + step);
      return createId(value);
    }

    incrementFunc.by = (amount: number) => {
      setValue(v => v + amount);
      return createId(value);
    }

    return incrementFunc;
  }, [step]);
}
