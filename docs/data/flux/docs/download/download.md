---
productId: flux
title: Download Flux Beta
---

# Download Flux Beta

<p class="description">Download the Flux beta for macOS. Supports both Apple Silicon and Intel Macs.</p>

## Flux Beta for macOS

> **Beta Release** -- This is a pre-release build. Flux is not yet signed with an Apple Developer certificate, so macOS Gatekeeper will block it by default. See the installation instructions below.

| | |
|---|---|
| **Version** | Beta |
| **File** | Flux-beta.zip |
| **Size** | 12 MB |
| **Architecture** | Universal (Apple Silicon & Intel) |
| **Requires** | macOS 15 Sequoia or later |

<a href="/static/flux/Flux-beta.zip" download style="display:inline-block;padding:12px 24px;background:#1976d2;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;font-size:16px;margin:16px 0">Download Flux Beta (12 MB)</a>

## Installation

### 1. Download and extract

Download the zip file above and double-click it to extract **Flux.app**.

### 2. Bypass macOS Gatekeeper

Because this beta is not yet signed with an Apple Developer certificate, macOS will prevent it from opening. Use one of the methods below to allow it.

#### Method A: Remove the quarantine attribute (recommended)

Open **Terminal** and run:

```bash
xattr -cr ~/Downloads/Flux.app
```

If you extracted the app to a different location, adjust the path accordingly. After running this command, double-click Flux.app to open it normally.

#### Method B: Right-click to open

1. Right-click (or Control-click) on **Flux.app** in Finder.
2. Select **Open** from the context menu.
3. In the dialog that appears, click **Open** again.

macOS remembers this choice, so you only need to do it once.

#### Method C: Allow in System Settings

1. Double-click **Flux.app** -- macOS will block it.
2. Open **System Settings** > **Privacy & Security**.
3. Scroll down to the **Security** section. You will see a message that "Flux.app was blocked from use because it is not from an identified developer."
4. Click **Open Anyway**, then confirm.

### 3. First launch

On first launch, Flux appears as a menu bar icon. Click it to add your first website wallpaper or try the built-in fluid simulation.

## Troubleshooting

**"Flux.app is damaged and can't be opened"** -- This usually means the quarantine attribute is still set. Run the `xattr -cr` command from Method A above.

**App won't open after right-click method** -- Try Method A (`xattr -cr`) instead. Some macOS versions are stricter about unsigned apps.

**Intel Mac performance** -- Flux runs natively on Intel, but WebGL-heavy wallpapers may use more CPU. Adjust the refresh interval or choose lighter wallpapers if needed.
