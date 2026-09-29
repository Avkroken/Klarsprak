import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const asset = name => readFileSync(new URL("../public/" + name, import.meta.url), "utf8");

test("Klarspråk exposes shared themes while Legacy keeps the existing palette", () => {
  const css = asset("theme.css");
  const js = asset("theme.js");

  assert.match(css, /:root\[data-theme="forest"\]/);
  assert.match(css, /:root\[data-theme="blackout"\]/);
  assert.doesNotMatch(css, /:root\[data-theme="legacy"\]/);
  assert.match(js, /avkroken\.theme/);
  assert.match(js, /avkroken_theme/);
  assert.match(js, /Domain=\.denied\.se/);
});

test("public and admin pages share the same theme selector", () => {
  for (const name of ["index.html", "varfor.html", "admin.html"]) {
    const html = asset(name);
    assert.match(html, /data-theme="legacy"/);
    assert.match(html, /href="\/theme\.css"/);
    assert.match(html, /src="\/theme\.js"/);
    assert.match(html, /value="legacy">Legacy/);
    assert.match(html, /value="forest">Avkroken/);
    assert.match(html, /value="blackout">Blackout/);
  }
});
