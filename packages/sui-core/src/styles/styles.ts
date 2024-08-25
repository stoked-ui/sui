import { blend } from "@mui/system";
import {SxProps, Theme, useTheme} from "@mui/material/styles";

export function ToggleButtonGroupSx(theme: Theme): SxProps {
  return {
    background: blend(theme.palette.background.default, '#AAA', 0.04),
    '& .MuiButtonBase-root': {
      color: theme.palette.text.primary,
      '&:hover': {
        color: theme.palette.primary.main,
        background: theme.palette.background.default,
        border: `1px solid ${theme.palette.text.primary}`,
      },
    }
  }
}

export function themeContrast(theme: Theme, percent: number) {
  return blend(theme.palette.background.default, theme.palette.text.primary, percent)
}

export function modeContrast(mode: 'dark' | 'light', percent: number) {
  const back = mode === 'light' ? '#000' : '#fff';
  const fore = mode === 'light' ? '#fff' : '#000';
  return blend(back, fore, percent)
}

export function useContrast(percent: number) {
  const theme = useTheme();
  const out = blend(theme.palette.background.default, theme.palette.text.primary, percent);
  console.log('useContrast', percent, out);
  return out;
}

export function usePaletteVar(themeVar: string) {
  const theme = useTheme();
  console.log('theme.palette', theme.palette.action, theme.palette.background, theme.palette.text)
  let ret: any = theme.palette;
  const parts: string[] = themeVar.split('.');
  parts.forEach((part)=> {
    ret = ret[part];
  })
  return ret;
}
