import assert from "node:assert/strict";
import test from "node:test";

import { planLegacyMigrationReconciliation } from "../scripts/reconcile-d1-migrations.mjs";

function rows({ columns = [], migrations = [], indexes = [] } = {}) {
  return [
    ...columns.map((name) => ({ kind: "column", name })),
    ...migrations.map((name) => ({ kind: "migration", name })),
    ...indexes.map((name) => ({ kind: "index", name })),
  ];
}

test("marks legacy migrations when their schema is already present", () => {
  const plan = planLegacyMigrationReconciliation(rows({
    columns: ["created_at", "submitter_ip", "foreslaget_rattsomrade"],
    indexes: ["idx_submissions_ip_created"],
  }));

  assert.deepEqual(plan, {
    createIpIndex: false,
    markMigration2: true,
    markMigration3: true,
  });
});

test("repairs the IP index before recording migration 0002", () => {
  const plan = planLegacyMigrationReconciliation(rows({
    columns: ["created_at", "submitter_ip"],
  }));

  assert.deepEqual(plan, {
    createIpIndex: true,
    markMigration2: true,
    markMigration3: false,
  });
});

test("leaves genuinely unapplied migrations for Wrangler to execute", () => {
  const plan = planLegacyMigrationReconciliation(rows({
    columns: ["created_at"],
  }));

  assert.deepEqual(plan, {
    createIpIndex: false,
    markMigration2: false,
    markMigration3: false,
  });
});

test("fails closed when recorded migration state contradicts the schema", () => {
  assert.throws(
    () => planLegacyMigrationReconciliation(rows({ migrations: ["0002_add_submitter_ip.sql"] })),
    /submitter_ip is missing/,
  );

  assert.throws(
    () => planLegacyMigrationReconciliation(rows({ migrations: ["0003_add_foreslaget_rattsomrade.sql"] })),
    /foreslaget_rattsomrade is missing/,
  );
});
