// Pure game logic for Spindle: daily seed, quiz building, scoring.
// No DOM access here, so it can be unit-tested with Node.
var SpindleLogic = (function () {
  var EPOCH = Date.UTC(2026, 10, 26); // Spindle #1 = 26 Nov 2026
  var TZ = "America/New_York"; // new quiz at midnight New York time
  var ROUND_ORDER = ["duel", "emoji", "gap", "color", "time", "bio", "duet"];

  // Mulberry32 – small seeded PRNG so every player gets the same daily quiz.
  function mulberry32(a) {
    return function () {
      a |= 0;
      a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // "YYYY-MM-DD" for the given date in New York time.
  function isoDay(date) {
    return (date || new Date()).toLocaleDateString("sv-SE", { timeZone: TZ });
  }

  function dayNumber(iso) {
    var p = iso.split("-").map(Number);
    return Math.max(0, Math.round((Date.UTC(p[0], p[1] - 1, p[2]) - EPOCH) / 864e5));
  }

  function makeTools(rng) {
    return {
      pick: function (a) { return a[Math.floor(rng() * a.length)]; },
      shuffle: function (a) {
        a = a.slice();
        for (var i = a.length - 1; i > 0; i--) {
          var j = Math.floor(rng() * (i + 1));
          var t = a[i]; a[i] = a[j]; a[j] = t;
        }
        return a;
      }
    };
  }

  function makeQuestion(c, D, T) {
    var pick = T.pick, shuffle = T.shuffle, r;
    switch (c) {
      case "duel":
        r = pick(D.duel);
        var a = r[0], ay = r[1], b = r[2], by = r[3];
        return { c: c, type: "mc", sec: 20, duo: true, prompt: "Which song is older?",
          opts: shuffle([a, b]), ans: ay < by ? a : b,
          reveal: a.split(" – ")[0] + ": " + ay + " · " + b.split(" – ")[0] + ": " + by };
      case "emoji":
        r = pick(D.emoji);
        return { c: c, type: "mc", sec: 20, big: r[0], prompt: "Which song is hiding here?",
          opts: shuffle([r[1]].concat(r[2])), ans: r[1] };
      case "gap":
        r = pick(D.gap);
        return { c: c, type: "mc", sec: 20, big: r[0], prompt: "Complete the title by " + r[3],
          opts: shuffle([r[1]].concat(r[2])), ans: r[1] };
      case "color":
        r = pick(D.color);
        return { c: c, type: "mc", sec: 20, sw: r[0], prompt: "Which album cover matches this colour palette?",
          opts: shuffle([r[1]].concat(r[2])), ans: r[1] };
      case "time":
        return { c: c, type: "order", sec: 30, prompt: "Sort from oldest to newest", items: shuffle(pick(D.time)) };
      case "bio":
        r = pick(D.bio);
        return { c: c, type: "bio", sec: 30, prompt: "Who is it? Fewer clues, more points.",
          hints: r[1], opts: shuffle([r[0]].concat(r[2])), ans: r[0] };
      case "duet":
        r = pick(D.duet);
        return { c: c, type: "mc", sec: 20, big: "“" + r[0] + "”", prompt: r[1] + " and …?",
          opts: shuffle([r[2]].concat(r[3])), ans: r[2] };
      default:
        r = pick(D.rare);
        return { c: "rare", type: "text", sec: 25, prompt: r[0], tiers: r[1] };
    }
  }

  // Seven shuffled rounds plus the free-text finale, identical for everyone on a given day.
  function buildQuiz(day, D) {
    var T = makeTools(mulberry32(day * 9973 + 17));
    return T.shuffle(ROUND_ORDER).map(function (c) { return makeQuestion(c, D, T); })
      .concat([makeQuestion("rare", D, T)]);
  }

  // Lower-case, strip accents and punctuation, drop a leading "the".
  function norm(s) {
    return " " + String(s).toLowerCase().normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/&/g, " and ")
      .replace(/[^a-z0-9]+/g, " ")
      .replace(/^ ?the /, " ")
      .trim() + " ";
  }

  // Which rarity tier ("r", "m", "c") a free-text answer hits, or null.
  function tier(v, tiers) {
    var n = norm(v);
    if (n.trim().length < 2) return null;
    var keys = ["r", "m", "c"];
    for (var k = 0; k < keys.length; k++) {
      var list = tiers[keys[k]];
      for (var i = 0; i < list.length; i++) {
        var m = norm(list[i]);
        if (n === m || n.indexOf(m) > -1) return keys[k];
      }
    }
    return null;
  }

  // Optimal string alignment distance (Levenshtein + swapped neighbours), capped for speed.
  function editDistance(a, b, cap) {
    if (Math.abs(a.length - b.length) > cap) return cap + 1;
    var prev2 = null, prev = [], cur, i, j;
    for (j = 0; j <= b.length; j++) prev[j] = j;
    for (i = 1; i <= a.length; i++) {
      cur = [i];
      var rowMin = i;
      for (j = 1; j <= b.length; j++) {
        var cost = a[i - 1] === b[j - 1] ? 0 : 1;
        var v = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
        if (prev2 && i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) v = Math.min(v, prev2[j - 2] + 1);
        cur[j] = v;
        if (v < rowMin) rowMin = v;
      }
      if (rowMin > cap) return cap + 1;
      prev2 = prev; prev = cur;
    }
    return prev[b.length];
  }

  // How many typos we tolerate for an answer of this length (letters only, spaces ignored).
  function typoBudget(len) {
    return len < 5 ? 0 : len <= 8 ? 1 : len <= 14 ? 2 : 3;
  }

  // For an answer that doesn't match exactly: the closest known answer within the typo budget, or null.
  // Spaces are ignored, so "eyeofthetigr" or "eye of thetiger" are caught too.
  function suggest(v, tiers) {
    if (tier(v, tiers)) return null;
    var n = norm(v).replace(/ /g, "");
    if (n.length < 4) return null;
    var best = null, bestD = Infinity;
    ["r", "m", "c"].forEach(function (k) {
      tiers[k].forEach(function (s) {
        var m = norm(s).replace(/ /g, "");
        var budget = typoBudget(m.length);
        if (!budget) return;
        var d = editDistance(n, m, budget);
        if (d <= budget && d < bestD) { best = s; bestD = d; }
      });
    });
    return best;
  }

  // "eye of the tiger" -> "Eye Of The Tiger" for display.
  function titleCase(s) {
    return String(s).replace(/\b\w/g, function (m) { return m.toUpperCase(); });
  }

  var TIER_POINTS = { c: 30, m: 60, r: 100 };

  function mcPoints(correct, fractionLeft) { return correct ? 60 + Math.round(40 * fractionLeft) : 0; }
  function bioPoints(correct, cluesUsed) { return correct ? 100 - 20 * (cluesUsed - 1) : 0; }

  // seq = indices of items in the order the player tapped them.
  function orderCorrect(items, seq) {
    var sorted = items.map(function (_, k) { return k; })
      .sort(function (a, b) { return items[a][1] - items[b][1]; });
    var show = {}, count = 0;
    items.forEach(function (_, k) {
      var pos = seq.indexOf(k);
      show[k] = pos > -1 && sorted[pos] === k;
      if (show[k]) count++;
    });
    return { show: show, count: count, points: count * 25 };
  }

  function shareGrid(res, star) {
    return res.map(function (p, k) {
      if (k === res.length - 1 && star) return "🌟";
      return p >= 80 ? "🟩" : p >= 40 ? "🟨" : p > 0 ? "🟧" : "⬛";
    }).join("");
  }

  function nextStreak(last, iso) {
    if (!last) return 1;
    var d = Math.round((Date.parse(iso + "T00:00:00Z") - Date.parse(last.date + "T00:00:00Z")) / 864e5);
    return d === 1 ? last.streak + 1 : d === 0 ? last.streak : 1;
  }

  // Share of the *other* players today with a lower score, 0–100. null if you're the only player.
  function betterThan(stats) {
    var others = (stats && stats.players ? stats.players : 0) - 1;
    if (others < 1) return null;
    return Math.round(100 * Math.min(stats.below, others) / others);
  }

  return {
    TZ: TZ, betterThan: betterThan, mulberry32: mulberry32, isoDay: isoDay, dayNumber: dayNumber, buildQuiz: buildQuiz,
    norm: norm, tier: tier, editDistance: editDistance, suggest: suggest, titleCase: titleCase, TIER_POINTS: TIER_POINTS, mcPoints: mcPoints, bioPoints: bioPoints,
    orderCorrect: orderCorrect, shareGrid: shareGrid, nextStreak: nextStreak
  };
})();

if (typeof module !== "undefined") module.exports = SpindleLogic;
