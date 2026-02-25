---
productId: mac-mixer
title: Recording System Audio
---

# Recording System Audio

<p class="description">Record system audio from any application using Mac Mixer as a virtual audio input device.</p>

## Quick Start

1. Ensure Mac Mixer is running.
2. Open **QuickTime Player**.
3. Select **File > New Audio Recording** (or **New Screen Recording** / **New Movie Recording**).
4. Click the dropdown menu next to the record button.
5. Select **Mac Mixer** as the input device.
6. Press record.

## Recording System Audio and Microphone Together

To capture both system audio and your microphone simultaneously:

1. Open **Audio MIDI Setup** (in `/Applications/Utilities/`).
2. Create a new **Aggregate Device**.
3. Add your input device (usually "Built-in Input") and the **Mac Mixer** device to the aggregate.
4. Select this aggregate device as your recording input.

## Privacy Note

Mac Mixer requires "microphone access" permission in macOS. This is because it captures system audio through its virtual input device, which macOS classifies as a microphone. Mac Mixer does not actually listen to your physical microphone unless you configure an aggregate device as described above.
