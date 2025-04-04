/**
 * @fileoverview This module exports a default component for the TimelineView.
 */

"use strict";
"use client";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

/**
 * @typedef {Object} SvgIcon
 */
/**
 * @typedef {Object} Props
 * @property {string} d - The SVG path data string.
 * @property {string} [label] - The label to display next to the icon.
 */

/**
 * Creates a TimelineView component with the specified SVG path data and label.
 *
 * @param {Props} props - The props for the TimelineView component.
 * @returns {object} The rendered JSX element.
 */
var _createSvgIcon = _interopRequireDefault(require("@mui/material/utils/createSvgIcon"));

var _jsxRuntime = require("react/jsx-runtime");

/**
 * @exports default
 */
var _default = exports.default = (0, _createSvgIcon.default)((0, _jsxRuntime.jsx)("path", {
  d: "M3,23a1,1,0,0,1-1-1V2A1,1,0,0,1,4,2V3H8A1,1,0,0,1,8,5H4v6h8a1,1,0,0,1,0,2H4v6H6a1,1,0,0,1,0,2H4v1A1,1,0,0,1,3,23ZM21,3H13V2a1,1,0,0,0-2,0V4h0V6a1,1,0,0,0,2,0V5h8a1,1,0,0,0,0-2Zm0,8H17V10a1,1,0,0,0-2,0v2h0v2a1,1,0,0,0,2,0V13h4a1,1,0,0,0,0-2Zm0,8H11V18a1,1,0,0,0-2,0v2H9v2a1,1,0,0,0,2,0V21H21a1,1,0,0,0,0-2Z"
}), 'TimelineView');