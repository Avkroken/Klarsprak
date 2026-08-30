import assert from "node:assert/strict";
import test from "node:test";

import { validateProductionResponse } from "../scripts/check-production-domain.mjs";
import { workersBuildMetadata } from "../scripts/deploy-production.mjs";

const SHA = "0123456789abcdef0123456789abcdef01234567";

test("Workers Builds production metadata requires main and a full commit SHA", () => {
  assert.deepEqual(workersBuildMetadata({ WORKERS_CI: "1", WORKERS_CI_BRANCH: "main", WORKERS_CI_COMMIT_SHA: SHA }), {
    commitSha: SHA,
  });

  assert.throws(
    () => workersBuildMetadata({ WORKERS_CI: "1", WORKERS_CI_BRANCH: "feature", WORKERS_CI_COMMIT_SHA: SHA }),
    /expected main/,
  );

  assert.throws(
    () => workersBuildMetadata({ WORKERS_CI: "1", WORKERS_CI_BRANCH: "main", WORKERS_CI_COMMIT_SHA: "short" }),
    /valid WORKERS_CI_COMMIT_SHA/,
  );
});

test("manual production deploy remains available outside Workers Builds", () => {
  assert.deepEqual(workersBuildMetadata({}), { commitSha: null });
});

test("canonical root must return HTTP 200", async () => {
  await validateProductionResponse("root", new Response("ok", { status: 200 }));
  await assert.rejects(
    validateProductionResponse("root", new Response("blocked", { status: 403 })),
    /expected 200/,
  );
});

test("terms API must be healthy JSON backed by the expected shape", async () => {
  await validateProductionResponse("terms", new Response(JSON.stringify({ terms: [] }), {
    status: 200,
    headers: { "content-type": "application/json; charset=utf-8" },
  }));

  await assert.rejects(
    validateProductionResponse("terms", new Response(JSON.stringify({ error: "bad" }), {
      status: 200,
      headers: { "content-type": "application/json" },
    })),
    /terms array/,
  );
});

test("IDN alias must redirect permanently to the canonical root", async () => {
  await validateProductionResponse("alias", new Response(null, {
    status: 301,
    headers: { location: "https://klarsprak.denied.se/" },
  }));

  await assert.rejects(
    validateProductionResponse("alias", new Response(null, {
      status: 302,
      headers: { location: "https://klarsprak.denied.se/" },
    })),
    /expected 301/,
  );
});
