---
title: introduction
toc: 'menu'
group:
  title: runner
---

## Runner

We provide a runner that is coupled to the editor and is used to run the data produced by the editor.

You can implement your own running system by defining the running capabilities (audio playback, animation playback, etc.) in each <code><a href="/data#timelineeffect">TimelineEffect</a></code> .

+ 🛠 Provides the ability to set time, set running rate, etc.
+ ⚙️ Can be used independently


## Example

You can use the runner in the following two scenarios:

### Run while editing
> The editor has a built-in runner, providing <code><a href="/data#timelinestate">TimelineState</a></code> for more convenient control of the runner.
>
> We do not provide default runner styles, you need to customize the styles
>
> You can easily obtain changes in running data through listeners, thereby customizing your own runner style.

<code src="./engine-basic/index.tsx"></code>

### Standalone use

> You can also use the runner anywhere to run the data produced by the editor
>
> This is useful when you want to share a set of data and runtime capabilities between <b style="color: #a87654">edit</b> and <b style="color: #a87654">runtime</b> very useful

<code src="./engine-standalone/index.tsx"></code>
