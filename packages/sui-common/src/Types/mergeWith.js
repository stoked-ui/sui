"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mergeWith = mergeWith;
function mergeWith(otherArray, mergeKey) {
    const mergedMap = new Map();
    const instance = this.filter(Boolean);
    if (!Array.isArray(otherArray)) {
        return instance;
    }
    otherArray = otherArray.filter(Boolean);
    instance.forEach((item) => {
        const key = item[mergeKey];
        mergedMap.set(key, item);
    });
    otherArray.forEach((item) => {
        const key = item[mergeKey];
        mergedMap.set(key, item);
    });
    return Array.from(mergedMap.values());
}
Array.prototype.mergeWith = mergeWith;
//# sourceMappingURL=mergeWith.js.map