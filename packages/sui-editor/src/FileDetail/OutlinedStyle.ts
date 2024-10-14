import {styled} from "@mui/material/styles";

const OutlinedStyle = (tag) => {
  return styled(tag)(() => ({
    '& .MuiSelect-select': {
      display: 'flex',
      alignItems: 'center'
    },
  }));
}
export default OutlinedStyle;

