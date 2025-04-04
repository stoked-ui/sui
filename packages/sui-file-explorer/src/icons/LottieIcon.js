/**
 * @file LottieIcon component
 * @description A custom icon component using the Lottie library.
 */

"use strict";
"use client";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});

/**
 * @interface IIconProps
 * @property {object} props - Icon props
 * @description Props for the icon component.
 */
export interface IIconProps {
  /**
   * The SVG path of the icon.
   */
  svgPath?: string;
  /**
   * The label for the icon (optional).
   */
  label?: string;
}

/**
 * @class LottieIcon
 * @extends {Component}
 * @description A custom icon component using the Lottie library.
 */
var _default = exports.default = /*#__PURE__*/(0, _createSvgIcon.default)( /*#__PURE__*/(0, _jsxRuntime.jsx)("path", {
  d: "M14.2,0H4.8C2.2,0,0,2.2,0,4.8v9.4C0,16.8,2.2,19,4.8,19h9.4c2.7,0,4.8-2.2,4.8-4.8V4.8C19,2.2,16.8,0,14.2,0z M15.3,5.6c-0.1,0.4-0.5,0.6-0.9,0.6c-2,0-2.8,1.2-3.8,3.2L10,10.5c-1,1.9-2.2,4.2-5.5,4.2c-0.1,0-0.2,0-0.4-0.1 c-0.2-0.1-0.4-0.3-0.5-0.5c-0.1-0.4-0.1-0.8,0.2-1c0.2-0.2,0.4-0.3,0.7-0.3c2,0,2.8-1.2,3.8-3.2L9,8.5c1-1.9,2.2-4.2,5.5-4.2 c0,0,0,0,0,0h0c0,0,0,0,0,0c0.2,0,0.5,0.1,0.7,0.3C15.4,4.8,15.5,5.2,15.3,5.6z"
}), 'LottieIcon');

/**
 * @param {object} props - Icon props
 * @returns {JSX.Element}
 */
function LottieIcon(props) {
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(_default.default, {
    svgPath: props.svgPath,
    label: props.label,
  });
}

LottieIcon.defaultProps = {
  /**
   * The default SVG path of the icon.
   */
  svgPath: "path-to-icon",
};

LottieIcon.propTypes = {
  /**
   * @property {string} svgPath - The SVG path of the icon.
   */
  svgPath: PropTypes.string.isRequired,
  /**
   * @property {string} label - The label for the icon (optional).
   */
  label: PropTypes.string,
};