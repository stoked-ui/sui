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

## Alpha download

Mac Mixer is currently distributed as a signed and notarized direct-download alpha installer.

<a href="https://cdn.stokd.cloud/products/mac-mixer/releases/alpha/2.0.0-1/MacMixer-2.0.0-1.pkg" style="display:inline-block;padding:12px 24px;background:#1976d2;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;font-size:16px;margin:16px 12px 16px 0">Download Mac Mixer Alpha</a>

- Installer: [MacMixer-2.0.0-1.pkg](https://cdn.stokd.cloud/products/mac-mixer/releases/alpha/2.0.0-1/MacMixer-2.0.0-1.pkg)
- Release manifest: [MacMixer-2.0.0-1.json](https://cdn.stokd.cloud/products/mac-mixer/releases/alpha/2.0.0-1/MacMixer-2.0.0-1.json)

The direct alpha uses a license key purchased through consulting.stokd.cloud and validated by the direct license API. It installs a system-wide CoreAudio HAL plug-in and requires administrator approval.

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
