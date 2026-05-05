---
productId: mac-mixer
title: Roadmap
---

# Roadmap

<p class="description">Mac Mixer is in private alpha. This roadmap reflects the current product direction for the CoreAudio driver, menu-bar app, and release packaging.</p>

## Alpha scope

- CoreAudio HAL virtual output device named **Mac Mixer**.
- Menu-bar routing popover with drag-and-drop app assignment.
- Per-app volume and per-device master volume.
- Device rename, hide, and re-enable flows.
- YAML configuration persistence in Application Support.
- Runtime route push to the driver through the `mmcf` CoreAudio property.
- 30-day trial state.
- Direct-license activation and validation against `stokedconsulting.com`.
- Mac App Store subscription build path with StoreKit 2.

## Near term

- Signed and notarized direct installer.
- Public download and checkout flow on stokedconsulting.com.
- Release-channel QA for direct and Mac App Store builds.
- More resilient handling for device connect/disconnect events.
- Better empty, error, and permission states in the menu-bar popover.
- Expanded E2E coverage for route switching and device quality changes.

## Later

- More detailed app-helper identity mapping.
- Keyboard shortcuts for common route and mute actions.
- Import/export helpers for route profiles.
- Multi-channel device work after the stereo routing path is stable.
- Input and recording workflows as a separate future product phase.

## Not in the current product

Mac Mixer v2 is focused on per-app output routing. Auto-pausing music players, system-audio recording, audio effects, and analytics are not part of the current release scope.
