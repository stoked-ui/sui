/**
 * Higher-order function that applies outlined style to a component using Material-UI styling.
 * @param {string} tag - The HTML tag of the component to style.
 * @returns {Function} A styled component with outlined style applied.
 */
const OutlinedStyle = (tag) => {
  return styled(tag)(() => ({
    '& .MuiSelect-select': {
      display: 'flex',
      alignItems: 'center'
    },
  }));
}

export default OutlinedStyle;