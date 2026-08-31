# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in this project, do not create a public issue. Report it privately.

### How to Report

- Email: `dev@denied.se`
- GitHub: use the "Report a vulnerability" function under the Security tab

### What to Include

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Any suggested fix, if available

### Response Timeline

| Stage | Timeframe |
|---|---|
| Initial acknowledgment | Within 48 hours |
| Assessment | Within 5 business days |
| Fix implementation | Based on severity |
| Public disclosure | After fix is released |

## Scope

This policy covers repository-controlled application and deployment surfaces, including:

- `public/`
- `src/worker.js`
- D1 schema and migrations under `migrations/`
- `wrangler.jsonc`
- admin/API authorization behavior
- GitHub Actions workflows and repository merge-enforcement

Cloudflare Workers platform vulnerabilities should be reported to Cloudflare. Content or legal-interpretation errors without a security impact should be handled as ordinary content issues rather than security vulnerabilities.

## Merge security enforcement

The active `main` ruleset requires both `validate` and `osv` with strict latest-base enforcement. Pull requests must therefore be revalidated when the relevant HEAD or base changes.

GitHub Code Scanning merge protection is enabled for `CodeQL` with these thresholds:

- code-scanning alerts: `errors_and_warnings`
- security alerts: `medium_or_higher`

Trivy is not configured in this repository and is not a merge-gate.

Unresolved relevant review threads block merge. The generic approval requirement is 0 and no last-push approval is required. Only squash merge is allowed and the ruleset has no bypass actors.

CodeRabbit is best effort and is not a required status check. Missing, pending, rate-limited or failed CodeRabbit status does not by itself block merge. Actual relevant CodeRabbit findings and review threads must still be evaluated and resolved when appropriate.

Copilot Code Review runs on new pushes, excludes drafts and is advisory. Copilot quota, policy or availability failures do not by themselves block merge; actual relevant feedback must still be evaluated.

## Security practices

- Never commit or log secrets, private keys, access tokens or credentials.
- `ADMIN_TOKEN` is a runtime secret and must be provided through the deployment platform's secret mechanism, never source code.
- Cloudflare Workers Builds owns the normal production deployment path. GitHub Actions must not become a parallel production deployment mechanism.
- Validate untrusted input at server-side boundaries and enforce admin authorization server-side.
- GitHub Actions dependencies should be pinned to commit SHAs when practical.
- Dependency scanning must fail closed when the scanner cannot complete a required PR scan.

If a credential is exposed, revoke or rotate it at the provider, remove the exposed material from active use, and follow GitHub's sensitive-data removal guidance when repository history is affected.

## Supported Versions

| Version | Supported |
|---|---|
| Latest commit on `main` | Yes |
| Older commits | No |

## Acknowledgments

Security researchers who report valid vulnerabilities may be acknowledged here with their permission.
