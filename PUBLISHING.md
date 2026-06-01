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

For the first release, you can add the trusted publisher before publishing; npm will link it to the package on the first successful publish from that workflow.

## Release process

1. Ensure `package.json` `version` matches the release you are shipping (e.g. `1.0.0`).
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
