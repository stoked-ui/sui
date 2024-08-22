import { blend } from "@mui/system";
import { SxProps, Theme } from "@mui/material/styles";

export function ToggleButtonGroupSx(theme: Theme): SxProps {
  return {
    background: blend(theme.palette.background.default, '#AAA', 0.04),
    '& .MuiButtonBase-root': {
      color: 'black',
      '&:hover': {
        color: theme.palette.primary.main,
        background: theme.palette.background.default,
        border: '1px solid black',
      },
    }
  }
}
