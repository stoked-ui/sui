"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultSchemaOptions = exports.swapId = void 0;
const swapId = (doc, ret) => {
    if (Array.isArray(ret)) {
        return ret.map((item) => (0, exports.swapId)(doc, item));
    }
    if (ret && typeof ret === "object") {
        if (ret._id && !ret.id) {
            ret.id = ret._id.toString();
        }
        Object.keys(ret).forEach((key) => {
            if (ret[key] && typeof ret[key] === "object") {
                ret[key] = (0, exports.swapId)(doc, ret[key]);
            }
        });
        delete ret._id;
        delete ret.__v;
    }
    return ret;
};
exports.swapId = swapId;
exports.DefaultSchemaOptions = {
    timestamps: true,
    virtuals: true,
    toObject: {
        transform: exports.swapId,
    },
    toJSON: {
        transform: exports.swapId,
    },
};
//# sourceMappingURL=defaultSchemaOptions.js.map