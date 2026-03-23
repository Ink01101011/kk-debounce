# CVE Checklist

Run this checklist before each release.

## 1) Automated checks

- `pnpm run check:cve`
- `pnpm run check:cve:full`

## 2) Review findings

- Read severity and affected ranges.
- Prefer upgrades that remove vulnerable transitive versions.
- If no safe version exists, document risk and mitigation in release notes.

## 3) Verify lockfile integrity

- Ensure `pnpm-lock.yaml` is committed.
- Re-run `pnpm install --frozen-lockfile` on CI and run CVE checks again.

## 4) Release gate

- Do not publish if `high` or `critical` vulnerabilities are unresolved.
- Re-run `pnpm run check:all` before `pnpm publish`.
