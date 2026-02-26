---
productId: always-listening
title: Always Listening - Voice Pipeline Tray App
---

# Overview

<p class="description">Always Listening is a cross-platform system tray app that turns your voice into actions -- talk to AI agents, dictate text, and control your smart home.</p>

## What is Always Listening?

Always Listening is a native desktop application built with Tauri v2 (Rust backend, React/TypeScript frontend) that wraps a complete voice automation pipeline into a system tray icon. It captures audio from your microphone, runs Voice Activity Detection to isolate speech, transcribes it locally with Whisper, and routes the transcription to configurable agents -- AI assistants, dictation targets, or Home Assistant smart home commands.

The app lives entirely in your system tray (no Dock icon on macOS, no taskbar window on Windows), so it stays out of your way while remaining instantly accessible via a click or a global hotkey.

## Key Features

- **Configurable Voice Agents** -- Define any number of agents, each with its own CLI command, TTS voice, trigger words, exit phrases, and custom icon. The built-in "Hal 9000" agent ships as a starting point.
- **Built-in Dictation Mode** -- A hardcoded Dictation agent transcribes your speech and types it directly at the cursor in any application, with optional auto-submit (Enter key).
- **Local Whisper Transcription** -- Speech-to-text runs entirely on-device using whisper-rs with CoreML acceleration on Apple Silicon. Models are downloaded automatically on first run.
- **Voice Activity Detection** -- WebRTC VAD detects when you start and stop speaking, so the app only transcribes actual speech -- no manual push-to-talk required.
- **Multiple TTS Engines** -- Each agent can speak responses via Home Assistant TTS, ElevenLabs, Piper (local neural TTS), or the native macOS `say` / Windows SAPI voices. Every method falls back gracefully to local speech if the primary engine fails.
- **Trigger Word Switching** -- Say another agent's trigger word mid-conversation to seamlessly switch modes without touching the keyboard.
- **Echo Detection** -- The app tracks recently spoken TTS output and filters it from the microphone input, preventing the AI from responding to its own voice.
- **Animated Tray Icon** -- The system tray icon changes state in real time: idle (gray), active (mode-specific icon), recording (animated EQ bars), agent speaking (colored), and muted.
- **Global Hotkeys** -- F19 cycles through enabled modes, F18 toggles mute, and each agent can have its own dedicated hotkey.
- **Agent Avatar Toast** -- A small floating window in the upper-right corner shows the active agent's icon and name, so you always know who is listening.
- **Crash Recovery** -- If a pipeline crashes, the app retries with exponential backoff (2s, 4s, 8s, 16s, 32s) up to five attempts, then stops gracefully and notifies you.
- **Home Assistant Integration** -- Connect to a local or remote Home Assistant instance for TTS output through smart speakers and smart home voice control.
- **Cross-Platform** -- Built for macOS and Windows with platform-specific adaptations for keystroke injection, TTS, and audio device handling.

## Architecture

| Layer | Technology | Role |
|-------|-----------|------|
| Frontend | React 18 + TypeScript + Vite | Preferences window, setup wizard, agent toast overlay |
| Backend | Rust + Tauri v2 | Audio capture, VAD, Whisper transcription, subprocess management, tray icon, global hotkeys |
| Audio | cpal + WebRTC VAD + whisper-rs | Real-time microphone capture, voice activity detection, on-device speech-to-text |
| TTS | Home Assistant API, ElevenLabs API, Piper, macOS say, Windows SAPI | Text-to-speech output with automatic fallback chain |
| Config | YAML (config.yaml + agents.yaml) | Persistent settings stored in platform-native Application Support directories |

## System Requirements

| Requirement | Minimum |
|-------------|---------|
| Operating System | macOS 10.13+ or Windows 10+ |
| Architecture | Apple Silicon (recommended) or Intel, Windows x64 |
| Microphone | Any system-recognized audio input device |
| Dependencies | Whisper model (auto-downloaded), Piper (auto-installed) |

## Getting Started

1. **Install** -- Build from source with `npm run build` or download a pre-built release. The app bundle is output to `src-tauri/target/release/bundle/`.
2. **First Launch** -- The setup wizard walks you through four steps: Welcome, Dependency Check (ffmpeg, Whisper, Claude CLI, Accessibility, Microphone), Quick Configuration (audio device, Whisper model, Home Assistant toggle), and a Completion summary.
3. **Select a Mode** -- Click the tray icon to see all available modes. Checkmarks indicate enabled modes; the play arrow indicates the currently active mode.
4. **Talk** -- Speak naturally. The app detects your voice, transcribes it, sends it to the active agent, and speaks the response.
5. **Customize** -- Open Preferences from the tray menu to configure agents, audio settings, integrations, and hotkeys.

Continue to the [Voice Modes](/always-listening/docs/voice-modes) page to learn how each mode works, or jump to [Preferences](/always-listening/docs/preferences) for detailed configuration options.
