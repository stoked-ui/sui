/**
 * Tooltip component with slotProps validation.
 *
 * This component demonstrates how to use the `slotProps` property of the `Tooltip`
 * component from Material-UI. The `slotProps` object contains two nested objects:
 *   - `tooltip`: defines the styles for the tooltip text.
 *   - `arrow`: defines the styles for the arrow icon.
 *
 * @see https://material-ui.com/components/tooltip/#slots
 */

import * as React from 'react';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import { PaletteColor } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Palette {
    custom: PaletteColor;
  }
}

interface SlotProps {
  /**
   * The styles for the tooltip text.
   *
   * @param theme The Material-UI theme object.
   */
  tooltip: React.SlotHTMLAttributes<React.ComponentType<{ sx?: (theme: any) => { [key: string]: any } }>>>;

  /**
   * The styles for the arrow icon.
   *
   * @param theme The Material-UI theme object.
   */
  arrow: React.SlotHTMLAttributes<React.ComponentType<{ sx?: (theme: any) => { [key: string]: any } }>>;
}

function TooltipComponent({ tooltip, arrow }: SlotProps) {
  return (
    <Tooltip
      title="tooltip"
      slotProps={{
        tooltip,
        arrow,
      }}
    >
      <Button>Hover Me!</Button>
    </Tooltip>
  );
}