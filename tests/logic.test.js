// Run with: node --test
const test = require("node:test");
const assert = require("node:assert/strict");
const L = require("../js/logic.js");
const { SPINDLE_DATA: D, SPINDLE_LABELS: LBL } = require("../js/data.js");

test("same day gives the same quiz", () => {
  assert.deepEqual(L.buildQuiz(5, D), L.buildQuiz(5, D));
});

test("quiz has 7 different rounds plus the rare finale", () => {
  for (let day = 0; day < 50; day++) {
    const q = L.buildQuiz(day, D);
    assert.equal(q.length, 8);
    assert.equal(q[7].c, "rare");
    assert.equal(new Set(q.slice(0, 7).map((x) => x.c)).size, 7);
    q.forEach((x) => assert.ok(LBL[x.c], "label for " + x.c));
    q.filter((x) => x.opts).forEach((x) => assert.ok(x.opts.includes(x.ans)));
  }
});

test("dayNumber counts from launch day", () => {
  assert.equal(L.dayNumber("2026-11-26"), 0);
  assert.equal(L.dayNumber("2026-11-27"), 1);
  assert.equal(L.dayNumber("2027-11-26"), 365);
  assert.equal(L.dayNumber("2020-01-01"), 0);
});

test("norm strips case, accents, punctuation and leading 'the'", () => {
  assert.equal(L.norm("The Hives!"), " hives ");
  assert.equal(L.norm("José González"), " jose gonzalez ");
  assert.equal(L.norm("Peter, Bjorn & John"), " peter bjorn and john ");
});

test("tier finds rarest matching tier", () => {
  const t = D.rare[1][1]; // Sweden
  assert.equal(L.tier("ABBA", t), "c");
  assert.equal(L.tier("Robyn", t), "m");
  assert.equal(L.tier("The Hives", t), "r");
  assert.equal(L.tier("Coldplay", t), null);
  assert.equal(L.tier(" ", t), null);
});

test("scoring helpers", () => {
  assert.equal(L.mcPoints(true, 1), 100);
  assert.equal(L.mcPoints(true, 0), 60);
  assert.equal(L.mcPoints(false, 1), 0);
  assert.equal(L.bioPoints(true, 1), 100);
  assert.equal(L.bioPoints(true, 4), 40);
  assert.equal(L.bioPoints(false, 1), 0);
});

test("orderCorrect scores each item in the right slot", () => {
  const items = [["B", 1990], ["A", 1970], ["D", 2010], ["C", 2000]];
  assert.equal(L.orderCorrect(items, [1, 0, 3, 2]).points, 100);
  assert.equal(L.orderCorrect(items, [0, 1, 3, 2]).count, 2);
  assert.equal(L.orderCorrect(items, []).points, 0);
});

test("shareGrid and streak", () => {
  assert.equal(L.shareGrid([100, 50, 10, 0, 80, 40, 1, 100], true), "🟩🟨🟧⬛🟩🟨🟧🌟");
  assert.equal(L.nextStreak(null, "2026-12-01"), 1);
  assert.equal(L.nextStreak({ date: "2026-11-30", streak: 3 }, "2026-12-01"), 4);
  assert.equal(L.nextStreak({ date: "2026-12-01", streak: 3 }, "2026-12-01"), 3);
  assert.equal(L.nextStreak({ date: "2026-11-28", streak: 3 }, "2026-12-01"), 1);
});
