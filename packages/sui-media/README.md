# file-selector

> A small package for converting a [DragEvent](https://developer.mozilla.org/en-US/docs/Web/API/DragEvent) or [file input](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file) to a list of File objects.

[![npm](https://img.shields.io/npm/v/file-selector.svg?style=flat-square)](https://www.npmjs.com/package/file-selector)
[![Tests](https://img.shields.io/github/workflow/status/react-dropzone/file-selector/Test?label=tests&style=flat-square)](https://github.com/react-dropzone/file-selector/actions?query=workflow%3ATest)
[![codecov](https://img.shields.io/coveralls/github/react-dropzone/file-selector/master?style=flat-square)](https://coveralls.io/github/react-dropzone/file-selector?branch=master)
[![Open Collective Backers](https://img.shields.io/opencollective/backers/react-dropzone.svg?style=flat-square)](#backers)
[![Open Collective Sponsors](https://img.shields.io/opencollective/sponsors/react-dropzone.svg?style=flat-square)](#sponsors)
[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-2.1-4baaaa.svg?style=flat-square)](https://github.com/react-dropzone/.github/blob/main/CODE_OF_CONDUCT.md)

# Table of Contents

* [Installation](#installation)
* [Usage](#usage)
* [Browser Support](#browser-support)
* [Contribute](#contribute)
* [Credits](#credits)
* [Support](#support)
* [License](#license)


## Installation
To install this package:

```bash
npm add @stoked-ui/media-selector
yarn add @stoked-ui/media-selector
pnpm add @stoked-ui/media-selector
```

## Usage

### ES6
Convert a [DragEvent](https://developer.mozilla.org/en-US/docs/Web/API/DragEvent) to File objects:
```ts
import FileWithPath from '@stoked-ui/media-selector/FileWithPath';
document.addEventListener('drop', async evt => {
    const files = await FileWithPath.from(evt);
    console.log(files);
});
```

Convert a [change event](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/change_event) for an input type file to File objects:
```ts
import FileWithPath from '@stoked-ui/media-selector/FileWithPath';
const input = document.getElementById('myInput');
input.addEventListener('change', async evt => {
    const files = await FileWithPath.from(evt);
    console.log(files);
});
```

Convert [FileSystemFileHandle](https://developer.mozilla.org/en-US/docs/Web/API/FileSystemFileHandle) items to File objects:
```ts
import FileWithPath from '@stoked-ui/media-selector/FileWithPath';

// Open file picker
const handles = await window.showOpenFilePicker({multiple: true});
// Get the files
const files = await FileWithPath.from(handles);
console.log(files);
```
**NOTE** The above is experimental and subject to change.

### CommonJS
Convert a `DragEvent` to File objects:
```ts
const {fromEvent} = require('@stoked-ui/media-selector');
document.addEventListener('drop', async evt => {
    const files = await fromEvent(evt);
    console.log(files);
});
```


## Browser Support
Most browser support basic File selection with drag 'n' drop or file input:
* [File API](https://developer.mozilla.org/en-US/docs/Web/API/File#Browser_compatibility)
* [Drag Event](https://developer.mozilla.org/en-US/docs/Web/API/DragEvent#Browser_compatibility)
* [DataTransfer](https://developer.mozilla.org/en-US/docs/Web/API/DataTransfer#Browser_compatibility)
* [`<input type="file">`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file#Browser_compatibility)

For folder drop we use the [FileSystem API](https://developer.mozilla.org/en-US/docs/Web/API/FileSystem) which has very limited support:
* [DataTransferItem.getAsFile()](https://developer.mozilla.org/en-US/docs/Web/API/DataTransferItem/getAsFile#Browser_compatibility)
* [DataTransferItem.webkitGetAsEntry()](https://developer.mozilla.org/en-US/docs/Web/API/DataTransferItem/webkitGetAsEntry#Browser_compatibility)
* [FileSystemEntry](https://developer.mozilla.org/en-US/docs/Web/API/FileSystemEntry#Browser_compatibility)
* [FileSystemFileEntry.file()](https://developer.mozilla.org/en-US/docs/Web/API/FileSystemFileEntry/file#Browser_compatibility)
* [FileSystemDirectoryEntry.createReader()](https://developer.mozilla.org/en-US/docs/Web/API/FileSystemDirectoryEntry/createReader#Browser_compatibility)
* [FileSystemDirectoryReader.readEntries()](https://developer.mozilla.org/en-US/docs/Web/API/FileSystemDirectoryReader/readEntries#Browser_compatibility)


## Contribute
If you wish to contribute, please use the following guidelines:
* Use [Conventional Commits](https://conventionalcommits.org)
* Use `[ci skip]` in commit messages to skip a build

## Credits
* [file-selector](https://github.com/react-dropzone/file-selector)

## Support

### Backers
Support us with a monthly donation and help us continue our activities. [[Become a backer](https://opencollective.com/react-dropzone#backer)]

### Sponsors
Become a sponsor and get your logo on our README on Github with a link to your site. [[Become a sponsor](https://opencollective.com/react-dropzone#sponsor)]

## License
MIT
