// Spindle UI: renders screens and wires up input. Logic lives in logic.js, questions in data.js.
(function () {
  var L = SpindleLogic, D = SPINDLE_DATA, LBL = SPINDLE_LABELS;
  var $ = function (s) { return document.querySelector(s); };
  var app = $("#app");
  var esc = function (s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  };

  var today = L.isoDay();
  var parts = today.split("-").map(Number);
  var day = L.dayNumber(today);
  var Q = L.buildQuiz(day, D);
  var TOTAL = Q.length;
  var MAX = TOTAL * 100;

  var store = {
    get: function (k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage blocked */ } }
  };

  var i = 0, res = [], star = false, rareAnswer = null;
  var tm = null, t0 = 0, dur = 1;

  // Pixel-art record drawn on a 32×32 grid: one SVG path per colour, crisp edges.
  var disc = (function () {
    var N = 32, c = N / 2, paths = {};
    function put(col, x, y) { (paths[col] = paths[col] || []).push("M" + x + " " + y + "h1v1h-1z"); }
    for (var y = 0; y < N; y++) {
      for (var x = 0; x < N; x++) {
        var dx = x + 0.5 - c, dy = y + 0.5 - c, d = Math.sqrt(dx * dx + dy * dy);
        var ang = Math.atan2(-dy, dx) * 180 / Math.PI;
        if (d > 15) continue;
        if (d <= 1.2) put("#fff8e7", x, y);
        else if (d <= 5.4) put("#ffcf3a", x, y);
        else if (d <= 6.6) put("#ff6a55", x, y);
        else if (d >= 13 && d <= 14.2 && ang > 25 && ang < 75) put("#8a6a80", x, y);
        else if ((d >= 9.4 && d <= 10.2) || (d >= 12 && d <= 12.7)) put("#4a2a40", x, y);
        else put("#24121f", x, y);
      }
    }
    var body = Object.keys(paths).map(function (col) {
      return '<path fill="' + col + '" d="' + paths[col].join("") + '"/>';
    }).join("");
    return function (cls, spin) {
      return '<svg class="' + cls + '" viewBox="0 0 32 34" shape-rendering="crispEdges" aria-hidden="true">' +
        '<path fill="rgba(0,0,0,.25)" d="M5 32h22v2h-22z"/><g class="' + (spin ? "spin" : "") + '">' + body + "</g></svg>";
    };
  })();

  // Small record in the corner of every screen: click to go back to the main menu.
  function homeButton() {
    return '<button class="home" id="home" aria-label="Back to main menu" title="Main menu">' + disc("rec-s", false) + "</button>";
  }
  function wireHome() {
    var h = $("#home");
    if (h) h.onclick = function () { stop(); startScreen(); };
  }

  // "Title – Artist" -> title with artist as small subline.
  function optLabel(s) {
    var p = s.split(" – ");
    return esc(p[0]) + (p[1] ? "<small>" + esc(p[1]) + "</small>" : "");
  }

  // ---------- Timer ----------
  function left() { return Math.max(0, 1 - (Date.now() - t0) / dur); }
  function stop() { clearInterval(tm); }
  function timer(sec, onEnd) {
    stop();
    t0 = Date.now();
    dur = sec * 1000;
    tm = setInterval(function () {
      var f = left(), b = $(".bar i");
      if (b) b.style.width = (f * 100) + "%";
      if (f <= 0) { stop(); onEnd(); }
    }, 100);
  }

  // ---------- Start ----------
  function startScreen() {
    var saved = store.get("spindle-" + today);
    var dateLabel = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]))
      .toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
    // A quiz left halfway (via the record button) can be resumed.
    var inProgress = !saved && (i > 0 || res.length > 0);
    var goLabel = saved ? "See today’s result" : inProgress ? "Continue · Track " + (Math.min(res.length, TOTAL - 1) + 1) : "Drop the needle";
    app.innerHTML = '<div class="hero">' + disc("rec", true) + "<h1>Spindle</h1>" +
      '<p class="sub">The daily music quiz with no sound needed. ' + TOTAL + " tracks, about 3 minutes. New every day, the same for everyone.</p>" +
      '<div class="card" style="width:100%"><ol class="tl">' +
      Q.map(function (q, n) {
        var side = n === 0 ? '<li class="side">Side A</li>' : n === TOTAL / 2 ? '<li class="side">Side B</li>' : "";
        return side + "<li><b>" + (n + 1) + "</b>" + esc(LBL[q.c]) + "</li>";
      }).join("") +
      "</ol></div>" +
      '<button class="go" id="go">' + goLabel + "</button>" +
      '<div class="meta">Spindle #' + (day + 1) + " · " + esc(dateLabel) + "</div></div>";
    $("#go").onclick = function () {
      if (saved) return result(saved);
      // If the current track was already answered before leaving, move on to the next one.
      if (res.length > i) i = res.length;
      if (i >= TOTAL) return finish();
      question();
    };
  }

  // ---------- Question ----------
  function question() {
    var x = Q[i];
    var pts = res.reduce(function (a, b) { return a + b; }, 0);
    app.innerHTML = '<div class="top">' + homeButton() + '<div class="dots">' +
      Q.map(function (_, n) { return '<span class="' + (n < i ? "done" : n === i ? "now" : "") + '"></span>'; }).join("") +
      '</div><div class="pts">' + pts + " pts</div></div>" +
      '<div class="card"><div class="lab">Track ' + (i + 1) + "/" + TOTAL + " · " + esc(LBL[x.c]) + "</div>" +
      '<div class="bar"><i></i></div><div id="body"></div><div class="fb" id="fb" aria-live="polite"></div></div>';
    wireHome();
    var renderers = { mc: renderMC, bio: renderBio, order: renderOrder, text: renderText };
    renderers[x.type](x, $("#body"));
  }

  function lockOptions(bs, x, chosen) {
    bs.forEach(function (b, k) {
      b.disabled = true;
      if (x.opts[k] === x.ans) b.classList.add("ok");
      else if (k === chosen) b.classList.add("bad");
    });
  }

  function renderMC(x, B) {
    B.innerHTML = (x.big ? '<div class="big">' + esc(x.big) + "</div>" : "") +
      (x.sw ? '<div class="sw">' + x.sw.map(function (c) { return '<i style="background:' + esc(c) + '"></i>'; }).join("") + "</div>" : "") +
      '<div class="q">' + esc(x.prompt) + '</div><div class="opts' + (x.duo ? " duo" : "") + '">' +
      x.opts.map(function (o, n) { return '<button class="opt" data-n="' + n + '">' + optLabel(o) + "</button>"; }).join("") + "</div>";
    var bs = [].slice.call(B.querySelectorAll(".opt"));
    function fin(n) {
      stop();
      lockOptions(bs, x, n);
      var ok = n != null && x.opts[n] === x.ans;
      var p = L.mcPoints(ok, left());
      done(p, (ok ? '<span class="g">Correct! +' + p + "</span>"
        : '<span class="r">' + (n == null ? "Time’s up." : "Not quite.") + " Answer: " + esc(x.ans.split(" – ")[0]) + "</span>") +
        (x.reveal ? "<p>" + esc(x.reveal) + "</p>" : ""));
    }
    bs.forEach(function (b) { b.onclick = function () { fin(+b.dataset.n); }; });
    timer(x.sec, function () { fin(null); });
  }

  function renderBio(x, B) {
    var h = 1;
    B.innerHTML = '<div class="q">' + esc(x.prompt) + '</div><ul class="hints" id="hints"></ul>' +
      '<button class="ghost" id="more"></button><div class="opts" style="margin-top:14px">' +
      x.opts.map(function (o, n) { return '<button class="opt" data-n="' + n + '">' + esc(o) + "</button>"; }).join("") + "</div>";
    function draw() {
      $("#hints").innerHTML = x.hints.map(function (t, k) {
        return k < h ? "<li>" + esc(t) + "</li>" : '<li class="lock">Clue ' + (k + 1) + "</li>";
      }).join("");
      var max = x.hints.length;
      $("#more").disabled = h >= max;
      $("#more").textContent = h >= max ? "All clues revealed" : "Next clue (−20)";
    }
    draw();
    $("#more").onclick = function () { h = Math.min(x.hints.length, h + 1); draw(); };
    var bs = [].slice.call(B.querySelectorAll(".opt"));
    function fin(n) {
      stop();
      $("#more").disabled = true;
      lockOptions(bs, x, n);
      var ok = n != null && x.opts[n] === x.ans;
      var p = L.bioPoints(ok, h);
      done(p, ok ? '<span class="g">Correct with ' + h + " " + (h > 1 ? "clues" : "clue") + "! +" + p + "</span>"
        : '<span class="r">' + (n == null ? "Time’s up." : "Not quite.") + " It was " + esc(x.ans) + ".</span>");
    }
    bs.forEach(function (b) { b.onclick = function () { fin(+b.dataset.n); }; });
    timer(x.sec, function () { fin(null); });
  }

  function renderOrder(x, B) {
    var seq = [], n = x.items.length;
    B.innerHTML = '<div class="q">' + esc(x.prompt) + '</div><p class="meta" style="margin-top:-8px">Tap the songs in the right order.</p>' +
      '<div class="opts" id="ol"></div><div class="row"><button class="ghost" id="rs">Reset</button>' +
      '<button class="go" id="ck" disabled>Check</button></div>';
    function draw(show) {
      $("#ol").innerHTML = x.items.map(function (it, k) {
        var p = seq.indexOf(k);
        return '<button class="opt ord' + (p > -1 ? " sel" : "") + (show ? (show[k] ? " ok" : " bad") : "") + '" data-k="' + k + '"' +
          (show ? " disabled" : "") + '><span class="num">' + (p > -1 ? p + 1 : "") + "</span><span>" + optLabel(it[0]) +
          (show ? "<small>" + it[1] + "</small>" : "") + "</span></button>";
      }).join("");
      if (show) return;
      $("#ol").querySelectorAll(".opt").forEach(function (b) {
        b.onclick = function () {
          var k = +b.dataset.k;
          if (seq.indexOf(k) < 0 && seq.length < n) {
            seq.push(k);
            draw();
            $("#ck").disabled = seq.length < n;
          }
        };
      });
    }
    draw();
    $("#rs").onclick = function () { seq = []; draw(); $("#ck").disabled = true; };
    function fin() {
      stop();
      var r = L.orderCorrect(x.items, seq);
      draw(r.show);
      $("#rs").disabled = true;
      $("#ck").disabled = true;
      done(r.points, '<span class="' + (r.count ? "g" : "r") + '">' + r.count + "/" + n + " in the right spot. +" + r.points + "</span>");
    }
    $("#ck").onclick = fin;
    timer(x.sec, fin);
  }

  function renderText(x, B) {
    B.innerHTML = '<div class="big" style="font-size:clamp(24px,6vw,34px)">' + esc(x.prompt) + "</div>" +
      '<p class="meta" style="text-align:center;margin-top:-6px">The rarer your correct answer, the more points.</p>' +
      '<form id="f"><input type="text" id="in" autocomplete="off" placeholder="Your answer" aria-label="Your answer">' +
      '<div class="dym" id="dym" aria-live="polite"></div>' +
      '<button class="go next" type="submit">Submit</button></form>';
    $("#in").focus();
    var finished = false;
    var asked = null; // the text we already offered a correction for

    // Small typo? Ask "Did you mean …?" once before submitting.
    function trySubmit() {
      var v = $("#in").value;
      if (asked === v) return fin(); // second Enter on the same text: keep it as typed
      var s = L.suggest(v, x.tiers);
      if (!s) return fin();
      asked = v;
      var nice = L.titleCase(s);
      $("#dym").innerHTML = '<p class="dym-q">Did you mean <b>“' + esc(nice) + '”</b>?</p>' +
        '<div class="row"><button type="button" class="go" id="dy">Yes, that one</button>' +
        '<button type="button" class="ghost" id="dn">No, keep mine</button></div>';
      $("#dy").onclick = function () { $("#in").value = nice; fin(); };
      $("#dn").onclick = function () { fin(); };
      $("#dy").focus();
    }
    function fin() {
      if (finished) return;
      finished = true;
      stop();
      var v = $("#in").value;
      $("#in").disabled = true;
      $("#f").querySelectorAll("button").forEach(function (b) { b.disabled = true; });
      $("#dym").innerHTML = "";
      var t = L.tier(v, x.tiers);
      rareAnswer = L.norm(v).trim().slice(0, 60) || null;
      var names = { c: "Popular pick", m: "Pretty rare", r: "Super rare! 🌟" };
      var ex = x.tiers.r.slice(0, 3).map(function (s) { return s.replace(/\b\w/g, function (m) { return m.toUpperCase(); }); }).join(", ");
      var tail = "<p>Rare answers include: " + esc(ex) + "</p>";
      done(t ? L.TIER_POINTS[t] : 0,
        t ? '<span class="g">' + names[t] + " +" + L.TIER_POINTS[t] + "</span>" + tail
          : '<span class="r">' + (v.trim() ? "“" + esc(v.trim()) + "” isn’t on our list." : "No answer.") + "</span>" + tail,
        t === "r");
    }
    $("#f").onsubmit = function (e) { e.preventDefault(); trySubmit(); };
    timer(x.sec, fin);
  }

  function done(p, html, isStar) {
    res.push(p);
    if (isStar) star = true;
    var last = i >= TOTAL - 1;
    $("#fb").innerHTML = html + '<button class="go next" id="nx">' + (last ? "See result" : "Next track") + "</button>";
    $("#nx").focus();
    $("#nx").onclick = function () { i++; i < TOTAL ? question() : finish(); };
  }

  // ---------- Result ----------
  function finish() {
    var total = res.reduce(function (a, b) { return a + b; }, 0);
    var streak = L.nextStreak(store.get("spindle-last"), today);
    var r = { total: total, grid: L.shareGrid(res, star), res: res, streak: streak, cats: Q.map(function (x) { return x.c; }),
      rare: rareAnswer, submitted: false };
    store.set("spindle-" + today, r);
    store.set("spindle-last", { date: today, streak: streak });
    result(r);
  }

  function result(r) {
    stop();
    var pct = null;
    var shareText = function () {
      return "Spindle #" + (day + 1) + " 🎵 " + r.total + "/" + MAX + "\n" + r.grid +
        (pct != null ? "\n🏆 Better than " + pct + "% of players" : "");
    };
    app.innerHTML = '<div class="hero"><button class="home home-big" id="home" aria-label="Back to main menu" title="Main menu">' +
      disc("rec", false) + "</button>" +
      '<div class="card" style="width:100%"><div class="lab">Spindle #' + (day + 1) + "</div>" +
      '<div class="score big" style="margin:6px 0 0">' + r.total + "</div>" +
      '<div class="meta">out of ' + MAX + " points" + (r.streak > 1 ? " · " + r.streak + "-day streak" : "") + "</div>" +
      '<div class="stats" id="stats" aria-live="polite"><p class="meta">Comparing with other players…</p></div>' +
      '<div class="grid">' + r.grid + '</div><button class="go" id="cp">Copy result</button><div id="cpo"></div>' +
      "<table>" + r.res.map(function (p, k) { return "<tr><td>" + (k + 1) + ". " + esc(LBL[r.cats[k]]) + "</td><td>" + p + "</td></tr>"; }).join("") + "</table>" +
      '<p class="meta" style="margin-top:14px">Next record in <b id="cd"></b></p></div></div>';
    wireHome();
    loadStats(r, function (p) { pct = p; });
    $("#cp").onclick = function () {
      var txt = shareText();
      var fallback = function () {
        $("#cpo").innerHTML = '<textarea rows="3" readonly>' + esc(txt) + "</textarea>";
        $("#cpo textarea").select();
      };
      if (!navigator.clipboard) return fallback();
      navigator.clipboard.writeText(txt).then(function () { $("#cp").textContent = "Copied!"; }).catch(fallback);
    };
    function countdown() {
      var p = {};
      new Intl.DateTimeFormat("de-DE", { timeZone: L.TZ, hour: "numeric", minute: "numeric", second: "numeric", hourCycle: "h23" })
        .formatToParts(new Date()).forEach(function (o) { p[o.type] = +o.value; });
      var s = 86400 - (p.hour * 3600 + p.minute * 60 + p.second);
      var el = $("#cd");
      if (el) el.textContent = Math.floor(s / 3600) + "h " + Math.floor((s % 3600) / 60) + "m";
    }
    countdown();
    tm = setInterval(countdown, 30000);
  }

  // ---------- Player statistics ----------
  // First view after finishing: submit the result (once). Later views: just fetch fresh stats.
  function loadStats(r, onPct) {
    if (typeof SpindleStats === "undefined") return showStatsError();
    var req = r.submitted ? SpindleStats.stats(day, r.total, r.rare) : SpindleStats.submit(day, r.res, r.rare);
    req.then(function (s) {
      if (!r.submitted) {
        r.submitted = true;
        store.set("spindle-" + today, r);
      }
      var p = L.betterThan(s);
      onPct(p);
      renderStats(s, r, p);
    }).catch(showStatsError);
  }

  function showStatsError() {
    var el = $("#stats");
    if (el) el.innerHTML = '<p class="meta">Player comparison is unavailable right now.</p>';
  }

  function renderStats(s, r, p) {
    var el = $("#stats");
    if (!el) return;
    var players = s.players || 0;
    var head = p == null
      ? '<div class="pct px">First player today!</div><p class="meta">Come back later to see how you compare.</p>'
      : '<div class="pct-lab">Better than</div><div class="pct px">' + p + "%</div>" +
        '<p class="meta">of today’s ' + players + " players</p>";
    // score distribution: one pixel column per 100 points, yours highlighted
    var b = s.buckets || [];
    var max = Math.max.apply(null, b.concat([1]));
    var mine = Math.min(Math.floor(r.total / 100), 8);
    var hist = players > 1 && b.length === 9
      ? '<div class="hist" role="img" aria-label="Score distribution of today’s players">' +
        b.map(function (n, k) {
          var h = n ? Math.max(1, Math.round(8 * n / max)) : 0;
          return '<div class="col' + (k === mine ? " me" : "") + '"><i style="height:' + (h * 6) + 'px"></i><span>' +
            (k === 8 ? "800" : k * 100) + "</span></div>";
        }).join("") + "</div>"
      : "";
    var rare = "";
    if (r.rare && s.rare_same && players > 1) {
      var share = Math.round(100 * s.rare_same / players);
      rare = '<p class="meta">' + share + "% of players also answered “" + esc(r.rare) + "” in the finale</p>";
    }
    el.innerHTML = head + hist + rare;
  }

  startScreen();
})();
