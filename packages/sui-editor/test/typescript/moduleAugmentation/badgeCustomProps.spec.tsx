import * as React from 'react';
/**
 * Importing MUI components and creating a custom theme.
 */

import Badge from '@mui/material/Badge';
import { createTheme } from '@mui/material/styles';

/**
 * Extending the @mui/material/Badge component with additional variant and color options.
 */
declare module '@mui/material/Badge' {
  interface BadgePropsVariantOverrides {
    /**
     * Action variant for the badge.
     */
    action: true;
  }
  interface BadgePropsColorOverrides {
    /**
     * Success color override for the badge.
     */
    success: true;
  }
}

/**
 * Creating a custom theme with extended badge component variants and colors.
 */
const theme = createTheme({
  components: {
    MuiBadge: {
      variants: [
        {
          props: { variant: 'action' },
          style: {
            /**
             * Adding a dashed grey border for the action variant.
             */
            border: `2px dashed grey`,
          },
        },
        {
          props: { color: 'success' },
          style: {
            /**
             * Setting the background color to green for the success color override.
             */
            backgroundColor: 'green',
          },
        },
      ],
    },
  },
});

/**
 * Rendering a badge component with the action variant and success color.
 */
<Badge variant="action" color="success" badgeContent={123} />

/**
 * Rendering a badge component with an incorrect variant (should be "Action").
 *
 * @ts-expect-error typo
 */
<Badge variant="Action" />

/**
 * Rendering a badge component with an incorrect color (should be "Success").
 *
 * @ts-expect-error typo
 */
<Badge color="Success" />;