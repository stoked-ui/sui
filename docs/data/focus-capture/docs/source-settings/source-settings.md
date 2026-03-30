---
productId: focus-capture
title: Focus Capture Source Settings
---

# Source Settings

<p class="description">Configure Focus Capture directly from the OBS source properties panel.</p>

## Available Settings

| Setting | Default | What it does |
|---------|---------|--------------|
| `fps` | `30` | Sets the capture frame rate. |
| `capture_cursor` | `true` | Includes the mouse cursor in the captured output. |
| `show_empty_names` | `false` | Allows capture of windows with empty titles. |
| `fit_to_screen` | `false` | Scales the captured window to fit the OBS canvas with letterboxing. |
| `auto_resize_window` | `false` | Resizes the focused window to match the OBS canvas dimensions. |
| `snap_aspect_ratio` | `false` | Adjusts the focused window to match the OBS canvas aspect ratio. |
| `exclusion_list` | system app defaults | Ignores matching bundle IDs so those apps do not steal capture. |

## Recommended starting configuration

- Leave `fps` at `30` unless you need a smoother cursor or animation capture.
- Keep `capture_cursor` enabled for demos and support walkthroughs.
- Use `fit_to_screen` if your active apps vary widely in size.
- Use the exclusion list for apps like Spotlight, Control Center, and notification surfaces.

## Exclusion list format

Enter one macOS bundle ID per line. Example:

```text
com.apple.Spotlight
com.apple.notificationcenterui
com.apple.controlcenter
```

When one of these apps becomes focused, Focus Capture keeps the previous window instead of switching.

## Notes on resize behavior

- `auto_resize_window` is useful for repeatable recording setups where every captured window should match your canvas.
- `snap_aspect_ratio` is a lighter-touch option when you want the current window to keep its position but better fit the recording aspect ratio.

For release status and planned improvements, see the [Roadmap](/products/focus-capture/docs/roadmap/).
