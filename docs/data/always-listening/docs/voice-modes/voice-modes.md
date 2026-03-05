---
productId: always-listening
title: Voice Modes
---

# Voice Modes

<p class="description">Always Listening supports multiple voice modes that run as independent pipelines -- Dictation for typing speech into any app, configurable </p>

## How Modes Work

Each mode is an **agent configuration** that defines how transcribed speech is processed. When a mode is active, the app continuously captures audio, detects voice segments using WebRTC VAD, transcribes them with Whisper, and routes the text through the agent's pipeline. The app enforces single-mode operation -- only one agent runs at a time.

The tray menu lists all modes with their status:

- **Checkmark** -- The mode is enabled and included in the hotkey cycle.
- **Play arrow prefix** -- The mode is currently active and processing speech.
- **No checkmark** -- The mode is disabled and skipped during cycling.

Clicking a mode in the tray menu toggles its enabled/disabled state. Use F19 (or your configured hotkey) to cycle through enabled modes. On startup, the first enabled mode activates automatically.

## Dictation Mode

Dictation is a built-in mode that ships with the app and cannot be removed or reordered. It is always the first entry in the mode list.

**How it works:**

1. Speak naturally into your microphone.
2. The app transcribes your speech locally using Whisper.
3. The transcribed text is typed at the current cursor position in whatever application has focus, using platform-native keystroke injection (AppleScript `keystroke` on macOS, `SendKeys` on Windows).
4. After typing the text, the app automatically presses Enter to submit.

**Configuration:**

| Setting | Value |
|---------|-------|
| ID | `dictation` |
| Type at cursor | Yes |
| Auto-submit | Yes |
| TTS | None (silent mode) |
| Trigger words | "dictate", "dictation" |
| Command | None (no external processing) |

Dictation mode is ideal for composing messages, writing documents, filling forms, or any situation where you want your speech transcribed directly into an input field.

## AI Agent Modes

Beyond Dictation, you can define any number of custom AI agents. Each agent has a full pipeline: transcription, command execution, response extraction, and text-to-speech output.

### Default Agent: Hal 9000

The app ships with a pre-configured agent called **Hal 9000** that demonstrates the full agent pipeline:

| Setting | Value |
|---------|-------|
| ID | `hal-9000` |
| Icon | Robot emoji |
| Command | `openclaw agent --agent main --session-id voice-pipeline --message "{text}" --json` |
| Response JSON path | `result.payloads.0.text` |
| TTS method | Home Assistant (with local fallback) |
| Trigger words | "hal", "hey hal" |
| Exit phrases | "goodbye hal", "later hal" |
| Prompt prefix | Instructs the AI to respond in plain conversational speech without markdown |

### Agent Pipeline

When an AI agent is active, each transcription flows through these steps:

1. **Echo Detection** -- The app compares the transcription against recently spoken TTS output. If more than 50% of the words overlap with text spoken in the last 15 seconds, the transcription is discarded as a microphone echo.

2. **Trigger Word Check** -- If the transcription starts with a trigger word belonging to a different agent, the app emits a `trigger-word-switch` event and transitions to that agent.

3. **Exit Phrase Check** -- If the transcription contains one of the agent's exit phrases (e.g., "goodbye hal"), the agent speaks "Goodbye!" and shuts down.

4. **Command Execution** -- The agent's command template is executed as a shell command, with `{text}` replaced by the (optionally prefixed) transcription. The command runs in a login shell so that PATH includes tools installed via Homebrew, NVM, or pnpm.

5. **Response Extraction** -- If `response_json_path` is configured, the agent parses the command's stdout as JSON and extracts the value at the specified dot-path (e.g., `result.payloads.0.text`).

6. **Text-to-Speech** -- If TTS is configured, the extracted response is spoken through the agent's TTS engine. The tray icon transitions to the "agent speaking" state during playback.

7. **Type at Cursor** -- If `type_at_cursor` is enabled, the transcription (not the response) is typed at the cursor. If `auto_submit` is also enabled, Enter is pressed after typing.

### Creating a Custom Agent

Open Preferences and navigate to the **Agents** tab. Click **+ Add Agent** and configure the following:

| Field | Description |
|-------|-------------|
| **ID** | Unique identifier (used internally and in config files) |
| **Name** | Display name shown in the tray menu and agent toast |
| **Icon** | Emoji character or an image file (PNG, SVG, JPG, WebP) that appears in the tray menu and toast |
| **Command template** | Shell command to execute. Use `{text}` as a placeholder for the transcribed speech |
| **Response JSON path** | Dot-separated path to extract text from JSON command output (e.g., `result.text`) |
| **Prompt prefix** | Text prepended to the transcription before sending to the command |
| **TTS method** | How responses are spoken: None, Home Assistant, Local (say), ElevenLabs, or Piper |
| **Type at cursor** | Whether to type the transcription at the current cursor position |
| **Auto-submit** | Whether to press Enter after typing |
| **Exit phrases** | Comma-separated phrases that deactivate the agent when spoken |
| **Trigger words** | Comma-separated words that activate this agent when spoken in another mode |
| **Hotkey** | Optional global keyboard shortcut to switch directly to this agent |

Agents are cycled in the order they appear in the list. Use the Up/Down buttons to reorder them.

## Mode Switching

There are four ways to switch between modes:

1. **F19 Hotkey (Cycle)** -- Pressing F19 (configurable) advances to the next enabled mode in the list, wrapping around to the first after the last. The cycle skips disabled modes.

2. **Agent-Specific Hotkey** -- Each agent can have a dedicated global shortcut (e.g., Cmd+Shift+1) that switches directly to it.

3. **Trigger Words** -- While one agent is active, speaking another agent's trigger word switches to that agent. For example, saying "dictate" while Hal 9000 is active switches to Dictation mode.

4. **Tray Menu** -- Click the tray icon and select a mode to toggle its enabled state. If you disable the currently active mode, the app automatically cycles to the next enabled mode.

When switching modes, the app stops the current pipeline, shows a floating avatar toast for the new agent, speaks a random short greeting ("Yo?", "Sup?", "Ready.", etc.), and starts the new pipeline.

## Mute

Press F18 (configurable) or click **Mute** in the tray menu to pause all audio processing. While muted:

- The pipeline stops, but the active agent is remembered.
- The tray icon shows a muted state.
- The agent avatar toast is hidden.
- Hotkey cycling is ignored.

Unmuting resumes the previously active pipeline and restores the avatar toast.

## App State Machine

The app tracks four states internally, visible through the tray icon:

| State | Tray Icon | Description |
|-------|-----------|-------------|
| **Idle** | Gray line | No agent active |
| **Active(agent)** | Mode-specific icon | Agent is listening, waiting for speech |
| **Recording(agent)** | Animated EQ bars | Voice detected, capturing speech |
| **AgentSpeaking(agent)** | Colored icon | TTS is playing the agent's response |

State transitions happen in under 100ms to ensure the tray icon always reflects what the app is doing in real time.
