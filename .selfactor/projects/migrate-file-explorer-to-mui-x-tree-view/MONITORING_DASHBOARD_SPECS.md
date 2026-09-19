# Monitoring Dashboard Specifications

**Project:** #8 - Migrate FileExplorer to MUI X RichTreeView
**Work Item:** 4.5 - Rollout Validation and Monitoring
**Version:** 1.0.0
**Date:** 2026-01-19

---

## Overview

This document specifies the monitoring dashboards for the FileExplorer migration rollout. These dashboards provide real-time visibility into performance, stability, and user experience metrics.

### Dashboard Architecture

```
┌─────────────────────────────────────────────────┐
│         Rollout Monitoring System              │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌──────────────┐  ┌──────────────┐            │
│  │  Dashboard 1  │  │  Dashboard 2  │            │
│  │   Rollout    │  │ Performance  │            │
│  │   Status     │  │   Metrics    │            │
│  └──────────────┘  └──────────────┘            │
│                                                 │
│  ┌──────────────┐  ┌──────────────┐            │
│  │  Dashboard 3  │  │  Dashboard 4  │            │
│  │    Error     │  │     User     │            │
│  │  Tracking    │  │  Experience  │            │
│  └──────────────┘  └──────────────┘            │
│                                                 │
│  ┌──────────────────────────────────┐          │
│  │      Alerting & Escalation       │          │
│  └──────────────────────────────────┘          │
└─────────────────────────────────────────────────┘
```

---

## Dashboard 1: Rollout Status

### Purpose
Real-time overview of rollout progress, feature flag status, and system health.

### Target Audience
- Engineering team
- Product managers
- On-call engineers
- Leadership (executive view)

### Refresh Rate
**1 minute** (real-time)

---

### Layout

```
┌─────────────────────────────────────────────────────────────┐
│  ROLLOUT STATUS DASHBOARD                   Last Updated: 1m│
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  CURRENT STAGE: [Gradual Expansion - 50%]  🟢 HEALTHY      │
│  Started: 2026-01-15  Elapsed: 4 days                       │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│  FEATURE FLAGS                                               │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │useMuiXRender│  │ dndInternal  │  │ dndExternal  │      │
│  │   🟢 50%    │  │   🟢 50%    │  │   🟢 50%    │      │
│  │  5,000 users │  │  5,000 users │  │  5,000 users │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                              │
│  ┌──────────────┐                                           │
│  │  dndTrash    │                                           │
│  │   🟢 50%    │                                           │
│  │  5,000 users │                                           │
│  └──────────────┘                                           │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│  HEALTH METRICS                                              │
│                                                              │
│  Error Rate:        0.08%  🟢 Target: <0.1%                 │
│  P95 Render Time:   445ms  🟢 Target: <500ms                │
│  P95 Drag Latency:  38ms   🟢 Target: <50ms                 │
│  Crash-Free Rate:   99.95% 🟢 Target: >99.9%                │
│  User Satisfaction: 4.2/5  🟢 Target: >4.0/5                │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│  TRAFFIC DISTRIBUTION                                        │
│                                                              │
│  [████████████████████░░░░░░░░░░░░░░░░] 50% New (5,000)    │
│  [░░░░░░░░░░░░░░░░░░░░████████████████] 50% Legacy (5,000) │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│  ACTIVE ALERTS                                               │
│                                                              │
│  ✅ No active alerts                                         │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│  RECENT INCIDENTS                                            │
│                                                              │
│  📅 2026-01-18  Resolved: P2 - Drag latency spike (resolved)│
│  📅 2026-01-16  Resolved: P3 - UI alignment issue (fixed)   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

### Metrics

#### 1. Current Stage
**Display:** Large text indicator
**Values:**
- Internal Beta
- Limited Production (Beta)
- Canary Rollout
- Gradual Expansion
- Full Rollout
- Stabilization

**Color Coding:**
- 🟢 Green: On track
- 🟡 Yellow: Attention needed
- 🔴 Red: Issues detected

#### 2. Feature Flag Status Cards

**Per Flag Display:**
```typescript
interface FeatureFlagCard {
  name: string;              // "useMuiXRendering"
  displayName: string;       // "MUI X Rendering"
  status: 'enabled' | 'disabled' | 'emergency';
  trafficPercentage: number; // 0-100
  exposedUsers: number;      // Actual user count
  healthStatus: 'healthy' | 'degraded' | 'error';
}
```

**Color Coding:**
- 🟢 Green: Healthy
- 🟡 Yellow: Degraded performance
- 🔴 Red: Errors detected
- ⚫ Gray: Disabled

**Click Action:** Drill down to feature-specific metrics

#### 3. Health Metrics Summary

**Displayed Metrics:**
```typescript
interface HealthMetrics {
  errorRate: number;          // % of sessions with errors
  p95RenderTime: number;      // ms
  p95DragLatency: number;     // ms
  crashFreeRate: number;      // %
  userSatisfaction: number;   // 1-5 scale
}
```

**Each Metric Shows:**
- Current value
- Target value
- Status indicator (🟢/🟡/🔴)
- Trend arrow (↑/↓/→)

**Thresholds:**
- 🟢 Green: Within target
- 🟡 Yellow: 10% over target
- 🔴 Red: 20% over target or exceeds limit

#### 4. Traffic Distribution

**Visualization:** Horizontal stacked bar chart

**Data:**
- % of users on new implementation
- % of users on legacy implementation
- Absolute user counts
- User cohort distribution

**Interactive:** Click to see user segments

#### 5. Active Alerts

**Display:** Alert list with severity

**Alert Format:**
```typescript
interface Alert {
  severity: 'P0' | 'P1' | 'P2' | 'P3';
  timestamp: Date;
  title: string;
  description: string;
  affectedFeature: string;
  status: 'active' | 'investigating' | 'resolved';
}
```

**Example:**
```
🔴 P1 - Error rate elevated to 0.15% (Active)
   Affecting: dndExternal, Started: 2m ago
   [View Details] [Acknowledge]
```

#### 6. Recent Incidents

**Display:** Timeline of last 10 incidents

**Incident Format:**
```typescript
interface Incident {
  date: Date;
  severity: 'P0' | 'P1' | 'P2' | 'P3';
  title: string;
  status: 'resolved' | 'investigating';
  resolution?: string;
}
```

---

### Implementation

#### Data Sources

```typescript
// Real-time metrics endpoint
interface RolloutStatusAPI {
  getCurrentStage(): Promise<RolloutStage>;
  getFeatureFlags(): Promise<FeatureFlagStatus[]>;
  getHealthMetrics(): Promise<HealthMetrics>;
  getTrafficDistribution(): Promise<TrafficDistribution>;
  getActiveAlerts(): Promise<Alert[]>;
  getRecentIncidents(): Promise<Incident[]>;
}

// WebSocket for real-time updates
const ws = new WebSocket('wss://api.example.com/rollout-status');
ws.onmessage = (event) => {
  const update = JSON.parse(event.data);
  updateDashboard(update);
};
```

#### React Component Example

```tsx
import React, { useEffect, useState } from 'react';
import { Box, Card, Typography, Chip, LinearProgress } from '@mui/material';

interface RolloutStatusDashboardProps {
  refreshInterval?: number; // ms
}

export function RolloutStatusDashboard({
  refreshInterval = 60000
}: RolloutStatusDashboardProps) {
  const [status, setStatus] = useState<RolloutStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const data = await fetch('/api/rollout-status').then(r => r.json());
        setStatus(data);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch rollout status:', error);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  if (loading) return <LinearProgress />;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Rollout Status Dashboard
      </Typography>

      {/* Current Stage */}
      <Card sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6">
          Current Stage: {status.currentStage}
        </Typography>
        <Chip
          label={getHealthStatus(status)}
          color={getHealthColor(status)}
        />
      </Card>

      {/* Feature Flags */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2, mb: 2 }}>
        {status.featureFlags.map(flag => (
          <FeatureFlagCard key={flag.name} flag={flag} />
        ))}
      </Box>

      {/* Health Metrics */}
      <Card sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6">Health Metrics</Typography>
        <HealthMetricsDisplay metrics={status.healthMetrics} />
      </Card>

      {/* Active Alerts */}
      {status.activeAlerts.length > 0 && (
        <Card sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6">Active Alerts</Typography>
          <AlertList alerts={status.activeAlerts} />
        </Card>
      )}
    </Box>
  );
}
```

---

## Dashboard 2: Performance Metrics

### Purpose
Detailed performance tracking against benchmarks and targets.

### Target Audience
- Engineering team
- Performance engineers
- QA team

### Refresh Rate
**5 minutes**

---

### Layout

```
┌─────────────────────────────────────────────────────────────┐
│  PERFORMANCE METRICS DASHBOARD              Last Updated: 5m│
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  RENDER PERFORMANCE                                          │
│                                                              │
│  [Line Chart: Render Time Percentiles - Last 24 Hours]      │
│  │                                                           │
│  │  500ms ┼ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ Target (P95) ─ ─ ─ ─     │
│  │        │              ▲                                   │
│  │  400ms ┼─────────────●●●──────────────────────           │
│  │        │          ●●●   ●●●                               │
│  │  300ms ┼────────●●           ●●●──────────────           │
│  │        │     ●●●                  ●●●                     │
│  │  200ms ┼───●●                        ●●●───────           │
│  │        │                                                  │
│  └────────┴─────────────────────────────────────────        │
│           0h    6h    12h   18h   24h                        │
│                                                              │
│  P50: 380ms  P95: 445ms 🟢  P99: 510ms 🟡                   │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│  DRAG & DROP PERFORMANCE                                     │
│                                                              │
│  [Histogram: Drag Latency Distribution]                     │
│  │                                                           │
│  │     ████                                                  │
│  │     ████                                                  │
│  │     ████  ███                                             │
│  │   █████████████                                           │
│  │ ███████████████████                                       │
│  └────────────────────────────────                          │
│    0ms   25ms   50ms   75ms  100ms                           │
│              Target: <50ms (P95)                             │
│                                                              │
│  P50: 32ms  P95: 38ms 🟢  P99: 45ms 🟢                      │
│  Operations/sec: 125                                         │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│  RESOURCE USAGE                                              │
│                                                              │
│  Bundle Size:   81.52 KB (gzip) 🟢 Target: <126 KB          │
│  Memory Usage:  7.8 MB (1000 items) 🟢 Target: <10 MB       │
│  CPU Usage:     12% (average) 🟢                             │
│                                                              │
│  [Line Chart: Memory Usage Over Time - Last 7 Days]         │
│  │                                                           │
│  │  10MB ┼ ─ ─ ─ ─ ─ ─ ─ Target ─ ─ ─ ─ ─ ─ ─             │
│  │   8MB ┼───────────────────────────────────────           │
│  │   6MB ┼───────────────────────────────────────           │
│  │   4MB ┼───────────────────────────────────────           │
│  │   2MB ┼───────────────────────────────────────           │
│  └───────┴───────────────────────────────────────           │
│         Day1   Day2   Day3   Day4   Day5   Day6   Day7      │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│  FRAME RATE ANALYSIS                                         │
│                                                              │
│  [Timeline: FPS During Drag Operations]                     │
│  │                                                           │
│  │  60fps ┼──────────────────────────────────────           │
│  │  55fps ┼ ─ ─ ─ ─ ─ Target ─ ─ ─ ─ ─ ─ ─ ─               │
│  │  50fps ┼                                                  │
│  │  45fps ┼                                                  │
│  └────────┴─────────────────────────────────────            │
│           0s      5s      10s     15s     20s                │
│                                                              │
│  Average FPS: 60  P95 FPS: 58 🟢  Dropped Frames: 0.2%      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

### Metrics

#### 1. Render Performance

**Tracked Metrics:**
```typescript
interface RenderMetrics {
  // Percentiles
  p50RenderTime: number;  // ms
  p95RenderTime: number;  // ms
  p99RenderTime: number;  // ms

  // By Item Count
  renderTime100Items: number;  // ms
  renderTime1000Items: number; // ms
  renderTime5000Items: number; // ms

  // Breakdown
  componentRenderTime: number;    // ms
  pluginInitializationTime: number; // ms
  layoutCalculationTime: number;  // ms
}
```

**Visualizations:**
1. **Line Chart:** P50/P95/P99 render time over last 24 hours
2. **Bar Chart:** Render time by item count
3. **Stacked Area:** Render time breakdown by phase

**Targets:**
- P95 render time (1000 items): <500ms
- Component render: <300ms
- Plugin init: <100ms
- Layout calculation: <100ms

#### 2. Drag & Drop Performance

**Tracked Metrics:**
```typescript
interface DragMetrics {
  // Latency
  p50DragLatency: number;  // ms
  p95DragLatency: number;  // ms
  p99DragLatency: number;  // ms

  // Throughput
  dragOperationsPerSecond: number;
  dragOperationsPerMinute: number;

  // Success Rate
  successfulDrags: number;
  failedDrags: number;
  successRate: number; // %
}
```

**Visualizations:**
1. **Histogram:** Drag latency distribution
2. **Time Series:** Operations per second
3. **Gauge:** Success rate

**Targets:**
- P95 drag latency: <50ms
- Success rate: >99.5%

#### 3. Resource Usage

**Tracked Metrics:**
```typescript
interface ResourceMetrics {
  // Bundle Size
  bundleMinifiedKB: number;
  bundleGzippedKB: number;

  // Memory
  memoryUsageMB: number;
  memoryPeakMB: number;
  memoryGrowthRate: number; // MB/hour

  // CPU
  cpuUsagePercent: number;
  cpuPeakPercent: number;
}
```

**Visualizations:**
1. **Gauge:** Bundle size vs target
2. **Line Chart:** Memory usage over 7 days
3. **Area Chart:** CPU usage timeline

**Targets:**
- Bundle size (gzip): <126KB
- Memory usage: <10MB
- Memory growth: <1MB/hour
- CPU usage: <20% average

#### 4. Frame Rate Analysis

**Tracked Metrics:**
```typescript
interface FrameRateMetrics {
  averageFPS: number;
  p95FPS: number;
  p99FPS: number;
  droppedFrames: number;
  droppedFrameRate: number; // %
  jankEvents: number;
}
```

**Visualizations:**
1. **Timeline:** FPS during drag operation
2. **Gauge:** Average FPS
3. **Counter:** Dropped frames

**Targets:**
- P95 FPS: ≥55fps
- Dropped frame rate: <3%
- Jank events: <1 per minute

---

### Implementation

#### Data Collection

```typescript
// Performance Observer
const performanceObserver = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (entry.entryType === 'measure') {
      // Send to analytics
      sendMetric({
        name: entry.name,
        duration: entry.duration,
        timestamp: entry.startTime,
      });
    }
  }
});

performanceObserver.observe({
  entryTypes: ['measure', 'navigation', 'resource']
});

// Custom render measurement
performance.mark('file-explorer-render-start');
// ... render FileExplorer ...
performance.mark('file-explorer-render-end');
performance.measure(
  'file-explorer-render',
  'file-explorer-render-start',
  'file-explorer-render-end'
);
```

#### React Component Example

```tsx
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

export function PerformanceMetricsDashboard() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      const data = await fetch('/api/performance-metrics').then(r => r.json());
      setMetrics(data);
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 5 * 60 * 1000); // 5 minutes
    return () => clearInterval(interval);
  }, []);

  if (!metrics) return <LinearProgress />;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4">Performance Metrics</Typography>

      {/* Render Performance */}
      <Card sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6">Render Performance</Typography>
        <LineChart width={800} height={300} data={metrics.renderTimeHistory}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="timestamp" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="p50" stroke="#8884d8" name="P50" />
          <Line type="monotone" dataKey="p95" stroke="#82ca9d" name="P95" />
          <Line type="monotone" dataKey="p99" stroke="#ffc658" name="P99" />
          <ReferenceLine y={500} stroke="red" strokeDasharray="3 3" label="Target" />
        </LineChart>

        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          <MetricCard
            label="P50 Render Time"
            value={`${metrics.p50RenderTime}ms`}
            status={metrics.p50RenderTime < 400 ? 'success' : 'warning'}
          />
          <MetricCard
            label="P95 Render Time"
            value={`${metrics.p95RenderTime}ms`}
            target="<500ms"
            status={metrics.p95RenderTime < 500 ? 'success' : 'error'}
          />
          <MetricCard
            label="P99 Render Time"
            value={`${metrics.p99RenderTime}ms`}
            status={metrics.p99RenderTime < 600 ? 'success' : 'warning'}
          />
        </Box>
      </Card>

      {/* Drag Performance */}
      <Card sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6">Drag & Drop Performance</Typography>
        {/* Histogram component */}
        <DragLatencyHistogram data={metrics.dragLatencyDistribution} />

        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          <MetricCard
            label="P95 Drag Latency"
            value={`${metrics.p95DragLatency}ms`}
            target="<50ms"
            status={metrics.p95DragLatency < 50 ? 'success' : 'error'}
          />
          <MetricCard
            label="Operations/sec"
            value={metrics.dragOperationsPerSecond}
          />
        </Box>
      </Card>

      {/* Resource Usage */}
      <Card sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6">Resource Usage</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <MetricCard
            label="Bundle Size (gzip)"
            value={`${metrics.bundleGzippedKB} KB`}
            target="<126 KB"
            status={metrics.bundleGzippedKB < 126 ? 'success' : 'error'}
          />
          <MetricCard
            label="Memory Usage"
            value={`${metrics.memoryUsageMB} MB`}
            target="<10 MB"
            status={metrics.memoryUsageMB < 10 ? 'success' : 'error'}
          />
          <MetricCard
            label="CPU Usage"
            value={`${metrics.cpuUsagePercent}%`}
            status={metrics.cpuUsagePercent < 20 ? 'success' : 'warning'}
          />
        </Box>
      </Card>
    </Box>
  );
}
```

---

## Dashboard 3: Error Tracking

### Purpose
Monitor errors, stability, and identify issues requiring attention.

### Target Audience
- On-call engineers
- QA team
- Engineering team

### Refresh Rate
**1 minute** (real-time for errors)

---

### Layout

```
┌─────────────────────────────────────────────────────────────┐
│  ERROR TRACKING DASHBOARD                   Last Updated: 1m│
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ERROR RATE OVERVIEW                                         │
│                                                              │
│  Current Error Rate: 0.08% 🟢 Target: <0.1%                 │
│  Sessions with Errors: 8 / 10,000                            │
│  Total Errors (24h): 245                                     │
│                                                              │
│  [Line Chart: Error Rate - Last 24 Hours]                   │
│  │                                                           │
│  │ 0.5% ┼                                                    │
│  │ 0.4% ┼                                                    │
│  │ 0.3% ┼                                                    │
│  │ 0.2% ┼                                                    │
│  │ 0.1% ┼ ─ ─ ─ ─ ─ Target ─ ─ ─ ─ ─ ─ ─ ─                │
│  │ 0.0% ┼────────────────────────────────────               │
│  └──────┴─────────────────────────────────────              │
│         0h    6h    12h   18h   24h                          │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│  ERROR BREAKDOWN                                             │
│                                                              │
│  [Pie Chart: Errors by Type]                                │
│                                                              │
│      JavaScript Errors: 120 (49%)  [████████]               │
│      Render Errors:      65 (27%)  [████]                   │
│      DnD Errors:         45 (18%)  [███]                    │
│      Plugin Errors:      15 (6%)   [█]                      │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│  ERRORS BY SEVERITY                                          │
│                                                              │
│  P0 (Critical):  0  🟢                                       │
│  P1 (High):      2  🟡 [View Details]                       │
│  P2 (Medium):    8  🟢                                       │
│  P3 (Low):      15  🟢                                       │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│  TOP 10 ERRORS                                               │
│                                                              │
│  1. TypeError: Cannot read property 'id'   (45 occurrences) │
│     Last seen: 5m ago  Severity: P2  [View Stack Trace]     │
│                                                              │
│  2. RenderError: Component failed to render (32 occurrences)│
│     Last seen: 12m ago  Severity: P1  [View Stack Trace]    │
│                                                              │
│  3. DnDError: Drop target not found        (28 occurrences) │
│     Last seen: 3m ago  Severity: P2  [View Stack Trace]     │
│                                                              │
│  [Show More]                                                 │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│  NEW ERRORS (Last 4 Hours)                                   │
│                                                              │
│  🔴 NEW: ReferenceError: expandedItems not defined          │
│     First seen: 35m ago  Occurrences: 5  Severity: P1       │
│     [Investigate] [Create Ticket]                            │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│  STABILITY METRICS                                           │
│                                                              │
│  Crash-Free Rate:      99.95% 🟢 Target: >99.9%             │
│  Successful Renders:   99.8%  🟢 Target: >99.5%             │
│  Feature Flag Errors:  0      🟢                             │
│  Rollback Events:      0      🟢                             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

### Metrics

#### 1. Error Rate Overview

**Tracked Metrics:**
```typescript
interface ErrorRateMetrics {
  // Overall
  errorRate: number;              // % of sessions with errors
  totalErrors: number;            // Count in time period
  sessionsWithErrors: number;     // Count of affected sessions
  totalSessions: number;          // Total sessions

  // Trend
  errorRateTrend: number[];       // Historical data
  errorRateChange: number;        // % change from previous period
}
```

**Thresholds:**
- 🟢 Green: <0.1%
- 🟡 Yellow: 0.1-0.3%
- 🔴 Red: >0.3%

**Alerts:**
- Error rate >0.2% for 15 minutes → P2 alert
- Error rate >0.5% for 5 minutes → P1 alert
- Error rate >1.0% for 1 minute → P0 alert (emergency)

#### 2. Error Breakdown by Type

**Error Types:**
```typescript
enum ErrorType {
  JAVASCRIPT = 'JavaScript Errors',      // Runtime errors
  RENDER = 'Render Errors',              // React render errors
  DND = 'DnD Errors',                    // Drag-and-drop errors
  PLUGIN = 'Plugin Errors',              // Plugin-related errors
  NETWORK = 'Network Errors',            // API/network errors
  UNKNOWN = 'Unknown Errors',            // Uncategorized
}

interface ErrorBreakdown {
  [ErrorType.JAVASCRIPT]: number;
  [ErrorType.RENDER]: number;
  [ErrorType.DND]: number;
  [ErrorType.PLUGIN]: number;
  [ErrorType.NETWORK]: number;
  [ErrorType.UNKNOWN]: number;
}
```

**Visualization:** Pie chart or donut chart

**Click Action:** Filter error list by type

#### 3. Errors by Severity

**Severity Levels:**
```typescript
interface ErrorsBySeverity {
  p0Critical: number;   // App crash, data loss
  p1High: number;       // Major feature broken
  p2Medium: number;     // Minor feature degraded
  p3Low: number;        // Cosmetic issues
}
```

**Thresholds:**
- P0: 0 tolerated → Immediate escalation
- P1: <5 per week → P1 alert if exceeded
- P2: <20 per week → Monitor
- P3: Track only

#### 4. Top Errors List

**Error Summary:**
```typescript
interface ErrorSummary {
  id: string;
  message: string;
  type: ErrorType;
  severity: 'P0' | 'P1' | 'P2' | 'P3';
  occurrences: number;
  firstSeen: Date;
  lastSeen: Date;
  stackTrace: string;
  affectedUsers: number;
  affectedFeatures: string[];
}
```

**Display:**
- Top 10 by occurrence count
- Sortable by: occurrences, last seen, severity
- Expandable for full stack trace
- Actions: View details, Create ticket, Mark as known

#### 5. New Errors Detection

**New Error Criteria:**
- Error pattern not seen in last 7 days
- Error message is unique
- Error stack trace is unique

**Alert:**
- New P0/P1 error → Immediate notification
- New P2 error → Daily summary
- New P3 error → Weekly summary

#### 6. Stability Metrics

**Tracked:**
```typescript
interface StabilityMetrics {
  crashFreeRate: number;          // % of sessions without crash
  successfulRenders: number;      // % of successful renders
  featureFlagErrors: number;      // Flag loading errors
  rollbackEvents: number;         // Emergency rollbacks
}
```

**Targets:**
- Crash-free rate: >99.9%
- Successful renders: >99.5%
- Feature flag errors: 0
- Rollback events: 0

---

### Implementation

#### Error Tracking Setup

```typescript
// Global error handler
window.addEventListener('error', (event) => {
  const error: ErrorReport = {
    type: 'javascript',
    message: event.message,
    stack: event.error?.stack,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href,
  };

  // Send to error tracking service
  trackError(error);
});

// React Error Boundary
class ErrorBoundary extends React.Component {
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const errorReport: ErrorReport = {
      type: 'render',
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
    };

    trackError(errorReport);
  }
}

// Custom error tracking
function trackError(error: ErrorReport) {
  // Classify severity
  const severity = classifyErrorSeverity(error);

  // Add context
  const enrichedError = {
    ...error,
    severity,
    featureFlags: getCurrentFeatureFlags(),
    userId: getCurrentUserId(),
    sessionId: getSessionId(),
  };

  // Send to backend
  fetch('/api/errors', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(enrichedError),
  });
}
```

#### Error Classification

```typescript
function classifyErrorSeverity(error: ErrorReport): 'P0' | 'P1' | 'P2' | 'P3' {
  // P0: Critical
  if (
    error.message.includes('Cannot render application') ||
    error.message.includes('data loss') ||
    error.type === 'security'
  ) {
    return 'P0';
  }

  // P1: High
  if (
    error.message.includes('Component failed') ||
    error.message.includes('Feature unavailable') ||
    error.affectedUsers > 100
  ) {
    return 'P1';
  }

  // P2: Medium
  if (
    error.message.includes('degraded') ||
    error.affectedUsers > 10
  ) {
    return 'P2';
  }

  // P3: Low
  return 'P3';
}
```

---

## Dashboard 4: User Experience

### Purpose
Track user satisfaction, feature adoption, and engagement metrics.

### Target Audience
- Product managers
- Engineering team
- Leadership

### Refresh Rate
**1 hour**

---

### Layout

```
┌─────────────────────────────────────────────────────────────┐
│  USER EXPERIENCE DASHBOARD                  Last Updated: 1h│
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  USER SATISFACTION                                           │
│                                                              │
│  Average Score: 4.2 / 5.0 🟢 Target: >4.0                   │
│  Responses: 1,234 (12% of users)                             │
│                                                              │
│  [Bar Chart: Satisfaction Distribution]                     │
│  │                                                           │
│  │ 5★ ████████████████████████████  560 (45%)               │
│  │ 4★ ████████████████████          420 (34%)               │
│  │ 3★ ████████                      154 (13%)               │
│  │ 2★ ████                           80 (6%)                │
│  │ 1★ ██                             20 (2%)                │
│  └──────────────────────────────────────────                │
│                                                              │
│  [Line Chart: Satisfaction Trend - Last 30 Days]            │
│  │                                                           │
│  │ 5.0 ┼                                                     │
│  │ 4.5 ┼                                                     │
│  │ 4.0 ┼ ─ ─ ─ ─ ─ Target ─ ─ ─ ─ ─ ─ ─ ─                │
│  │ 3.5 ┼                                                     │
│  │ 3.0 ┼                                                     │
│  └─────┴────────────────────────────────────                │
│       Week1  Week2  Week3  Week4                             │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│  FEATURE ADOPTION                                            │
│                                                              │
│  Overall Adoption: 58% 🟢 Target: >50%                      │
│  (Users who used any new feature at least once)             │
│                                                              │
│  Feature-Specific Adoption:                                 │
│  Internal DnD:  72% ████████████████████  7,200 users       │
│  External DnD:  45% ████████████          4,500 users       │
│  Trash:         38% ██████████            3,800 users       │
│                                                              │
│  [Funnel Chart: Adoption Funnel]                            │
│  Exposed Users:     10,000  █████████████████████           │
│  Viewed Feature:     8,500  ████████████████                │
│  Tried Feature:      5,800  ████████████                    │
│  Regular Users:      3,200  ███████                         │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│  ENGAGEMENT METRICS                                          │
│                                                              │
│  Avg Session Duration:       8.5 minutes                     │
│  File Operations/Session:    12.3                            │
│  Return User Rate:           78% (day 7)                     │
│  Feature Usage Frequency:    3.2 times/session              │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│  SUPPORT TICKETS                                             │
│                                                              │
│  This Week: 4 tickets 🟢 Target: <5/week                    │
│  Last Week: 6 tickets                                        │
│  Trend: ↓ Decreasing                                         │
│                                                              │
│  [Bar Chart: Tickets by Priority]                           │
│  P0: 0  P1: 1  P2: 2  P3: 1                                 │
│                                                              │
│  [Table: Recent Tickets]                                    │
│  ID     Priority  Title                        Status       │
│  #1234  P1       Drag fails in Safari         In Progress  │
│  #1235  P2       Trash icon not visible       Resolved     │
│  #1236  P3       Minor UI alignment           Backlog      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

### Metrics

#### 1. User Satisfaction

**Collection:**
```typescript
interface SatisfactionSurvey {
  question: string;
  scale: 1 | 2 | 3 | 4 | 5;
  feedback?: string;
  timestamp: Date;
  userId: string;
  featureUsed: string;
}

// In-app survey
function showSatisfactionSurvey() {
  return (
    <Dialog>
      <DialogTitle>How was your experience?</DialogTitle>
      <DialogContent>
        <Rating
          value={rating}
          onChange={(e, value) => {
            submitSatisfaction({
              rating: value,
              feature: 'file-explorer',
              timestamp: new Date(),
            });
          }}
        />
        <TextField
          label="Additional feedback (optional)"
          multiline
          rows={3}
        />
      </DialogContent>
    </Dialog>
  );
}
```

**Display:**
- Average score (weighted)
- Distribution bar chart
- Trend line (30 days)
- Response rate

**Targets:**
- Average: >4.0/5
- Response rate: >10%
- Trend: Stable or improving

#### 2. Feature Adoption

**Tracked:**
```typescript
interface FeatureAdoption {
  // Overall
  overallAdoption: number;        // % of users who used any feature

  // Per Feature
  dndInternalAdoption: number;    // % used internal DnD
  dndExternalAdoption: number;    // % used external DnD
  trashAdoption: number;          // % used trash

  // Funnel
  exposedUsers: number;           // Saw the feature
  viewedUsers: number;            // Interacted with UI
  triedUsers: number;             // Used feature once
  regularUsers: number;           // Used 3+ times
}
```

**Targets:**
- Week 1: >20%
- Week 2: >35%
- Week 4: >50%
- Week 8: >65%

#### 3. Engagement Metrics

**Tracked:**
```typescript
interface EngagementMetrics {
  averageSessionDuration: number;      // minutes
  fileOperationsPerSession: number;    // count
  returnUserRate: number;              // % (day 7)
  featureUsageFrequency: number;       // times per session
  dailyActiveUsers: number;            // count
  weeklyActiveUsers: number;           // count
}
```

**Analysis:**
- Session duration trend
- Operations per session distribution
- Return user cohort analysis
- Usage frequency histogram

#### 4. Support Tickets

**Tracked:**
```typescript
interface SupportTickets {
  // Counts
  thisWeek: number;
  lastWeek: number;
  thisMonth: number;

  // By Priority
  p0Count: number;
  p1Count: number;
  p2Count: number;
  p3Count: number;

  // Metrics
  averageResolutionTime: number;  // hours
  firstResponseTime: number;      // minutes
  customerSatisfaction: number;   // 1-5
}
```

**Targets:**
- Total: <5/week steady state
- P0: 0
- P1: <2/week
- Resolution time: <24 hours
- First response: <2 hours

---

## Alerting & Escalation

### Alert Configuration

#### Performance Alerts

```typescript
const performanceAlerts: AlertRule[] = [
  {
    name: 'P95 Render Time High',
    condition: 'p95RenderTime > 550',
    severity: 'P1',
    duration: '15 minutes',
    notification: ['slack', 'email'],
  },
  {
    name: 'P95 Drag Latency High',
    condition: 'p95DragLatency > 60',
    severity: 'P1',
    duration: '10 minutes',
    notification: ['slack'],
  },
  {
    name: 'Bundle Size Exceeded',
    condition: 'bundleGzippedKB > 130',
    severity: 'P2',
    duration: 'immediate',
    notification: ['slack'],
  },
  {
    name: 'Memory Leak Detected',
    condition: 'memoryGrowthRate > 5',
    severity: 'P0',
    duration: '1 hour',
    notification: ['pagerduty', 'slack', 'email'],
  },
];
```

#### Error Alerts

```typescript
const errorAlerts: AlertRule[] = [
  {
    name: 'Critical Error',
    condition: 'p0Errors > 0',
    severity: 'P0',
    duration: 'immediate',
    notification: ['pagerduty', 'slack', 'email'],
    escalation: true,
  },
  {
    name: 'Error Rate High',
    condition: 'errorRate > 0.5',
    severity: 'P1',
    duration: '5 minutes',
    notification: ['pagerduty', 'slack'],
  },
  {
    name: 'Error Rate Elevated',
    condition: 'errorRate > 0.2',
    severity: 'P2',
    duration: '15 minutes',
    notification: ['slack'],
  },
  {
    name: 'New High Severity Error',
    condition: 'newP1Error = true',
    severity: 'P1',
    duration: 'immediate',
    notification: ['slack', 'email'],
  },
];
```

#### User Experience Alerts

```typescript
const uxAlerts: AlertRule[] = [
  {
    name: 'Satisfaction Drop',
    condition: 'userSatisfaction < 3.5',
    severity: 'P1',
    duration: '24 hours',
    notification: ['slack', 'email'],
  },
  {
    name: 'Support Ticket Spike',
    condition: 'weeklyTickets > 10',
    severity: 'P2',
    duration: 'weekly',
    notification: ['slack'],
  },
  {
    name: 'Crash Rate High',
    condition: 'crashFreeRate < 99.5',
    severity: 'P0',
    duration: '1 hour',
    notification: ['pagerduty', 'slack', 'email'],
  },
];
```

### Notification Channels

#### Slack Integration

```typescript
interface SlackNotification {
  channel: string;           // #incidents, #monitoring
  severity: 'P0' | 'P1' | 'P2' | 'P3';
  message: string;
  alert: AlertRule;
  dashboardLink: string;
}

function sendSlackAlert(notification: SlackNotification) {
  const color = {
    P0: '#FF0000',
    P1: '#FFA500',
    P2: '#FFFF00',
    P3: '#0000FF',
  }[notification.severity];

  const payload = {
    channel: notification.channel,
    attachments: [{
      color,
      title: `${notification.severity} Alert: ${notification.alert.name}`,
      text: notification.message,
      fields: [
        { title: 'Severity', value: notification.severity, short: true },
        { title: 'Duration', value: notification.alert.duration, short: true },
      ],
      actions: [
        { type: 'button', text: 'View Dashboard', url: notification.dashboardLink },
        { type: 'button', text: 'Acknowledge', url: '/api/alerts/acknowledge' },
      ],
    }],
  };

  return fetch(SLACK_WEBHOOK_URL, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
```

#### Email Notifications

```typescript
interface EmailNotification {
  to: string[];
  subject: string;
  alert: AlertRule;
  metrics: Record<string, any>;
}

function sendEmailAlert(notification: EmailNotification) {
  const html = `
    <h2>${notification.alert.name}</h2>
    <p><strong>Severity:</strong> ${notification.alert.severity}</p>
    <p><strong>Condition:</strong> ${notification.alert.condition}</p>
    <h3>Current Metrics:</h3>
    <ul>
      ${Object.entries(notification.metrics).map(([key, value]) =>
        `<li><strong>${key}:</strong> ${value}</li>`
      ).join('')}
    </ul>
    <a href="${DASHBOARD_URL}">View Dashboard</a>
  `;

  return sendEmail({
    to: notification.to,
    subject: notification.subject,
    html,
  });
}
```

#### PagerDuty Integration

```typescript
interface PagerDutyAlert {
  severity: 'critical' | 'error' | 'warning' | 'info';
  summary: string;
  source: string;
  details: Record<string, any>;
}

function triggerPagerDuty(alert: PagerDutyAlert) {
  return fetch('https://events.pagerduty.com/v2/enqueue', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Token ${PAGERDUTY_API_KEY}`,
    },
    body: JSON.stringify({
      routing_key: PAGERDUTY_ROUTING_KEY,
      event_action: 'trigger',
      payload: {
        summary: alert.summary,
        severity: alert.severity,
        source: alert.source,
        custom_details: alert.details,
      },
    }),
  });
}
```

---

## Summary

### Dashboard Overview

| Dashboard | Purpose | Audience | Refresh | Priority |
|-----------|---------|----------|---------|----------|
| **Rollout Status** | Real-time health | All | 1 min | P0 |
| **Performance** | Detailed metrics | Engineers | 5 min | P1 |
| **Error Tracking** | Stability monitoring | On-call | 1 min | P0 |
| **User Experience** | Satisfaction & adoption | Product | 1 hour | P2 |

### Key Success Metrics

**Performance:**
- ✅ P95 render time: <500ms
- ✅ P95 drag latency: <50ms
- ✅ Bundle size: <126KB gzip
- ✅ Memory usage: <10MB
- ✅ Frame rate: ≥55fps

**Stability:**
- ✅ Error rate: <0.1%
- ✅ Crash-free rate: >99.9%
- ✅ No P0 bugs
- ✅ <3 P1 bugs

**User Experience:**
- ✅ Satisfaction: >4.0/5
- ✅ Adoption: >50% (week 4)
- ✅ Support tickets: <5/week

### Implementation Priority

1. **Phase 1 (Week 1):** Rollout Status Dashboard + Error Tracking
2. **Phase 2 (Week 2):** Performance Metrics Dashboard
3. **Phase 3 (Week 3):** User Experience Dashboard
4. **Phase 4 (Week 4):** Alerting & Escalation automation

---

**Document Version:** 1.0.0
**Last Updated:** 2026-01-19
**Status:** Ready for Implementation
