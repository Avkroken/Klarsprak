import { spawnSync } from "node:child_process";

import { checkProduction } from "./check-production-domain.mjs";

const DATABASE = "klarsprak-db";
const PRODUCTION_BRANCH = "main";

function run(command, args) {
  const result = spawnSync(command, args, { stdio: "inherit" });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(" ")} failed with exit code ${result.status}`);
  }
}

function workersBuildMetadata(env = process.env) {
  if (env.WORKERS_CI !== "1") return { commitSha: null };

  const branch = env.WORKERS_CI_BRANCH?.trim();
  if (branch !== PRODUCTION_BRANCH) {
    throw new Error(`Refusing production deploy from Workers Builds branch ${branch || "<missing>"}; expected ${PRODUCTION_BRANCH}`);
  }

  const commitSha = env.WORKERS_CI_COMMIT_SHA?.trim();
  if (!commitSha || !/^[0-9a-f]{40}$/i.test(commitSha)) {
    throw new Error("Workers Builds did not provide a valid WORKERS_CI_COMMIT_SHA");
  }

  return { commitSha };
}

export async function deployProduction(env = process.env) {
  const { commitSha } = workersBuildMetadata(env);

  run("wrangler", ["d1", "migrations", "apply", DATABASE, "--remote"]);

  const deployArgs = ["deploy"];
  if (commitSha) deployArgs.push("--message", `Git ${commitSha}`);
  run("wrangler", deployArgs);

  await checkProduction();
}

if (import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  deployProduction().catch((error) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`::error::${message}`);
    process.exit(1);
  });
}
