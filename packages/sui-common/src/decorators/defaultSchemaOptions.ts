export const swapId = (doc, ret) => {
  // Handle arrays (for populated arrays like friends)
  if (Array.isArray(ret)) {
    return ret.map((item) => swapId(doc, item));
  }

  // Handle single documents
  if (ret && typeof ret === "object") {
    // Only add id if _id exists and id doesn't
    if (ret._id && !ret.id) {
      ret.id = ret._id.toString();
    }

    // Handle nested objects that might be populated documents
    Object.keys(ret).forEach((key) => {
      if (ret[key] && typeof ret[key] === "object") {
        ret[key] = swapId(doc, ret[key]);
      }
    });

    // Delete MongoDB specific fields
    delete ret._id;
    delete ret.__v;
  }

  return ret;
};

export const DefaultSchemaOptions = {
  timestamps: true,
  virtuals: true,
  toObject: {
    transform: swapId,
  },
  toJSON: {
    transform: swapId,
  },
};
