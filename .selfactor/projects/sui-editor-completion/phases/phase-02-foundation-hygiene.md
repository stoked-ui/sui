# Phase 2: Foundation Hygiene & Dead Code Removal

**Purpose:** Trustworthy signal — remove dead MUI X path, console noise, compiled artifacts.

**Depends on:** Phase 1 complete.

| Item | Title | Verify (summary) |
|------|-------|------------------|
| 2.1 | Remove timeline console noise | grep Engine.ts clean; `timeline typescript` |
| 2.2 | Remove window.setSetting globals | grep `window.set` empty |
| 2.3 | Delete file-explorer MUI X dead code | 3 files deleted; `file-explorer build` |
| 2.4 | File-explorer console + icon DRY | shared `getIconFromMediaType` |
| 2.5 | Remove common compiled .js artifacts | `find *.js` count = 0 in common src |
| 2.6 | Fix Engine._dealClear BTree | unit test + `timeline typescript` |

**Phase gate:** All 6 items verified → Fable may start Phase 3.