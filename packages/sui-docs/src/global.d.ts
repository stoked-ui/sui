import {Theme as MuiTheme} from "@mui/material/styles";

declare module '@emotion/react' {
  interface Theme extends MuiTheme {
    applyDarkStyles: (styles: any) => any;
  }
}

