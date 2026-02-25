---
productId: mac-mixer
title: Download Mac Mixer
---

# Download

<p class="description">Download and install Mac Mixer on your Mac.</p>

## Requirements

- macOS 10.13 or later
- Apple Silicon or Intel Mac

## Option 1: Homebrew

Install using [Homebrew](https://brew.sh/) by running the following command in Terminal:

```bash
brew install --cask background-music
```

## Option 2: Direct Download

Download version 0.4.3:

[BackgroundMusic-0.4.3.pkg](https://github.com/kyleneideck/BackgroundMusic/releases/download/v0.4.3/BackgroundMusic-0.4.3.pkg) (771 KB)

## Option 3: Build from Source

Requires [Xcode](https://developer.apple.com/xcode/download/) version 10 or higher.

1. Open Terminal.
2. Run:

```bash
(set -eo pipefail; URL='https://github.com/kyleneideck/BackgroundMusic/archive/master.tar.gz'; \
    cd $(mktemp -d); echo Downloading $URL to $(pwd); curl -qfL# $URL | gzcat - | tar x && \
    /bin/bash BackgroundMusic-master/build_and_install.sh -w && rm -rf BackgroundMusic-master)
```

The script restarts the system audio process (coreaudiod) at the end, so pause any audio playback before building.

## Uninstall

1. Open Terminal.
2. Run: `cd /Applications/Background\ Music.app/Contents/Resources/`
3. Run: `bash uninstall.sh`
