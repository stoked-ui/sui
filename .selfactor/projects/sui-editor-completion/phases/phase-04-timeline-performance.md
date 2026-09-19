# Phase 4: Timeline & Preview Performance

**Purpose:** Smooth scrubbing and playback for 5–15 track editor-scale projects.

**Depends on:** Phase 3 complete.

| Item | Title | Verify (summary) |
|------|-------|------------------|
| 4.1 | Scrub path engine-only updates | ≤1 dispatch per scrub gesture |
| 4.2 | Reducer map rebuild scope | SET_SETTING cursor skips map rebuild |
| 4.3 | React.memo timeline clips | memo on Action + Track |
| 4.4 | Horizontal viewport culling | off-screen actions not mounted |
| 4.5 | Playback playhead React reduction | ≤10 dispatches/sec during play |
| 4.6 | deal_data unit tests | ≥8 time/pixel tests |

**Phase gate:** All 6 items verified → Fable may start Phase 5.