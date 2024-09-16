import {shouldForwardProp} from "@mui/system/createStyled";
import {styled} from "../internals/zero-styled";

export const FileIconContainer = styled('div', {
  name: 'MuiFile',
  slot: 'IconContainer',
  overridesResolver: (props, styles) => styles.iconContainer,
  shouldForwardProp: (prop) =>
    shouldForwardProp(prop) &&
    prop !== 'iconName'
})({
  width: 16,
  display: 'flex',
  flexShrink: 0,
  justifyContent: 'center',
  '& svg': {
    fontSize: 18,
  },
});
