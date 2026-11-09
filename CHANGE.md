# CHANGE.md

## 2026-11-09 — 1.1.1

### Fixed (#31)

- `debounce` now aborts with a standard `AbortError` (`DOMException`) instead of a plain string, so `fetch` rejects with an error whose `name` is `'AbortError'` and the README `try/catch` pattern works. With `withSignal`, a returned promise that rejects with that abort reason is no longer reported as an unhandled rejection.
- `throttle` no longer locks up for good when a queued (trailing) call throws, and a throwing first call still opens the window.
- `debounce` with `behavior: 'leading'` schedules its window before invoking, so a synchronous throw no longer disables debouncing; a call inside the window with `autoAbort` no longer aborts the running execution; `.cancel()` still aborts it after calls inside the window; and an already-aborted external `signal` prevents the call.
- `debouncedSignal` no longer leaves `isPending` stuck at `true` in leading mode, when the external `signal` aborts, or when the setter throws (including during `flush()`).
- `debouncedSignal` attaches its external `signal` listener only while an update is pending, so a long-lived signal no longer retains every controller created for it (for example by `useDebounceSignal` re-renders).
- React: `useDebounce` and `useDebounceSignal` now recreate when `withSignal` changes, and `useDebounce(..., { withSignal: true })` omits the signal parameter from its returned type.

### Changed

- The external `signal` is now honoured with one listener, attached only while a call is pending or in flight, instead of building an `AbortSignal.any()` composite on every call. Calls with an external signal are about 12x faster (~2,100 to ~170 ns per call) and no longer retain memory (1M calls previously grew the heap by ~1.1 GB). It also works in runtimes without `AbortSignal.any()`, where the option used to be ignored.
- `wait` is validated: values outside 0 – 2,147,483,647 ms (negative, `NaN`, `Infinity`, or more than ~24.8 days) throw a `RangeError` and a non-number temporal unit throws a `TypeError`, instead of silently firing after ~1 ms. Temporal objects only read their own properties.

### Upgrade notes

Released as a patch because these only affect inputs or patterns that did not work correctly before, but check them when upgrading:

- An unusable `wait` now throws at creation (inside React hooks that means during render) instead of firing after ~1 ms.
- `signal.reason` from `autoAbort` and `.cancel()` is now a `DOMException` named `AbortError`, not the strings `'Debounced: New call initiated'` / `'Debounced: Manually cancelled'`; code comparing against those strings must check `reason.name === 'AbortError'` instead.
- In leading mode and in `throttle`, a callback that throws synchronously still opens its window, so the next call inside the window does not run it again.

### Maintenance

- Updated `package.json` version to `1.1.1`.
- Updated `vitest` and `@vitest/coverage-v8` to 4.1.12 and `eslint` to 10.14.0, and added `pnpm` overrides for `esbuild` (via tsup) and `minimatch` (via eslint) to clear GHSA-qxg6-89mg-rqv8, GHSA-xp26-3454-mjgp, GHSA-g3hv-75wg-m249 and GHSA-g7r4-m6w7-qqqr; `pnpm audit` reports no advisories.
- CI: runs on Ubuntu, macOS and Windows with Node 22 and 24 (Node 20 is end-of-life), declares `permissions: contents: read`, and pins actions to commit SHAs. Added `.gitattributes` to keep LF line endings on Windows checkouts.

## 2026-10-12

### Fixed

- Fixed `autoAbort` not aborting in-flight async work (#28). The execution's controller now stays live until the promise returned by the callback settles, so a newer call (with `autoAbort`) or `.cancel()` aborts it. Previously the controller was cleared as soon as the callback started, so `autoAbort` only cancelled a pending timer.

### Added

- Added the `withSignal` option to `debounce`. When `true`, the execution's `AbortSignal` (merged with the external `signal`) is appended as the callback's last argument, and the returned function's type omits that parameter. It is opt-in, so existing callback signatures are unchanged.

### Documentation

- Updated the README async example to pass the signal to `fetch` with `withSignal: true`, and documented `withSignal` in the API reference.

### Maintenance

- Updated dev dependencies within their existing ranges (vite, vitest, eslint, tsup and their transitive packages) to clear `pnpm audit` advisories, and raised the `vite` override to `^7.3.7` to match.
- Updated `package.json` version to `1.1.0` (minor: `withSignal` is new API).

## 2026-03-30

### Fixed

- Fixed temporal object parameters (`{ hours, minutes, seconds, ms }`) causing unnecessary React hook recreation by destructuring wait values directly in dependency array instead of relying on object reference identity.
- Fixed `useDebounce`, `useThrottled`, and `useDebounceSignal` to properly track temporal object changes without re-creating debounced/throttled functions on each render.

### Changed

- Updated React peer dependency to support both React 18 and React 19: `"react": "^18.0.0 || ^19.0.0"`.
- Made React peer dependency optional via `peerDependenciesMeta` to allow non-React consumers to install the package without React dependency warnings.

### Added

- Added React 18 and React 19 compatibility matrix to GitHub Actions CI pipeline with separate type checking and test runs for each version.
- Added clarification in `README.md` that React is optional unless importing from `kk-debounce/react`.

### Maintenance

- Updated `package.json` version to `1.0.6`.

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
