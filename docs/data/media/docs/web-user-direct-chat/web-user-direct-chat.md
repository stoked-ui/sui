---
productId: media
title: WebUserDirectChat
components: WebUserDirectChat
githubLabel: 'WebUserDirectChat'
packageName: '@stoked-ui/media'
---

# WebUserDirectChat

<p class="description">A conversational support widget that collects a message, name, and reply email, then forwards the request to a direct messaging provider.</p>

{{"component": "modules/components/ComponentLinkHeader"}}

:::warning
The live demo on this page currently posts to the real `/api/chat/send` route. Reply to the forwarded Telegram message to continue the conversation in the widget.
:::

## Introduction

`WebUserDirectChat` presents support intake as a short conversation instead of a flat form. It asks for the issue first, progressively collects the caller's name and reply email, then opens a live Telegram-backed chat session once the first message is delivered.

The component is a good fit for product pages, consulting landing pages, and authenticated app surfaces where you want a compact support entry point without building a custom flow from scratch.

## Import

```tsx
import { WebUserDirectChat } from '@stoked-ui/media';
```

## Live Telegram demo

This demo is intentionally wired to the live docs API route so you can verify the real Telegram delivery path before placing the widget on the main site. After the first message lands in Telegram, reply directly to that Telegram message to sync your response back into the embedded chat.

{{"demo": "WebUserDirectChatLive.js", "bg": true}}

## Basic usage

Use `provider="telegram"` or `provider="whats-app"` to choose the downstream transport. In the docs app we recommend passing an explicit API path with `getApiUrl()` so the widget avoids POST redirects.

```tsx
import { WebUserDirectChat } from '@stoked-ui/media';
import { getApiUrl } from 'docs/src/modules/utils/getApiUrl';

export default function SupportPanel() {
  return (
    <WebUserDirectChat
      provider="telegram"
      apiEndpoint={getApiUrl('/api/chat/send')}
      title="Need help with your build?"
      subtitle="Tell us what broke and we will keep the Telegram thread in sync."
    />
  );
}
```

## Conversation behavior

- The first message captures the user's request.
- If `initialName` is missing, the widget asks who it should reply to.
- If `initialEmail` is missing or invalid, the widget asks for a reply address.
- For Telegram, a successful first submission opens a live chat mode that keeps polling for replies.
- Telegram replies must reply directly to the forwarded bot message so the session can be matched back to the widget.
- Failed submissions surface the API error inline and expose a retry action during the initial handshake.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `provider` | `'telegram' \| 'whats-app'` | - | Messaging provider used when the form payload is forwarded |
| `apiEndpoint` | `string` | `'/api/chat/send'` | POST target that receives the collected conversation payload |
| `title` | `string` | `'Chat with support'` | Main heading rendered in the widget header |
| `subtitle` | `string` | - | Supporting copy shown below the title |
| `headerText` | `string` | - | Deprecated alias for `subtitle` |
| `initialName` | `string` | - | Prefills the user's name and skips that step when present |
| `initialEmail` | `string` | - | Prefills the reply email and skips that step when valid |
| `prompts` | `Partial<DirectChatPrompts>` | - | Overrides the assistant copy for each conversation step |
| `placeholders` | `Partial<DirectChatPlaceholders>` | - | Overrides the text field placeholders for message, name, and email |
| `onSuccess` | `() => void` | - | Called after a successful submission |
| `onError` | `(error: string) => void` | - | Called when the API request fails |
| `pollIntervalMs` | `number` | `3000` | Poll interval for Telegram-backed live chat sync after the first message |
| `sx` | `SxProps<Theme>` | - | Applies custom Material UI styling to the outer paper |
