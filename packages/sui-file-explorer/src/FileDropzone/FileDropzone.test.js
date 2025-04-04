/**
 * @fileOverview Tests for FileDropzone component
 */

'use strict';

/**
 * Exported exports
 */
Object.defineProperty(exports, "__esModule", { value: true });

/**
 * React library
 *
 * @param {object} React - The React library
 * @returns {object} The React library
 */
var React = require("react");

/**
 * Internal test utilities module
 *
 * @module internal_test_utils
 */
var internal_test_utils_1 = require("@stoked-ui/internal-test-utils");

/**
 * FileDropzone component module
 *
 * @module @stoked-ui/file-explorer/FileDropzone
 */
var FileDropzone_1 = require("@stoked-ui/file-explorer/FileDropzone");

/**
 * Test utilities for describing conformance
 *
 * @module test/utils/describeConformance
 */
var describeConformance_1 = require("test/utils/describeConformance");

/**
 * Tests for ee<FileDropzone /> component
 */
describe('ee<FileDropzone />', function () {
    /**
     * Render function for testing
     *
     * @param {object} renderer - The renderer object
     * @returns {object} The rendered HTML element
     */
    var render = (0, internal_test_utils_1.createRenderer)().render;

    /**
     * Describe conformance test for FileDropzone component
     *
     * @param {object} config - The test configuration
     */
    (0, describeConformance_1.describeConformance)(<FileDropzone_1.FileDropzone />, function () {
        return ({
            /**
             * Classes used in the component
             *
             * @type {string}
             */
            classes: FileDropzone_1.fileDropzoneClasses,

            /**
             * InheritComponent prop value
             *
             * @type {string}
             */
            inheritComponent: 'ul',

            /**
             * Render function for testing
             *
             * @param {object} props - The component props
             * @returns {object} The rendered HTML element
             */
            render: render,

            /**
             * Ref instanceof value
             *
             * @type {boolean}
             */
            refInstanceof: window.HTMLUListElement,

            /**
             * MuiName prop value
             *
             * @type {string}
             */
            muiName: 'MuiFileDropzone',

            /**
             * Skip list for tests
             *
             * @type {array}
             */
            skip: ['componentProp', 'componentsProp', 'themeVariants'],
        });
    });
});