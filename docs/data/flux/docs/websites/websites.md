---
productId: flux
title: Managing Websites
---

# Managing Websites

<p class="description">Add, organize, and customize the websites that Flux renders as your desktop wallpaper.</p>

## Adding Websites

Open Flux from the menu bar and click **Add Website**. You can supply:

- A **remote URL** (e.g. `https://example.com`)
- A **local file path** to an HTML file on disk

Each website is saved to your list and can be activated at any time.

### Quick-Add via URL Scheme

You can also add a website programmatically:

```
flux:add?url=https://example.com
```

This is useful for scripts, Shortcuts actions, or links shared between users.

## Switching Between Websites

When multiple websites are configured you can cycle through them:

- **From the menu bar** -- Select any website in the list to activate it immediately.
- **Next / Previous** -- Use the menu bar controls or the URL schemes `flux:next` and `flux:previous`.
- **Random** -- Jump to a random website with `flux:random`.

## Multi-Monitor Support

Flux supports multiple displays. Each monitor can render a different website independently:

1. Open the Flux settings panel.
2. Select the target display from the monitor dropdown.
3. Assign a website to that display.

Changes take effect immediately -- no restart required.

## Interactive Browsing Mode

By default Flux renders the website as a non-interactive wallpaper layer. Toggle **Browsing Mode** to interact with the page directly:

- **Right-click** to navigate (back, forward, reload).
- **Pinch-to-zoom** for fine control.
- **Scroll and click** as you would in any browser.

Toggle browsing mode from the menu bar or with the URL scheme `flux:toggle-browsing-mode`.

## Mouse Position Tracking

Even outside browsing mode, Flux forwards the cursor position to the loaded website. Developers can read this in JavaScript to create effects that follow the mouse -- particles, lighting, parallax, and more.

See the [Scripting & Automation](/flux/docs/scripting) page for the JavaScript API details.

## Customization

### Custom CSS Injection

Add CSS rules that are injected into the website on every load. This is ideal for:

- Hiding unwanted elements (headers, footers, cookie banners)
- Overriding fonts or colors
- Adjusting layout for wallpaper use

Open the per-website settings and paste your CSS into the **Custom CSS** field.

```css
/* Example: hide a site header and force dark background */
header, .cookie-banner { display: none !important; }
body { background: #0a0a0a !important; }
```

### Custom JavaScript Injection

Inject JavaScript that runs after the page loads. Common uses:

- Auto-dismiss modals
- Start animations automatically
- Connect to the Flux mouse-position API

Paste your script into the **Custom JS** field in per-website settings.

```js
// Example: auto-click a "Start" button after 2 seconds
setTimeout(() => {
  document.querySelector('.start-btn')?.click();
}, 2000);
```

### Color Inversion

Enable **Invert Colors** per website to flip all colors -- an instant fake dark mode for pages that only ship a light theme. This applies a CSS `filter: invert(1)` to the page root.

### Opacity Control

Slide the **Opacity** control to blend the wallpaper with your desktop color. At 100 % the website is fully opaque; lower values let the desktop background show through, keeping icons and text readable.

### Auto-Reload

Set a reload interval (in minutes) so the page refreshes automatically. Useful for:

- Dashboards that do not auto-update
- News sites
- Photo-of-the-day pages

You can also trigger an immediate reload with `flux:reload`.
