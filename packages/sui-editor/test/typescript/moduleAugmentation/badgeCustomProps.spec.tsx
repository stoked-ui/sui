import * as React from 'react';
import Badge from '@mui/material/Badge';
import { createTheme } from '@mui/material/styles';

/**
 * Update the Button's extendable props options
 */
declare module '@mui/material/Badge' {
  interface BadgePropsVariantOverrides {
    action: true;
  }
  interface BadgePropsColorOverrides {
    success: true;
  }
}

/**
 * Theme typings should work as expected
 */
const theme = createTheme({
  components: {
    MuiBadge: {
      variants: [
        {
          props: { variant: 'action' },
          style: {
            border: `2px dashed grey`,
          },
        },
        {
          props: { color: 'success' },
          style: {
            backgroundColor: 'green',
          },
        },
      ],
    },
  },
});

/**
 * Renders a Badge component with specified variant, color, and badge content.
 * @param {Object} props - The props for the Badge component.
 * @property {string} variant - The variant of the Badge (e.g., 'action').
 * @property {string} color - The color of the Badge (e.g., 'success').
 * @property {number} badgeContent - The content to be displayed as the badge count.
 * @returns {JSX.Element} The rendered Badge component.
 * @example
 * <Badge variant="action" color="success" badgeContent={123} />;
 */
<Badge variant="action" color="success" badgeContent={123} />;

// @ts-expect-error typo
<Badge variant="Action" />;

// @ts-expect-error typo
<Badge color="Success" />;