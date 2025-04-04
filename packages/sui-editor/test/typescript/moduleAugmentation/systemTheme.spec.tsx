/**
 * A basic React component demonstrating the use of a custom Box component from Material-UI.
 */

import * as React from 'react';
import Box from '@mui/material/Box';

/**
 * A simple box with primary color border.
 */
<Box sx={{ borderColor: (theme) => theme.palette.primary.main }} />;
 
/**
 * A box with an invalid color, demonstrating how to handle unknown colors.
 * @param {object} props - The component's properties
 * @returns {JSX.Element} The rendered JSX element
 */
Box sx={{ borderColor: (theme) => theme.palette.invalid }} />;