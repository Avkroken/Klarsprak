# Starter-workflows analysis

This repository may only use workflow/configuration templates that are applicable from `actions/starter-workflows`.

## Actions state before the reset

The latest observed pull-request run of the previous custom `CI` workflow completed successfully with the job `validate`. Its log showed 10/10 Node tests passing, all local D1 migration files applying successfully, and a successful Wrangler deploy dry-run. It also contained repository-specific remediation-seed validation and Bun installation/orchestration.

The previous custom `OSV` workflow also completed successfully but wrapped OSV scanning in repository-specific jobs including `osv-preflight`, `scan-pr`, and the aggregate required check `osv`.

GitHub Code Scanning default setup is already active and has produced successful dynamic CodeQL runs. A repository-local CodeQL workflow is therefore not added.

## Selected starter templates

- `code-scanning/dependency-review.yml`: used for pull requests to `main`. Action major versions are pinned to the exact commits already accepted by the organization Actions policy, without adding workflow logic.
- `.github/dependabot.yml`: kept in the starter configuration structure, filled for the repository's actual `bun` and `github-actions` ecosystems, both weekly.

## Templates attempted or intentionally not used

### OSV-Scanner

The current `code-scanning/osv-scanner.yml` starter was first added essentially as published, with `main` and the weekly cron placeholder filled. Its first pull-request run ended in `startup_failure` before GitHub created any jobs.

The reusable workflow at the exact commit referenced by the current starter template is resolvable, but its contents include multiple mutable action version references. The connector does not expose a more specific startup diagnostic, so the exact policy rejection is not asserted as proven. What is verified is that the current starter workflow cannot start in this repository as-is.

Because changing or wrapping that workflow to make it pass would create repository-specific workflow logic outside the current starter template, OSV-Scanner is removed and recorded as a coverage gap.

### Node.js CI

The current `ci/node.js.yml` starter requires npm caching and `npm ci`. This repository has a Bun lockfile and uses Bun for dependency installation. Replacing those starter steps with Bun-specific setup would move beyond the selected starter template's frame, so no Node.js CI workflow is added.

The former Bun test, D1 migration, remediation-seed, and Wrangler deploy dry-run behavior is therefore a documented coverage gap rather than custom workflow logic.

### Release automation

The former repository workflow delegated to an organization-specific Release Please workflow. No equivalent is introduced unless an applicable starter-workflows template can cover the same repository behavior without custom orchestration.

### Issue and pull-request templates

`actions/starter-workflows` does not provide a security-alert-specific `ISSUE_TEMPLATE` set. Its repository-local pull-request template is for contributing new starter workflows and is not an applicable security-alert template for this repository. The previous local bug, feature, issue config, and pull-request templates are therefore removed rather than replaced with custom forms.

## Ruleset evidence and rollout gate

The live repository `required-ci` ruleset currently requires the old custom checks `validate` and `osv`. Those names must not be copied into the target ruleset after the workflows are replaced.

The repository-specific target ruleset will only be written after the remaining Dependency Review starter workflow has run successfully on this branch and its exact job/check name has been observed. The existing `dev-pilot` ruleset contains branch/review protections but no required status checks, so it does not invent workflow checks.

No CodeQL status check is proposed as a universal organization-level required check: GitHub default setup emits language-dependent dynamic CodeQL check names across repositories rather than one stable check context applicable everywhere.
