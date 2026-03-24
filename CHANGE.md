# CHANGE.md

## 2026-03-24

### Fixed

- Updated throttle tests to match current throttle behavior (immediate call + trailing latest call).
- Added throttle cancellation test coverage.
- Fixed failing `pnpm test` caused by outdated throttle expectations.

### Documentation

- Rewrote `README.md` to match current public API:
- `debouncedSignal` naming (replacing older `createDebouncedSignal` references).
- Subpath imports (`/debounce`, `/debounceSignal`, `/throttle`, `/react`, `/types`).
- Strict type-only guidance for `kk-debounce/types`.
- Added throttle behavior and React hook sections.

### Notes

- `kk-debounce/types` is type-only by design; runtime import is intentionally blocked.
