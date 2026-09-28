(function (root, factory) {
  var api = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (root) root.SEQStore = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  var KEY = "seq.practice.v1";
  var MAX_RUNS = 300;

  function empty() {
    return {
      version: 1,
      runs: [],
      coverage: {},
      prefs: {
        mathMinutes: 5,
        seqMinutes: 6,
        mathScoring: "paper",
        seqScoring: "paper",
      },
    };
  }

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return empty();
      var data = JSON.parse(raw);
      var base = empty();
      data.runs = Array.isArray(data.runs) ? data.runs : [];
      data.coverage = data.coverage || {};
      data.prefs = Object.assign(base.prefs, data.prefs || {});
      data.version = 1;
      return data;
    } catch (err) {
      return empty();
    }
  }

  function persist(data) {
    localStorage.setItem(KEY, JSON.stringify(data));
  }

  function uid() {
    if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
  }

  function grade(given, expected) {
    var clean = function (s) {
      return String(s == null ? "" : s).trim().replace(/[\s,]/g, "");
    };
    var a = clean(given);
    var e = clean(expected);
    if (!a || !e) return false;
    if (/^-?\d+$/.test(e)) {
      if (!/^-?\d+$/.test(a)) return false;
      try {
        return BigInt(a) === BigInt(e);
      } catch (err) {
        return false;
      }
    }
    return a.toUpperCase() === e.toUpperCase();
  }

  function saveRun(run) {
    var data = load();
    data.runs.unshift(run);
    if (data.runs.length > MAX_RUNS) data.runs.length = MAX_RUNS;
    if (run.section === "seq") {
      var now = Date.now();
      var seen = {};
      (run.questions || []).forEach(function (q) {
        if (!q.familyId || seen[q.familyId]) return;
        seen[q.familyId] = true;
        var prev = data.coverage[q.familyId] || { count: 0, last: 0 };
        prev.count += 1;
        prev.last = now;
        prev.name = q.family;
        prev.group = q.group;
        data.coverage[q.familyId] = prev;
      });
    }
    persist(data);
    return run;
  }

  function runs() {
    return load().runs.slice();
  }

  function coverage() {
    return Object.assign({}, load().coverage);
  }

  function prefs() {
    return Object.assign({}, load().prefs);
  }

  function setPrefs(next) {
    var data = load();
    data.prefs = Object.assign(data.prefs, next);
    persist(data);
    return data.prefs;
  }

  function recomputeCoverage(data) {
    var coverage = {};
    data.runs.slice().reverse().forEach(function (run) {
      if (run.section !== "seq") return;
      var seen = {};
      (run.questions || []).forEach(function (q) {
        if (!q.familyId || seen[q.familyId]) return;
        seen[q.familyId] = true;
        var prev = coverage[q.familyId] || { count: 0, last: 0 };
        prev.count += 1;
        prev.last = new Date(run.startedAt).getTime() || Date.now();
        prev.name = q.family;
        prev.group = q.group;
        coverage[q.familyId] = prev;
      });
    });
    data.coverage = coverage;
  }

  function deleteRun(id) {
    var data = load();
    data.runs = data.runs.filter(function (r) { return r.id !== id; });
    recomputeCoverage(data);
    persist(data);
  }

  function clearAll() {
    var data = load();
    var kept = data.prefs;
    var fresh = empty();
    fresh.prefs = kept;
    persist(fresh);
  }

  return {
    load: load,
    saveRun: saveRun,
    runs: runs,
    coverage: coverage,
    prefs: prefs,
    setPrefs: setPrefs,
    deleteRun: deleteRun,
    clearAll: clearAll,
    grade: grade,
    uid: uid,
  };
});
