---
productId: focus-capture
title: Focus Capture - Active Window Capture for OBS
---

# Overview

<p class="description">Focus Capture is a macOS OBS plugin that automatically switches capture to the active application window.</p>

## What is Focus Capture?

Focus Capture is a native OBS source for macOS. It watches whichever layer-0 window currently has keyboard focus and redirects the capture stream to that window in real time. The result is a cleaner workflow for demos, support sessions, pair programming, and recorded walkthroughs where you jump between apps constantly.

## Key Features

- **Automatic active-window capture** -- Switches to the focused app window without manually changing scenes or sources.
- **Built for OBS Studio** -- Ships as a dedicated OBS source instead of relying on brittle scene macros or browser automation.
- **ScreenCaptureKit pipeline** -- Uses Apple's modern window-capture APIs for sharp capture and lower overhead on macOS 13+.
- **Exclusion list** -- Ignore utility apps such as Spotlight, Notification Center, or your own custom bundle IDs.
- **Capture controls** -- Configure frame rate, cursor capture, fit-to-screen behavior, and optional auto-resize directly in OBS.
- **Universal macOS build** -- Works on both Apple Silicon and Intel Macs.

## System Requirements

| Requirement | Minimum |
|-------------|---------|
| Operating System | macOS 13 Ventura or later |
| OBS Studio | 31.1.1 or later |
| Architecture | Apple Silicon or Intel |
| Distribution | [Download](/products/focus-capture/docs/download/) |

## How It Works

Focus Capture combines `NSWorkspace` activation events, Accessibility APIs, and ScreenCaptureKit:

1. It detects when the frontmost application changes.
2. It resolves the focused layer-0 window for that process.
3. It switches the capture stream to the new window.
4. OBS keeps receiving frames from the updated target without manual source changes.

## Best Fit

Focus Capture is a good fit when:

- you demo software across several apps during live calls
- you record tutorials while bouncing between editor, browser, and terminal
- you want a source that follows your workflow instead of forcing scene choreography

Continue to [Download](/products/focus-capture/docs/download/) for installer links, or jump to [Installation](/products/focus-capture/docs/installation/) for the OBS and macOS permission setup.
