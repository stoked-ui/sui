"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MimeRegistry = void 0;
exports.getExtension = getExtension;
class MimeRegistry {
    static get exts() {
        return this._exts;
    }
    static names() {
        return this._names;
    }
    static subtypes() {
        return this._subtypes;
    }
    static types() {
        return this._types;
    }
    static create(application, name, ext, description, embedded = true, type = 'application') {
        const mimeType = {
            get type() {
                return `${type}/${this.subType}`;
            },
            get subType() {
                return `${application}-${name}`;
            },
            get application() {
                return application;
            },
            get name() {
                return name;
            },
            get ext() {
                return ext;
            },
            get description() {
                return description;
            },
            get embedded() {
                return embedded;
            },
            get accept() {
                return {
                    [this.type]: this.ext
                };
            },
            get typeObj() {
                return { type: this.type };
            }
        };
        this.exts[ext] = mimeType;
        this.names[name] = mimeType;
        this.subtypes[mimeType.subType] = mimeType;
        this.types[mimeType.type] = mimeType;
        return mimeType;
    }
}
exports.MimeRegistry = MimeRegistry;
MimeRegistry._exts = {};
MimeRegistry._names = {};
MimeRegistry._subtypes = {};
MimeRegistry._types = {};
function getExtension(url) {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const lastIndex = pathname.lastIndexOf(".");
    if (lastIndex === -1) {
        return "";
    }
    return pathname.substring(lastIndex);
}
//# sourceMappingURL=IMimeType.js.map