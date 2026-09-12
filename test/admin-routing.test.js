import assert from "node:assert/strict";
import test from "node:test";

import { adminRoute, isAdminPath } from "../src/index.js";

test("admin page is exposed only on the standardized /admin path", () => {
  assert.deepEqual(adminRoute("/admin"), { type: "rewrite", pathname: "/admin.html" });
  assert.deepEqual(adminRoute("/admin/"), { type: "rewrite", pathname: "/admin.html" });
  assert.deepEqual(adminRoute("/admin.html"), { type: "redirect", pathname: "/admin" });
});

test("standard admin API paths rewrite internally to the existing handlers", () => {
  assert.deepEqual(adminRoute("/admin/api/queue"), { type: "rewrite", pathname: "/api/admin/queue" });
  assert.deepEqual(adminRoute("/admin/api/terms/7"), { type: "rewrite", pathname: "/api/admin/terms/7" });
});

test("legacy public admin API paths redirect into the protected admin namespace", () => {
  assert.deepEqual(adminRoute("/api/admin/queue"), { type: "redirect", pathname: "/admin/api/queue" });
  assert.deepEqual(adminRoute("/api/admin/review/7"), { type: "redirect", pathname: "/admin/api/review/7" });
});

test("public API paths pass through unchanged", () => {
  assert.deepEqual(adminRoute("/api/terms"), { type: "pass", pathname: "/api/terms" });
  assert.deepEqual(adminRoute("/api/submit"), { type: "pass", pathname: "/api/submit" });
});

test("all admin entry points are marked no-store", () => {
  for (const pathname of [
    "/admin",
    "/admin/",
    "/admin.html",
    "/admin/api/queue",
    "/api/admin/queue",
  ]) {
    assert.equal(isAdminPath(pathname), true, pathname);
  }
  assert.equal(isAdminPath("/api/terms"), false);
});
