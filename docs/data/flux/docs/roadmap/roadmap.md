---
productId: flux
title: Roadmap
---

# Flux Roadmap

<p class="description">Planned features and future direction for the Flux desktop wallpaper app.</p>

## Current Version

Flux is available on the Mac App Store and includes the following features:

- Display any remote or local website as desktop wallpaper
- Multi-website management with list controls
- Multi-monitor support with per-display assignment
- Interactive browsing mode (right-click navigation, pinch-to-zoom)
- Mouse position tracking and JavaScript API
- Custom CSS and JavaScript injection per website
- Color inversion (fake dark mode)
- Opacity control
- Auto-reload at configurable intervals
- URL scheme commands (`flux:reload`, `flux:next`, `flux:previous`, `flux:random`, `flux:add`, `flux:toggle-browsing-mode`)
- Shortcuts app and Siri integration
- Built-in fluid simulation wallpaper

## Short Term

### Enhanced Website Management

- **Folders & Tags** -- Organize websites into groups for easier switching.
- **Import / Export** -- Share website lists between machines or with other users.
- **Thumbnail Previews** -- Live or cached thumbnails in the website list.

### Display & Rendering

- **Per-Monitor Scheduling** -- Independent auto-rotate timers per display.
- **Transition Effects** -- Fade, slide, or dissolve when switching websites.
- **Performance Profiles** -- Reduce frame rate or pause rendering when on battery.

### Quality of Life

- **Keyboard Shortcuts** -- Global hotkeys for next, previous, reload, and toggle browsing.
- **Launch at Login** -- Option to start Flux automatically on boot.
- **Notification Center Integration** -- Surface current wallpaper info in widgets.

## Medium Term

### Developer Experience

- **Expanded JavaScript API** -- Expose battery level, active app, dark-mode state, and time-of-day to wallpaper scripts.
- **Wallpaper SDK** -- A starter project template with hot reload for building custom wallpapers.
- **Community Gallery** -- A curated collection of community-submitted wallpapers.

### Advanced Customization

- **Scheduled Themes** -- Automatically switch websites based on time of day, day of week, or Focus mode.
- **Audio Reactivity** -- Pipe system audio levels into the JavaScript API for music-driven effects.
- **Dynamic Parameters** -- Expose sliders and toggles in the Flux UI that map to CSS custom properties or JS variables.

## Long Term

### Platform

- **iPadOS / visionOS** -- Investigate dynamic wallpaper support on other Apple platforms.
- **Wallpaper Marketplace** -- Allow creators to distribute premium wallpapers through Flux.

### AI & Automation

- **Generative Wallpapers** -- Use on-device ML to generate or modify wallpaper content.
- **Context-Aware Switching** -- Automatically change wallpaper based on calendar events, weather, location, or active workflow.

## Feedback

Your feedback shapes the roadmap. If there is a feature you want to see:

- **App Store Reviews** -- Leave a review or feature request on the Mac App Store listing.
- **GitHub Discussions** -- [Start a discussion](https://github.com/stoked-ui/sui/discussions) in the Stoked UI repository.
- **Email** -- Reach out at support@stoked.ui.

---

*This roadmap is subject to change based on user feedback and platform capabilities.*
