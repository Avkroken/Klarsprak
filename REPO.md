# REPO.md

`klarsprak` is a Cloudflare Workers prototype with frontend under `public/`, backend in `src/worker.js`, D1 migrations in `migrations/` and versioned Worker configuration in `wrangler.jsonc`.

## Invariants

- Factual/legal claims must be source-backed; do not guess.
- Validate untrusted input server-side. Admin authorization is verified server-side against `ADMIN_TOKEN`.
- Never hardcode or log secrets, tokens or credentials.
- Cloudflare Workers Builds owns production deployment from `main`; GitHub Actions validates but does not duplicate deployment.
- Schema changes use Wrangler-native D1 migrations.

## Validation

Run `bun run test` for relevant changes. For CI, Wrangler or D1 changes, validate migrations from an empty local state and run Wrangler dry-run validation.

The live repository rules currently require `validate` and `osv`. Do not rename a required check without updating and verifying the live ruleset in the same migration.

Pin third-party GitHub Actions to full commit SHAs.
