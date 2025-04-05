/**
 * Defines Yup schema for ITimelineActionDetail validation.
 */
export const actionDataSchema = yup.object({
  id: yup.string().required("ID is required"),
  name: yup.string().required("Name is required"),
  start: yup.number().required("Start time is required"),
  end: yup.number().required("End time is required"),
  blendMode: yup.string().required("Blend mode is required"),
  x: yup.number().optional(),
  y: yup.number().optional(),
  z: yup.number().required("Z-coordinate is required"),
  width: yup
    .number()
    .when('$fileMediaType', {
      is: (mediaType: string) => ['image', 'video'].includes(mediaType),
      then: (schema) => schema.required("Width is required"),
      otherwise: (schema) => schema.optional(),
    }),
  height: yup
    .number()
    .when('$fileMediaType', {
      is: (mediaType: string) => ['image', 'video'].includes(mediaType),
      then: (schema) => schema.required("Height is required"),
      otherwise: (schema) => schema.optional(),
    }),
  volume: yup
    .array()
    .of(
      yup
        .array()
        .of(yup.number().nullable())
        .length(3)
        .test('valid-volume', 'Invalid volume structure', (value) => {
          if (!value) {
            return false;
          }
          const [volume, start, end] = value;
          return (
            typeof volume === 'number' &&
            (start === undefined || typeof start === 'number') &&
            (end === undefined || typeof end === 'number')
          );
        })
    )
    .optional(),
  fit: yup
    .mixed<'contain' | 'cover' | 'fill' | 'none'>()
    .oneOf(['contain', 'cover', 'fill', 'none'])
    .optional(),
});

/**
 * Validator schema for IEditorProjectDetail.
 */
export const projectSchema = yup.object({
  id: yup.string().required("ID is required"),
  name: yup.string().required("Name is required"),
  description: yup.string().optional(),
  author: yup.string().optional(),
  created: yup.number().required("Creation timestamp is required"),
  lastModified: yup.number().optional(),
  backgroundColor: yup
    .string()
    .optional(),
  width: yup.number().required("Width is required"),
  height: yup.number().required("Height is required"),
});

/**
 * Validator schema for ITimelineTrackDetail.
 */
export const trackObjectSchema = yup.object({
  id: yup.string().required("ID is required"),
  name: yup.string().required("Name is required"),
  hidden: yup.boolean().required("Hidden flag is required"),
  muted: yup.boolean().required("Muted flag is required"),
  locked: yup.boolean().required("Lock flag is required"),
  blendMode: yup.string().required(),
});

/**
 * Validator schema for IFileDetail.
 */
export const fileObjectSchema = yup.object({
  id: yup.string().required("ID is required"),
  name: yup.string().required("Name is required"),
  url: yup.string().url("Must be a valid URL").required("URL is required"),
  mediaType: yup.string().required("Media type is required"),
  path: yup.string().optional(),
  webkitRelativePath: yup.string().required("webkitRelativePath is required"),
  created: yup.number().required("Creation timestamp is required"),
  lastModified: yup.number().optional(),
  size: yup.number().required("File size is required"),
  type: yup.string().required("Type is required"),
  duration: yup.number().optional(),
});

/**
 * Combined schema for validation of editor action details.
 */
export const actionSchema = yup.object({
  project: projectSchema,
  track: trackObjectSchema,
  action: actionDataSchema,
  file: fileObjectSchema,
  type: yup.string().required('Type is required'),
}).test({
  name: 'file-and-action-dependency',
  /**
   * @param {*} _
   * @param {object} options
   */
  test(_, { options }) {
    const fileMediaType = options.context?.file?.mediaType;
    if (fileMediaType && options.context) {
      options.context.fileMediaType = fileMediaType;
    }
    return true;
  },
});