/*
 import * as React from 'react';

interface IncrementByFunc {
  (amount: number): string;
}

interface IncrementFunc extends IncrementByFunc{
  (): string;
  by: IncrementByFunc;
}


/!**
 * Auto-incrementing state
 *!/
export default function IncGenerator(prefix: string, id: string = '', length: number = 3, initialValue: number = 1, step: number = 1): [IncrementFunc] {
  const incrementId = `${prefix}-${id}`;
  const createId = (val: number) => {
    return `${incrementId}-${String(val).padStart(length, "0")}`;
  }
  const [value, setValue] = React.useState(initialValue);
  const inc = React.useMemo(() => {

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

  return [inc];
}
*/
