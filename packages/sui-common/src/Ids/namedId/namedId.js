"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.randomBytes = randomBytes;
exports.default = namedId;
function randomBytes(length) {
    const bytes = new Uint8Array(length);
    for (let i = 0; i < length; i += 1) {
        bytes[i] = Math.floor(Math.random() * 256);
    }
    return Array.from(bytes)
        .map(byte => byte.toString(16).padStart(2, '0'))
        .join('').substring(0, length);
}
function namedId(props) {
    let id = 'id';
    let length = 7;
    let prefix;
    let suffix;
    if (props) {
        if (typeof props === 'string') {
            id = props;
        }
        else if (props && props) {
            const namedProps = props;
            if (namedProps.id) {
                id = namedProps.id;
            }
            if (namedProps.length) {
                length = namedProps.length;
            }
            prefix = namedProps.prefix;
            suffix = namedProps.suffix;
        }
    }
    let start = prefix ? `${prefix}-${id}` : id;
    start = suffix ? `${start}-${suffix}` : start;
    return `${start}-${randomBytes(length)}`;
}
//# sourceMappingURL=namedId.js.map