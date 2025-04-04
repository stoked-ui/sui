/**
 * A styled component that adds a margin and padding to the select element.
 *
 * @param {string} tag - The HTML tag to apply the style to (e.g., "select").
 */
import { styled } from "@mui/material/styles";

const OutlinedStyle = (tag) => {
  /**
   * Styles the select element to display it as an outlined component.
   */
  return styled(tag)(() => ({
    '& .MuiSelect-select': {
      /**
       * Centers the content of the select element vertically.
       */
      display: 'flex',
      alignItems: 'center'
    },
  }));
}

export default OutlinedStyle;