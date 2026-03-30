---
productId: focus-capture
title: Focus Capture Roadmap
---

# Roadmap

<p class="description">Current launch scope and the next improvements planned for Focus Capture.</p>

## Current release

Focus Capture 1.0.0 ships the core macOS workflow:

- active-window tracking
- native OBS source integration
- ScreenCaptureKit window capture
- exclusion rules
- fit-to-screen and resize controls

## Next priorities

- **Installer polish** -- tighter packaging, signing, and smoother first-run install flow
- **Permission UX** -- clearer guidance when Screen Recording or Accessibility access is missing
- **Capture performance** -- continue reducing switch latency and scaling overhead during fast app changes
- **Source ergonomics** -- richer presets for common recording layouts and exclusion profiles
- **Validation coverage** -- stronger automated checks around focus changes, exclusion logic, and resize behavior

## Longer-term ideas

- app-specific behavior profiles
- smarter handling for transient utility windows
- deeper OBS workflow integration for advanced recording setups

Focus Capture is currently macOS-focused because it depends on ScreenCaptureKit for the capture pipeline.
