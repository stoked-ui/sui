---
productId: mac-mixer
title: Mac Mixer Overview
---

# Overview

<p class="description">Mac Mixer is a macOS menu-bar utility for routing each app's audio to the output device you choose, with independent app volume and per-device master volume.</p>

## What Mac Mixer does

Mac Mixer solves the "one default output device" limitation in macOS. It installs a CoreAudio HAL virtual output device named **Mac Mixer**, makes that device the system output, then uses the companion menu-bar app to forward each app's audio stream to a physical device.

Common routing examples:

- Zoom to AirPods while Spotify plays through speakers.
- Chrome to an HDMI capture device while system notifications stay on built-in output.
- A meeting app, music app, and browser each kept at their own volume.
- A device renamed in Mac Mixer so a hardware UID becomes a label you recognize.

## Product scope

| Area           | Current behavior                                                                |
| :------------- | :------------------------------------------------------------------------------ |
| Platform       | macOS 13 or later                                                               |
| UI             | Menu-bar app with a routing popover and Settings scene                          |
| Audio device   | CoreAudio HAL virtual output device                                             |
| Output routing | Up to 8 active physical output destinations                                     |
| Volume         | Per-app volume plus per-device master volume                                    |
| Persistence    | YAML config in `~/Library/Application Support/MacMixer/config.yaml`             |
| Licensing      | 30-day trial, direct annual license, and Mac App Store subscription build paths |

## How the audio path works

1. Mac Mixer installs the HAL plug-in at `/Library/Audio/Plug-Ins/HAL/MacMixer.driver`.
2. macOS sees **Mac Mixer** as an output device.
3. Apps write audio to that virtual device.
4. The driver separates app streams into loopback buses.
5. The menu-bar app reads those buses and forwards audio to the selected physical outputs.
6. Route and volume changes are written to disk and pushed to the driver immediately.

Audio content is processed locally on the Mac. The product does not upload or analyze audio.

## Current release status

Mac Mixer is in private alpha. The current build is focused on the core routing path: virtual output capture, drag-and-drop route assignment, app volume, device master volume, device naming, configuration persistence, trial state, and license activation.

Public installer links will be added after release signing, notarization, and packaging are complete.

## Next steps

- Read [Routing and Volumes](/products/mac-mixer/docs/app-volumes/) to understand the main workflow.
- Read [Installation](/products/mac-mixer/docs/installation/) before running an alpha build.
- Read [Licensing](/products/mac-mixer/docs/licensing/) for trial, direct-license, and App Store subscription behavior.
