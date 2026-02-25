---
productId: always-listening
title: Roadmap
---

# Roadmap

<p class="description">Always Listening is under active development. This page outlines the current status, near-term priorities, and long-term vision for the voice pipeline tray app.</p>

## Current Status

The app is fully functional for macOS with Windows support in progress. The following capabilities are implemented and working:

- Tauri v2 system tray application with React/TypeScript frontend and Rust backend
- Real-time audio capture via cpal with WebRTC Voice Activity Detection
- On-device Whisper transcription with CoreML acceleration and automatic model download
- Configurable agent pipeline with command execution, JSON response extraction, and prompt prefixing
- Built-in Dictation mode with native keystroke injection (AppleScript on macOS)
- Five TTS engines: Home Assistant, ElevenLabs, Piper (local neural), macOS say, Windows SAPI
- Animated tray icon with four distinct states (idle, active, recording, agent speaking)
- Global hotkeys for mode cycling (F19), mute toggle (F18), and per-agent shortcuts
- Agent avatar toast overlay in the upper-right corner
- Trigger word switching between agents
- Echo detection to prevent the AI from responding to its own TTS output
- Crash recovery with exponential backoff (up to 5 retries)
- Preferences window with six tabs: General, Audio, Agents, Integrations, Docker Setup, Logs
- First-run setup wizard with dependency checking
- YAML-based configuration with legacy TOML migration
- Home Assistant integration with connection testing
- ElevenLabs integration with voice listing and connection testing
- Piper auto-installation and model browsing
- Real-time log streaming in the Preferences window

## Near-Term Priorities

### Audio Device Enumeration

Replace the current text-input device selector with a live dropdown that lists all available input devices detected by cpal/ffmpeg. Include a **Test Microphone** button that plays back a short recording so users can verify the correct device is selected.

### High-Quality Resampling

The current audio resampling from the device's native sample rate to Whisper's 16kHz uses naive linear interpolation. The rubato crate is already included as a dependency but not yet wired in. Switching to rubato's sinc-based resampling will improve transcription accuracy, especially for devices with higher native sample rates (48kHz, 96kHz).

### Whisper Model Management

Add a model management UI that shows which models are downloaded, their sizes, and provides one-click download/delete. Currently the model path must be set manually or the default model is auto-downloaded.

### Vocabulary Hint Improvements

Expand the vocabulary hint system to support user-defined custom vocabulary beyond agent names and trigger words. This would let users add domain-specific terms, names, and jargon that Whisper should recognize accurately.

### Windows Platform Parity

Complete Windows support for all features:

- Validate Windows SAPI TTS integration end-to-end
- Test and fix `SendKeys` keystroke injection for Dictation mode, with clipboard-paste fallback
- Implement launch-at-login via Windows Registry or Task Scheduler
- Package as MSIX for Microsoft Store distribution

## Mid-Term Goals

### Combined Mode

Implement a Combined mode that runs both Dictation and an AI agent concurrently. The current architecture enforces single-mode operation; Combined mode would require isolated task management and an intelligent routing layer to decide whether speech should be dictated or sent to the AI agent, potentially based on a wake-word prefix.

### Home Assistant Setup Wizard

Build a guided Docker-based setup wizard for Home Assistant:

1. Detect Docker installation and running state
2. Check for existing Home Assistant containers
3. Create and configure a new HA container if needed
4. Poll for HA readiness and walk through initial setup
5. Guide token creation and entity configuration
6. Securely store credentials in the macOS Keychain or Windows Credential Manager

### Secure Credential Storage

Migrate sensitive credentials (Home Assistant tokens, ElevenLabs API keys) from plaintext YAML files to the platform-native secure storage:

- **macOS** -- Keychain Services
- **Windows** -- Windows Credential Manager
- **Linux** -- Secret Service API (libsecret)

### Per-Agent Audio Routing

Allow different agents to use different audio input devices. For example, a desk microphone for Dictation and a headset microphone for AI conversation.

### Accessibility Permissions Automation

On macOS, the app requires Accessibility permissions for keystroke injection. Currently the setup wizard checks the status but the user must manually grant it in System Settings. Investigate using `tccutil` or a helper tool to streamline this process.

## Long-Term Vision

### App Store Distribution

Prepare the app for distribution through the macOS App Store and Microsoft Store:

- Code signing with Apple Developer certificates and Windows Authenticode
- macOS sandboxing with appropriate entitlements (microphone, accessibility, network)
- XPC helper service for subprocess management within the sandbox
- Privacy policy, store metadata, and screenshots
- Automated store submission via CI/CD

### Plugin System

Introduce a plugin architecture that allows third-party agent definitions to be installed and shared. Plugins would bundle a command, default TTS configuration, trigger words, and an icon into a distributable package.

### Streaming Transcription

Replace the current "capture segment then transcribe" flow with streaming transcription that provides partial results as the user speaks. This would reduce perceived latency and enable real-time display of in-progress transcription.

### Multi-Language Support

Extend beyond single-language transcription to support automatic language detection and multi-language vocabularies. Whisper already supports 99 languages; the app would need UI for language selection and potentially per-agent language configuration.

### Local LLM Integration

Add support for running local language models (via llama.cpp or similar) as agent backends, enabling fully offline AI conversation without any cloud API dependency.

### Linux Support

Tauri v2 supports Linux. Extend the app with Linux-specific implementations for:

- System tray (using libappindicator or StatusNotifierItem)
- Keystroke injection (xdotool or ydotool for Wayland)
- Audio device enumeration via PulseAudio/PipeWire
- Credential storage via libsecret
- Distribution as AppImage, Flatpak, or Snap

## Development Timeline

| Phase | Scope | Estimated Duration |
|-------|-------|--------------------|
| Phase 1 | Foundation and scaffolding (Tauri v2, tray, state management, CI/CD) | 1 week |
| Phase 2 | Core pipeline (subprocess manager, logging, config, Voice-to-Claude, Dictation) | 2 weeks |
| Phase 3 | Preferences GUI and live configuration | 1.5 weeks |
| Phase 4 | Home Assistant integration and Docker wizard | 1.5 weeks |
| Phase 5 | App Store preparation, first-run wizard, packaging | 2 weeks |

Phases 1 and 2 are complete. Phase 3 is substantially complete. Phases 4 and 5 are in progress.
