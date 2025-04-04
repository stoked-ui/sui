/**
 * Describes the conformance of a given React element.
 *
 * @param {React.ReactElement} minimalElement - The minimal React element to test for conformance.
 * @param {function} getOptions - A function that returns an object with options for testing conformance.
 */
export default function describeConformance(
  minimalElement: React.ReactElement,
  getOptions: () => ConformanceOptions,
) {
  /**
   * Returns the options with defaults, including ThemeProvider and createTheme.
   *
   * @returns {object} The options with defaults.
   */
  function getOptionsWithDefaults() {
    return {
      ThemeProvider,
      createTheme,
      ...getOptions(),
    };
  }

  return baseDescribeConformance(minimalElement, getOptionsWithDefaults);
}

/**
 * Options for testing conformance.
 *
 * @typedef {object} ConformanceOptions
 */