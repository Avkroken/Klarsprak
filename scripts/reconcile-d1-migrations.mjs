import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";

const DATABASE = "klarsprak-db";
const MIGRATION_2 = "0002_add_submitter_ip.sql";
const MIGRATION_3 = "0003_add_foreslaget_rattsomrade.sql";
const IP_INDEX = "idx_submissions_ip_created";

function runWrangler(sql) {
  const output = execFileSync(
    "wrangler",
    ["d1", "execute", DATABASE, "--remote", "--json", "--command", sql],
    { encoding: "utf8", stdio: ["ignore", "pipe", "inherit"] },
  );

  const parsed = JSON.parse(output);
  if (!Array.isArray(parsed) || parsed.some((entry) => entry?.success !== true)) {
    throw new Error("Unexpected Wrangler D1 response");
  }
  return parsed.flatMap((entry) => entry.results ?? []);
}

export function planLegacyMigrationReconciliation(rows) {
  const columns = new Set(rows.filter((row) => row.kind === "column").map((row) => row.name));
  const migrations = new Set(rows.filter((row) => row.kind === "migration").map((row) => row.name));
  const indexes = new Set(rows.filter((row) => row.kind === "index").map((row) => row.name));

  const hasSubmitterIp = columns.has("submitter_ip");
  const hasCreatedAt = columns.has("created_at");
  const hasRattsomrade = columns.has("foreslaget_rattsomrade");
  const migration2Recorded = migrations.has(MIGRATION_2);
  const migration3Recorded = migrations.has(MIGRATION_3);

  if (migration2Recorded && !hasSubmitterIp) {
    throw new Error(`${MIGRATION_2} is recorded but submissions.submitter_ip is missing`);
  }
  if (migration3Recorded && !hasRattsomrade) {
    throw new Error(`${MIGRATION_3} is recorded but submissions.foreslaget_rattsomrade is missing`);
  }
  if (hasSubmitterIp && !hasCreatedAt) {
    throw new Error("submissions.submitter_ip exists but submissions.created_at is missing");
  }

  return {
    createIpIndex: hasSubmitterIp && !indexes.has(IP_INDEX),
    markMigration2: hasSubmitterIp && !migration2Recorded,
    markMigration3: hasRattsomrade && !migration3Recorded,
  };
}

function main() {
  // Wrangler itself owns this table. Creating it with Wrangler's documented
  // schema is harmless when it already exists and makes the inspection below
  // deterministic.
  runWrangler(`CREATE TABLE IF NOT EXISTS d1_migrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
  )`);

  const rows = runWrangler(`
    SELECT 'column' AS kind, name FROM pragma_table_info('submissions')
    UNION ALL
    SELECT 'migration' AS kind, name FROM d1_migrations
    UNION ALL
    SELECT 'index' AS kind, name FROM sqlite_master
      WHERE type = 'index' AND tbl_name = 'submissions'
  `);

  const plan = planLegacyMigrationReconciliation(rows);

  if (plan.createIpIndex) {
    console.log(`Repairing missing ${IP_INDEX} index`);
    runWrangler(`CREATE INDEX IF NOT EXISTS ${IP_INDEX} ON submissions(submitter_ip, created_at)`);
  }

  if (plan.markMigration2) {
    console.log(`Recording already-applied ${MIGRATION_2}`);
    runWrangler(`INSERT OR IGNORE INTO d1_migrations (name) VALUES ('${MIGRATION_2}')`);
  }

  if (plan.markMigration3) {
    console.log(`Recording already-applied ${MIGRATION_3}`);
    runWrangler(`INSERT OR IGNORE INTO d1_migrations (name) VALUES ('${MIGRATION_3}')`);
  }

  if (!plan.createIpIndex && !plan.markMigration2 && !plan.markMigration3) {
    console.log("Legacy D1 migration records already match the inspected schema");
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
