"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StdSchema = StdSchema;
const type_metadata_storage_1 = require("@nestjs/mongoose/dist/storages/type-metadata.storage");
const lodash_clonedeep_1 = __importDefault(require("lodash.clonedeep"));
const defaultSchemaOptions_1 = require("./defaultSchemaOptions");
function mergeOptions(parentOptions, childOptions) {
    for (const key in childOptions) {
        if (Object.prototype.hasOwnProperty.call(childOptions, key)) {
            parentOptions[key] = childOptions[key];
        }
    }
    return parentOptions;
}
function StdSchema(options) {
    return (target) => {
        let stdOptions = defaultSchemaOptions_1.DefaultSchemaOptions;
        stdOptions = (0, lodash_clonedeep_1.default)(stdOptions);
        const mergedOptions = mergeOptions(stdOptions, options ?? {});
        type_metadata_storage_1.TypeMetadataStorage.addSchemaMetadata({
            target,
            options: mergedOptions,
        });
    };
}
//# sourceMappingURL=stdschema.decorator.js.map