"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var internal_test_utils_1 = require("@stoked-ui/internal-test-utils");
var FileDropzone_1 = require("@stoked-ui/file-explorer/FileDropzone");
var describeConformance_1 = require("test/utils/describeConformance");
describe('ee<FileDropzone />', function () {
    var render = (0, internal_test_utils_1.createRenderer)().render;
    (0, describeConformance_1.describeConformance)(<FileDropzone_1.FileDropzone />, function () { return ({
        classes: FileDropzone_1.fileDropzoneClasses,
        inheritComponent: 'ul',
        render: render,
        refInstanceof: window.HTMLUListElement,
        muiName: 'MuiFileDropzone',
        skip: ['componentProp', 'componentsProp', 'themeVariants'],
    }); });
});
