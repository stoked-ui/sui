---
productId: mac-mixer
title: Auto-Pause - Automatic Music Pausing
---

# Auto-Pause

<p class="description">Automatically pause your music player when other audio sources start playing, and resume when they stop.</p>

## How It Works

When Mac Mixer detects audio from a non-music application (such as a video call, YouTube video, or notification sound), it automatically pauses your music player. When that audio source stops, Mac Mixer resumes playback.

## Supported Music Players

- [iTunes / Apple Music](https://www.apple.com/itunes/)
- [Spotify](https://www.spotify.com)
- [VLC](https://www.videolan.org/vlc/)
- [VOX](https://vox.rocks/mac-music-player)
- [Decibel](https://sbooth.org/Decibel/)
- [Hermes](http://hermesapp.org/)
- [Swinsian](https://swinsian.com/)
- [GPMDP](https://www.googleplaymusicdesktopplayer.com/)

## Configuration

The auto-pause delay can be adjusted to avoid false triggers from short notification sounds. Increase the delay if brief system sounds are causing unwanted pauses.

## Adding New Players

Adding support for a new music player is usually straightforward if the player supports AppleScript with `isPlaying`, `isPaused`, `play`, and `pause` events. Players without AppleScript support require additional development effort.
