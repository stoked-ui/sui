---
title: data definition
toc: 'menu'
---

## TimelineRow

> Editor data: row data structure

<table>
  <thead>
    <tr>
      <th>Attribute name</th>
      <th>Description</th>
      <th>Type</th>
      <th>Default value</th>
    </tr>
  </thead>
  <tbody>
  </tbody>
    <tr>
      <td>id</td>
      <td>Action row id</td>
      <td>
        <code>string</code>
      </td>
      <td>
        <code>(required)</code>
      </td>
    </tr>
    <tr>
      <td>actions</td>
      <td>Row action list</td>
      <td>
        <code><a href="/data#timelineaction">TimelineAction</a>[]</code>
      </td>
      <td>
        <code>(required)</code>
      </td>
    </tr>
    <tr>
      <td>rowHeight</td>
      <td>Customized row height (default determined by rowHeight in props)</td>
      <td>
        <code>number</code>
      </td>
      <td>
        <code>--</code>
      </td>
    </tr>
    <tr>
      <td>selected</td>
      <td>Whether the row is selected</td>
      <td>
        <code>boolean</code>
      </td>
      <td>
        <code>false</code>
      </td>
    </tr>
    <tr>
      <td>classNames</td>
      <td>Extended class name of row</td>
      <td>
        <code>string[]</code>
      </td>
      <td>
        <code>--</code>
      </td>
    </tr>
</table>


## TimelineAction

> Editor data: action data structure

<table>
  <thead>
    <tr>
      <th>Attribute name</th>
      <th>Description</th>
      <th>Type</th>
      <th>Default value</th>
    </tr>
  </thead>
  <tbody>
  </tbody>
    <tr>
      <td>id</td>
      <td>action id</td>
      <td>
        <code>string</code>
      </td>
      <td>
        <code>(required)</code>
      </td>
    </tr>
    <tr>
      <td>start</td>
      <td>Action start time</td>
      <td>
        <code>number</code>
      </td>
      <td>
        <code>(required)</code>
      </td>
    </tr>
    <tr>
      <td>end</td>
      <td>Action end time</td>
      <td>
        <code>number</code>
      </td>
      <td>
        <code>(required)</code>
      </td>
    </tr>
    <tr>
      <td>effectId</td>
      <td>The effect id index corresponding to the action</td>
      <td>
        <code>string</code>
      </td>
      <td>
        <code>(required)</code>
      </td>
    </tr>
    <tr>
      <td>selected</td>
      <td>Whether the action is selected</td>
      <td>
        <code>boolean</code>
      </td>
      <td>
        <code>false</code>
      </td>
    </tr>
    <tr>
      <td>flexible</td>
      <td>Whether the action is scalable</td>
      <td>
        <code>boolean</code>
      </td>
      <td>
        <code>true</code>
      </td>
    </tr>
    <tr>
      <td>movable</td>
      <td>Whether the action is movable</td>
      <td>
        <code>boolean</code>
      </td>
      <td>
        <code>true</code>
      </td>
    </tr>
    <tr>
      <td>disable</td>
      <td>Disable action</td>
      <td>
        <code>boolean</code>
      </td>
      <td>
        <code>false</code>
      </td>
    </tr>
    <tr>
      <td>minStart</td>
      <td>Minimum start time limit for actions</td>
      <td>
        <code>number</code>
      </td>
      <td>
        <code>0</code>
      </td>
    </tr>
    <tr>
      <td>maxEnd</td>
      <td>Maximum end time limit for actions</td>
      <td>
        <code>number</code>
      </td>
      <td>
        <code>Number.MAX_VALUE</code>
      </td>
    </tr>
</table>

## TimelineEffect

> Editor running effect data structure

<table>
  <thead>
    <tr>
      <th>Attribute name</th>
      <th>Description</th>
      <th>Type</th>
      <th>Default value</th>
    </tr>
  </thead>
  <tbody>
  </tbody>
    <tr>
      <td>id</td>
      <td>Effect id</td>
      <td>
        <code>string</code>
      </td>
      <td>
        <code>(required)</code>
      </td>
    </tr>
     <tr>
      <td>name</td>
      <td>Effect name</td>
      <td>
        <code>string</code>
      </td>
      <td>
        <code>--</code>
      </td>
    </tr>
     <tr>
      <td>source</td>
      <td>Effect running code</td>
      <td>
        <code>TimeLineEffectSource</code>
      </td>
      <td>
        <code>--</code>
      </td>
    </tr>
</table>

### TimeLineEffectSource

> Editor effect running code data structure

+ start trigger condition
  + When the runner starts playing, if the time is triggered within the current action time range
+ enter trigger condition
  + Enter the current action time area from the non-action time area
+ update trigger condition
  + Triggered every frame when playing the current action (including reRender)
  + Triggered when reRender
+ leave trigger condition
  + Leave the current action time area
+ stop trigger condition
  + When the runner pauses, if the time is triggered within the current action time range

<table>
  <thead>
    <tr>
      <th>Attribute name</th>
      <th>Description</th>
      <th>Type</th>
      <th>Default value</th>
    </tr>
  </thead>
  <tbody>
  </tbody>
    <tr>
      <td>start</td>
      <td>Callback when the current action time area starts playing</td>
      <td>
        <code>(param: EffectSourceParam) => void</code>
      </td>
      <td>
        <code>--</code>
      </td>
    </tr>
     <tr>
      <td>enter</td>
      <td>Execute callback when time enters action</td>
      <td>
        <code>(param: EffectSourceParam) => void</code>
      </td>
      <td>
        <code>--</code>
      </td>
    </tr>
     <tr>
      <td>update</td>
      <td> Callback when action is updated</td>
      <td>
        <code>(param: EffectSourceParam) => void</code>
      </td>
      <td>
        <code>--</code>
      </td>
    </tr>
     <tr>
      <td>leave</td>
      <td> Execute callback when time leaves the action</td>
      <td>
        <code>(param: EffectSourceParam) => void</code>
      </td>
      <td>
        <code>--</code>
      </td>
    </tr>
     <tr>
      <td>stop</td>
      <td> Called back when the current action time area stops playing</td>
      <td>
        <code>(param: EffectSourceParam) => void</code>
      </td>
      <td>
        <code>--</code>
      </td>
    </tr>
</table>

### EffectSourceParam

> Editor effect running code parameters

<table>
  <thead>
    <tr>
      <th>Attribute name</th>
      <th>Description</th>
      <th>Type</th>
    </tr>
  </thead>
  <tbody>
  </tbody>
    <tr>
      <td>time</td>
      <td>Current playback time</td>
      <td>
        <code>number</code>
      </td>
    </tr>
    <tr>
      <td>isPlaying</td>
      <td>Whether it is playing</td>
      <td>
        <code>boolean</code>
      </td>
    </tr>
     <tr>
      <td>action</td>
      <td>Action</td>
      <td>
        <code><a href="/data#timelineaction">TimelineAction</a></code>
      </td>
    </tr>
     <tr>
      <td>effect</td>
      <td>Action effects</td>
      <td>
        <code><a href="/data#timelineeffect">TimelineEffect</a></code>
      </td>
    </tr>
     <tr>
      <td>engine</td>
      <td>Runner</td>
      <td>
        <code>TimelineEngine</code>
      </td>
    </tr>
</table>

## TimelineState

> timeline component data

<table>
  <thead>
    <tr>
      <th>Attribute name</th>
      <th>Description</th>
      <th>Type</th>
    </tr>
  </thead>
  <tbody>
  </tbody>
    <tr>
      <td>target</td>
      <td>The dom node to which timeline belongs</td>
      <td>
        <code>HTMLElement</code>
      </td>
    </tr>
     <tr>
      <td>listener</td>
      <td>Run the listener</td>
      <td>
        <code>Emitter</code>
      </td>
    </tr>
     <tr>
      <td>isPlaying</td>
      <td>Whether it is playing</td>
      <td>
        <code>boolean</code>
      </td>
    </tr>
     <tr>
      <td>isPaused</td>
      <td>Is it paused</td>
      <td>
        <code>boolean</code>
      </td>
    </tr>
     <tr>
      <td>setTime</td>
      <td>Set the current playback time</td>
      <td>
        <code>(time: number) => void</code>
      </td>
    </tr>
     <tr>
      <td>getTime</td>
      <td>Get the current playback time</td>
      <td>
        <code>() => number</code>
      </td>
    </tr>
     <tr>
      <td>setPlayRate</td>
      <td>Set playback rate</td>
      <td>
        <code>(rate: number) => void</code>
      </td>
    </tr>
     <tr>
      <td>getPlayRate</td>
      <td>Set playback rate</td>
      <td>
        <code>() => number</code>
      </td>
    </tr>
     <tr>
      <td>reRender</td>
      <td>Re-render the current time</td>
      <td>
        <code>() => void</code>
      </td>
    </tr>
     <tr>
      <td>play</td>
      <td>Run</td>
      <td>
        <code>(param: { toTime?: number; autoEnd?: boolean; }) => boolean</code>
      </td>
    </tr>
     <tr>
      <td>pause</td>
      <td>Pause</td>
      <td>
        <code>() => void</code>
      </td>
    </tr>
     <tr>
      <td>setScrollLeft</td>
      <td>Set scrollLeft</td>
      <td>
        <code>(val: number) => void</code>
      </td>
    </tr>
     <tr>
      <td>setScrollTop</td>
      <td>Set scrollTop</td>
      <td>
        <code>(val: number) => void</code>
      </td>
    </tr>
</table>
