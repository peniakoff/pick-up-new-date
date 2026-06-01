# Publishing to npm

This package is published automatically when a GitHub Release is published.

## One-time npm setup

1. Sign in at [npmjs.com](https://www.npmjs.com) with an account that can publish `pickupnewdate`.
2. Enable **two-factor authentication** (required for `npm publish`).
3. Configure a **Trusted Publisher** (OIDC, no long-lived `NPM_TOKEN` needed):
   - Open [npm Access Tokens](https://www.npmjs.com/settings/~your-username/tokens) → **Trusted Publishers** → **Add**
   - Provider: **GitHub Actions**
   - Repository: `peniakoff/pick-up-new-date` (must match this GitHub repo)
   - Workflow filename: `publish.yml`
   - Environment: leave empty (unless you add a GitHub Environment named `release`)

For the first release, add the trusted publisher **before** publishing. Without it, `npm publish` from Actions often fails with `404 Not Found` on the first `PUT` to the registry.

### Retry after fixing npm setup

```bash
gh workflow run publish.yml
# or re-run the failed job:
gh run rerun --failed
```

## Release process

### v1.0.0 (tag already on GitHub)

The `v1.0.0` git tag is on `origin`. To publish to npm:

1. Complete **One-time npm setup** below (2FA + Trusted Publisher for `peniakoff/pick-up-new-date`).
2. Open [GitHub Releases](https://github.com/peniakoff/pick-up-new-date/releases/new), choose tag `v1.0.0`, add release notes, and click **Publish release** (not draft).
3. Confirm the [Publish workflow](https://github.com/peniakoff/pick-up-new-date/actions/workflows/publish.yml) succeeds.
4. Run `npm view pickupnewdate` and install the package to verify.

### Later releases

1. Ensure `package.json` `version` matches the release you are shipping (e.g. `1.0.1`).
2. Merge changes to `main` and confirm the **CI** workflow passes.
3. Create and push a git tag: `git tag v1.0.0 && git push origin v1.0.0`
4. On GitHub: **Releases** → **Draft a new release** → choose tag `v1.0.0` → **Publish release** (not draft).
5. The **Publish** workflow runs `npm publish --provenance --access public`.
6. Verify: `npm view pickupnewdate` and `npm install pickupnewdate`.

## Subsequent versions

```bash
npm version patch   # or minor / major
git push origin main --follow-tags
```

Then create a GitHub Release for the new tag and publish it.
