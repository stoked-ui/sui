---
title: API
group:
  title: runner
---

## Runner API

### isPlaying

`boolean` whether the runner is running

### isPaused

`boolean` Whether the runner is stopped

### effects

*setter* <code>Record<string,<a href="/data#timelineeffect">TimelineEffect</a>></code> Running effect

### data

*setter* <code><a href="/data#timelinerow">TimelineRow</a>[]</code> Run data

### setPlayRate

`(rate: number) => void` Set the playback rate

### getPlayRate

`() => number` Get the playback rate

### setTime

`(time: number) => void` Set the playback time

### getTime

`() => number` Get playback time

### reRender

`() => void` re-renders the current time

### play

`(param: {toTime?: number; autoEnd?: boolean}) => boolean`

Start playing from the current time (can be set through `setTime`), and return whether the playback is successful.
+ toTime (optional): playback end time
+ autoEnd (optional): whether to automatically stop after playing all actions

```ts | pure
import { TimelineEngine } from '@stoked-ui/timeline';
const engine = new TimelineEngine();
engine.play({autoEnd: true})
```

### pause

`() => void` Pause

### listener

You can listen to some events provided by the runner and respond to logic

```ts | pure
import { TimelineEngine } from '@stoked-ui/timeline';
const engine = new TimelineEngine();
```

+ `setTimeByTick`: time change caused by runner tick
```ts | pure
engine.on('setTimeByTick', ({time, engine}) => {...})
```

+ `beforeSetTime`: before setting time (manually) (setting can be prevented by `return false`)
```ts | pure
engine.on('beforeSetTime', ({time, engine}) => {...})
```

+ `afterSetTime`: after setting the time (manual)
```ts | pure
engine.on('afterSetTime', ({time, engine}) => {...})
```

+ `beforeSetPlayRate`: before setting the running rate (can be prevented by `return false`)
```ts | pure
engine.on('beforeSetPlayRate', ({rate, engine}) => {...})
```

+ `afterSetPlayRate`: After setting the running rate
```ts | pure
engine.on('afterSetPlayRate', ({rate, engine}) => {...})

```

+ `play`: listen to running events
```ts | pure
engine.on('play', ({engine}) => {...})
```

+ `paused`: listen for pause events
```ts | pure
engine.on('paused', ({engine}) => {...})
```

+ `ended`: monitor the playback completion event
```ts | pure
engine.on('ended', ({engine}) => {...})
```
