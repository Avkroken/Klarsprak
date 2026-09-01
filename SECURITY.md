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

Organization rulesets are the enforcement truth. At the latest live verification, pull requests to `main` require `validate` and `osv` with strict latest-base enforcement, one approval, stale-review dismissal after push, approval of the latest push by someone other than its author, and resolved review threads. Deletion and non-fast-forward/force push are blocked, squash is the only allowed merge method, and no bypass actors are configured.

GitHub Code Scanning merge protection is enabled for `CodeQL` with these thresholds:

- code-scanning alerts: `errors_and_warnings`
- security alerts: `medium_or_higher`

Trivy is not configured in this repository and is not a merge-gate.

The repository-local OSV PR gate is deliberately fail-closed. It rejects symbolic links at reserved OSV result paths, uses the pinned fail-closed reusable PR scanner revision, and exposes terminal context `osv` only after both the preflight and scanner complete successfully.

The organization-level `main` ruleset currently also invokes Regelverket's OSV workflow as a central required workflow. That remaining organization-level coupling must be removed separately to complete the repository-specific target architecture; repository CI must not attempt to emulate or bypass it.

CodeRabbit and Copilot Code Review are advisory rather than required status checks. Their quota, rate-limit, or availability state does not by itself replace the enforced checks. Actual relevant findings and review threads must still be evaluated and resolved where appropriate.

## Security practices

- Never commit or log secrets, private keys, access tokens or credentials.
- `ADMIN_TOKEN` is a runtime secret and must be provided through the deployment platform's secret mechanism, never source code.
- Cloudflare Workers Builds owns the normal production deployment path. GitHub Actions must not become a parallel production deployment mechanism.
- Repository workflows must not create or update branches or pull requests, arm auto-merge, delegate remediation, or maintain cross-repository security state.
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
