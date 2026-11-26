// Anonymous player statistics via Supabase (see supabase/schema.sql).
// The anon key is a public, browser-safe key: it can only call the two functions
// spindle_submit and spindle_stats, the table itself is not readable.
var SpindleStats = (function () {
  var URL = "https://yummzksyuhzdrsavihcg.supabase.co";
  var KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1bW16a3N5dWh6ZHJzYXZpaGNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTU3MjYyODcsImV4cCI6MjExMTMwMjI4N30.RlIcQyEcMKUKTWWB8XfKTjRIDkI9RJvAsWvgWfYNQ9A";

  function rpc(fn, body) {
    if (typeof fetch !== "function") return Promise.reject(new Error("no fetch"));
    var ctrl = typeof AbortController === "function" ? new AbortController() : null;
    var to = ctrl ? setTimeout(function () { ctrl.abort(); }, 8000) : null;
    return fetch(URL + "/rest/v1/rpc/" + fn, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: KEY, Authorization: "Bearer " + KEY },
      body: JSON.stringify(body),
      signal: ctrl ? ctrl.signal : undefined
    }).then(function (r) {
      if (to) clearTimeout(to);
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    });
  }

  return {
    submit: function (day, points, rare) { return rpc("spindle_submit", { p_day: day, p_points: points, p_rare: rare || null }); },
    stats: function (day, total, rare) { return rpc("spindle_stats", { p_day: day, p_total: total, p_rare: rare || null }); }
  };
})();
