import assert from "node:assert/strict";
import test from "node:test";

import { adminRoute, isAdminPath } from "../src/index.js";

test("admin page uses one protected namespace", () => {
  assert.deepEqual(adminRoute("GET", "/admin"), { type: "rewrite", pathname: "/admin.html" });
  assert.deepEqual(adminRoute("GET", "/admin/"), { type: "rewrite", pathname: "/admin.html" });
  assert.deepEqual(adminRoute("GET", "/admin.html"), { type: "redirect", pathname: "/admin" });
});

test("all canonical admin APIs rewrite to existing handlers", () => {
  for (const [method, pathname, internal] of [
    ["GET", "/admin/api/queue", "/api/admin/queue"],
    ["GET", "/admin/api/terms", "/api/admin/terms"],
    ["POST", "/admin/api/review/7", "/api/admin/review/7"],
    ["PUT", "/admin/api/terms/7", "/api/admin/terms/7"],
    ["POST", "/admin/api/terms/7/status", "/api/admin/terms/7/status"],
  ]) {
    assert.deepEqual(adminRoute(method, pathname), { type: "rewrite", pathname: internal });
  }
});

test("old critical paths redirect to the single admin namespace", () => {
  assert.deepEqual(adminRoute("GET", "/admin/critical"), {
    type: "redirect",
    pathname: "/admin",
  });
  assert.deepEqual(adminRoute("POST", "/admin/critical/api/review/7"), {
    type: "redirect",
    pathname: "/admin/api/review/7",
  });
});

test("legacy admin APIs redirect to /admin/api", () => {
  for (const [method, pathname, target] of [
    ["GET", "/api/admin/queue", "/admin/api/queue"],
    ["POST", "/api/admin/review/7", "/admin/api/review/7"],
    ["PUT", "/api/admin/terms/7", "/admin/api/terms/7"],
    ["POST", "/api/admin/terms/7/status", "/admin/api/terms/7/status"],
  ]) {
    assert.deepEqual(adminRoute(method, pathname), { type: "redirect", pathname: target });
  }
});

test("public API paths pass through unchanged", () => {
  assert.deepEqual(adminRoute("GET", "/api/terms"), { type: "pass", pathname: "/api/terms" });
  assert.deepEqual(adminRoute("POST", "/api/submit"), { type: "pass", pathname: "/api/submit" });
});

test("all admin entry points are marked no-store", () => {
  for (const pathname of [
    "/admin",
    "/admin/",
    "/admin.html",
    "/admin/api/queue",
    "/api/admin/queue",
    "/admin/critical",
    "/admin/critical/api/review/7",
  ]) {
    assert.equal(isAdminPath(pathname), true, pathname);
  }
  assert.equal(isAdminPath("/api/terms"), false);
});
