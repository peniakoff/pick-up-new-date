# Publishing to npm

This package is published **only** when a semver git tag `v*` is pushed to GitHub and that tag points at a commit on **`master`**.

Pushing a tag is the sole release trigger. GitHub Releases and manual workflow runs do **not** publish to npm.

## GitHub ↔ npm visibility

GitHub does **not** list versions from [registry.npmjs.org](https://registry.npmjs.org) in the repository **Packages** tab (that tab is for GitHub Packages only). Integration works like this:

| Where | What you see |
|-------|----------------|
| [npm package page](https://www.npmjs.com/package/pickupnewdate) | Link to GitHub repo (from `package.json` `repository`) |
| [GitHub Actions — Publish](https://github.com/peniakoff/pick-up-new-date/actions/workflows/publish.yml) | Runs on each `v*` tag push |
| [README](README.md) | npm version badge → current release on npm |
| npm (after CI publish with trusted publishing) | Green provenance check → links to workflow run and commit on GitHub |

The **Packages** sidebar on GitHub will stay empty unless you also publish to GitHub Packages — that is expected.

After a successful tag publish, the **Publish** workflow also creates or updates the matching [GitHub Release](https://github.com/peniakoff/pick-up-new-date/releases) (changelog from commits since the previous tag, plus an npm link). Releases are not the publish trigger—only the tag push is.

## One-time npm setup (required before CI publish works)

1. Sign in at [npmjs.com](https://www.npmjs.com) with an account that can publish `pickupnewdate`.
2. Enable **two-factor authentication** (required for `npm publish`).
3. Configure **Trusted publishing** (OIDC). This is **not** under account “Access Tokens”.

   **Step 1 — Create the package on npm (required once if the package does not exist yet):**

   `npm trust` only works if the package already exists on the registry.

   ```bash
   npm login   # if needed
   npm run test:build
   npm publish --access public
   ```

   Provenance is enabled only in CI (`publish.yml` uses `--provenance`). Do not set `"provenance": true` in `publishConfig` — local publish would fail with `provider: null`.

   **Step 2 — Enable trusted publishing for GitHub Actions**

   **Option A — Website (most reliable):**

   Open https://www.npmjs.com/package/pickupnewdate/access (you must be logged in as the package owner).

   Under **Publishing access** → **Add a trusted publisher** → **GitHub Actions**, set:

   | Field | Value |
   |-------|--------|
   | Organization or user | `peniakoff` |
   | Repository | `pick-up-new-date` |
   | Workflow filename | `publish.yml` |
   | Environment | _(leave empty)_ |

   Save. If the UI offers allowed actions, enable **npm publish**.

   **Option B — CLI (npm ≥ 11.10):**

   Complete 2FA in the browser when prompted, or pass an app OTP:

   ```bash
   npm trust github pickupnewdate \
     --file=publish.yml \
     --repository=peniakoff/pick-up-new-date \
     --otp=123456 \
     -y
   ```

   If you get `400 Bad Request` on `/-/package/pickupnewdate/trust`, use Option A or retry after `npm login` and a fresh OTP.

   After Step 2, each new `v*` tag push on `master` can publish via GitHub Actions.

Without trusted publishing configured, `npm publish` from Actions fails (often `404 Not Found` on the first `PUT` to the registry).

### Retry after fixing npm setup

Re-push the tag so the Publish workflow runs again:

```bash
git push origin :refs/tags/v1.1.0
git tag -f v1.1.0 <commit-on-master>
git push origin v1.1.0
```

Or bump `package.json`, create a new tag (e.g. `v1.1.1`), and push it.

## Release process

1. Merge changes into **`master`** and confirm the **CI** workflow passes.
2. Set `"version"` in `package.json` to the version you are shipping (e.g. `1.1.0`).
3. Commit and push `master`.
4. Create and push a tag whose name matches the version:

   ```bash
   git tag v1.1.0
   git push origin v1.1.0
   ```

   Or use npm’s version helper on `master`:

   ```bash
   npm version patch   # or minor / major
   git push origin master --follow-tags
   ```

5. The **Publish** workflow validates the tag, runs tests, and runs `npm publish --provenance --access public`.
6. Verify: `npm view pickupnewdate version` and `npm install pickupnewdate`.

### Workflow checks

| Check | Failure means |
|-------|----------------|
| Tag format `vMAJOR.MINOR.PATCH` | Use e.g. `v1.1.0`, not `v1.1.0-beta` |
| Tag commit is on `master` | Tag a commit that has been merged to `master` |
| Tag `vX.Y.Z` = `package.json` `version` `X.Y.Z` | Bump `package.json` before tagging |
| Version not already on npm | Re-push is skipped safely if already published |

## Troubleshooting

| Symptom | Likely cause |
|---------|----------------|
| Tag pushed, no Publish workflow | Tag name does not match `v*` or workflow not on default branch yet |
| Publish fails on `npm publish` | Trusted publishing not configured (see above) |
| `Tag does not match package.json` | `git tag v1.1.0` but `package.json` still says `1.0.0` |
| `Tag must point to master` | Tag created on another branch’s tip |
| Tag push does nothing second time | GitHub does not re-run; delete and re-push the tag (see retry above) |
