
export type NoArgsConstructor<T> = new () => T;

export type ArgsConstructor<T> = new (...args: any[]) => T;

export type Constructor<T> = (NoArgsConstructor<T> | ArgsConstructor<T>);

