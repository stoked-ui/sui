# Build Social Links Component

## 1. Feature Overview
**Feature Name:** Social Links Component
**Owner:** Stoked Consulting / Development Team
**Status:** Draft
**Target Release:** TBD

### Summary
Build a reusable React component for the stoked-ui monorepo that allows users to connect and display their social media accounts across 13+ platforms. Inspired by Substack's social links UI, the component presents a clean, dark-themed list of platform entries, each with its own icon, label, and input field for usernames or URLs. All platforms are visible by default, with a prop to control which platforms appear.

---

## 2. Problem Statement
### What problem are we solving?
There is currently no standardized social links component in the stoked-ui ecosystem. Applications that need to collect or display social media profiles must build ad-hoc solutions, leading to inconsistent UX, duplicated effort, and missing platform coverage. A dedicated component provides a single, well-tested, reusable solution.

### Who is affected?
- **Primary users:** Developers building profile or settings pages within stoked-ui applications who need a social links form
- **Secondary users:** End-users who fill out social profiles and expect a clear, intuitive interface with recognizable platform icons
- **Ecosystem:** The broader stoked-ui component library benefits from a richer set of composable UI primitives

### Why now?
Social presence across multiple platforms is increasingly expected in creator, media, and professional tools. The stoked-ui ecosystem already includes media-oriented packages (sui-media, sui-media-selector, sui-video-renderer), and a social links component is a natural complement. Building it now establishes a pattern for profile-related components and avoids multiple one-off implementations as applications mature.

---

## 3. Goals & Success Metrics
### Goals
1. Deliver a production-ready `SocialLinks` React component as a new module within the stoked-ui monorepo
2. Support all 13 platforms: Instagram, TikTok, YouTube, Facebook, LinkedIn, Bluesky, Books, Website, X, Soundcloud, Bandcamp, OnlyFans, Nostr
3. Provide a clean, dark-themed UI consistent with Substack's social links design reference
4. Allow consumers to control visible platforms via a prop while showing all by default
5. Expose a controlled/uncontrolled value API for reading and writing link data
6. Include platform-specific icons and appropriate input placeholders (username vs. full URL)
7. Follow stoked-ui conventions for theming, TypeScript types, and package structure

### Success Metrics
- **Platform completeness:** All 13 platforms rendered with correct icons and labels -> target: 13/13
- **Default visibility:** All platforms visible when no filter prop is provided -> target: PASS
- **Filter prop:** Only specified platforms visible when filter prop is set -> target: PASS
- **TypeScript coverage:** Full type definitions for all props, value shapes, and platform identifiers -> target: 100%
- **Test coverage:** Unit tests covering rendering, filtering, value changes, and edge cases -> target: >= 90%
- **Accessibility:** Labeled inputs, keyboard navigable, WCAG 2.1 AA compliant -> target: automated audit score >= 95
- **Bundle size:** Component bundle (excluding icons) -> target: < 15 KB gzipped

---

## 4. User Experience & Scope
### In Scope
**Component API:**
- `SocialLinks` root component accepting platform link values and emitting changes
- `platforms` prop: an array of platform identifiers specifying which platforms to show (default: all)
- `value` / `defaultValue` prop: object mapping platform keys to their URL/username strings
- `onChange` callback: fires when any platform input changes, providing the updated link map
- `disabled` / `readOnly` props for form integration
- `variant` prop for potential display modes (e.g., edit mode with inputs vs. display mode with clickable links) -- TBD based on implementation

**Platform Definitions:**
Each platform entry includes:
- Unique key (e.g., `instagram`, `tiktok`, `youtube`, `facebook`, `linkedin`, `bluesky`, `books`, `website`, `x`, `soundcloud`, `bandcamp`, `onlyfans`, `nostr`)
- Display label (e.g., "Instagram", "TikTok", "YouTube", etc.)
- Platform icon (SVG or icon component)
- Input type hint: username-based (e.g., Instagram, TikTok, X) or URL-based (e.g., Website, Books)
- Placeholder text appropriate to the platform (e.g., "instagram.com/username" or "yourwebsite.com")

**UI/Styling:**
- Dark-themed design inspired by Substack's social links panel
- Each platform row: icon on the left, label, and text input field
- Clean vertical list layout with consistent spacing
- Theming support via stoked-ui/MUI theming conventions
- Responsive layout for various container widths

**Integration:**
- Works as a controlled or uncontrolled component
- Compatible with form libraries (e.g., react-hook-form, Formik) via standard value/onChange pattern
- Exportable platform list and types for consumers who need to reference platforms programmatically

### Out of Scope
- **URL validation or verification** -- the component accepts free-text input; validation is the consumer's responsibility
- **OAuth or account connection** -- this is a display/input component, not an authentication flow
- **Profile picture or avatar fetching** -- no API calls to social platforms
- **Drag-and-drop reordering of platforms** -- platforms render in a fixed order
- **Separate npm package** -- ships as a module within an existing stoked-ui package, not a standalone package
- **Server-side rendering concerns** -- standard SSR compatibility expected from React components but no special SSR-only features
- **Animated transitions** -- keep the component simple; animations can be added later

---

## 5. Assumptions & Constraints
### Assumptions
- The Substack social links screenshot serves as a visual reference, not a pixel-perfect spec; the component adapts to stoked-ui's design system
- Platform icons are available as SVG assets or can be sourced from open-source icon sets (e.g., Simple Icons, Lucide) with appropriate licensing
- Consumers will handle persistence of social link data; this component is purely presentational/input
- The 13 specified platforms represent the initial set; the architecture should support adding new platforms easily
- MUI theming infrastructure is available for styling

### Constraints
**Technical:**
- Must be written in TypeScript with strict mode compliance
- Must follow stoked-ui monorepo conventions (build tooling, exports, naming)
- React 18.3.1 compatibility required (per monorepo peer dependencies)
- Must use MUI v5 theming (consistent with existing packages)
- No new major dependencies beyond icon assets

**Design:**
- Dark theme is the primary design target (matching Substack reference)
- Must support MUI light/dark theme switching if the consuming application uses it
- Icons must be visually recognizable at small sizes (20-24px)

**Licensing:**
- All platform icons must use licenses compatible with the stoked-ui project (MIT, Apache 2.0, or similar)
- OnlyFans and Nostr icons may require custom SVGs if not available in standard icon libraries

---

## 6. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| **Icon licensing issues** -- Some platform icons (OnlyFans, Nostr, Bandcamp) may not be available under permissive licenses | MEDIUM - Could delay delivery or require custom icon design | Survey icon availability early. Use Simple Icons (CC0) where possible. Commission simple custom SVGs for missing platforms. |
| **Platform list changes** -- Social platforms emerge and disappear; the hardcoded list may need frequent updates | LOW - Easy to add platforms but creates maintenance | Design an extensible platform registry pattern so consumers can add custom platforms without modifying the component source. |
| **Input type ambiguity** -- Some platforms accept usernames, others full URLs, and user expectations vary | MEDIUM - Could create confusing UX if placeholders are unclear | Provide clear placeholder text per platform. Include optional URL prefix display (e.g., "instagram.com/") as a visual hint. Document expected input format. |
| **Theming inconsistency** -- Dark theme may not match consuming application's design system | LOW - Substack reference is dark but apps may vary | Build on MUI theme tokens so the component inherits the app's palette. Test in both light and dark modes. |
| **Scope creep toward validation** -- Consumers may expect built-in URL validation or link checking | MEDIUM - Could delay initial release if pursued | Explicitly document that validation is out of scope. Provide TypeScript types that make it easy for consumers to add validation externally. Consider a follow-up enhancement. |
| **Nostr identifier complexity** -- Nostr uses npub keys rather than simple usernames or URLs | LOW - Could confuse users unfamiliar with Nostr | Use appropriate placeholder text (e.g., "npub1... or NIP-05 address"). Document the expected format. |

---

## 7. Dependencies
**Internal Dependencies:**
- **stoked-ui monorepo build system** -- Turbo/pnpm workspace configuration for building and publishing the component
- **MUI v5 theming** -- Theme tokens for colors, spacing, typography
- **@stoked-ui/sui-common** -- Shared utilities and types if applicable
- **Documentation site (sui-docs)** -- For component demos and API documentation

**External Dependencies:**
- **@mui/material v5.15+** -- Already a peer dependency in the monorepo; used for TextField, Box, Typography, and theme primitives
- **React 18.3.1** -- Current peer dependency, no change needed
- **Platform icon assets** -- SVG icons for all 13 platforms (source: Simple Icons, custom, or bundled SVGs)

**Development Dependencies:**
- **TypeScript compiler** -- Type checking and declaration generation
- **Testing libraries** -- Jest + React Testing Library for unit tests
- **Storybook or docs site** -- For visual development and documentation

**Knowledge Dependencies:**
- **Substack social links UI screenshot** -- Visual design reference
- **Platform identifier formats** -- Understanding of what each platform expects (username vs. URL vs. special format like Nostr npub)

---

## 8. Open Questions
1. **Package placement:** Should this component live in an existing package (e.g., sui-common) or warrant its own package (e.g., sui-social-links)? Monorepo conventions should guide this decision.

2. **Icon sourcing:** Which icon library or asset set will be used for all 13 platforms? Are there any platforms lacking freely licensed icons that need custom SVGs?

3. **Input prefix display:** Should username-based platforms show a non-editable URL prefix (e.g., "instagram.com/") inline with the input, or rely solely on placeholder text?

4. **Display-only mode:** Is a read-only "display mode" (rendering clickable links instead of inputs) needed for the initial release, or is that a follow-up enhancement?

5. **Platform ordering:** What order should platforms appear in? Alphabetical, by popularity, matching the Substack reference order, or consumer-configurable?

6. **Custom platforms:** Should the API support consumer-defined custom platforms (with custom icon, label, and key) in the initial release?

7. **Form integration testing:** Which form libraries (react-hook-form, Formik, etc.) should be explicitly tested for compatibility?

8. **Nostr and OnlyFans icon availability:** Are there existing open-source icons for these platforms, or do they need to be designed?

---

## 9. Non-Goals
**Explicitly excluded from this component:**

1. **Authentication or OAuth flows** -- This component does not connect to any social platform APIs. It is purely a UI input/display component.

2. **Link validation or verification** -- No checking whether a provided username or URL actually exists on the platform. Validation is the consumer's responsibility.

3. **Profile data fetching** -- No API calls to retrieve follower counts, profile pictures, or other metadata from social platforms.

4. **Drag-and-drop reordering** -- Platform order is fixed (either by default or by the consumer's `platforms` prop). Reordering UI is not included.

5. **Analytics or tracking** -- No built-in tracking of which platforms users fill in or click.

6. **Platform-specific input masks** -- No enforcing character limits, format restrictions, or auto-formatting beyond placeholder hints.

7. **Standalone npm package** -- The component ships within the stoked-ui monorepo, not as an independent package on npm.

8. **Mobile-native support** -- Standard responsive web only; no React Native variant.

9. **Internationalization (i18n)** -- Platform labels are English-only in the initial release. i18n support can be added later.

10. **Animated transitions or micro-interactions** -- Focus is on clean, functional UI. Animations are a potential follow-up enhancement.

---

## 10. Notes & References
**Design Reference:**
- Substack social links UI (screenshot provided by stakeholder) -- serves as visual inspiration for layout, iconography, and dark theme aesthetic
- The Substack design shows a vertical list of platforms, each with an icon, platform name, and text input field

**Platform List (13 platforms):**
| Key | Label | Input Type | Notes |
|-----|-------|------------|-------|
| `instagram` | Instagram | Username | Prefix: instagram.com/ |
| `tiktok` | TikTok | Username | Prefix: tiktok.com/@ |
| `youtube` | YouTube | URL | Full channel URL |
| `facebook` | Facebook | URL | Full profile/page URL |
| `linkedin` | LinkedIn | URL | Full profile URL |
| `bluesky` | Bluesky | Handle | e.g., user.bsky.social |
| `books` | Books | URL | Link to book page or reading list |
| `website` | Website | URL | Full URL |
| `x` | X | Username | Prefix: x.com/ |
| `soundcloud` | Soundcloud | URL | Full profile URL |
| `bandcamp` | Bandcamp | URL | Full profile URL |
| `onlyfans` | OnlyFans | Username | Prefix: onlyfans.com/ |
| `nostr` | Nostr | npub/NIP-05 | npub key or NIP-05 identifier |

**Technical Context:**
- Monorepo: stoked-ui (pnpm workspaces + Turbo)
- Package naming convention: `@stoked-ui/sui-*`
- Build: TypeScript, MUI v5, React 18.3.1
- Existing packages for reference: sui-common, sui-media-selector, sui-file-explorer

**Icon Resources:**
- [Simple Icons](https://simpleicons.org/) -- CC0 licensed SVG icons for many platforms
- [Lucide Icons](https://lucide.dev/) -- MIT licensed icon set
- Custom SVGs may be needed for: OnlyFans, Nostr, Books (generic book icon)

**Architecture Guidance:**
- Follow the controlled/uncontrolled component pattern used elsewhere in stoked-ui and MUI
- Platform registry should be a typed constant array, making it straightforward to add or remove platforms
- Component should export its types (`SocialLinksProps`, `SocialPlatform`, `SocialLinkValues`) for consumer use
- Consider a `SocialLinksItem` sub-component for individual platform rows to enable composition patterns

**Success Criteria Summary:**
This component succeeds when a developer can drop `<SocialLinks />` into a stoked-ui application and immediately get a complete, styled social links form for all 13 platforms. It should require zero configuration for the default case, offer simple prop-based filtering for custom platform sets, and integrate cleanly with standard React form patterns. Failure looks like: missing platform icons, confusing input expectations, or an API that fights against common form library patterns.
