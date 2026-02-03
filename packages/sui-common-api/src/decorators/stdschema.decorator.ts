import { TypeMetadataStorage } from "@nestjs/mongoose/dist/storages/type-metadata.storage";
import cloneDeep from "lodash.clonedeep";
import { SchemaOptions } from "mongoose";
import { DefaultSchemaOptions } from "./defaultSchemaOptions";

function mergeOptions(
  parentOptions: SchemaOptions,
  childOptions: SchemaOptions,
) {
  for (const key in childOptions) {
    if (Object.prototype.hasOwnProperty.call(childOptions, key)) {
      parentOptions[key] = childOptions[key];
    }
  }
  return parentOptions;
}

export function StdSchema(options?: SchemaOptions): ClassDecorator {
  return (target: Function) => {
    let stdOptions = DefaultSchemaOptions;
    stdOptions = cloneDeep(stdOptions);
    const mergedOptions = mergeOptions(stdOptions, options ?? {});

    TypeMetadataStorage.addSchemaMetadata({
      target,
      options: mergedOptions,
    });
  };
}
