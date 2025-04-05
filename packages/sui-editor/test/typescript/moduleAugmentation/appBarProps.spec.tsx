import * as React from 'react';
import { AppBar } from '@mui/material';

/**
 * Extends the AppBarPropsColorOverrides interface to include customAppBarColor.
 */
declare module '@mui/material/AppBar' {
  interface AppBarPropsColorOverrides {
    customAppBarColor: true;
  }
}

/**
 * Renders a custom AppBar component with a custom color.
 * 
 * @returns {JSX.Element} The custom AppBar component.
 * @example
 * <CustomAppBar color="customAppBarColor" />
 * 
 * @fires CustomAppBar#unknownColorError
 */
<AppBar color="customAppBarColor" />;

// @ts-expect-error unknown color
/**
 * Renders an AppBar component with an unknown color, triggering an error.
 * 
 * @fires CustomAppBar#unknownColorError
 */
<AppBar color="foo" />;