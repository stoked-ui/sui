/**
 * Represents a box component with custom styling.
 * @param {Object} props - The component props
 * @property {Function} sx - The custom styling object
 * @returns {JSX.Element} React component
 * @example
 * <CustomBox sx={{ borderColor: (theme) => theme.palette.primary.main }} />
 * @example
 * <CustomBox sx={{ borderColor: (theme) => theme.palette.secondary.main }} />
 */
<Box sx={{ borderColor: (theme) => theme.palette.primary.main }} />;

/**
 * Represents a box component with custom styling and an invalid color (intentionally causing a TypeScript error).
 * @param {Object} props - The component props
 * @property {Function} sx - The custom styling object with an invalid color
 */
// @ts-expect-error unknown color
<Box sx={{ borderColor: (theme) => theme.palette.invalid }} />;
