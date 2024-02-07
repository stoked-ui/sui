# Migrating from deprecated APIs

<p class="description">Learn how to migrate away from recently deprecated APIs before they become breaking changes.</p>

## Why you should migrate

Features become deprecated over time as maintainers make improvements to the APIs.
Migrating to these improved APIs results in a better developer experience, so it's in your best interest to stay up to date.
Deprecated APIs often become breaking changes in subsequent major versions, so the sooner you migrate, the smoother the next major update will be.

## Migrating

Material UI provides the `deprecations/all` codemod to help you stay up to date with minimal effort.

```bash
npx @mui/codemod@latest deprecations/all <path>
```

This command runs all the current [deprecations codemods](https://github.com/mui/material-ui/tree/HEAD/packages/mui-codemod#deprecations), automatically migrating to the updated API.
You can run this codemod as often as necessary to keep up with the latest changes.

:::info

If you need to manually migrate from a deprecated API, you can find examples below for all deprecations that have been added in Material UI v5.
If you need to run a specific codemod, those are also linked below.

:::

## Accordion

### TransitionComponent

The Accordion's `TransitionComponent` was deprecated in favor of `slots.transition` ([Codemod](https://github.com/mui/material-ui/tree/HEAD/packages/mui-codemod#accordion-props)):

```diff
 <Accordion
-  TransitionComponent={CustomTransition}
+  slots={{ transition: CustomTransition }}
 />
```

### TransitionProps

The Accordion's `TransitionProps` was deprecated in favor of `slotProps.transition` ([Codemod](https://github.com/mui/material-ui/tree/HEAD/packages/mui-codemod#accordion-props)):

```diff
 <Accordion
-  TransitionProps={{ unmountOnExit: true }}
+  slotProps={{ transition: { unmountOnExit: true } }}
 />
```

## Divider

### light

The Divider's `light` prop was deprecated, Use `sx={{ opacity : "0.6" }}` (or any opacity). ([Codemod](https://github.com/mui/material-ui/tree/HEAD/packages/mui-codemod#divider-props)):

```diff
 <Divider
-  light
+  sx={{ opacity : "0.6" }}
 />
```
