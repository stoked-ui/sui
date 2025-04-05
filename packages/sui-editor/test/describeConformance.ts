/** 
 * Function to describe the conformance of a React component
 * 
 * @param {React.ReactElement} minimalElement - The minimal React element to test conformance
 * @param {Function} getOptions - A function that returns ConformanceOptions
 * 
 * @returns {void}
 */
export default function describeConformance(
  minimalElement: React.ReactElement,
  getOptions: () => ConformanceOptions,
) {
  /**
   * Function to get options with default values
   * 
   * @returns {Object} - Options object with default values
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