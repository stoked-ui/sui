# Feature Flag System Documentation

**Project:** FileExplorer Migration to MUI X RichTreeView
**Work Item:** 4.4 - Feature Flag Implementation
**Version:** 1.0.0
**Date:** 2026-01-19

---

## Table of Contents

1. [Overview](#overview)
2. [Feature Flags](#feature-flags)
3. [Configuration](#configuration)
4. [Usage](#usage)
5. [Rollout Strategy](#rollout-strategy)
6. [Rollback Capability](#rollback-capability)
7. [Runtime Configuration](#runtime-configuration)
8. [Monitoring](#monitoring)
9. [API Reference](#api-reference)
10. [Examples](#examples)

---

## Overview

The Feature Flag System provides safe, gradual rollout of the FileExplorer migration to MUI X RichTreeView. It enables:

- **Independent feature control** for each migration phase
- **Runtime configuration** without code redeployment
- **Rollback capability** to legacy rendering
- **Gradual user exposure** with traffic percentage controls
- **Emergency kill switches** for critical issues

### Key Benefits

1. **Risk Mitigation**: Deploy features to small user cohorts first
2. **Fast Rollback**: Disable problematic features instantly without code changes
3. **Flexible Rollout**: Control exposure percentage at runtime
4. **Feature Independence**: Enable/disable features separately
5. **User Consistency**: Same user always sees same implementation (sticky sessions)

---

## Feature Flags

The system provides 4 independent feature flags corresponding to migration phases:

### 1. `useMuiXRendering` (Phase 1)

**Purpose:** Controls MUI X RichTreeView rendering engine
**Default:** `enabled: true, trafficPercentage: 100`
**Rollback:** When disabled, falls back to legacy rendering
**Dependencies:** None

**Features Controlled:**
- MUI X RichTreeView rendering
- Custom TreeItem integration
- Grid view with RichTreeView
- Plugin lifecycle adapters

### 2. `dndInternal` (Phase 2)

**Purpose:** Controls internal drag-and-drop functionality
**Default:** `enabled: true, trafficPercentage: 100`
**Rollback:** Falls back to Atlaskit DnD when disabled
**Dependencies:** Requires `useMuiXRendering`

**Features Controlled:**
- Internal file reordering
- TreeItem2 with DragAndDropOverlay
- MUI X itemsReordering integration
- Drag-and-drop state management

### 3. `dndExternal` (Phase 3)

**Purpose:** Controls external drag-and-drop (files from outside)
**Default:** `enabled: true, trafficPercentage: 100`
**Rollback:** Disables external file drops
**Dependencies:** Requires `useMuiXRendering`

**Features Controlled:**
- External file drop handling
- File type validation
- Drop zone integration

### 4. `dndTrash` (Phase 3)

**Purpose:** Controls trash management functionality
**Default:** `enabled: true, trafficPercentage: 100`
**Rollback:** Disables trash features
**Dependencies:** Requires `useMuiXRendering`

**Features Controlled:**
- Trash/delete functionality
- File restoration
- Trash collection management

---

## Configuration

### Default Configuration

All features are enabled by default (post-rollout):

```typescript
const DEFAULT_FEATURE_FLAGS: FeatureFlagConfiguration = {
  useMuiXRendering: {
    enabled: true,
    trafficPercentage: 100,
    emergencyDisabled: false,
  },
  dndInternal: {
    enabled: true,
    trafficPercentage: 100,
    emergencyDisabled: false,
  },
  dndExternal: {
    enabled: true,
    trafficPercentage: 100,
    emergencyDisabled: false,
  },
  dndTrash: {
    enabled: true,
    trafficPercentage: 100,
    emergencyDisabled: false,
  },
};
```

### Environment-Specific Configuration

#### Development
```typescript
{
  useMuiXRendering: { enabled: true, trafficPercentage: 100 },
  dndInternal: { enabled: true, trafficPercentage: 100 },
  dndExternal: { enabled: true, trafficPercentage: 100 },
  dndTrash: { enabled: true, trafficPercentage: 100 },
}
```

#### Staging
```typescript
{
  useMuiXRendering: { enabled: true, trafficPercentage: 100 },
  dndInternal: { enabled: true, trafficPercentage: 100 },
  dndExternal: { enabled: true, trafficPercentage: 100 },
  dndTrash: { enabled: true, trafficPercentage: 100 },
}
```

#### Production
Uses `DEFAULT_FEATURE_FLAGS` with runtime overrides support.

---

## Usage

### Basic Setup

Wrap your application with `FeatureFlagProvider`:

```tsx
import { FeatureFlagProvider } from '@stoked-ui/file-explorer/featureFlags';
import { FileExplorerWithFlags } from '@stoked-ui/file-explorer';

function App() {
  return (
    <FeatureFlagProvider userId="user-123">
      <FileExplorerWithFlags items={files} />
    </FeatureFlagProvider>
  );
}
```

### Using Feature Flags in Components

#### Check Single Feature

```tsx
import { useFeatureFlag, FeatureFlag } from '@stoked-ui/file-explorer/featureFlags';

function MyComponent() {
  const isMuiXEnabled = useFeatureFlag(FeatureFlag.USE_MUI_X_RENDERING);

  return isMuiXEnabled ? <MuiXView /> : <LegacyView />;
}
```

#### Access All Flags

```tsx
import { useFeatureFlags } from '@stoked-ui/file-explorer/featureFlags';

function ControlPanel() {
  const { flags, isFeatureEnabled, updateFlags } = useFeatureFlags();

  const handleToggle = (flag: FeatureFlag) => {
    updateFlags({
      [flag]: { enabled: !flags[flag].enabled },
    });
  };

  return (
    <div>
      {Object.values(FeatureFlag).map((flag) => (
        <Switch
          key={flag}
          checked={isFeatureEnabled(flag)}
          onChange={() => handleToggle(flag)}
        />
      ))}
    </div>
  );
}
```

### FileExplorerWithFlags Component

The `FileExplorerWithFlags` component automatically handles feature flag integration:

```tsx
import { FileExplorerWithFlags } from '@stoked-ui/file-explorer';

// Automatically uses feature flags for rendering and DnD
<FileExplorerWithFlags
  items={files}
  dndInternal={true}  // Will be controlled by feature flag
  dndExternal={true}  // Will be controlled by feature flag
  dndTrash={true}     // Will be controlled by feature flag
/>
```

---

## Rollout Strategy

### Stage 1: Internal Beta (Days 1-2)

**Configuration:**
```typescript
{
  useMuiXRendering: { enabled: true, trafficPercentage: 100 },  // Development/Staging only
  dndInternal: { enabled: true, trafficPercentage: 100 },
  dndExternal: { enabled: false },  // Phase 3 not included
  dndTrash: { enabled: false },
}
```

**Scope:** Development and staging environments only
**Users:** Internal development team
**Duration:** Minimum 2 days
**Focus:** Core functionality validation

### Stage 2: Limited Production (Days 3-7)

**Configuration:**
```typescript
{
  useMuiXRendering: { enabled: true, trafficPercentage: 10 },
  dndInternal: { enabled: true, trafficPercentage: 10 },
  dndExternal: { enabled: true, trafficPercentage: 10 },
  dndTrash: { enabled: false },  // Trash not included yet
}
```

**Scope:** Production environment
**Users:** 10% of user base
**Duration:** 3-5 days
**Focus:** Real-world usage patterns, performance metrics

### Stage 3: Expanded Rollout (Days 8-12)

**Configuration:**
```typescript
{
  useMuiXRendering: { enabled: true, trafficPercentage: 50 },
  dndInternal: { enabled: true, trafficPercentage: 50 },
  dndExternal: { enabled: true, trafficPercentage: 50 },
  dndTrash: { enabled: true, trafficPercentage: 50 },
}
```

**Scope:** Production environment
**Users:** 50% of user base
**Duration:** 3-5 days
**Focus:** All features enabled, scaling validation

### Stage 4: Full Rollout (Day 13+)

**Configuration:**
```typescript
{
  useMuiXRendering: { enabled: true, trafficPercentage: 100 },
  dndInternal: { enabled: true, trafficPercentage: 100 },
  dndExternal: { enabled: true, trafficPercentage: 100 },
  dndTrash: { enabled: true, trafficPercentage: 100 },
}
```

**Scope:** Production environment
**Users:** 100% of user base
**Duration:** Ongoing (2+ weeks observation)
**Focus:** Full deployment, stability monitoring

---

## Rollback Capability

### AC-4.4.c: Rollback to Legacy Rendering

The system provides instant rollback without code deployment:

#### Scenario 1: Rollback MUI X Rendering

```typescript
// Disable MUI X rendering, fall back to legacy
updateFlags({
  useMuiXRendering: { enabled: false },
});

// Result: FileExplorerLegacy component is used
// All DnD features automatically disabled (dependencies not met)
```

#### Scenario 2: Emergency Disable

```typescript
// Emergency kill switch for critical issues
emergencyDisable(FeatureFlag.USE_MUI_X_RENDERING);

// Result: Feature disabled immediately, overrides all other settings
```

#### Scenario 3: Partial Rollback

```typescript
// Keep MUI X rendering, disable specific DnD features
updateFlags({
  useMuiXRendering: { enabled: true, trafficPercentage: 100 },
  dndInternal: { enabled: false },  // Disable internal DnD only
});
```

### Rollback Validation

After rollback, verify:

1. **Rendering:** Legacy FileExplorer component is displayed
2. **Functionality:** All core features work (selection, expansion, focus)
3. **No Errors:** No console errors or warnings
4. **User Experience:** Smooth transition without visual glitches
5. **Performance:** Metrics return to baseline

---

## Runtime Configuration

### AC-4.4.d: Runtime Configuration Without Redeployment

#### Update Traffic Percentage

```typescript
const { updateFlags } = useFeatureFlags();

// Gradually increase exposure
updateFlags({
  useMuiXRendering: { enabled: true, trafficPercentage: 25 },
});
```

#### Configuration via API

```typescript
// Example: Load configuration from remote API
async function loadRemoteConfig() {
  const response = await fetch('/api/feature-flags');
  const config = await response.json();

  updateFlags(config);
}
```

#### Configuration via Admin Panel

```tsx
function AdminPanel() {
  const { flags, updateFlags } = useFeatureFlags();

  return (
    <div>
      <h2>Feature Flag Controls</h2>
      {Object.entries(flags).map(([flag, state]) => (
        <div key={flag}>
          <label>{flag}</label>
          <input
            type="checkbox"
            checked={state.enabled}
            onChange={(e) =>
              updateFlags({
                [flag]: { ...state, enabled: e.target.checked },
              })
            }
          />
          <input
            type="number"
            value={state.trafficPercentage}
            onChange={(e) =>
              updateFlags({
                [flag]: { ...state, trafficPercentage: parseInt(e.target.value) },
              })
            }
          />
        </div>
      ))}
    </div>
  );
}
```

#### Persistence

Flags are automatically persisted to localStorage:

```typescript
// Automatic persistence
<FeatureFlagProvider persist={true}>
  {/* Flags saved to localStorage on change */}
</FeatureFlagProvider>

// Custom storage key
<FeatureFlagProvider
  persist={true}
  storageKey="my-custom-feature-flags"
>
  {/* ... */}
</FeatureFlagProvider>

// Disable persistence
<FeatureFlagProvider persist={false}>
  {/* Flags not persisted */}
</FeatureFlagProvider>
```

---

## Monitoring

### AC-4.4.e: Monitoring Dashboards

#### Key Metrics to Track

1. **Feature Flag State**
   - Current enabled/disabled status
   - Traffic percentage per flag
   - Emergency disable status

2. **User Exposure**
   - Number of users seeing MUI X vs Legacy
   - Traffic distribution by cohort
   - User ID hash distribution

3. **Error Rates**
   - Error count by implementation (MUI X vs Legacy)
   - Error types and stack traces
   - Correlation with feature flag changes

4. **Performance Metrics**
   - Render time: MUI X vs Legacy
   - Memory usage comparison
   - Interaction latency

5. **Feature Usage**
   - Feature adoption rates
   - User engagement per feature
   - Feature-specific error rates

#### Monitoring Dashboard Example

```typescript
import { useFeatureFlags } from '@stoked-ui/file-explorer/featureFlags';

function MonitoringDashboard() {
  const { flags, isFeatureEnabled } = useFeatureFlags();

  return (
    <div>
      <h2>Feature Flag Status</h2>
      <table>
        <thead>
          <tr>
            <th>Flag</th>
            <th>Enabled</th>
            <th>Traffic %</th>
            <th>Emergency Disabled</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(flags).map(([flag, state]) => (
            <tr key={flag}>
              <td>{flag}</td>
              <td>{state.enabled ? 'Yes' : 'No'}</td>
              <td>{state.trafficPercentage}%</td>
              <td>{state.emergencyDisabled ? 'YES' : 'No'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Current User Exposure</h2>
      <ul>
        <li>MUI X Rendering: {isFeatureEnabled(FeatureFlag.USE_MUI_X_RENDERING) ? 'Active' : 'Inactive'}</li>
        <li>Internal DnD: {isFeatureEnabled(FeatureFlag.DND_INTERNAL) ? 'Active' : 'Inactive'}</li>
        <li>External DnD: {isFeatureEnabled(FeatureFlag.DND_EXTERNAL) ? 'Active' : 'Inactive'}</li>
        <li>Trash Management: {isFeatureEnabled(FeatureFlag.DND_TRASH) ? 'Active' : 'Inactive'}</li>
      </ul>
    </div>
  );
}
```

---

## API Reference

### FeatureFlagProvider

```tsx
interface FeatureFlagProviderProps {
  children: React.ReactNode;
  initialFlags?: Partial<FeatureFlagConfiguration>;
  userId?: string;
  persist?: boolean;
  storageKey?: string;
}
```

### useFeatureFlags()

```typescript
interface FeatureFlagContextValue {
  flags: FeatureFlagConfiguration;
  isFeatureEnabled: (flag: FeatureFlag, userId?: string) => boolean;
  updateFlags: (updates: Partial<FeatureFlagConfiguration>) => void;
  resetFlags: () => void;
  emergencyDisable: (flag: FeatureFlag) => void;
  environment: string;
}
```

### useFeatureFlag()

```typescript
function useFeatureFlag(flag: FeatureFlag, userId?: string): boolean;
```

### FeatureFlag Enum

```typescript
enum FeatureFlag {
  USE_MUI_X_RENDERING = 'useMuiXRendering',
  DND_INTERNAL = 'dndInternal',
  DND_EXTERNAL = 'dndExternal',
  DND_TRASH = 'dndTrash',
}
```

### FeatureFlagState Interface

```typescript
interface FeatureFlagState {
  enabled: boolean;
  trafficPercentage?: number;
  emergencyDisabled?: boolean;
  description?: string;
}
```

---

## Examples

### Example 1: Basic Integration

```tsx
import { FeatureFlagProvider } from '@stoked-ui/file-explorer/featureFlags';
import { FileExplorerWithFlags } from '@stoked-ui/file-explorer';

function App() {
  return (
    <FeatureFlagProvider userId="user-123">
      <FileExplorerWithFlags items={myFiles} />
    </FeatureFlagProvider>
  );
}
```

### Example 2: Custom Initial Configuration

```tsx
import { FeatureFlagProvider, FeatureFlag } from '@stoked-ui/file-explorer/featureFlags';

const customFlags = {
  [FeatureFlag.USE_MUI_X_RENDERING]: { enabled: true, trafficPercentage: 50 },
  [FeatureFlag.DND_INTERNAL]: { enabled: false },
};

<FeatureFlagProvider initialFlags={customFlags} userId="user-123">
  <App />
</FeatureFlagProvider>
```

### Example 3: Runtime Configuration Update

```tsx
function FeatureFlagControls() {
  const { updateFlags } = useFeatureFlags();

  const enableBeta = () => {
    updateFlags({
      [FeatureFlag.USE_MUI_X_RENDERING]: { enabled: true, trafficPercentage: 10 },
    });
  };

  const enableFull = () => {
    updateFlags({
      [FeatureFlag.USE_MUI_X_RENDERING]: { enabled: true, trafficPercentage: 100 },
      [FeatureFlag.DND_INTERNAL]: { enabled: true, trafficPercentage: 100 },
      [FeatureFlag.DND_EXTERNAL]: { enabled: true, trafficPercentage: 100 },
      [FeatureFlag.DND_TRASH]: { enabled: true, trafficPercentage: 100 },
    });
  };

  return (
    <div>
      <button onClick={enableBeta}>Start Beta (10%)</button>
      <button onClick={enableFull}>Full Rollout (100%)</button>
    </div>
  );
}
```

### Example 4: Emergency Rollback

```tsx
function EmergencyControls() {
  const { emergencyDisable, resetFlags } = useFeatureFlags();

  const handleEmergency = () => {
    // Disable MUI X rendering immediately
    emergencyDisable(FeatureFlag.USE_MUI_X_RENDERING);
    console.error('Emergency rollback executed');
  };

  const handleRecover = () => {
    // Reset to default configuration
    resetFlags();
    console.log('Flags reset to default');
  };

  return (
    <div>
      <button onClick={handleEmergency} style={{ color: 'red' }}>
        EMERGENCY ROLLBACK
      </button>
      <button onClick={handleRecover}>
        Reset to Default
      </button>
    </div>
  );
}
```

### Example 5: Conditional Rendering

```tsx
import { useFeatureFlag, FeatureFlag } from '@stoked-ui/file-explorer/featureFlags';

function FileExplorerContainer() {
  const useMuiX = useFeatureFlag(FeatureFlag.USE_MUI_X_RENDERING);

  if (!useMuiX) {
    return <FileExplorerLegacy items={files} />;
  }

  return <FileExplorer items={files} />;
}
```

---

## Best Practices

1. **Always provide userId** for consistent user experience
2. **Start with low traffic percentage** (5-10%) for new features
3. **Monitor metrics** before increasing exposure
4. **Use emergency disable** only for critical issues
5. **Test rollback** in staging before production deployment
6. **Document configuration changes** with reasons and timestamps
7. **Persist flags** to maintain user consistency across sessions
8. **Validate dependencies** before enabling dependent features

---

## Troubleshooting

### Issue: Feature not enabled for user

**Check:**
1. Is feature flag `enabled: true`?
2. Is `trafficPercentage` high enough for user's hash?
3. Are feature dependencies satisfied?
4. Is `emergencyDisabled` set to `true`?

### Issue: Flags not persisting

**Check:**
1. Is `persist` prop set to `true`?
2. Is localStorage available in environment?
3. Are there localStorage quota issues?

### Issue: Inconsistent feature state

**Check:**
1. Is userId consistent across sessions?
2. Are flags being overridden by initialFlags?
3. Is configuration being loaded from API correctly?

---

**Document Version:** 1.0.0
**Last Updated:** 2026-01-19
**Maintained By:** FileExplorer Team
