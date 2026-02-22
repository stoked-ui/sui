"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SortedList = void 0;
exports.setProperty = setProperty;
function setProperty(o, name, value) {
    console.log('setProperty', 'name');
    Object.defineProperty(o, name, {
        value,
        writable: false,
        configurable: false,
        enumerable: true
    });
}
class SortedList extends Array {
    constructor(compareFn, items) {
        super();
        this.compareFn = compareFn;
        if (items) {
            items.sort(compareFn).forEach((item) => this.push(item));
        }
    }
    insert(value) {
        if (value === undefined) {
            return;
        }
        let low = 0;
        let high = this.length;
        while (low < high) {
            const mid = Math.floor((low + high) / 2);
            if (this.compareFn(this[mid], value) < 0) {
                low = mid + 1;
            }
            else {
                high = mid;
            }
        }
        this.splice(low, 0, value);
    }
    push(...items) {
        items.forEach((item) => this.insert(item));
        return this.length;
    }
    unshift(...items) {
        items.forEach((item) => this.insert(item));
        return this.length;
    }
    splice(start, deleteCount, ...items) {
        const removed = super.splice(start, deleteCount, ...items);
        this.sort(this.compareFn);
        return removed;
    }
    concat(...items) {
        const flattenedItems = items.flat();
        return new SortedList(this.compareFn, [...this, ...flattenedItems]);
    }
    sort(compareFn) {
        super.sort(this.compareFn);
        return this;
    }
    copyWithin(target, start, end) {
        throw new Error("The copyWithin method is not supported in SortedList as it breaks sorted order.");
    }
    reverse() {
        throw new Error("The reverse method is not supported in SortedList as it breaks sorted order.");
    }
    toArray() {
        return Array.from(this);
    }
}
exports.SortedList = SortedList;
//# sourceMappingURL=Types.js.map