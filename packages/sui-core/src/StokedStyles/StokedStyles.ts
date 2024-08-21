import { blend } from "@mui/system";
import { useTheme } from "@mui/material/styles";

export default function StokedStyles() {
  const theme = useTheme();

  const toggleButtonGroup = {
    background: blend(theme.palette.background.default, '#AAA', 0.04),
    '& .MuiButtonBase-root': {
      color: 'black',
      '&:hover': {
        color: theme.palette.primary.main,
        background: theme.palette.background.default,
        border: '1px solid black',
      },
    }
  };

  return { toggleButtonGroup }
}
