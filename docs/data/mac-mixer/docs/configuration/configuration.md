---
productId: mac-mixer
title: Configuration
---

# Configuration

<p class="description">Mac Mixer stores route state in YAML and mirrors that state into the HAL driver for real-time audio routing.</p>

## Config location

The routing config lives at:

```text
~/Library/Application Support/MacMixer/config.yaml
```

The menu-bar app owns runtime state and writes this file whenever routes, device names, enabled devices, or volume values change.

## Shape

The schema is shared with the Rust config crate and mirrored in the Swift app. A simplified config looks like this:

```yaml
devices:
  - uid: BuiltInSpeakerDevice
    name: MacBook Speakers
    enabled: true
    sort_order: 0
    master_volume: 0.85
  - uid: AirPodsPro
    name: AirPods Pro
    enabled: true
    sort_order: 1
    master_volume: 0.7
routes:
  - bundle_id: us.zoom.xos
    device_uid: AirPodsPro
    volume: 0.82
  - bundle_id: com.spotify.client
    device_uid: BuiltInSpeakerDevice
    volume: 0.35
```

Volume values are normalized between `0.0` and `1.0`.

## Runtime sync

Mac Mixer sends the same route payload to the HAL driver through the custom `mmcf` CoreAudio property. That push is what lets route and volume changes take effect without reinstalling the driver or restarting `coreaudiod`.

The Rust config layer also includes file-watching support so manual edits can be picked up during development.

## Editing by hand

Hand editing is useful for alpha debugging, but use the popover for normal changes. When editing manually:

- Keep `uid` and `device_uid` values exactly as macOS reports them.
- Keep volumes in the `0.0` to `1.0` range.
- Do not route apps to disabled devices.
- Relaunch Mac Mixer if the UI and config file disagree.

## Resetting

The app Settings screen includes a reset path that removes the config and rebuilds state from discovered output devices. Trial and license data are stored separately in Keychain and UserDefaults.
