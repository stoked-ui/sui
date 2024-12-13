// Usage
/*
const settings = createSettings({
  user: { name: 'John', preferences: { theme: 'dark' } }
});

console.log(settings['user.name']); // Output: John
settings['user.preferences.theme'] = 'light';
console.log(settings['user.preferences.theme']); // Output: light
*/

export interface NestedRecord<T = any> {
  [path: string]: T;
}

export interface Settings<T = any> extends NestedRecord<T> {}

export function createSettings<T = any>(initialData: Record<string, T> = {}): Settings<T> {
  const settings: Settings<T> = {...initialData};

  return new Proxy(settings, {
    get: (target, path: string | symbol) => {
      if (typeof path === 'string' && path.includes('.')) {
        const keys = path.split('.');
        return keys.reduce((acc: any, key: string) => {
          return acc && acc[key] !== undefined ? acc[key] : undefined;
        }, target);
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
        }, target);
        return true;
      }
      target[path as keyof typeof target] = value;
      return true;
    }
  });
}
