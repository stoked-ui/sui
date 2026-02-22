"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSettings = createSettings;
function createSettings(initialData = {}) {
    const settings = { ...initialData };
    return new Proxy(settings, {
        get: (target, path) => {
            if (typeof path === 'string' && path.includes('.')) {
                const keys = path.split('.');
                return keys.reduce((acc, key) => {
                    return acc && acc[key] !== undefined ? acc[key] : undefined;
                }, target);
            }
            return target[path];
        },
        set: (target, path, value) => {
            if (typeof path === 'string' && path.includes('.')) {
                const keys = path.split('.');
                keys.reduce((acc, key, index) => {
                    if (index === keys.length - 1) {
                        acc[key] = value;
                    }
                    else {
                        acc[key] = acc[key] || {};
                    }
                    return acc[key];
                }, target);
                return true;
            }
            target[path] = value;
            return true;
        }
    });
}
//# sourceMappingURL=Settings.js.map