# DEVELOP.md

Developer guide for kk-debounce maintainers.

## Goals

- Keep public API small, stable, and tree-shakable.
- Prevent regressions in timing behavior and signal handling.
- Maintain release quality with automated checks.

## Project Layout

- src/packages/debounce: core debounce implementation.
- src/packages/createDebounceSignal: reactive debounce helper.
- src/packages/types: public type contracts.
- src/utils: shared helper functions.
- src/__test__: unit tests.
- src/example: runnable examples and usage references.

## Commands

- Install: npm install
- Test (CI): npm test
- Test (watch): npm run test:watch
- Typecheck: npm run typecheck
- Build: npm run build
- CVE check (prod deps): npm run check:cve
- CVE check (all deps): npm run check:cve:full
- Full release gate: npm run check:all

## Development Techniques

- Use fake timers in tests for deterministic debounce assertions.
- Validate both number delays and temporal object delays.
- Verify cancel and flush behavior explicitly.
- Keep examples aligned with public API so docs and tests stay trustworthy.
- Avoid non-essential runtime dependencies to keep bundle tiny.

## Husky

- Hook file: .husky/pre-commit
- Current gate: npm run check:all
- Purpose: block commits that fail typecheck, tests, build, or CVE scan.

## Tree-Shaking and Bundle Size

- package.json uses sideEffects: false.
- tsup builds ESM + CJS + declaration files.
- Minification and treeshaking are enabled in tsup.config.ts.
- Check output size from build logs before release.

## Security and CVE Process

- Follow CVE_CHECKLIST.md before every publish.
- Do not publish with unresolved high/critical findings.
- Keep package-lock.json committed and current.

## Release Workflow

1. npm run check:all
2. Confirm README consumer docs are up to date.
3. Confirm example files compile logically with latest API.
4. Publish package: npm publish --access public
