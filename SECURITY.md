# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in this project, do not create a public issue. Report it privately.

- Email: `dev@denied.se`
- GitHub: use **Report a vulnerability** under the Security tab

Include a description, reproduction steps, potential impact, and a suggested fix when available.

| Stage | Timeframe |
| --- | --- |
| Initial acknowledgment | Within 48 hours |
| Assessment | Within 5 business days |
| Fix implementation | Based on severity |
| Public disclosure | After fix is released |

## Scope

This policy covers repository-controlled application and deployment surfaces, including `public/`, `src/worker.js`, D1 migrations, `wrangler.jsonc`, authorization behavior and GitHub Actions workflows.

Cloudflare Workers platform vulnerabilities should be reported to Cloudflare. Content or legal-interpretation errors without a security impact are ordinary content issues.

Merge and CI enforcement is documented in `docs/CI.md` rather than duplicated here.

## Security practices

- Never commit or log secrets, private keys, access tokens or credentials.
- `ADMIN_TOKEN` is a runtime secret and must be provided through the deployment platform's secret mechanism.
- Cloudflare Workers Builds owns normal production deployment; GitHub Actions must not become a parallel production deployment path.
- Validate untrusted input at server-side boundaries and enforce admin authorization server-side.
- GitHub Actions dependencies should be pinned to commit SHAs when practical.
- Dependency scanning must fail closed when a required scan cannot complete.

If a credential is exposed, revoke or rotate it at the provider and follow GitHub's sensitive-data removal guidance when repository history is affected.

## Supported Versions

| Version | Supported |
| --- | --- |
| Latest commit on `main` | Yes |
| Older commits | No |
