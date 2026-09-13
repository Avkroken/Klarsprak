import assert from "node:assert/strict";
import test from "node:test";

import { adminRoute, isAdminPath } from "../src/index.js";

test("admin pages are exposed only on standardized protected paths", () => {
  assert.deepEqual(adminRoute("GET", "/admin"), { type: "rewrite", pathname: "/admin.html" });
  assert.deepEqual(adminRoute("GET", "/admin/"), { type: "rewrite", pathname: "/admin.html" });
  assert.deepEqual(adminRoute("GET", "/admin/critical"), { type: "rewrite", pathname: "/admin.html" });
  assert.deepEqual(adminRoute("GET", "/admin/critical/"), { type: "rewrite", pathname: "/admin.html" });
  assert.deepEqual(adminRoute("GET", "/admin.html"), { type: "redirect", pathname: "/admin" });
});

test("normal admin reads rewrite internally to existing handlers", () => {
  assert.deepEqual(adminRoute("GET", "/admin/api/queue"), {
    type: "rewrite",
    pathname: "/api/admin/queue",
  });
  assert.deepEqual(adminRoute("GET", "/admin/api/terms"), {
    type: "rewrite",
    pathname: "/api/admin/terms",
  });
});

test("critical admin mutations cannot run through normal admin namespace", () => {
  assert.deepEqual(adminRoute("POST", "/admin/api/review/7"), {
    type: "redirect",
    pathname: "/admin/critical/api/review/7",
  });
  assert.deepEqual(adminRoute("PUT", "/admin/api/terms/7"), {
    type: "redirect",
    pathname: "/admin/critical/api/terms/7",
  });
  assert.deepEqual(adminRoute("POST", "/admin/api/terms/7/status"), {
    type: "redirect",
    pathname: "/admin/critical/api/terms/7/status",
  });
});

test("critical namespace rewrites only critical mutations", () => {
  assert.deepEqual(adminRoute("POST", "/admin/critical/api/review/7"), {
    type: "rewrite",
    pathname: "/api/admin/review/7",
  });
  assert.deepEqual(adminRoute("PUT", "/admin/critical/api/terms/7"), {
    type: "rewrite",
    pathname: "/api/admin/terms/7",
  });
  assert.deepEqual(adminRoute("POST", "/admin/critical/api/terms/7/status"), {
    type: "rewrite",
    pathname: "/api/admin/terms/7/status",
  });
  assert.deepEqual(adminRoute("GET", "/admin/critical/api/queue"), {
    type: "redirect",
    pathname: "/admin/api/queue",
  });
});

test("legacy admin APIs redirect to the correct Access namespace", () => {
  assert.deepEqual(adminRoute("GET", "/api/admin/queue"), {
    type: "redirect",
    pathname: "/admin/api/queue",
  });
  assert.deepEqual(adminRoute("POST", "/api/admin/review/7"), {
    type: "redirect",
    pathname: "/admin/critical/api/review/7",
  });
  assert.deepEqual(adminRoute("PUT", "/api/admin/terms/7"), {
    type: "redirect",
    pathname: "/admin/critical/api/terms/7",
  });
  assert.deepEqual(adminRoute("POST", "/api/admin/terms/7/status"), {
    type: "redirect",
    pathname: "/admin/critical/api/terms/7/status",
  });
});

test("public API paths pass through unchanged", () => {
  assert.deepEqual(adminRoute("GET", "/api/terms"), { type: "pass", pathname: "/api/terms" });
  assert.deepEqual(adminRoute("POST", "/api/submit"), { type: "pass", pathname: "/api/submit" });
});

test("all admin entry points are marked no-store", () => {
  for (const pathname of [
    "/admin",
    "/admin/",
    "/admin/critical",
    "/admin/critical/",
    "/admin.html",
    "/admin/api/queue",
    "/admin/critical/api/review/7",
    "/api/admin/queue",
  ]) {
    assert.equal(isAdminPath(pathname), true, pathname);
  }
  assert.equal(isAdminPath("/api/terms"), false);
});
