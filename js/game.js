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

  var i = 0, res = [], star = false;
  var tm = null, t0 = 0, dur = 1;

  var disc = '<svg class="rec" viewBox="0 0 300 300" aria-hidden="true">' +
    '<ellipse cx="150" cy="282" rx="110" ry="12" fill="rgba(0,0,0,.18)"/><g class="spin">' +
    '<circle cx="150" cy="150" r="140" fill="#24121f"/>' +
    [124, 110, 96, 82, 68].map(function (r) {
      return '<circle cx="150" cy="150" r="' + r + '" fill="none" stroke="#3a2232" stroke-width="2"/>';
    }).join("") +
    '<path d="M150 10 A140 140 0 0 1 270 80" stroke="rgba(255,255,255,.22)" stroke-width="10" fill="none" stroke-linecap="round"/>' +
    '<circle cx="150" cy="150" r="52" fill="#ffcf3a"/><g transform="translate(152 146)" fill="#24121f">' +
    '<ellipse cx="-12" cy="20" rx="13" ry="9" transform="rotate(-22 -12 20)"/><rect x="-2" y="-30" width="5" height="50"/>' +
    '<path d="M3 -30 q20 8 17 34 q-3 -16 -17 -18z"/></g><circle cx="150" cy="150" r="5" fill="#fff"/></g></svg>';

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
    app.innerHTML = '<div class="hero">' + disc + "<h1>Spindle</h1>" +
      '<p class="sub">The daily music quiz with no sound needed. ' + TOTAL + " tracks, about 3 minutes. New every day, the same for everyone.</p>" +
      '<div class="card" style="width:100%"><ol class="tl">' +
      Q.map(function (q, n) {
        var side = n === 0 ? '<li class="side">Side A</li>' : n === TOTAL / 2 ? '<li class="side">Side B</li>' : "";
        return side + "<li><b>" + (n + 1) + "</b>" + esc(LBL[q.c]) + "</li>";
      }).join("") +
      "</ol></div>" +
      '<button class="go" id="go">' + (saved ? "See today’s result" : "Drop the needle") + "</button>" +
      '<div class="meta">Spindle #' + (day + 1) + " · " + esc(dateLabel) + "</div></div>";
    $("#go").onclick = function () { saved ? result(saved) : question(); };
  }

  // ---------- Question ----------
  function question() {
    var x = Q[i];
    var pts = res.reduce(function (a, b) { return a + b; }, 0);
    app.innerHTML = '<div class="top"><div class="dots">' +
      Q.map(function (_, n) { return '<span class="' + (n < i ? "done" : n === i ? "now" : "") + '"></span>'; }).join("") +
      "</div><div>" + pts + " pts</div></div>" +
      '<div class="card"><div class="lab">Track ' + (i + 1) + "/" + TOTAL + " · " + esc(LBL[x.c]) + "</div>" +
      '<div class="bar"><i></i></div><div id="body"></div><div class="fb" id="fb" aria-live="polite"></div></div>';
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
      '<button class="go next" type="submit">Submit</button></form>';
    $("#in").focus();
    var finished = false;
    function fin() {
      if (finished) return;
      finished = true;
      stop();
      var v = $("#in").value;
      $("#in").disabled = true;
      $("#f button").disabled = true;
      var t = L.tier(v, x.tiers);
      var names = { c: "Popular pick", m: "Pretty rare", r: "Super rare! 🌟" };
      var ex = x.tiers.r.slice(0, 3).map(function (s) { return s.replace(/\b\w/g, function (m) { return m.toUpperCase(); }); }).join(", ");
      var tail = "<p>Rare answers include: " + esc(ex) + "</p>";
      done(t ? L.TIER_POINTS[t] : 0,
        t ? '<span class="g">' + names[t] + " +" + L.TIER_POINTS[t] + "</span>" + tail
          : '<span class="r">' + (v.trim() ? "“" + esc(v.trim()) + "” isn’t on our list." : "No answer.") + "</span>" + tail,
        t === "r");
    }
    $("#f").onsubmit = function (e) { e.preventDefault(); fin(); };
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
    var r = { total: total, grid: L.shareGrid(res, star), res: res, streak: streak, cats: Q.map(function (x) { return x.c; }) };
    store.set("spindle-" + today, r);
    store.set("spindle-last", { date: today, streak: streak });
    result(r);
  }

  function result(r) {
    stop();
    var txt = "Spindle #" + (day + 1) + " 🎵 " + r.total + "/" + MAX + "\n" + r.grid;
    app.innerHTML = '<div class="hero">' + disc.replace('class="spin"', "") +
      '<div class="card" style="width:100%"><div class="lab">Spindle #' + (day + 1) + "</div>" +
      '<div class="score big" style="margin:6px 0 0">' + r.total + "</div>" +
      '<div class="meta">out of ' + MAX + " points" + (r.streak > 1 ? " · " + r.streak + "-day streak" : "") + "</div>" +
      '<div class="grid">' + r.grid + '</div><button class="go" id="cp">Copy result</button><div id="cpo"></div>' +
      "<table>" + r.res.map(function (p, k) { return "<tr><td>" + (k + 1) + ". " + esc(LBL[r.cats[k]]) + "</td><td>" + p + "</td></tr>"; }).join("") + "</table>" +
      '<p class="meta" style="margin-top:14px">Next record in <b id="cd"></b></p></div></div>';
    $("#cp").onclick = function () {
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

  startScreen();
})();
