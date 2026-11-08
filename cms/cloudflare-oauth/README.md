# MS EMotion Cars CMS — Cloudflare OAuth Worker

This code is for the existing Cloudflare Worker **ms-emotion-cms-auth** only. It does not run inside Astro and does not alter the published website.

## Manual setup
1. In Cloudflare, ensure Production bindings `GITHUB_CLIENT_ID` (text) and `GITHUB_CLIENT_SECRET` (encrypted secret) exist. Never share the secret or commit it.
2. Open Worker → **Edit code** → replace the complete default `worker.js` with `worker.js` from this folder → **Deploy**.
3. Open `https://ms-emotion-cms-auth.bwalser13.workers.dev/`. It should display `CMS OAuth service ready`.
4. GitHub OAuth App callback must be exactly `https://ms-emotion-cms-auth.bwalser13.workers.dev/callback`.
5. The Worker currently allows **only GitHub login BerniK-13**. Do not change this without reviewing access control.
6. Do not open `/auth` to test a complete CMS login until the admin page is enabled; Decap initiates the popup handshake.

## Security
- OAuth state is a cryptographically random value stored in Secure/HttpOnly/SameSite=Lax cookie with 10-minute expiry.
- GitHub account is checked server-side before the token is passed to the CMS opener.
- Popup postMessage is restricted to `https://bernik-13.github.io`; the callback does not put the token in the URL.
- The worker is not a password gate for the public website. Authorization to change repository files still depends on GitHub permissions.
- A GitHub OAuth app may request `public_repo` permission for public repositories; review GitHub's authorization screen before approving.
- The `CMS_PATH` constant documents the expected site path; the popup origin is the security boundary.

## Before enabling Decap CMS
- Add `base_url: https://ms-emotion-cms-auth.bwalser13.workers.dev` and `auth_endpoint: auth` to the served Decap backend configuration, after testing.
- GitHub Pages serves the CMS at `/ms-emotion-cars/admin/`, not at root.
- Audit Decap 3 OAuth popup compatibility in a staging login before deploying public admin.
- No live content switch until verified builds and screenshot comparisons.
