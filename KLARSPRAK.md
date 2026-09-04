# KLARSPRAK.md

This is the repository governance document for `Avkroken/Klarsprak`. Binding AI coding-agent policy is defined only in `Avkroken/.github/AGENTS.md`. This document records repository-specific technical contracts, invariants, validation requirements, and operational context required by that policy; it must not define, supplement, narrow, or override agent policy.

## Repository

`klarsprak` is a static Cloudflare Workers prototype that compares ordinary-language meaning with legal and public-authority usage. The frontend is under `public/`, backend in `src/worker.js`, D1 migrations in `migrations/`, and `wrangler.jsonc` owns versioned Worker configuration.

Cloudflare Workers Builds owns normal production deployment from `main`. GitHub Actions must not duplicate Cloudflare's production control plane.

## Content and security invariants

- Claims about factual differences or legal meaning must be source-backed; do not guess.
- Validate untrusted input server-side.
- Admin authorization is verified server-side against `ADMIN_TOKEN`.
- Secrets, tokens and credentials must never be hardcoded or logged.

## GitHub Actions and Cloudflare

- `.github/workflows/ci.yml` owns the `validate` check context, blocks unfinished remediation seed files and runs tests, local D1 migrations from an empty state, and Wrangler dry-run validation.
- `.github/workflows/osv-scanner.yml` owns the repository-local terminal `osv` context when that workflow is part of the live merge policy.
- Pin third-party GitHub Actions to full commit SHAs.
- The production trigger uses branch `main`, root `/`, an empty build command and deploy command `bun run migrate:production && bun run deploy && bun run verify:production`.
- `migrate:production` uses Wrangler-native D1 migrations.
- `deploy` uses `wrangler deploy --strict`.

## Validation

Run `bun run test` for relevant changes. For CI, Wrangler or D1 changes, validate migrations from an empty local state and run `wrangler deploy --dry-run`.

## Response format

Read and follow `SKILLS.md` when working in this repository.
