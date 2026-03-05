---
productId: always-listening
title: Preferences
---

# Preferences

<p class="description">The Preferences window provides full control over Always Listening's behavior, audio settings, agent configurations, and third-party integrations</p>

## Opening Preferences

Open the Preferences window from the system tray menu by clicking **Preferences...**, or by selecting the menu item when the tray icon is clicked. The window is a standalone 500x550 pixel panel that can be resized. Closing it (via the red X button or Cancel) hides the window and discards unsaved changes. Click **Save** to persist all changes and dismiss the window.

Configuration is stored in two YAML files:

- **config.yaml** -- General settings, audio, Whisper, hotkeys, integrations, and disabled modes. Located at `~/.stoked-projects/config.yaml`.
- **agents.yaml** -- Agent definitions (everything in the Agents tab). Located at `~/.stoked-consulting/agents.yaml`.

Legacy TOML configuration (`~/Library/Application Support/AlwaysListening/config.toml`) is automatically migrated on first launch.

## General Tab

The General tab controls startup behavior and global hotkeys.

### Startup

| Setting | Description | Default |
|---------|-------------|---------|
| **Launch at login** | Automatically start the app when you log in to your computer | Off |

### Global Hotkeys

Global hotkeys are registered system-wide and work regardless of which application has focus.

| Setting | Description | Default |
|---------|-------------|---------|
| **Mode Cycle** | Cycles through all enabled modes in order | F19 |
| **Global Mute** | Toggles mute on/off, pausing all audio processing | F18 |

To change a hotkey, click the capture field and press your desired key combination (e.g., Control+Shift+M). The field records modifier keys (Cmd/Control/Alt/Shift) plus a primary key. If a hotkey conflicts or is invalid, an error banner appears at the bottom of the Preferences window after saving.

## Audio Tab

The Audio tab configures the microphone input, Whisper transcription engine, and working directories.

### Input Device

| Setting | Description | Default |
|---------|-------------|---------|
| **Audio Device** | The audio input device name, or "default" for the system default | `default` |

The app uses the `cpal` library to enumerate and access audio devices. Audio is captured in real time, downmixed to mono, resampled to 16kHz (Whisper's native sample rate), and fed through WebRTC Voice Activity Detection before transcription.

### Whisper Transcription

| Setting | Description | Default |
|---------|-------------|---------|
| **Model** | Whisper model size: tiny, base, small, medium, or large | `base` |
| **Model Path (GGML)** | Filesystem path to the GGML-format Whisper model binary | `~/.cache/whisper/ggml-base.bin` |
| **Language** | Language code for transcription (e.g., "en" for English) | `en` |

If the model file does not exist at the specified path, the app downloads it automatically from Hugging Face on first use. Larger models produce more accurate transcriptions but require more memory and processing time:

| Model | Parameters | English-only Speed | Disk Size |
|-------|-----------|-------------------|-----------|
| tiny | 39M | Fastest | ~75 MB |
| base | 74M | Fast | ~142 MB |
| small | 244M | Moderate | ~466 MB |
| medium | 769M | Slow | ~1.5 GB |
| large | 1550M | Slowest | ~2.9 GB |

On Apple Silicon Macs, the app uses CoreML acceleration (enabled via the `coreml` feature in whisper-rs) for significantly faster inference.

The transcription engine also applies **vocabulary hints** -- agent names, trigger words, and exit phrases are passed to Whisper as an initial prompt to bias recognition toward expected words. This dramatically improves accuracy for proper nouns like "Hal" that might otherwise be misheard.

### Directories

| Setting | Description | Default |
|---------|-------------|---------|
| **Temp Directory** | Working directory for temporary audio files | `/tmp/voice-pipeline` |

## Agents Tab

The Agents tab is where you create, edit, reorder, and remove voice agents. Dictation mode is built-in and does not appear here -- it is always present as the first mode.

Each agent card shows its icon, name, and ID. Click a card to expand it and reveal the full configuration form. See the [Voice Modes](/always-listening/docs/voice-modes) page for detailed descriptions of each agent field.

### Agent Fields

- **ID** -- Unique identifier used in config files and internal state.
- **Name** -- Display name in the tray menu and avatar toast.
- **Icon** -- Emoji or image file (PNG, SVG, JPG, WebP). Image files are stored in the app's icon directory and displayed as native tray menu icons.
- **Command template** -- Shell command with `{text}` placeholder.
- **Response JSON path** -- Dot-path for extracting text from JSON output.
- **Prompt prefix** -- Text prepended to transcriptions before command execution.

### TTS Configuration

Each agent has independent TTS settings:

| Method | Description |
|--------|-------------|
| **None** | No speech output |
| **Home Assistant** | Speaks via a Home Assistant TTS service entity through a media player entity. Requires HA integration to be configured in the Integrations tab. |
| **Local (say)** | Uses the macOS `say` command or Windows SAPI. Choose from installed system voices via a dropdown. |
| **ElevenLabs** | Cloud-based neural TTS. Requires an API key in the Integrations tab. Select a voice and model (Monolingual v1, Multilingual v2, or Turbo v2.5) from dropdowns that populate from the ElevenLabs API. |
| **Piper (Local)** | Offline neural TTS using the Piper engine. Point to a `.onnx` model file (downloadable from Hugging Face). Piper is auto-installed on first launch (~15 MB download). Optionally specify a speaker ID for multi-speaker models. Includes a Test Voice button. |

Every TTS method except "None" and "Local (say)" also shows a **Fallback voice** dropdown that selects which macOS system voice to use if the primary TTS engine fails.

### Behavior

- **Type at cursor** -- Types the transcribed text at the current cursor position via platform-native keystroke injection.
- **Auto-submit** -- Presses Enter after typing.
- **Exit phrases** -- Comma-separated list of phrases that deactivate the agent when spoken.
- **Trigger words** -- Comma-separated list of words that activate this agent from another mode.
- **Hotkey** -- Optional global keyboard shortcut to jump directly to this agent.

### Agent Management

- **+ Add Agent** -- Creates a new blank agent at the bottom of the list.
- **Up / Down** -- Reorder agents. The order determines the F19 cycling sequence.
- **Remove** -- Deletes the agent permanently.

## Integrations Tab

The Integrations tab manages connections to third-party services. Credentials are stored locally in the YAML config file.

### Home Assistant

| Setting | Description |
|---------|-------------|
| **Enable** | Master toggle for the Home Assistant integration |
| **Home Assistant URL** | Base URL of your HA instance (e.g., `http://homeassistant.local:8123`) |
| **Long-Lived Access Token** | Authentication token generated from HA: Profile > Long-Lived Access Tokens > Create Token |
| **Test Connection** | Validates the URL and token by making an API request to your HA instance |

Once configured, individual agents can select Home Assistant as their TTS method and specify which TTS service entity and media player entity to use.

### ElevenLabs

| Setting | Description |
|---------|-------------|
| **API Key** | Your ElevenLabs API key (from elevenlabs.io > Profile > API Keys) |
| **Test Connection** | Validates the key and reports how many voices are available |

Once configured, individual agents can select ElevenLabs as their TTS method and choose from your available voices and models.

## Docker Setup Tab

The Docker Setup tab provides guided assistance for setting up Home Assistant via Docker, including container state detection, creation, and health monitoring. This is useful for users who want to run a local Home Assistant instance alongside the app.

## Logs Tab

The Logs tab provides real-time visibility into the app's operation. Log entries stream in from the Rust backend and display directly in the Preferences window. Logs include:

- Pipeline state transitions (Idle, Active, Recording, AgentSpeaking)
- Transcription results and filtered hallucinations
- Agent command execution and responses
- TTS synthesis and playback events
- Hotkey registration and mode switching
- Error messages and crash recovery attempts

You can also access the full log files via the **Show Logs** item in the tray menu, which opens the log directory in Finder/Explorer. Log files rotate daily and are stored in the OS-native log location.

## Setup Wizard

On first launch, a four-step setup wizard guides you through initial configuration:

1. **Welcome** -- Overview of Always Listening's capabilities (Voice-to-Claude, Dictation, Home Assistant).
2. **Dependencies** -- Automated checks for ffmpeg, Whisper, Claude CLI, Accessibility permissions, and Microphone access. Each dependency shows a pass/fail indicator with version info. You can proceed even if some checks fail.
3. **Configuration** -- Quick setup for audio device, Whisper model selection, and Home Assistant toggle.
4. **Complete** -- Summary with quick tips for getting started.

The wizard only appears once. All settings can be changed later in the full Preferences window.
