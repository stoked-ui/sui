/**
 * @description React component for a file dropzone.
 * 
 * @param {object} props - The props for the FileDropzone component.
 * @property {string} [classes] - The CSS classes for the file dropzone.
 * @property {string} [inheritComponent] - The HTML element type to inherit from.
 * @property {Function} [render] - The function to render the file dropzone.
 * @property {Window.HTMLUListElement} [refInstanceof] - The reference instance of a HTMLUListElement.
 * @property {string} [muiName] - The Material-UI component name.
 * @property {string[]} [skip] - The list of props to skip.
 * 
 * @returns {React.ReactNode}
 * 
 * @example
 * <FileDropzone />
 * 
 * @fires 
 * @see describeConformance
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

var React = require("react");
var internal_test_utils_1 = require("@stoked-ui/internal-test-utils");
var FileDropzone_1 = require("@stoked-ui/file-explorer/FileDropzone");
var describeConformance_1 = require("test/utils/describeConformance");

describe('ee<FileDropzone />', function () {
    var render = (0, internal_test_utils_1.createRenderer)().render;
    
    (0, describeConformance_1.describeConformance)(<FileDropzone_1.FileDropzone />, function () { 
        return ({
            classes: FileDropzone_1.fileDropzoneClasses,
            inheritComponent: 'ul',
            render: render,
            refInstanceof: window.HTMLUListElement,
            muiName: 'MuiFileDropzone',
            skip: ['componentProp', 'componentsProp', 'themeVariants'],
        }); 
    });
});