# Starter-workflows analysis

This repository may only use workflow/configuration templates that are applicable from `actions/starter-workflows`.

## Actions state before the reset

The latest observed pull-request run of the previous custom `CI` workflow completed successfully with the job `validate`. Its log showed 10/10 Node tests passing, all local D1 migration files applying successfully, and a successful Wrangler deploy dry-run. It also contained repository-specific remediation-seed validation and Bun installation/orchestration.

The previous custom `OSV` workflow also completed successfully but wrapped OSV scanning in repository-specific jobs including `osv-preflight`, `scan-pr`, and the aggregate required check `osv`.

GitHub Code Scanning default setup is already active and has produced successful dynamic CodeQL runs. A repository-local CodeQL workflow is therefore not added.

## Selected starter templates

- `code-scanning/dependency-review.yml`: used for pull requests to `main`. It has run successfully on this branch and produces the exact job/check name `dependency-review`.
- `.github/dependabot.yml`: kept in the starter configuration structure, filled for the repository's actual `bun` and `github-actions` ecosystems, both weekly.

## Templates attempted or intentionally not used

### OSV-Scanner

The current `code-scanning/osv-scanner.yml` starter was tested as published, with `main` and the weekly cron placeholder filled.

The first attempts ended in `startup_failure` before GitHub created any jobs. Repository rulesets `required-ci` and `dev-pilot` were disabled live, while the inherited organization ruleset `main` was verified to contain no required status checks. The same startup failure still occurred, proving the repository rulesets were not the cause.

The effective Actions policy was then inspected. Both the organization and repository used `allowed_actions: selected`, allowed `google/*`, and required SHA pinning. After `sha_pinning_required` was disabled at both levels, the exact same GitHub OSV starter workflow progressed past startup and created the job `scan-pr / scan-pr`.

That job then failed during action preparation with GitHub's explicit error that the upstream reusable workflow uses deprecated `actions/upload-artifact` v3 at commit `a8a3f3ad30e3422c9c7b888a15615d19a852ae32`. GitHub no longer permits that artifact-action version.

Therefore the current GitHub OSV starter template cannot complete successfully in this repository as published. Fixing the upstream reusable workflow or replacing its action references locally would move outside the GitHub starter template's frame, so OSV-Scanner is removed and recorded as a coverage gap.

### Node.js CI

The current `ci/node.js.yml` starter requires npm caching and `npm ci`. This repository has a Bun lockfile and uses Bun for dependency installation. Replacing those starter steps with Bun-specific setup would move beyond the selected starter template's frame, so no Node.js CI workflow is added.

The former Bun test, D1 migration, remediation-seed, and Wrangler deploy dry-run behavior is therefore a documented coverage gap rather than custom workflow logic.

### Release automation

The former repository workflow delegated to an organization-specific Release Please workflow. No equivalent is introduced unless an applicable starter-workflows template can cover the same repository behavior without custom orchestration.

### Issue and pull-request templates

`actions/starter-workflows` does not provide a security-alert-specific `ISSUE_TEMPLATE` set. Its repository-local pull-request template is for contributing new starter workflows and is not an applicable security-alert template for this repository. The previous local bug, feature, issue config, and pull-request templates are therefore removed rather than replaced with custom forms.

## Ruleset evidence and rollout gate

The live repository `required-ci` ruleset still contains the old custom checks `validate` and `osv`, but its enforcement is currently disabled. The live `dev-pilot` ruleset is also disabled. Those old check names must not be copied into the target ruleset after the workflows are replaced.

The remaining Dependency Review starter workflow has run successfully with the exact job/check name `dependency-review`. The repository-specific target ruleset file therefore requires only `dependency-review`.

No CodeQL status check is proposed as a universal organization-level required check: GitHub default setup emits language-dependent dynamic CodeQL check names across repositories rather than one stable check context applicable everywhere.
