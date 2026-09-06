# CI och deploy

`.github/workflows/ci.yml` producerar `validate`, blockerar ofärdiga `.github/codex-dispatch/issue-*.md`-seedfiler, kör projektets tester, applicerar D1-migrationer mot tom lokal Wrangler-state och gör Wrangler dry-run.

`.github/workflows/osv-scanner.yml` producerar `osv`. PR-flödet verifierar PR-HEAD, kör den pinnade scannern och kräver explicit success från både preflight och scan.

GitHub Actions deployar inte produktion. Cloudflare Workers Builds äger normal production deployment från `main`. `wrangler.jsonc` är source of truth för versionshanterad Worker-konfiguration och runtime-secrets ligger i Cloudflare.
