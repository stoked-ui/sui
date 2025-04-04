import * as React from 'react';
import {SxProps} from "@mui/system";
import {styled, Theme} from "@mui/material/styles";

/**
 * Root Svg Props
 *
 * @typedef {Object} RootSvgProps
 * @property {Object} [sx] - The sx prop to apply to the SVG element.
 * @property {React.Ref<SVGSVGElement>} [ref] - A reference to the SVG element.
 */
export type RootSvgProps<P = unknown> = Omit<React.SVGProps<SVGSVGElement>, 'ref'> & {
  /**
   * The sx prop to apply to the SVG element. This property accepts an object with styles that can be used in conjunction with MUI's theme.
   * @type {SxProps<Theme>}
   */
  sx?: SxProps<Theme>;
  /**
   * A reference to the SVG element.
   * @type {React.Ref<SVGSVGElement>}
   */
  ref?: React.Ref<SVGSVGElement>;
} & P;

/**
 * Styled Svg Component
 *
 * This component is a styled SVG that can be used as a wrapper for other SVG elements or components.
 */
const Svg = styled('svg')({
  /**
   * The vertical alignment of the SVG element. In this case, it's set to 'bottom' so that the SVG appears at the bottom of its parent container.
   */
  verticalAlign: 'bottom',
});

/**
 * TimelineTrackIcon Component
 *
 * This component represents a timeline track icon and is used in conjunction with other icons to display a timeline.
 *
 * @param {RootSvgProps} props - The properties for this component.
 * @returns {JSX.Element} The JSX element for the component.
 */
export default function TimelineTrackIcon(props: RootSvgProps) {
  return (
    <Svg
      /**
       * The xmlns attribute specifies the namespace for the SVG element. This is a standard attribute used to specify the document type of an XML file.
       */
      xmlns="http://www.w3.org/2000/svg"
      /**
       * The viewBox attribute specifies the coordinate system for the SVG element.
       */
      viewBox="-4 4 22 22"
      fill="none"
      sx={[
        /**
         * This function applies a style to the SVG element based on the theme. The styles are defined in MUI's theme object and are applied using the theme.applyStyles method.
         */
        (theme) => ({
          flexShrink: 0,
          color: 'common.black',
          ...theme.applyStyles('dark', {
            color: '#FFF',
          })
        }),
        /**
         * If sx is an array, it's spread into the SVG element. This allows for a more dynamic and flexible way of applying styles to the SVG element.
         */
        ...(Array.isArray(props.sx) ? props.sx : [props.sx]),
      ]}
      {...props}
    >
      /**
       * The path element defines the shape of the SVG icon. In this case, it's a timeline track icon with three segments.
       */
      <path
        d="M 18.024 16.725 L 18.024 19.725 L 2.024 19.725 L 2.024 16.725 L 18.024 16.725 Z M 15.024 12.725 L 15.024 15.725 L 8.024 15.725 L 8.024 12.725 L 15.024 12.725 Z M 18.024 8.725 L 18.024 11.725 L 4.024 11.725 L 4.024 8.725 L 18.024 8.725 Z"
        /**
         * The fill attribute specifies the color of the path element.
         */
        fill="#007FFF"
      />
    </Svg>);
}