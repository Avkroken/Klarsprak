import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { applyResponsePolicy } from "../src/response-policy.js";

const publicFile = (name) =>
  readFile(new URL("../public/" + name, import.meta.url), "utf8");

test("public and admin application code is served as external first-party assets", async () => {
  const [index, admin, app, adminApp] = await Promise.all([
    publicFile("index.html"),
    publicFile("admin.html"),
    publicFile("app.js"),
    publicFile("admin.js"),
  ]);

  assert.match(index, /<script src="\/app\.js" defer><\/script>/);
  assert.match(admin, /<script src="\/admin\.js" defer><\/script>/);
  assert.doesNotMatch(index, /<script>(?:.|\n)*?<\/script>/i);
  assert.doesNotMatch(admin, /<script>(?:.|\n)*?<\/script>/i);
  assert.match(app, /loadTerms\(\)/);
  assert.match(adminApp, /async function loadAll\(\)/);
});

test("CSP avoids inline script execution and explicitly allows Turnstile", () => {
  const response = applyResponsePolicy(new Response(null));
  const csp = response.headers.get("content-security-policy") || "";

  assert.match(csp, /script-src 'self' https:\/\/challenges\.cloudflare\.com/);
  assert.match(csp, /frame-src https:\/\/challenges\.cloudflare\.com/);
  assert.match(csp, /connect-src 'self' https:\/\/challenges\.cloudflare\.com/);
  assert.doesNotMatch(csp, /script-src[^;]*'unsafe-inline'/);
});
