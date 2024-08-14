---
title: introduction
toc: 'menu'
---


## react timeline editor

`timeline` is a component developed based on react and used to quickly build timeline editing capabilities.

It can be mainly used to build animation editors, video editors, etc.

![timeline](/assets/timeline.gif)


## ✨ Features

- 🛠 Supports drag and zoom modes, and provides convenient control hooks.
- 🔗 Provides interactive capabilities such as grid adsorption and auxiliary line adsorption.
- 🏷 Automatically recognize the length of the action and scroll infinitely.
- 🎨 Customize styles quickly and easily.
- 📡 Provides strong decoupling runner capabilities and can be run independently from the editor.

## Get started quickly

```
npm install @stoked-ui/timeline
```

```tsx | pure
import React from 'react';
import { Timeline } from '@stoked-ui/timeline';

export const TimelineEditor = () => {
  return (
    <Timeline
      editorData={[]}
      effects={{}}
    />
  )
}
```

## Props
<API hideTitle src="../src/Timeline/Timeline.tsx"></API>
