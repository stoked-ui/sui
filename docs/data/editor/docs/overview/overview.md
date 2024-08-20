---
productId: core
title: Stoked UI Core
githubLabel: 'component: core'
components: Button, PluginComponent
packageName: '@stoked-ui/core'
---

# Overview

<p class="description">The Core library contains all the reusable stuffs. It will likely mostly just contain hacked and slashed components yoink'd from @mui/material for this and that.</p>

{{"component": "modules/components/ComponentLinkHeader"}}

## Available components

The Stoked UI Core package exposes two components intialy.

### Button

### Plugin Component


```jsx
import Button from '@stoked-ui/core/Button';
```

The simple version of the Button component stolen from @mui/material is used primarily for testing and investigation. Specifically looking at the way @mui/material toolchain works vs @mui/mui-x. Definitely do not need this library or the full Button code from material in order to theme it up stoked style.

{{"demo": "CoreDemo.js", "defaultCodeOpen": false, "bg": "noMargin"}}
