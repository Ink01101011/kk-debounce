# CVE Checklist

Run this checklist before each release.

## 1) Automated checks

- `pnpm run check:cve`
  Release gate for production dependencies. This is the check that must pass before publishing.
- `pnpm run check:cve:full`
  Tracking check for dev tooling vulnerabilities. Use it to monitor issues in build, test, lint, and CI dependencies.

## 2) Review findings

- Read severity and affected ranges.
- Prefer upgrades that remove vulnerable transitive versions.
- If no safe version exists, document risk and mitigation in release notes.

## 3) Verify lockfile integrity

- Ensure `pnpm-lock.yaml` is committed.
- Re-run `pnpm install --frozen-lockfile` on CI and run CVE checks again.

## 4) Release gate

- Do not publish if `high` or `critical` vulnerabilities are unresolved.
- Treat `pnpm run check:cve` as the publish gate for runtime and production dependency risk.
- Treat `pnpm run check:cve:full` as a maintenance signal for dev tooling, not as the publish gate.
- Re-run `pnpm run check:all` before `pnpm publish`.
