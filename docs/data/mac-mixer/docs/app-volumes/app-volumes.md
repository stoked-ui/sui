---
productId: mac-mixer
title: Routing and Volumes
---

# Routing and Volumes

<p class="description">Use the Mac Mixer popover to move apps between output devices and control each route's level without changing the rest of the system mix.</p>

## Routing an app

1. Click the Mac Mixer menu-bar icon.
2. Find the app under its current output device.
3. Drag the app row onto another device section.
4. Mac Mixer writes the new route to the config file and pushes it to the HAL driver.
5. The app's audio starts flowing to the selected physical output.

The first enabled output is the default route for new or unassigned apps. If a device is hidden or disconnected, Mac Mixer reassigns affected apps to the default enabled output.

## Volume model

Mac Mixer applies volume in two layers:

| Control              | Applies to                    | Use it for                                                          |
| :------------------- | :---------------------------- | :------------------------------------------------------------------ |
| App volume           | One routed app                | Lower music under calls, balance browser audio, mute a noisy app    |
| Device master volume | All apps routed to one output | Keep one speaker/headphone output quieter than another              |

The driver receives route configuration through the custom CoreAudio property `mmcf`, so volume changes do not require a `coreaudiod` restart.

## Device controls

Each output device can be:

- **Renamed** in Mac Mixer while preserving the original system device name.
- **Set as the only active output** when you want a simple single-device mix.
- **Hidden** when it should not receive app routes.
- **Re-enabled** from the inactive devices list.

The current driver exposes 8 loopback input buses, so the active physical-output route count is capped at 8.

## App identity notes

Mac Mixer routes by bundle identifier. Some apps use helper processes for audio, so the row you move may represent a helper bundle rather than the visible app bundle. Chrome-style audio helper processes are normalized where the driver can identify them.

## Troubleshooting

- If a device does not appear, confirm macOS can see it in Sound settings or Audio MIDI Setup.
- If routing does not change immediately, quit and relaunch Mac Mixer so it can resync the forwarder pipelines.
- If all audio is silent after quitting, choose a physical output in macOS Sound settings. The app is designed to restore the original output on quit when possible.
