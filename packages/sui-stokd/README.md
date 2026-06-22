# @stoked-ui/stokd

Host-agnostic, CSS-variable-themed React components and view-model types for the
Stokd **Current Activity** UX. Consumed by the Stokd web dashboard and the Stokd
VS Code extension webview (and any future host).

## Install

```bash
pnpm add @stoked-ui/stokd
```

`react` and `react-dom` are peer dependencies.

## Usage

Import the default theme once per host, then render components from a plain
view-model:

```tsx
import '@stoked-ui/stokd/theme.css';
import { ActiveTaskCard } from '@stoked-ui/stokd';

<ActiveTaskCard title="Add a button" workType="task" sessions={sessions} dbTask={task} />;
```

## Theming

Every component references `var(--sui-*)` design tokens with sensible dark
defaults (see `src/theme/tokens.css`). Override the variables to theme for your
host:

- **Web**: map `--sui-*` to your `github-*`/`accent-*` Tailwind tokens.
- **VS Code webview**: map `--sui-*` to `--vscode-*` theme tokens.

## Design rules (axioms)

- **View-model source of truth** — the UX types live here; hosts adapt their
  domain data into them. The library never imports a host/app package.
- **CSS-variable themed** — no Tailwind, no required theme provider, no
  hard-coded colors in component source.
- **Purely presentational** — data in via props, actions out via callbacks; no
  fetching, routing, or network/auth side effects.

See `.axioms.md` for the enforced invariants.
