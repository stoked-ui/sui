interface NestedRecord<T> {
  [path: string]: T;
}

export default class Settings<T = any> implements NestedRecord<T> {
  [path: string]: T;

  constructor(initialData: Record<string, T> = {}) {
    Object.assign(this, initialData);

    return new Proxy(this, {
      get: (target, path: string | symbol) => {
        if (typeof path === 'string' && path.includes('.')) {
          const keys = path.split('.');
          return keys.reduce((acc: any, key: string) => {
            return acc && acc[key] !== undefined ? acc[key] : undefined;
          }, this);
        }
        return target[path as keyof typeof target];
      },
      set: (target, path: string | symbol, value) => {
        if (typeof path === 'string' && path.includes('.')) {
          const keys = path.split('.');
          keys.reduce((acc: any, key: string, index: number) => {
            if (index === keys.length - 1) {
              acc[key] = value;
            } else {
              acc[key] = acc[key] || {};
            }
            return acc[key];
          }, this);
          return true;
        }
        target[path as keyof typeof target] = value;
        return true;
      }
    });
  }
}
