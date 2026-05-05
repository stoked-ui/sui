---
productId: mac-mixer
title: Installation
---

# Installation

<p class="description">Mac Mixer installs a native macOS menu-bar app plus a CoreAudio HAL plug-in. Alpha builds require care because the plug-in is installed system-wide.</p>

## Requirements

| Requirement   | Minimum                                                   |
| :------------ | :-------------------------------------------------------- |
| macOS         | 13 Ventura                                                |
| Audio devices | Stereo output devices are the current supported path      |
| Permissions   | Administrator approval for the first HAL plug-in install  |

## Release channels

Mac Mixer has two build-time distribution channels:

- **Direct build** - Uses a license key purchased through stokedconsulting.com and validated by the direct license API.
- **Mac App Store build** - Uses StoreKit 2 products under the Mac Mixer Pro subscription group.

Public installer links are not published yet. They will be added here after release signing, notarization, and packaging are complete.

## First launch

On first launch, Mac Mixer:

1. Starts as a menu-bar-only app.
2. Checks whether the Mac Mixer virtual output device is already installed.
3. If needed, asks for administrator approval to copy `MacMixer.driver` into `/Library/Audio/Plug-Ins/HAL/`.
4. Restarts `coreaudiod` so macOS loads the new HAL plug-in.
5. Opens the menu-bar popover and begins syncing output devices and running apps.

Restarting `coreaudiod` briefly interrupts system audio. This is expected during install and plug-in upgrades.

## Quitting

When the app quits, it stops the audio forwarder and attempts to restore the physical output that was active before Mac Mixer took over. The HAL plug-in remains installed so the next launch does not require another administrator prompt unless the driver changes.

## Removing the alpha build

Until a packaged uninstaller is published, alpha testers should remove the app and driver only if they understand the system-wide plug-in path:

```bash
sudo rm -rf /Library/Audio/Plug-Ins/HAL/MacMixer.driver
sudo killall coreaudiod
```

After removal, choose a physical output device in macOS Sound settings.
