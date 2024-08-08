# Media Selector Overview

<p class="description">The Media Selector library is responsible for extracting file data from input controls or drop targets and then converting them to FileWithPath objects.</p>

:::info
[FileWithPath](/stoked-ui/docs/media-selector/file-with-path/) objects are derived from the standard File object with the additional path data as well as other generic and type specific properties and functions.
:::

## Introduction

The Media Selector library is mainly stubbed out at the moment. The intent is to return media type metadata automatically as well as provide helper functions for media types such as images and video that allow its users the maximum amount of control over these types in the client immediately after introduction via a file input control or drop target.

## Usage

### Use with Input Control

```js
import { FileWithPath } from "@stoked-ui/media-selector";

const input = document.getElementById('myInput');
input.addEventListener('change', async evt => {
    const files = await FileWithPath.from(evt);
    console.log(files);
});
```

## What's next

- Check the Media Selector Roadmap (soon) to see what's coming next for this library.
- Check the Video Editor Roadmap to see the larger context.
