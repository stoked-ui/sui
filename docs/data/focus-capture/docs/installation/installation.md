---
productId: focus-capture
title: Install Focus Capture in OBS
---

# Installation

<p class="description">Install Focus Capture, grant the required macOS permissions, and add the source in OBS Studio.</p>

## Option 1: Installer Package

1. Download the `.pkg` from the [Download](/products/focus-capture/docs/download/) page.
2. Run the installer.
3. Finish the package flow and launch OBS Studio.

The installer places the plugin in the standard OBS plugins directory under `Library/Application Support/obs-studio/plugins`.

## Option 2: Manual Plugin Install

1. Download the `.zip` from the [Download](/products/focus-capture/docs/download/) page.
2. Extract `obs-auto-focus-window-capture.plugin`.
3. Copy it into one of these locations:

```bash
~/Library/Application Support/obs-studio/plugins/
```

or

```bash
/Library/Application Support/obs-studio/plugins/
```

4. Restart OBS Studio if it was already open.

## Add the source in OBS

1. Open the scene where you want active-window capture.
2. Click **Add Source**.
3. Choose **Auto-Focus Window Capture**.
4. Name the source and confirm.

## Required macOS Permissions

Focus Capture needs two macOS permissions to work correctly:

- **Screen Recording** -- Required for ScreenCaptureKit to capture window contents.
- **Accessibility** -- Required to observe which application window currently has focus.

If macOS blocks either permission:

1. Open **System Settings**.
2. Visit **Privacy & Security**.
3. Enable OBS Studio under **Screen Recording**.
4. Enable OBS Studio under **Accessibility**.
5. Restart OBS Studio after granting access.

## First-run checklist

- Confirm the source appears in OBS.
- Focus another app window and watch the capture switch.
- Add bundle IDs to the exclusion list if utility windows steal focus.
- Tune frame rate and cursor capture in the source settings.

Next, see [Source Settings](/products/focus-capture/docs/source-settings/) for the controls available on the OBS source.
