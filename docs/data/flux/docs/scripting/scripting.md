---
productId: flux
title: Scripting & Automation
---

# Scripting & Automation

<p class="description">Control Flux programmatically through URL schemes, Shortcuts, Siri, and the JavaScript API.</p>

## URL Schemes

Flux registers the `flux:` URL scheme so you can trigger actions from Terminal, scripts, Alfred, Raycast, or any app that can open URLs.

| Command | Description |
|---------|-------------|
| `flux:reload` | Reload the current wallpaper website |
| `flux:next` | Switch to the next website in the list |
| `flux:previous` | Switch to the previous website in the list |
| `flux:random` | Switch to a random website |
| `flux:add?url=<URL>` | Add a new website to the list |
| `flux:toggle-browsing-mode` | Toggle interactive browsing mode on/off |

### Usage from Terminal

```bash
open "flux:reload"
open "flux:next"
open "flux:add?url=https://example.com"
```

### Usage from a Script

Any language that can invoke `open` or launch a URL works:

```bash
# Python
python3 -c 'import subprocess; subprocess.run(["open", "flux:next"])'

# AppleScript
open location "flux:reload"
```

## Shortcuts App & Siri

Flux provides actions for the macOS Shortcuts app, enabling voice-activated control through Siri and timer-based automations.

### Available Shortcut Actions

- **Reload Wallpaper** -- Refreshes the current website.
- **Next Wallpaper** -- Advances to the next website.
- **Previous Wallpaper** -- Goes back to the previous website.
- **Random Wallpaper** -- Picks a random website.
- **Add Website** -- Adds a URL to the website list.
- **Toggle Browsing Mode** -- Switches interactive browsing on or off.

### Example Automations

**Rotate wallpaper every hour:**

1. Open **Shortcuts** and create a new automation.
2. Set the trigger to **Time of Day**, repeating every hour.
3. Add the **Next Wallpaper** Flux action.

**Switch wallpaper by voice:**

Say *"Hey Siri, next wallpaper"* and Flux advances to the next website in the list.

**Morning dashboard:**

1. Create a Shortcut triggered at 8:00 AM on weekdays.
2. Add the **Add Website** action with your dashboard URL, or select it from the existing list.
3. Optionally chain a **Reload Wallpaper** action to ensure fresh data.

## JavaScript API

Websites rendered by Flux have access to additional JavaScript APIs injected by the app. These allow the page to respond to desktop context.

### Mouse Position

Flux exposes the current mouse position so websites can create cursor-reactive effects:

```js
// The Flux object is injected into the page global scope
if (window.Flux) {
  // Get the current mouse position
  const { x, y } = window.Flux.mousePosition;

  // Or listen for updates
  window.Flux.onMouseMove((x, y) => {
    // Update a particle system, spotlight, parallax layer, etc.
    updateEffect(x, y);
  });
}
```

### Screen Information

```js
if (window.Flux) {
  const screen = window.Flux.screen;
  console.log(screen.width, screen.height);
  console.log(screen.scaleFactor); // Retina multiplier
}
```

### Building Interactive Wallpapers

Combine the JavaScript API with custom HTML/CSS to build fully interactive wallpapers:

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      margin: 0;
      overflow: hidden;
      background: #000;
    }
    .spotlight {
      position: fixed;
      width: 300px;
      height: 300px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(255,255,255,0.15), transparent 70%);
      transform: translate(-50%, -50%);
      pointer-events: none;
    }
  </style>
</head>
<body>
  <div class="spotlight" id="spot"></div>
  <script>
    const spot = document.getElementById('spot');
    if (window.Flux) {
      window.Flux.onMouseMove((x, y) => {
        spot.style.left = x + 'px';
        spot.style.top = y + 'px';
      });
    }
  </script>
</body>
</html>
```

Save this as a local HTML file and add it to Flux to see a spotlight that follows your cursor across the desktop.

## Built-in Fluid Simulation

Flux ships with an interactive fluid simulation wallpaper that demonstrates the mouse-tracking API. The simulation responds to cursor movement in real time, creating dynamic fluid effects on your desktop. No configuration is needed -- select it from the wallpaper list to get started.
