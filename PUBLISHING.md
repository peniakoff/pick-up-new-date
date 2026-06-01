# Publishing to npm

This package is published automatically when a GitHub Release is published.

## GitHub ↔ npm visibility

GitHub does **not** list versions from [registry.npmjs.org](https://registry.npmjs.org) in the repository **Packages** tab (that tab is for GitHub Packages only). Integration works like this:

| Where | What you see |
|-------|----------------|
| [npm package page](https://www.npmjs.com/package/pickupnewdate) | Link to GitHub repo (from `package.json` `repository`) |
| [GitHub Releases](https://github.com/peniakoff/pick-up-new-date/releases) | Link to npm added by `publish.yml` after a successful CI publish |
| [README](README.md) | npm version badge → current release on npm |
| npm (after CI publish with trusted publishing) | Green provenance check → links to workflow run and commit on GitHub |

The **Packages** sidebar on GitHub will stay empty unless you also publish to GitHub Packages — that is expected.

## One-time npm setup

1. Sign in at [npmjs.com](https://www.npmjs.com) with an account that can publish `pickupnewdate`.
2. Enable **two-factor authentication** (required for `npm publish`).
3. Configure **Trusted publishing** (OIDC). This is **not** under account “Access Tokens”.

   **Step 1 — Create the package on npm (required once):**

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

   After Step 2, future releases can use GitHub Actions (`gh workflow run publish.yml` or a published GitHub Release).

Without trusted publishing configured, `npm publish` from Actions fails with `404 Not Found` on the first `PUT` to the registry.

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
