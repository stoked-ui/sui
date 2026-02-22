# Product Requirements Document: Build Social Links Component

## 0. Source Context
**Derived From:** Product Feature Brief
**Feature Name:** Social Links Component
**PRD Owner:** TBD
**Last Updated:** 2026-01-31

### Feature Brief Summary
Build a reusable `SocialLinks` React component for the `@stoked-ui/common` package that allows users to connect and display social media accounts across 13 platforms (Instagram, TikTok, YouTube, Facebook, LinkedIn, Bluesky, Books, Website, X, Soundcloud, Bandcamp, OnlyFans, Nostr). The component presents a dark-themed vertical list of platform entries -- each with an icon, label, and input field -- inspired by Substack's social links UI. All platforms are visible by default; a `platforms` prop filters visibility. The component supports controlled and uncontrolled value patterns, `disabled`/`readOnly` states, and integrates with MUI v5 theming. No URL validation, OAuth, or API calls are in scope. The platform registry is designed for extensibility.

---

## 1. Objectives & Constraints

### Objectives
1. Deliver a production-ready `SocialLinks` component within `packages/sui-common/src/SocialLinks/` that renders all 13 platforms with correct icons, labels, and input placeholders.
2. Expose a `platforms` prop to filter which platforms appear; show all 13 by default.
3. Support both controlled (`value` + `onChange`) and uncontrolled (`defaultValue`) input patterns compatible with standard React form libraries.
4. Provide `disabled` and `readOnly` props for form integration scenarios.
5. Style the component with a dark-themed design referencing Substack's social links panel, built on MUI theme tokens so it adapts to light/dark mode switching.
6. Export all public types (`SocialLinksProps`, `SocialPlatform`, `SocialPlatformKey`, `SocialLinkValues`) for consumer use.
7. Achieve >= 90% test coverage with unit and integration tests.
8. Keep the component bundle under 15 KB gzipped (excluding icons).

### Constraints
- TypeScript strict mode compliance.
- React 18.3.1 peer dependency (no newer React features).
- MUI v5 (`@mui/material ^5.15.21`, `@mui/icons-material ^5.15.21`) -- already peer dependencies in sui-common.
- No new major runtime dependencies. Platform icons must be bundled as inline SVG components or sourced from `@mui/icons-material` and Simple Icons (CC0).
- Follows the sui-common package conventions: Babel build system, barrel exports via `index.ts`, `styled` from `@mui/material/styles`.
- Platform icons for OnlyFans, Nostr, Bandcamp, and Books may require custom SVG components if not available in MUI icons or Simple Icons under a permissive license.
- English-only labels in this release (no i18n).
- No animated transitions.

---

## 2. Execution Phases

> Phases below are ordered and sequential.
> A phase cannot begin until all acceptance criteria of the previous phase are met.

---

## Phase 1: Foundation & Platform Registry
**Purpose:** Establish TypeScript types, platform configuration registry, and component shell needed by all subsequent phases.

### 1.1 Platform Type Definitions & Registry

**Implementation Details:**

Create `packages/sui-common/src/SocialLinks/types.ts` containing:

1. A union type `SocialPlatformKey` with the 13 string literal keys: `'instagram' | 'tiktok' | 'youtube' | 'facebook' | 'linkedin' | 'bluesky' | 'books' | 'website' | 'x' | 'soundcloud' | 'bandcamp' | 'onlyfans' | 'nostr'`.
2. An `InputType` union: `'username' | 'url' | 'handle' | 'identifier'`.
3. A `SocialPlatform` interface:
   ```ts
   interface SocialPlatform {
     key: SocialPlatformKey;
     label: string;
     inputType: InputType;
     placeholder: string;
     prefix?: string; // e.g., "instagram.com/"
     icon: React.ComponentType<{ fontSize?: 'small' | 'medium' | 'large' | 'inherit' }>;
   }
   ```
4. A `SocialLinkValues` type: `Partial<Record<SocialPlatformKey, string>>`.

Create `packages/sui-common/src/SocialLinks/platformRegistry.ts` containing:

1. An array constant `PLATFORM_REGISTRY: readonly SocialPlatform[]` with all 13 platforms in the order: Instagram, TikTok, YouTube, Facebook, LinkedIn, Bluesky, Books, Website, X, Soundcloud, Bandcamp, OnlyFans, Nostr.
2. Each entry populated with `key`, `label`, `inputType`, `placeholder`, `prefix` (where applicable), and a temporary placeholder icon (use `@mui/icons-material` icons where available -- e.g., `Instagram`, `Facebook`, `YouTube`, `LinkedIn`, `Language` for Website -- and a generic `LinkIcon` for platforms without a direct MUI icon match).
3. A helper `getPlatformByKey(key: SocialPlatformKey): SocialPlatform | undefined`.
4. A constant `ALL_PLATFORM_KEYS: readonly SocialPlatformKey[]` derived from the registry.

**Platform configuration details:**

| Key | Label | InputType | Placeholder | Prefix |
|-----|-------|-----------|-------------|--------|
| `instagram` | Instagram | username | `username` | `instagram.com/` |
| `tiktok` | TikTok | username | `@username` | `tiktok.com/@` |
| `youtube` | YouTube | url | `youtube.com/c/yourchannel` | -- |
| `facebook` | Facebook | url | `facebook.com/yourpage` | -- |
| `linkedin` | LinkedIn | url | `linkedin.com/in/yourprofile` | -- |
| `bluesky` | Bluesky | handle | `user.bsky.social` | -- |
| `books` | Books | url | `goodreads.com/yourprofile` | -- |
| `website` | Website | url | `yourwebsite.com` | -- |
| `x` | X | username | `username` | `x.com/` |
| `soundcloud` | Soundcloud | url | `soundcloud.com/yourprofile` | -- |
| `bandcamp` | Bandcamp | url | `yourbandname.bandcamp.com` | -- |
| `onlyfans` | OnlyFans | username | `username` | `onlyfans.com/` |
| `nostr` | Nostr | identifier | `npub1... or NIP-05 address` | -- |

**Acceptance Criteria:**

- **AC-1.1.a:** `SocialPlatformKey` type union contains exactly 13 members corresponding to the platform list. Condition: Assign a string not in the union to a `SocialPlatformKey` variable -> Expected: TypeScript compiler error.
- **AC-1.1.b:** `PLATFORM_REGISTRY` array contains exactly 13 entries, each with all required fields (`key`, `label`, `inputType`, `placeholder`, `icon`). Condition: Access `PLATFORM_REGISTRY.length` -> Expected: 13.
- **AC-1.1.c:** `getPlatformByKey('instagram')` returns the Instagram platform object. Condition: Call with valid key -> Expected: returns matching `SocialPlatform`. Call with invalid key -> Expected: returns `undefined`.
- **AC-1.1.d:** `ALL_PLATFORM_KEYS` is a readonly array of length 13 derived from `PLATFORM_REGISTRY`. Condition: Check `ALL_PLATFORM_KEYS.length` -> Expected: 13.
- **AC-1.1.e:** `SocialLinkValues` type allows partial assignment of platform keys to string values. Condition: `const v: SocialLinkValues = { instagram: 'test' }` -> Expected: compiles. `const v: SocialLinkValues = { invalid: 'test' }` -> Expected: compiler error.

**Acceptance Tests:**

- **Test-1.1.a:** Unit test that imports `PLATFORM_REGISTRY` and asserts `length === 13` and every entry has non-empty `key`, `label`, `placeholder`, and a truthy `icon`.
- **Test-1.1.b:** Unit test that calls `getPlatformByKey` with each of the 13 keys and asserts a non-undefined result with matching `key`.
- **Test-1.1.c:** Unit test that calls `getPlatformByKey('nonexistent' as any)` and asserts `undefined`.
- **Test-1.1.d:** Unit test that asserts `ALL_PLATFORM_KEYS` contains all 13 expected string values.
- **Test-1.1.e:** TypeScript compilation test (via `tsc --noEmit`) confirming type-level constraints on `SocialPlatformKey` and `SocialLinkValues`.

---

### 1.2 Component Props Interface & Base Shell

**Implementation Details:**

Create `packages/sui-common/src/SocialLinks/SocialLinks.tsx` with:

1. A `SocialLinksProps` interface:
   ```ts
   interface SocialLinksProps {
     /** Array of platform keys to display. Defaults to all platforms. */
     platforms?: SocialPlatformKey[];
     /** Controlled value: map of platform key to input string. */
     value?: SocialLinkValues;
     /** Uncontrolled default value. */
     defaultValue?: SocialLinkValues;
     /** Callback fired when any platform input changes. */
     onChange?: (values: SocialLinkValues) => void;
     /** If true, all inputs are disabled. */
     disabled?: boolean;
     /** If true, all inputs are read-only. */
     readOnly?: boolean;
     /** MUI sx prop for root container styling overrides. */
     sx?: import('@mui/material').SxProps<import('@mui/material').Theme>;
   }
   ```
2. A minimal `SocialLinks` functional component that accepts `SocialLinksProps` and renders a `<Box>` placeholder with `data-testid="social-links-root"`. This shell validates that the component mounts and accepts props; actual rendering logic is implemented in Phase 2.
3. A default export of `SocialLinks`.

Create `packages/sui-common/src/SocialLinks/index.ts` barrel file exporting:
- `SocialLinks` (default export)
- All types from `types.ts`
- `PLATFORM_REGISTRY`, `getPlatformByKey`, `ALL_PLATFORM_KEYS` from `platformRegistry.ts`

**Acceptance Criteria:**

- **AC-1.2.a:** `SocialLinksProps` interface is exported and includes all specified properties with correct types. Condition: Import `SocialLinksProps` in a consumer file and use it to type a props object -> Expected: compiles with all documented fields.
- **AC-1.2.b:** `<SocialLinks />` renders without crashing when mounted with no props. Condition: Render with React Testing Library -> Expected: element with `data-testid="social-links-root"` is in the document.
- **AC-1.2.c:** Barrel file `index.ts` re-exports all public types and the component. Condition: `import { SocialLinks, SocialLinksProps, SocialPlatformKey, PLATFORM_REGISTRY } from './SocialLinks'` -> Expected: all imports resolve.

**Acceptance Tests:**

- **Test-1.2.a:** Render `<SocialLinks />` with no props; assert `screen.getByTestId('social-links-root')` exists.
- **Test-1.2.b:** Render `<SocialLinks disabled />` and `<SocialLinks readOnly />`; assert no errors thrown.
- **Test-1.2.c:** Import test verifying all expected exports from the barrel file.

---

## Phase 2: Core Component Implementation
**Purpose:** Build the functional component that renders platform fields with controlled/uncontrolled input support.

### 2.1 SocialLinkField Component

**Implementation Details:**

Create `packages/sui-common/src/SocialLinks/SocialLinkField.tsx`:

1. A `SocialLinkFieldProps` interface:
   ```ts
   interface SocialLinkFieldProps {
     platform: SocialPlatform;
     value: string;
     onChange: (key: SocialPlatformKey, value: string) => void;
     disabled?: boolean;
     readOnly?: boolean;
   }
   ```
2. The `SocialLinkField` component renders a single row:
   - A container `Box` with `display: 'flex'`, `alignItems: 'center'`, horizontal layout.
   - The platform icon rendered at 24px via `<platform.icon fontSize="small" />`.
   - The platform label rendered as MUI `Typography` (variant `body2`).
   - An MUI `TextField` (variant `outlined`, size `small`) for the input.
     - If `platform.prefix` is defined, render the prefix as a non-editable `InputAdornment` (start adornment) inside the TextField.
     - `placeholder` set to `platform.placeholder`.
     - `value` bound to the `value` prop.
     - `onChange` fires `props.onChange(platform.key, e.target.value)`.
     - `disabled` and `inputProps.readOnly` forwarded from props.
   - `data-testid` attribute: `social-link-field-{platform.key}`.

**Acceptance Criteria:**

- **AC-2.1.a:** Rendering `<SocialLinkField platform={instagramPlatform} value="" onChange={fn} />` produces a row containing the Instagram icon, the label "Instagram", and a text input with placeholder "username". Condition: Render and query -> Expected: icon element, text "Instagram", and input with placeholder present.
- **AC-2.1.b:** For platforms with a `prefix` (e.g., Instagram), the prefix text "instagram.com/" appears as a start adornment inside the input. Condition: Render Instagram field -> Expected: adornment text visible.
- **AC-2.1.c:** Typing in the input calls `onChange` with the platform key and new value. Condition: Fire change event on input with value "testuser" -> Expected: `onChange` called with `('instagram', 'testuser')`.
- **AC-2.1.d:** When `disabled` is true, the input element has `disabled` attribute. Condition: Render with `disabled={true}` -> Expected: input is disabled.
- **AC-2.1.e:** When `readOnly` is true, the input element has `readOnly` attribute. Condition: Render with `readOnly={true}` -> Expected: input is read-only.

**Acceptance Tests:**

- **Test-2.1.a:** Render `SocialLinkField` for each of the 13 platforms; assert each renders icon, label text, and input with correct placeholder.
- **Test-2.1.b:** Render Instagram field; assert `InputAdornment` with text "instagram.com/" is present. Render YouTube field (no prefix); assert no start adornment.
- **Test-2.1.c:** Render field with mock `onChange`; simulate typing "hello" in the input; assert mock called with `('instagram', 'hello')`.
- **Test-2.1.d:** Render with `disabled={true}`; assert `input` element has `disabled` attribute.
- **Test-2.1.e:** Render with `readOnly={true}`; assert `input` element has `readOnly` attribute.

---

### 2.2 SocialLinks Container Component

**Implementation Details:**

Update `packages/sui-common/src/SocialLinks/SocialLinks.tsx`:

1. Replace the placeholder `<Box>` from Phase 1 with the full implementation.
2. Determine the active platform list:
   - If `props.platforms` is provided and non-empty, filter `PLATFORM_REGISTRY` to include only platforms whose `key` is in `props.platforms`, preserving the order of `props.platforms`.
   - If `props.platforms` is undefined or empty, use the full `PLATFORM_REGISTRY` in its default order.
3. Render a root `Box` (`data-testid="social-links-root"`) containing a `SocialLinkField` for each active platform.
4. Pass `disabled` and `readOnly` down to each `SocialLinkField`.
5. Wire each field's `onChange` to an internal handler that updates state (see 2.3) and calls `props.onChange`.
6. Accept the `sx` prop on the root `Box`.

**Acceptance Criteria:**

- **AC-2.2.a:** `<SocialLinks />` with no `platforms` prop renders 13 `SocialLinkField` components. Condition: Render -> Expected: 13 elements matching `data-testid` pattern `social-link-field-*`.
- **AC-2.2.b:** `<SocialLinks platforms={['instagram', 'x', 'youtube']} />` renders exactly 3 fields in the specified order. Condition: Render with filter -> Expected: 3 field elements, first is Instagram, second is X, third is YouTube.
- **AC-2.2.c:** `<SocialLinks platforms={[]} />` renders 0 fields. Condition: Render with empty array -> Expected: no field elements; root container still present.
- **AC-2.2.d:** `disabled` and `readOnly` props propagate to all rendered fields. Condition: Render `<SocialLinks disabled />` -> Expected: all 13 inputs have `disabled` attribute.

**Acceptance Tests:**

- **Test-2.2.a:** Render `<SocialLinks />`; query all `[data-testid^="social-link-field-"]`; assert count is 13.
- **Test-2.2.b:** Render with `platforms={['instagram', 'x']}`; assert exactly 2 fields rendered; assert order matches.
- **Test-2.2.c:** Render with `platforms={[]}`; assert 0 fields but root container exists.
- **Test-2.2.d:** Render with `disabled`; assert every input has `disabled`.
- **Test-2.2.e:** Render with `platforms` containing an invalid key mixed with valid keys (e.g., `['instagram', 'invalidkey' as any]`); assert only the valid platform renders.

---

### 2.3 Controlled & Uncontrolled State Management

**Implementation Details:**

Inside `SocialLinks.tsx`:

1. Implement the controlled/uncontrolled pattern:
   - Use a `useRef` to track whether the component is controlled (i.e., `props.value !== undefined` on first render).
   - **Controlled mode:** When `props.value` is provided, use it directly as the source of truth. Do not maintain internal state. When a field changes, call `props.onChange` with the updated values object.
   - **Uncontrolled mode:** When `props.value` is not provided, initialize internal state via `useState(props.defaultValue ?? {})`. On field change, update internal state and call `props.onChange` if provided.
2. The field handler merges the changed key into the current values:
   ```ts
   const handleFieldChange = (key: SocialPlatformKey, fieldValue: string) => {
     const next = { ...currentValues, [key]: fieldValue };
     // Remove key if value is empty string (keep object clean)
     if (fieldValue === '') delete next[key];
     if (!isControlled) setInternalValues(next);
     onChange?.(next);
   };
   ```
3. Pass `currentValues[platform.key] ?? ''` as the `value` to each `SocialLinkField`.

**Acceptance Criteria:**

- **AC-2.3.a:** In uncontrolled mode (`defaultValue` provided, no `value`), typing in a field updates the displayed value without external state management. Condition: Render with `defaultValue={{ instagram: 'user1' }}`; type in Instagram field -> Expected: input value updates.
- **AC-2.3.b:** In controlled mode (`value` provided), the component reflects `value` prop changes. Condition: Re-render with updated `value` prop -> Expected: input values update to match new prop.
- **AC-2.3.c:** In controlled mode, typing in a field calls `onChange` but does not update the displayed value unless the parent updates `value`. Condition: Render with `value={{ instagram: 'a' }}`; type "b" -> Expected: `onChange` called with `{ instagram: 'ab' }`, but input still shows "a" until parent re-renders with new `value`.
- **AC-2.3.d:** `onChange` callback receives the full `SocialLinkValues` object, not just the changed field. Condition: Render with `value={{ instagram: 'a', x: 'b' }}`; type in Instagram -> Expected: `onChange` called with `{ instagram: 'newval', x: 'b' }`.
- **AC-2.3.e:** When a field is cleared to empty string, the key is removed from the values object passed to `onChange`. Condition: Clear Instagram input -> Expected: `onChange` called with object not containing `instagram` key.

**Acceptance Tests:**

- **Test-2.3.a:** Render uncontrolled with `defaultValue={{ instagram: 'initial' }}`; assert input shows "initial"; simulate change to "updated"; assert input shows "updated".
- **Test-2.3.b:** Render controlled with `value={{ x: 'hello' }}`; assert input shows "hello"; re-render with `value={{ x: 'world' }}`; assert input shows "world".
- **Test-2.3.c:** Render controlled; simulate change; assert `onChange` called; assert input still shows old value (controlled behavior).
- **Test-2.3.d:** Render with multiple values; change one field; assert `onChange` receives merged object with all values.
- **Test-2.3.e:** Render uncontrolled with `defaultValue={{ instagram: 'user' }}`; clear input; assert `onChange` receives object without `instagram`.

---

## Phase 3: Styling & Theming
**Purpose:** Apply dark-themed styling matching the Substack reference design and integrate with MUI theming.

### 3.1 Dark Theme Styling

**Implementation Details:**

Create `packages/sui-common/src/SocialLinks/SocialLinks.styles.ts`:

1. Define styled components using `styled` from `@mui/material/styles` (following the GrokLoader pattern in this package):
   - `SocialLinksRoot`: The root container. Dark background (`theme.palette.background.paper` in dark mode, fallback `#1a1a2e`), rounded corners (`borderRadius: theme.shape.borderRadius`), padding `theme.spacing(2)`, vertical flex layout with `gap: theme.spacing(1)`.
   - `SocialLinkFieldRow`: Horizontal flex container for one platform row. `display: 'flex'`, `alignItems: 'center'`, `gap: theme.spacing(2)`, `padding: theme.spacing(1, 1.5)`, subtle bottom border (`1px solid` using `theme.palette.divider`), and hover highlight (`backgroundColor: alpha(theme.palette.action.hover, 0.04)`).
   - `PlatformIcon`: Wrapper for the icon. Fixed width `40px`, flex-shrink 0, color `theme.palette.text.secondary`.
   - `PlatformLabel`: Styled `Typography`. Fixed width `120px`, flex-shrink 0, color `theme.palette.text.primary`, `fontWeight: 500`.
   - `PlatformInput`: Styled MUI `TextField`. Flex-grow 1, with `InputBase` styles: `color: theme.palette.text.primary`, `backgroundColor: alpha(theme.palette.background.default, 0.5)`, subdued border matching theme.
2. Import and use these styled components in `SocialLinkField.tsx` and `SocialLinks.tsx`, replacing raw MUI components.

**Acceptance Criteria:**

- **AC-3.1.a:** The root container renders with a dark background when using an MUI dark theme. Condition: Render inside `ThemeProvider` with dark theme -> Expected: root element has dark background color.
- **AC-3.1.b:** Each platform row displays icon, label, and input in a horizontal layout with consistent spacing. Condition: Render and inspect layout -> Expected: flex row with aligned items.
- **AC-3.1.c:** Platform labels have a fixed width ensuring vertical alignment of inputs. Condition: Render multiple rows -> Expected: all input fields start at the same horizontal offset.
- **AC-3.1.d:** Prefix adornments are styled subtly (muted color) to distinguish them from user input. Condition: Render Instagram field -> Expected: prefix text has `theme.palette.text.secondary` color.

**Acceptance Tests:**

- **Test-3.1.a:** Snapshot test rendering `<SocialLinks />` inside a dark `ThemeProvider`; verify snapshot contains expected styled class names or inline styles.
- **Test-3.1.b:** Render all 13 fields; query each row; assert each contains exactly 3 child regions (icon, label, input) in order.
- **Test-3.1.c:** Visual regression test (manual or screenshot-based) comparing rendered output to Substack reference layout.

---

### 3.2 MUI Theme Integration & Responsive Design

**Implementation Details:**

1. Ensure all styled components use only MUI theme tokens (`theme.palette`, `theme.spacing`, `theme.shape`, `theme.typography`) -- no hardcoded color values except as fallbacks.
2. Support both `mode: 'dark'` and `mode: 'light'` themes:
   - In light mode, the root background should use `theme.palette.background.paper` (typically white/light gray), and text colors should adapt accordingly.
   - Test visually in both modes.
3. Responsive behavior:
   - On narrow containers (below 480px width), the label column should be hidden, and the row should show only icon + input. Implement via a CSS media query or MUI's `useMediaQuery` with a container-width approach (or simply hide labels at `xs` breakpoint using `display: { xs: 'none', sm: 'block' }` on the `PlatformLabel` styled component).
   - Input fields should have `minWidth: 0` and `flex: 1` to prevent overflow.
4. Accept the `sx` prop on the root and merge it with default styles using MUI's `sx` prop spreading.

**Acceptance Criteria:**

- **AC-3.2.a:** Rendering in a light MUI theme produces readable text on a light background. Condition: Render in light theme -> Expected: text contrast ratio meets WCAG AA (4.5:1 for body text).
- **AC-3.2.b:** Rendering in a dark MUI theme produces readable text on a dark background. Condition: Render in dark theme -> Expected: text contrast ratio meets WCAG AA.
- **AC-3.2.c:** At viewport widths below the `sm` breakpoint (600px), platform labels are hidden. Condition: Render at 400px width -> Expected: label elements have `display: none`.
- **AC-3.2.d:** The `sx` prop on `<SocialLinks />` merges with default styles. Condition: Render with `sx={{ border: '2px solid red' }}` -> Expected: root element has red border in addition to default styles.

**Acceptance Tests:**

- **Test-3.2.a:** Render in light theme; assert root container has a `background-color` computed style in the light range (luminance > 0.5).
- **Test-3.2.b:** Render in dark theme; assert root container has a `background-color` computed style in the dark range (luminance < 0.3).
- **Test-3.2.c:** Render at narrow viewport (mock `matchMedia` for `xs`); assert label elements are not visible.
- **Test-3.2.d:** Render with custom `sx` prop; assert the custom style is applied to the root element.

---

## Phase 4: Testing & Package Integration
**Purpose:** Ensure quality through tests and proper package exports.

### 4.1 Unit Tests

**Implementation Details:**

Create `packages/sui-common/src/SocialLinks/__tests__/platformRegistry.test.ts`:
- Tests for `PLATFORM_REGISTRY` structure and completeness.
- Tests for `getPlatformByKey` behavior.
- Tests for `ALL_PLATFORM_KEYS` correctness.

Create `packages/sui-common/src/SocialLinks/__tests__/SocialLinkField.test.tsx`:
- Rendering tests for each platform.
- Input interaction tests (change, disabled, readOnly).
- Prefix adornment tests.

Use Jest + React Testing Library. Wrap renders in MUI `ThemeProvider` with `createTheme()`.

**Acceptance Criteria:**

- **AC-4.1.a:** All registry unit tests pass. Condition: Run `jest platformRegistry.test` -> Expected: all tests pass, 0 failures.
- **AC-4.1.b:** All SocialLinkField unit tests pass. Condition: Run `jest SocialLinkField.test` -> Expected: all tests pass, 0 failures.
- **AC-4.1.c:** Line coverage for `platformRegistry.ts` is 100%. Condition: Run with `--coverage` -> Expected: 100% line coverage.
- **AC-4.1.d:** Line coverage for `SocialLinkField.tsx` is >= 90%. Condition: Run with `--coverage` -> Expected: >= 90%.

**Acceptance Tests:**

- **Test-4.1.a:** `PLATFORM_REGISTRY` has 13 entries, each with all required fields.
- **Test-4.1.b:** `getPlatformByKey` returns correct platform for all valid keys and `undefined` for invalid keys.
- **Test-4.1.c:** `SocialLinkField` renders icon, label, and input for each of the 13 platforms (parameterized test).
- **Test-4.1.d:** `SocialLinkField` fires `onChange` with correct `(key, value)` arguments on input change.
- **Test-4.1.e:** `SocialLinkField` renders prefix adornment only for platforms that define a `prefix`.

---

### 4.2 Integration Tests

**Implementation Details:**

Create `packages/sui-common/src/SocialLinks/__tests__/SocialLinks.test.tsx`:
- Full component rendering tests.
- Platform filtering tests.
- Controlled and uncontrolled state management tests.
- Disabled/readOnly propagation tests.
- Edge case tests (empty platforms array, undefined value, rapid changes).

**Acceptance Criteria:**

- **AC-4.2.a:** All integration tests pass. Condition: Run `jest SocialLinks.test` -> Expected: all tests pass.
- **AC-4.2.b:** Line coverage for `SocialLinks.tsx` is >= 90%. Condition: Run with `--coverage` -> Expected: >= 90%.
- **AC-4.2.c:** Overall coverage for the `SocialLinks/` directory is >= 90%. Condition: Run with `--coverage` -> Expected: >= 90% across statements, branches, functions, lines.

**Acceptance Tests:**

- **Test-4.2.a:** Render `<SocialLinks />` with no props; assert 13 fields rendered.
- **Test-4.2.b:** Render with `platforms={['instagram', 'x']}`;  assert exactly 2 fields in correct order.
- **Test-4.2.c:** Render uncontrolled with `defaultValue`; type in field; assert value updates and `onChange` fires.
- **Test-4.2.d:** Render controlled with `value` and `onChange`; type in field; assert `onChange` fires with merged object; assert input does not update without prop change.
- **Test-4.2.e:** Render with `disabled={true}`; assert all inputs disabled.
- **Test-4.2.f:** Render with `readOnly={true}`; assert all inputs readOnly.
- **Test-4.2.g:** Render with `platforms={['nonexistent' as any]}`; assert 0 fields rendered, no crash.
- **Test-4.2.h:** Render controlled; clear a field; assert `onChange` receives object without that key.

---

### 4.3 Package Exports & Documentation

**Implementation Details:**

1. Update `packages/sui-common/src/index.ts` to add:
   ```ts
   export { default as SocialLinks } from './SocialLinks';
   export * from './SocialLinks';
   ```
   This follows the existing pattern (e.g., `GrokLoader` is exported similarly).

2. Add JSDoc comments to all exported types and the `SocialLinks` component:
   - `SocialLinksProps`: document each prop with `@param`-style descriptions.
   - `SocialPlatform`: document each field.
   - `SocialLinks` component: add a top-level `@example` showing basic usage:
     ```tsx
     <SocialLinks
       platforms={['instagram', 'x', 'youtube']}
       value={{ instagram: 'myuser' }}
       onChange={(values) => console.log(values)}
     />
     ```

3. Verify the build succeeds:
   - Run `pnpm typescript` (tsc type-check) in `packages/sui-common` with no errors.
   - Run `pnpm build` in `packages/sui-common` and confirm the `build/` output includes the new `SocialLinks` directory with `.js`, `.d.ts`, and `.js.map` files.

**Acceptance Criteria:**

- **AC-4.3.a:** `import { SocialLinks, SocialLinksProps, SocialPlatformKey, SocialLinkValues, PLATFORM_REGISTRY } from '@stoked-ui/common'` resolves without errors in a consuming package within the monorepo. Condition: Add import to a test file in another package -> Expected: TypeScript resolves all imports.
- **AC-4.3.b:** `pnpm build` in `packages/sui-common` completes with exit code 0. Condition: Run build -> Expected: success.
- **AC-4.3.c:** The `build/` directory contains `SocialLinks/index.js`, `SocialLinks/index.d.ts`, and related files. Condition: Check directory listing -> Expected: files present.
- **AC-4.3.d:** All exported types and the main component have JSDoc comments. Condition: Hover over imports in an IDE -> Expected: documentation tooltip appears.

**Acceptance Tests:**

- **Test-4.3.a:** Run `pnpm typescript` in `packages/sui-common`; assert exit code 0.
- **Test-4.3.b:** Run `pnpm build` in `packages/sui-common`; assert exit code 0.
- **Test-4.3.c:** Verify `build/SocialLinks/index.js` and `build/SocialLinks/index.d.ts` exist after build.
- **Test-4.3.d:** Grep exported functions and types for JSDoc `/** ... */` comments; assert presence on all public exports.

---

## 3. Completion Criteria

The Social Links Component is considered complete when ALL of the following are true:

1. All 4 phases have been executed sequentially, with every acceptance criterion met.
2. All acceptance tests (Test-1.x through Test-4.x) pass.
3. `pnpm typescript` and `pnpm build` succeed with 0 errors in `packages/sui-common`.
4. Test coverage for the `SocialLinks/` directory is >= 90% across statements, branches, functions, and lines.
5. All 13 platforms render with correct icons, labels, placeholders, and prefix adornments.
6. Controlled and uncontrolled value patterns work correctly.
7. The component renders correctly in both MUI dark and light themes.
8. All public types and the component are exported from `@stoked-ui/common`.

---

## 4. Rollout & Validation

1. **Developer Testing:** After Phase 4, a developer imports `<SocialLinks />` in a separate stoked-ui application or Storybook page and verifies:
   - Default rendering (all 13 platforms).
   - Filtered rendering (`platforms` prop with subset).
   - Controlled form integration (value + onChange).
   - Visual appearance in dark and light themes.
2. **Code Review:** PR reviewed by at least one other team member, focusing on:
   - TypeScript strictness and type safety.
   - Adherence to sui-common conventions.
   - Test quality and coverage.
   - Icon licensing compliance.
3. **CI Pipeline:** All monorepo CI checks pass (lint, type-check, tests, build).
4. **Version Bump:** Patch version bump for `@stoked-ui/common` (e.g., 0.1.2 -> 0.1.3) to include the new component.

---

## 5. Open Questions

> The following questions from the PFB have been resolved for this PRD with the noted decisions. If stakeholders disagree, these should be revisited before Phase 1 begins.

| # | Question | Decision for PRD |
|---|----------|-----------------|
| 1 | Package placement | Resolved: `packages/sui-common/src/SocialLinks/` within `@stoked-ui/common`. |
| 2 | Icon sourcing | Use `@mui/icons-material` where direct matches exist (Instagram, Facebook, YouTube, LinkedIn, Language/Website). Use custom inline SVG components for Bandcamp, Soundcloud, Bluesky, TikTok, OnlyFans, Nostr, Books, and X. Source from Simple Icons (CC0) where available. |
| 3 | Input prefix display | Username-type platforms (Instagram, TikTok, X, OnlyFans) show a non-editable `InputAdornment` prefix. URL-type platforms show only placeholder text. |
| 4 | Display-only mode | Deferred to follow-up. `readOnly` prop provides a non-editable state but still renders inputs. A future `variant="display"` mode with clickable links is out of scope for this release. |
| 5 | Platform ordering | Default order follows the PFB table (Instagram, TikTok, YouTube, Facebook, LinkedIn, Bluesky, Books, Website, X, Soundcloud, Bandcamp, OnlyFans, Nostr). When `platforms` prop is provided, order follows the prop array order. |
| 6 | Custom platforms | Deferred to follow-up. The registry architecture supports extension, but the public API does not accept custom platform definitions in this release. |
| 7 | Form library testing | Integration tests will verify the controlled/uncontrolled pattern. Explicit react-hook-form and Formik testing is deferred to the consuming application. |
| 8 | Nostr and OnlyFans icons | Custom SVG components will be created. Simple Icons provides Nostr and OnlyFans icons under CC0. |
