// Validates the question pool so new (also auto-generated) questions can't break the game.
const test = require("node:test");
const assert = require("node:assert/strict");
const { SPINDLE_DATA: D, SPINDLE_LABELS: LBL } = require("../js/data.js");

const str = (v) => typeof v === "string" && v.trim().length > 0;
const year = (v) => Number.isInteger(v) && v >= 1900 && v <= new Date().getFullYear();
const wrongs = (ans, list, n = 3) => {
  assert.ok(Array.isArray(list) && list.length === n, `${ans}: needs exactly ${n} wrong options`);
  list.forEach((w) => assert.ok(str(w), `${ans}: empty wrong option`));
  assert.ok(!list.includes(ans), `${ans}: answer is also listed as wrong option`);
  assert.equal(new Set(list).size, n, `${ans}: duplicate wrong options`);
};
const unique = (name, keys) => {
  const seen = new Set();
  keys.forEach((k) => { assert.ok(!seen.has(k), `${name}: duplicate entry "${k}"`); seen.add(k); });
};

test("every category has a label and at least 4 entries", () => {
  Object.keys(D).forEach((c) => {
    assert.ok(LBL[c], `label for ${c}`);
    assert.ok(D[c].length >= 4, `${c} has ${D[c].length} entries`);
  });
});

test("duel", () => {
  D.duel.forEach(([a, ay, b, by]) => {
    assert.ok(str(a) && str(b) && a !== b, `duel ${a} / ${b}`);
    assert.ok(year(ay) && year(by), `duel years ${a}`);
    assert.notEqual(ay, by, `duel ${a} vs ${b}: same year, no clear answer`);
  });
  unique("duel", D.duel.map((x) => x[0] + "|" + x[2]));
});

test("emoji, gap, color, duet", () => {
  D.emoji.forEach(([e, a, w]) => { assert.ok(str(e) && str(a)); wrongs(a, w); });
  D.gap.forEach(([p, a, w, ar]) => { assert.ok(p.includes("___"), `gap "${p}" needs ___`); assert.ok(str(a) && str(ar)); wrongs(a, w); });
  D.color.forEach(([s, a, w]) => {
    assert.ok(Array.isArray(s) && s.length >= 3 && s.length <= 10, `color ${a}: 3–10 swatches`);
    s.forEach((c) => assert.match(c, /^#[0-9a-f]{6}$/i, `color ${a}: bad hex ${c}`));
    assert.ok(str(a)); wrongs(a, w);
  });
  D.duet.forEach(([s, k, a, w]) => { assert.ok(str(s) && str(k) && str(a) && k !== a); wrongs(a, w); });
  unique("emoji", D.emoji.map((x) => x[1]));
  unique("gap", D.gap.map((x) => x[0]));
  unique("color", D.color.map((x) => x[1]));
  unique("duet", D.duet.map((x) => x[0]));
});

test("time", () => {
  D.time.forEach((set) => {
    assert.equal(set.length, 4, "timeline sets have 4 songs");
    set.forEach(([s, y]) => assert.ok(str(s) && year(y), `time ${s}`));
    assert.equal(new Set(set.map((x) => x[1])).size, 4, `timeline ${set[0][0]}: years must all differ`);
  });
});

test("bio", () => {
  D.bio.forEach(([a, h, w]) => {
    assert.ok(str(a));
    assert.equal(h.length, 4, `bio ${a}: 4 clues`);
    h.forEach((c) => assert.ok(str(c)));
    wrongs(a, w);
  });
  unique("bio", D.bio.map((x) => x[0]));
});

test("rare", () => {
  D.rare.forEach(([p, t]) => {
    assert.ok(str(p));
    ["c", "m", "r"].forEach((k) => {
      assert.ok(Array.isArray(t[k]) && t[k].length >= 3, `rare "${p}": tier ${k} needs ≥3 answers`);
      t[k].forEach((s) => assert.equal(s, s.toLowerCase(), `rare "${p}": "${s}" must be lower case`));
    });
    const all = [...t.c, ...t.m, ...t.r];
    assert.equal(new Set(all).size, all.length, `rare "${p}": answer listed in two tiers`);
  });
  unique("rare", D.rare.map((x) => x[0]));
});
