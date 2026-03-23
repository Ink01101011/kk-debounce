# CVE Checklist

Run this checklist before each release.

## 1) Automated checks

- `npm run check:cve`
- `npm run check:cve:full`

## 2) Review findings

- Read severity and affected ranges.
- Prefer upgrades that remove vulnerable transitive versions.
- If no safe version exists, document risk and mitigation in release notes.

## 3) Verify lockfile integrity

- Ensure `package-lock.json` is committed.
- Re-run `npm ci` on CI and run CVE checks again.

## 4) Release gate

- Do not publish if `high` or `critical` vulnerabilities are unresolved.
- Re-run `npm run check:all` before `npm publish`.
