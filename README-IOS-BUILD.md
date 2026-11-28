# BudgetOS iOS initial build scaffold

This branch adds a React + Vite + Tailwind CSS v4 + HeroUI + Tauri 2 starter and macOS GitHub Actions workflow. The original PWA on main remains untouched.

The workflow builds the frontend, initializes Tauri's generated iOS Xcode project, attempts an iOS Simulator build, and uploads its archive as an Actions artifact. A signed device IPA and GitHub prerelease require Apple signing credentials.

Required Actions secrets: APPLE_CERTIFICATE_BASE64, APPLE_CERTIFICATE_PASSWORD, APPLE_PROVISIONING_PROFILE_BASE64. For direct installation on a specific iPhone, the profile must be Development or Ad Hoc and include that device UDID. App Store profiles are for TestFlight/App Store Connect, not direct installation. Bundle ID: com.balabalaji.budgetos.

This is a starter proof-of-build, not yet a full migration of every legacy screen, existing localStorage records, onboarding, authentication, or cloud sync. Keep production PWA until feature parity and data migration are complete.