# BudgetOS iPhone PWA (starter)

This is a mobile-first Progressive Web App starter for BudgetOS. It is a separate project and does not modify the Android app.

## Included
- iPhone-friendly dark dashboard
- Monthly income, expense and balance totals
- Net worth calculation from manually entered assets and EMI liabilities
- Basic EMI list with loan start/end dates and monthly amount
- Local browser storage (`localStorage`)
- Offline shell via service worker
- JSON backup export
- Add to Home Screen metadata for iOS

## Important limitations
- This starter is not yet connected to your existing Android BudgetOS data or Jarvis API.
- Data stays in this browser on this device. It is not synced or encrypted by this starter.
- EMI liability is currently the manually entered outstanding principal; update it as repayments are made.
- Do not enter bank passwords, card PINs, OTPs or other secrets.

## Deploy free with GitHub Pages
1. Create a new **public** GitHub repository named `BudgetOS-iOS`.
2. Upload all files and folders from this project to the repository root.
3. In GitHub, open **Settings → Pages**.
4. Under Build and deployment, choose **Deploy from a branch**.
5. Select `main` and `/ (root)`, then Save.
6. Wait for the Pages URL shown there.

## Install on iPhone
1. Open the published HTTPS Pages URL in Safari.
2. Tap Share.
3. Choose **Add to Home Screen**.
4. Keep **Open as Web App** enabled if shown, then tap Add.

## Next integration step
Provide the existing BudgetOS repository or the current working web/JS files so the existing Jarvis endpoint, financial memory model and existing dashboard can be integrated without guessing API routes or breaking Android.
