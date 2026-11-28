# BudgetOS for iOS (PWA)

Single-file, local-first personal finance app. Everything lives in `index.html` (HTML, CSS, JS inline).
Data is saved in the browser's `localStorage` on your device. There is no cloud sync, so use **Export Backup** regularly.

## Files
- `index.html` – the whole app
- `manifest.webmanifest`, `icons/` – Add to Home Screen support
- `service-worker.js` – offline support (network-first, cache fallback)
- `.github/workflows/deploy-pages.yml` – GitHub Pages deploy

## Deploy free with GitHub Pages
1. Create a public repo (e.g. `BudgetOS-iOS`) and upload everything in this folder to the root.
2. Settings → Pages → Source: **GitHub Actions** (the included workflow deploys on every push to `main`).
3. Open the Pages URL in Safari.

## Install on iPhone
Safari → Share → **Add to Home Screen**.

## Updating
When you change `index.html`, bump `CACHE` in `service-worker.js` (e.g. `v33`) so phones pick up the new version.

Do not enter bank passwords, card PINs or OTPs.
