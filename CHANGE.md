# CHANGE.md

## 2026-03-28

### Documentation

- Expanded `README.md` into a more npm-ready package overview with badges, features, requirements, supported environments, and subpath import guidance.
- Added usage examples for `debounce`, `throttle`, `debouncedSignal`, `useDebounce`, `useThrottled`, and `useDebounceSignal`.
- Updated README positioning to reflect the current public API, including React hook support and throttle support.
- Updated API docs for `debounce` options to explicitly describe `behavior: 'leading' | 'trailing'`.
- Added a dedicated "More Examples" section in `README.md` with direct file references for core and React scenarios.

### Examples

- Added `src/example/debounce.behavior.example.ts` to cover `leading` and `trailing` debounce behavior.
- Added `src/example/debounce.abort-signal.example.ts` to demonstrate external `AbortSignal` usage.
- Added `src/example/throttle.example.ts` to demonstrate throttling high-frequency events.
- Added `src/example/react/ThrottledMouseTracker.tsx` to demonstrate `useThrottled` in React.

### Tests

- Added explicit debounce tests for `options.behavior` to verify both `leading` and `trailing` behaviors.
- Added React hook regression tests to verify `useDebounce` and `useDebounceSignal` recreate memoized handlers/controllers when `options.behavior` changes.

### Maintenance

- Cleaned up Vitest module-mocking warnings by replacing hoisted `vi.unmock(...)` usage in test cleanup with `vi.doUnmock(...)`.

### Security

- Clarified CVE policy in `CVE_CHECKLIST.md` for production release gating and dev tooling tracking.
- `pnpm run check:cve` is the production dependency release gate.
- `pnpm run check:cve:full` is used to track dev tooling vulnerabilities.
- Added `pnpm.overrides` in `package.json` to force patched transitive versions for `picomatch` and `brace-expansion`.
- Refreshed lockfile resolution so audit checks use patched transitive versions.
- Verified both `pnpm audit --audit-level moderate` and `pnpm audit --prod --audit-level moderate` pass.

### CI

- Updated GitHub Actions step labels and notes in `.github/workflows/ci.yml` to distinguish release-gate CVE checks from dev tooling vulnerability tracking.

## 2026-03-24

### Fixed

- Updated throttle tests to match current throttle behavior (immediate call + trailing latest call).
- Added throttle cancellation test coverage.
- Fixed failing `pnpm test` caused by outdated throttle expectations.

### Documentation

- Rewrote `README.md` to match the current public API.
- Updated `debouncedSignal` naming to replace older `createDebouncedSignal` references.
- Added subpath import guidance for `/debounce`, `/debounceSignal`, `/throttle`, `/react`, and `/types`.
- Added strict type-only guidance for `kk-debounce/types`.
- Added throttle behavior and React hook sections.

### Notes

- `kk-debounce/types` is type-only by design; runtime import is intentionally blocked.
