(function () {
  "use strict";

  var Store = window.SEQStore;
  var MathPaper = window.SEQMath;
  var Seq = window.SEQSeq;
  var app = document.getElementById("app");

  var state = {
    view: "home",
    mode: null,
    section: null,
    scoring: "paper",
    minutes: 5,
    cap: 50,
    durationMs: 0,
    questions: [],
    index: 0,
    answers: [],
    correct: 0,
    misses: 0,
    tries: 0,
    lastWrong: null,
    shownAt: 0,
    startedAt: 0,
    endsAt: 0,
    timer: null,
    locked: false,
    finished: false,
    sittingId: null,
    mathRun: null,
    reviewRuns: [],
    detailId: null,
    filter: "all",
    reason: null,
    untimed: false,
    studyGroup: "All",
    studyCards: null,
    prefs: Store.prefs(),
  };

  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function pad(n) {
    return String(n).padStart(2, "0");
  }

  function formatLeft(ms) {
    var secs = ms <= 0 ? 0 : Math.ceil(ms / 1000);
    var m = Math.floor(secs / 60);
    var s = secs % 60;
    return m + ":" + String(s).padStart(2, "0");
  }

  function formatElapsed(ms) {
    var secs = Math.max(0, Math.floor(ms / 1000));
    return Math.floor(secs / 60) + ":" + String(secs % 60).padStart(2, "0");
  }

  function formatUsed(ms) {
    var secs = Math.max(0, Math.round(ms / 1000));
    return Math.floor(secs / 60) + ":" + String(secs % 60).padStart(2, "0");
  }

  function formatWhen(iso) {
    var d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  }

  function words(mins) {
    return { 1: "One minute", 2: "Two minutes", 5: "Five minutes", 6: "Six minutes" }[mins] || (mins + " minutes");
  }

  function sectionTitle(section) {
    if (section === "math") return "Mental arithmetic";
    if (section === "study") return "Study";
    return "Sequences";
  }

  function sectionNo(section) {
    return section === "math" ? "02" : "03";
  }

  function promptOf(q) {
    if (q.kind === "math") return q.left + "  " + q.op + "  " + q.right;
    return (q.tokens || []).join("   ");
  }

  function scoreText() {
    var n = Math.min(state.index + 1, state.cap || 1);
    var line = pad(n) + " / " + pad(state.cap) + "    ·    " + state.correct + " correct";
    if (state.misses) line += "    ·    " + state.misses + " missed";
    return line;
  }

  function questionHtml(q) {
    if (q.kind === "math") {
      return '<p class="eq" aria-label="' + esc(promptOf(q)) + '"><span>' + esc(q.left) + '</span><span class="eq-op">' + esc(q.op) + '</span><span>' + esc(q.right) + '</span></p>';
    }
    var dense = q.tokens.length > 6 || q.tokens.some(function (t) { return t.length > 4; });
    var bits = q.tokens.map(function (t) {
      return t === "?" ? '<span class="gap">?</span>' : "<span>" + esc(t) + "</span>";
    }).join("");
    return '<p class="tokens' + (dense ? " dense" : "") + '" aria-label="' + esc(promptOf(q)) + '">' + bits + "</p>";
  }

  function nav(current) {
    function link(view, label) {
      var currentAttr = current === view ? ' aria-current="page"' : "";
      return '<button type="button" data-action="goto" data-view="' + view + '"' + currentAttr + ">" + label + "</button>";
    }
    return '<header class="nav"><button type="button" class="brand" data-action="goto" data-view="home">SEQ</button><nav class="navlinks">' + link("log", "Log") + link("patterns", "Patterns") + link("study", "Study") + "</nav></header>";
  }

  function pill(pref, value, label) {
    var on = String(state.prefs[pref]) === String(value);
    return '<button type="button" class="pill" data-action="pref" data-pref="' + pref + '" data-value="' + value + '" aria-pressed="' + (on ? "true" : "false") + '">' + label + "</button>";
  }

  function runsFor(section, minutes) {
    return Store.runs().filter(function (r) { return r.section === section && r.minutes === minutes; });
  }

  function bestOf(runs) {
    if (!runs.length) return null;
    return runs.slice().sort(function (a, b) {
      return b.correct - a.correct || b.accuracy - a.accuracy || a.usedMs - b.usedMs;
    })[0];
  }

  function statBlock(section, minutes, label) {
    var runs = runsFor(section, minutes);
    var best = bestOf(runs);
    var recent = runs.slice(0, 10);
    var avg = recent.length ? recent.reduce(function (s, r) { return s + r.correct; }, 0) / recent.length : 0;
    var bars = recent.slice().reverse();
    var max = bars.reduce(function (m, r) { return Math.max(m, r.correct); }, 1);
    var barHtml = bars.length
      ? '<div class="bars" aria-hidden="true">' + bars.map(function (r) {
        return '<i style="height:' + Math.max(8, Math.round((r.correct / max) * 100)) + '%"></i>';
      }).join("") + "</div>"
      : "";
    var figure = best ? '<p class="stat-num">' + best.correct + "</p>" : "";
    var meta = best
      ? "Best correct · recent average " + avg.toFixed(1) + " · " + runs.length + (runs.length === 1 ? " paper" : " papers")
      : "No papers at this timing yet";
    return '<div><p class="kicker">' + esc(label) + " · " + minutes + ":00</p>" + figure + '<p class="stat-meta">' + meta + "</p>" + barHtml + "</div>";
  }

  function logRows(list) {
    if (!list.length) return '<p class="empty">No papers yet.</p>';
    return list.map(function (r) {
      var acc = r.attempted ? Math.round(r.accuracy * 100) + "%" : "n/a";
      var name = sectionTitle(r.section);
      var tag = r.sittingId ? '<span class="tag">Full paper</span>' : "";
      var timing = r.section === "study" ? "Untimed · " + formatUsed(r.usedMs || 0) : r.minutes + ":00 · " + formatUsed(r.usedMs || 0);
      return '<button type="button" class="log-row" data-action="open" data-id="' + esc(r.id) + '"><strong>' + r.correct + '</strong><span>' + esc(name) + tag + '</span><span>' + timing + '</span><span>' + acc + '</span><span>' + esc(formatWhen(r.startedAt)) + "</span></button>";
    }).join("");
  }

  function renderHome() {
    return nav("home") + '<main class="wrap"><section class="hero"><h1 class="display">Practice<br><em>the paper.</em></h1><p class="lede">Mental arithmetic and sequences, in the Maven numerical format. Five minutes, then six. Every paper is a fresh draw, and every run is kept in this browser.</p><p class="fine">1 arithmetic · 2 sequences · 3 both</p></section><section class="grid"><article class="card"><p class="kicker">Section 02</p><h2>Mental arithmetic</h2><p class="card-copy">Four-digit addition and subtraction. Multiplication and division of at most two digits. Every answer is an integer. Fifty questions.</p><div class="pills">' + pill("mathMinutes", 1, "1:00") + pill("mathMinutes", 2, "2:00") + pill("mathMinutes", 5, "5:00") + "</div><div class=\"pills\">" + pill("mathScoring", "paper", "Paper") + pill("mathScoring", "drill", "Drill") + '</div><button type="button" class="btn" data-action="start" data-mode="math">Begin</button></article><article class="card"><p class="kicker">Section 03</p><h2>Sequences</h2><p class="card-copy">Number, letter, and mixed patterns, a wide set. Unused types are dealt first. Thirty questions.</p><div class="pills">' + pill("seqMinutes", 2, "2:00") + pill("seqMinutes", 6, "6:00") + "</div><div class=\"pills\">" + pill("seqScoring", "paper", "Paper") + pill("seqScoring", "drill", "Drill") + '</div><button type="button" class="btn" data-action="start" data-mode="seq">Begin</button></article></section><section class="sitting"><div><p class="kicker">Full paper</p><h2>Section 02, then 03</h2><p>Official timings. A wrong answer moves you on. Each section is saved.</p></div><button type="button" class="btn" data-action="start" data-mode="sitting">Begin the sitting</button></section><section class="stats">' + statBlock("math", state.prefs.mathMinutes, "Arithmetic") + statBlock("seq", state.prefs.seqMinutes, "Sequences") + '</section><section class="recent"><h2>Recent</h2>' + logRows(Store.runs().slice(0, 6)) + "</section></main>";
  }

  function renderIntro() {
    var math = state.section === "math";
    var scoring = state.scoring === "paper"
      ? "A wrong answer is marked, and the next question appears."
      : "The question stays until the answer is right. A miss only costs time.";
    var detail = math
      ? "Four-digit addition and subtraction, and multiplication or division with at most two digits. Every answer is an integer."
      : "Number, letter, and mixed patterns. Type the next term, or the missing term.";
    return nav("") + '<main class="wrap"><section class="prose"><p class="kicker">Section ' + sectionNo(state.section) + "</p><h1>" + esc(sectionTitle(state.section)) + "</h1><p>" + esc(words(state.minutes)) + " on the clock. " + state.cap + " questions. Answer as many as you can. You are not expected to finish.</p><p>" + esc(detail) + "</p><p>" + esc(scoring) + '</p><div class="actions"><button type="button" class="btn" data-action="begin" data-autofocus>Start</button><button type="button" class="btn ghost" data-action="goto" data-view="home">Back</button></div></section></main>';
  }

  function renderTest() {
    var q = state.questions[state.index];
    var inputMode = state.section === "math" ? "numeric" : "text";
    var cap = state.section === "math" ? "off" : "characters";
    var bar = state.untimed ? "" : '<div class="timebar" id="timebar"><span id="barfill"></span></div>';
    var kicker = state.untimed ? "Study" : "Section " + sectionNo(state.section) + " · " + sectionTitle(state.section);
    var clockLabel = state.untimed ? formatElapsed(state.startedAt ? Date.now() - state.startedAt : 0) : formatLeft(state.durationMs);
    var clock = '<div class="clock" id="clock">' + clockLabel + "</div>";
    return bar + '<main class="test"><header class="test-top"><button type="button" class="endbtn" data-action="end">End</button><div class="center-col"><p class="kicker">' + esc(kicker) + '</p><p class="scoreline" id="scoreline">' + esc(scoreText()) + '</p></div>' + clock + '</header><div class="stage-wrap"><form class="qform" id="qform" autocomplete="off">' + (q ? questionHtml(q) : "") + '<div><input id="answer" class="answer" data-autofocus autocomplete="off" autocapitalize="' + cap + '" spellcheck="false" inputmode="' + inputMode + '" aria-label="Answer"><button type="submit" class="hint">Enter to submit</button></div></form></div></main>';
  }

  function renderBridge() {
    var run = state.mathRun || { correct: 0, attempted: 0, reached: 0 };
    var acc = run.attempted ? Math.round(run.accuracy * 100) + "% accuracy" : "No answers submitted";
    return '<main class="wrap bridge"><p class="kicker">Section 02 complete</p><p class="score">' + run.correct + '</p><p class="stat-meta">' + run.correct + " correct · " + (run.reached || 0) + " reached · " + acc + '</p><section class="prose" style="padding-top:12px"><p class="kicker">Section 03</p><h1>Sequences</h1><p>Six minutes. Thirty questions. Answer as many as you can. You are not expected to finish.</p><p>Type the next term, or the missing term. A wrong answer is marked, and the next question appears.</p><div class="actions"><button type="button" class="btn" data-action="continue" data-autofocus>Start section 03</button><button type="button" class="btn ghost" data-action="goto" data-view="home">Leave</button></div></section></main>';
  }

  function avgSeconds(run) {
    var answered = (run.questions || []).filter(function (q) { return q.given != null; });
    if (!answered.length) return null;
    var ms = answered.reduce(function (s, q) { return s + (q.ms || 0); }, 0);
    return ms / answered.length / 1000;
  }

  function reviewBlock(run) {
    var questions = run.questions || [];
    var misses = questions.filter(function (q) { return q.given != null && !q.correct; });
    var blanks = questions.filter(function (q) { return q.given == null; });
    var goods = questions.filter(function (q) { return q.correct; });
    var avg = avgSeconds(run);
    var acc = run.attempted ? Math.round(run.accuracy * 100) + "%" : "n/a";
    function item(q, klass) {
      var yourClass = q.given == null ? "rule" : (q.correct ? "right" : "your");
      var status = q.correct ? "Correct" : (q.given == null ? "No answer" : "You wrote " + esc(q.given));
      var tries = q.tries > 1 ? '<p class="rule">Tries ' + q.tries + "</p>" : "";
      return '<article class="' + klass + '"><p class="kicker">' + esc(q.family || "") + '</p><p class="prompt">' + esc(q.prompt) + '</p><p class="' + yourClass + '">' + status + "</p>" + (q.correct ? "" : '<p class="right">' + esc(q.expected) + "</p>") + tries + '<p class="rule">' + esc(q.rule || "") + "</p></article>";
    }
    var missHtml = misses.length ? misses.map(function (q) { return item(q, "miss"); }).join("") : '<p class="empty">No misses.</p>';
    var blankHtml = blanks.length ? '<h2 class="kicker" style="margin-top:22px">Left blank</h2>' + blanks.map(function (q) { return item(q, "okitem"); }).join("") : "";
    var goodHtml = goods.length ? "<details><summary>" + goods.length + " correct</summary>" + goods.map(function (q) { return item(q, "okitem"); }).join("") + "</details>" : "";
    var label = run.section === "study"
      ? "Study · Untimed"
      : "Section " + sectionNo(run.section) + " · " + esc(sectionTitle(run.section)) + (run.scoring === "drill" ? " · Drill" : "");
    return '<section class="review-block"><p class="kicker">' + label + '</p><p class="hero-num">' + run.correct + '</p><p class="kicker">correct</p><ul class="meta-row"><li>' + (run.reached || questions.length) + " reached of " + run.cap + "</li><li>" + run.attempted + " answered</li><li>" + acc + " accuracy</li><li>" + (avg == null ? "n/a" : avg.toFixed(1) + "s average") + "</li><li>" + formatUsed(run.usedMs || 0) + " used</li></ul><h2 class=\"kicker\">Misses</h2>" + missHtml + blankHtml + goodHtml + "</section>";
  }

  function renderReview() {
    var runs = state.reviewRuns || [];
    var total = runs.reduce(function (s, r) { return s + (r.correct || 0); }, 0);
    var head = runs.length > 1 ? '<p class="kicker" style="margin-top:28px">Paper total ' + total + " correct</p>" : "";
    var again = state.mode === "study"
      ? '<button type="button" class="btn" data-action="goto" data-view="study">Back</button>'
      : '<button type="button" class="btn" data-action="again">New paper</button>';
    return nav("") + '<main class="wrap narrow" style="padding-top:48px">' + runs.map(reviewBlock).join("") + head + '<div class="actions">' + again + '<button type="button" class="btn ghost" data-action="goto" data-view="log">Log</button><button type="button" class="btn ghost" data-action="goto" data-view="home">Home</button></div></main>';
  }

  function renderLog() {
    var list = Store.runs().filter(function (r) {
      if (state.filter === "math") return r.section === "math";
      if (state.filter === "seq") return r.section === "seq";
      if (state.filter === "study") return r.section === "study";
      return true;
    });
    function filt(id, label) {
      return '<button type="button" class="pill" data-action="filter" data-value="' + id + '" aria-pressed="' + (state.filter === id ? "true" : "false") + '">' + label + "</button>";
    }
    var tools = Store.runs().length
      ? '<div class="head-actions"><button type="button" class="btn ghost" data-action="export">Export</button><button type="button" class="btn ghost" data-action="clear">Clear</button></div>'
      : "";
    return nav("log") + '<main class="wrap"><div class="page-head"><div><p class="kicker">This browser</p><h1>Log</h1></div>' + tools + '</div><div class="filters">' + filt("all", "All") + filt("math", "Arithmetic") + filt("seq", "Sequences") + filt("study", "Study") + "</div>" + logRows(list) + "</main>";
  }

  function renderDetail() {
    var run = Store.runs().filter(function (r) { return r.id === state.detailId; })[0];
    if (!run) return nav("log") + '<main class="wrap"><p class="empty">That paper is no longer in the log.</p></main>';
    return nav("log") + '<main class="wrap narrow">' + reviewBlock(run) + '<div class="actions"><button type="button" class="btn ghost" data-action="goto" data-view="log">Back</button><button type="button" class="btn ghost" data-action="delete">Delete</button></div></main>';
  }

  function renderPatterns() {
    var cov = Store.coverage();
    var cats = Seq.catalog();
    var groups = ["Number", "Letter", "Mixed"];
    var blocks = groups.map(function (group) {
      var items = cats.filter(function (f) { return f.group === group; });
      var seen = items.filter(function (f) { return cov[f.id] && cov[f.id].count; });
      var tiles = seen.sort(function (a, b) { return (cov[b.id].count - cov[a.id].count) || a.name.localeCompare(b.name); }).map(function (f) {
        return '<span class="tile">' + esc(f.name) + " <b>×" + cov[f.id].count + "</b></span>";
      }).join("");
      var unseen = items.length - seen.length;
      return '<section><p class="kicker">' + group + "</p><h2>" + seen.length + " of " + items.length + " met</h2>" + (tiles ? '<div class="tile-row">' + tiles + "</div>" : "") + (unseen ? '<p class="stat-meta">' + unseen + " not yet dealt. Names stay hidden until you meet them.</p>" : '<p class="stat-meta">Every pattern in this group has shown up.</p>') + "</section>";
    }).join("");
    var met = cats.filter(function (f) { return cov[f.id] && cov[f.id].count; }).length;
    return nav("patterns") + '<main class="wrap"><div class="page-head"><div><p class="kicker">' + met + " of " + cats.length + ' met</p><h1>Patterns</h1></div></div><p class="lede">A sequence paper draws 30. Patterns you have not met are dealt first. The full set takes eight papers to meet once, with new numbers every time.</p><p class="lede">Arithmetic is always a mix of four-digit addition and subtraction, plus two-digit multiplication and division.</p><div class="atlas">' + blocks + "</div></main>";
  }

  function shuffleList(list) {
    var a = list.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = a[i];
      a[i] = a[j];
      a[j] = tmp;
    }
    return a;
  }

  function renderStudy() {
    if (!state.studyCards) {
      state.studyCards = Seq.catalog().map(function (f) {
        return { id: f.id, name: f.name, group: f.group, q: Seq.question(f.id) };
      });
    }
    var group = state.studyGroup || "All";
    var groups = ["All", "Number", "Letter", "Mixed"];
    var chips = groups.map(function (g) {
      return '<button type="button" class="pill" data-action="study-filter" data-value="' + g + '" aria-pressed="' + (group === g ? "true" : "false") + '">' + g + "</button>";
    }).join("");
    var sections = ["Number", "Letter", "Mixed"].filter(function (g) {
      return group === "All" || group === g;
    }).map(function (g) {
      var cards = state.studyCards.filter(function (c) { return c.group === g; }).map(function (c) {
        var bits = c.q.tokens.map(function (t) {
          return t === "?" ? '<b class="ans">' + esc(c.q.answer) + "</b>" : "<span>" + esc(t) + "</span>";
        }).join(" ");
        return '<article class="study-card"><div><p class="kicker">' + esc(g) + '</p><h3>' + esc(c.name) + '</h3></div><p class="exline">' + bits + '</p><p class="rule">' + esc(c.q.rule) + '</p><button type="button" class="btn ghost try" data-action="study-one" data-id="' + esc(c.id) + '">Try one</button></article>';
      }).join("");
      return '<section><h2>' + g + '</h2><div class="study-grid">' + cards + "</div></section>";
    }).join("");
    return nav("study") + '<main class="wrap"><div class="page-head"><div><p class="kicker">' + state.studyCards.length + ' patterns</p><h1>Study</h1></div><div class="head-actions"><button type="button" class="btn" data-action="study-all">Practice all</button></div></div><p class="lede">Every sequence pattern, with one example. The marked term is the answer. Practice counts up and does not end on its own.</p><div class="filters">' + chips + '<button type="button" class="pill" data-action="study-refresh">New examples</button></div><div class="atlas">' + sections + "</div></main>";
  }

  function render() {
    hideVeil();
    var view = state.view;
    document.body.dataset.view = view;
    var html = "";
    if (view === "home") html = renderHome();
    else if (view === "intro") html = renderIntro();
    else if (view === "test") html = renderTest();
    else if (view === "bridge") html = renderBridge();
    else if (view === "review") html = renderReview();
    else if (view === "log") html = renderLog();
    else if (view === "detail") html = renderDetail();
    else if (view === "patterns") html = renderPatterns();
    else if (view === "study") html = renderStudy();
    app.innerHTML = html;
    if (view !== "test") document.title = "SEQ";
    var focus = app.querySelector("[data-autofocus]");
    if (focus) focus.focus();
    window.scrollTo(0, 0);
  }

  function paintElapsed(ms) {
    var clock = document.getElementById("clock");
    var label = formatElapsed(ms);
    if (clock) clock.textContent = label;
    if (state.view === "test") document.title = label + " · SEQ";
  }

  function paintTime(ms) {
    if (state.untimed) {
      paintElapsed(Date.now() - state.startedAt);
      return;
    }
    var clock = document.getElementById("clock");
    var bar = document.getElementById("barfill");
    var shell = document.getElementById("timebar");
    var label = formatLeft(ms);
    if (clock) {
      clock.textContent = label;
      clock.classList.toggle("late", ms > 0 && ms <= 20000);
    }
    if (shell) shell.classList.toggle("late", ms > 0 && ms <= 20000);
    if (bar && state.durationMs) {
      var pct = Math.max(0, Math.min(1, ms / state.durationMs));
      bar.style.transform = "scaleX(" + pct + ")";
    }
    if (state.view === "test") document.title = label + " · SEQ";
  }

  function paintScore() {
    var el = document.getElementById("scoreline");
    if (el) el.textContent = scoreText();
  }

  function stopClock() {
    if (state.timer) clearInterval(state.timer);
    state.timer = null;
  }

  function tick() {
    if (state.finished || state.view !== "test") return;
    if (state.untimed) {
      paintElapsed(Date.now() - state.startedAt);
      return;
    }
    var left = state.endsAt - Date.now();
    paintTime(Math.max(0, left));
    if (left <= 0) finish("time");
  }

  function startClock() {
    stopClock();
    state.timer = setInterval(tick, 100);
    tick();
  }

  function currentValue() {
    var input = document.getElementById("answer");
    return input ? input.value : "";
  }

  function record(q, text, correct) {
    var has = String(text || "").trim().length > 0;
    return {
      index: state.index,
      prompt: promptOf(q),
      expected: q.answer,
      given: has ? String(text).trim() : null,
      correct: !!correct,
      ms: Math.max(0, Date.now() - state.shownAt),
      tries: state.tries,
      family: q.family,
      familyId: q.familyId,
      group: q.group,
      rule: q.rule,
      kind: q.kind,
    };
  }

  function alreadyLogged() {
    return state.answers.some(function (a) { return a.index === state.index; });
  }

  function freezeOpen(includeBlank) {
    var q = state.questions[state.index];
    if (!q || alreadyLogged()) return;
    var text = currentValue().trim();
    if (text && state.lastWrong && text === state.lastWrong) {
      state.answers.push(record(q, text, false));
      return;
    }
    if (text) {
      var correct = Store.grade(text, q.answer);
      state.tries += 1;
      if (correct) state.correct += 1;
      else state.misses += 1;
      state.answers.push(record(q, text, correct));
      return;
    }
    if (state.lastWrong) {
      state.answers.push(record(q, state.lastWrong, false));
      return;
    }
    if (includeBlank) state.answers.push(record(q, "", false));
  }

  function buildRun() {
    var attempted = state.answers.filter(function (a) { return a.given != null; }).length;
    var correct = state.answers.filter(function (a) { return a.correct; }).length;
    var wrong = state.answers.filter(function (a) { return a.given != null && !a.correct; }).length;
    return {
      id: Store.uid(),
      sittingId: state.mode === "sitting" ? state.sittingId : null,
      mode: state.mode,
      section: state.section,
      scoring: state.scoring,
      minutes: state.minutes,
      cap: state.cap,
      durationMs: state.durationMs,
      usedMs: state.untimed ? Math.max(0, Date.now() - state.startedAt) : Math.max(0, Math.min(state.durationMs, Date.now() - state.startedAt)),
      startedAt: new Date(state.startedAt).toISOString(),
      reason: state.reason,
      correct: correct,
      attempted: attempted,
      wrong: wrong,
      misses: state.misses,
      reached: state.answers.length,
      accuracy: attempted ? correct / attempted : 0,
      questions: state.answers,
    };
  }

  function finish(reason) {
    if (state.finished) return;
    state.finished = true;
    state.reason = reason;
    stopClock();
    freezeOpen(true);
    var run = buildRun();
    var saveIt = reason !== "end" || run.attempted > 0 || state.misses > 0;
    if (saveIt) Store.saveRun(run);
    if (!saveIt) {
      state.view = "home";
      render();
      return;
    }
    if (state.mode === "sitting" && state.section === "math") {
      state.mathRun = run;
      state.view = "bridge";
      render();
      return;
    }
    state.reviewRuns = state.mode === "sitting" && state.mathRun ? [state.mathRun, run] : [run];
    state.view = "review";
    render();
  }

  function advance() {
    if (state.finished) return;
    state.index += 1;
    state.tries = 0;
    state.lastWrong = null;
    if (state.index >= state.questions.length) {
      finish("complete");
      return;
    }
    state.shownAt = Date.now();
    render();
    if (state.untimed) paintElapsed(Date.now() - state.startedAt);
    else paintTime(Math.max(0, state.endsAt - Date.now()));
  }

  function announce(text) {
    var live = document.getElementById("live");
    if (live) live.textContent = text;
  }

  function submitAnswer() {
    if (state.view !== "test" || state.finished || state.locked) return;
    if (document.getElementById("veil")) return;
    var input = document.getElementById("answer");
    if (!input) return;
    var text = input.value.trim();
    if (!text) return;
    var q = state.questions[state.index];
    var correct = Store.grade(text, q.answer);
    state.locked = true;
    state.tries += 1;
    input.classList.add(correct ? "is-good" : "is-bad");
    announce(correct ? "Correct" : "Incorrect");
    if (!correct) {
      state.misses += 1;
      state.lastWrong = text;
      paintScore();
    }
    if (correct || state.scoring === "paper") {
      if (correct) state.correct += 1;
      state.answers.push(record(q, text, correct));
    }
    window.setTimeout(function () {
      state.locked = false;
      if (state.finished || state.view !== "test") return;
      if (!correct && state.scoring === "drill") {
        input.value = "";
        input.classList.remove("is-bad");
        input.focus();
        return;
      }
      advance();
    }, correct ? 80 : 150);
  }

  function begin() {
    state.cap = state.section === "math" ? 50 : 30;
    state.untimed = false;
    state.durationMs = state.minutes * 60 * 1000;
    state.questions = state.section === "math"
      ? MathPaper.generateSet(state.cap)
      : Seq.generateSet(state.cap, Store.coverage());
    state.index = 0;
    state.answers = [];
    state.correct = 0;
    state.misses = 0;
    state.tries = 0;
    state.lastWrong = null;
    state.locked = false;
    state.finished = false;
    state.startedAt = Date.now();
    state.endsAt = state.startedAt + state.durationMs;
    state.shownAt = state.startedAt;
    state.view = "test";
    render();
    startClock();
  }

  function openSection(section, minutes, scoring, mode) {
    state.mode = mode;
    state.section = section;
    state.minutes = minutes;
    state.scoring = scoring;
    state.cap = section === "math" ? 50 : 30;
    if (mode === "sitting" && section === "math") {
      state.sittingId = Store.uid();
      state.mathRun = null;
    }
    state.view = "intro";
    render();
  }

  function startStudy(ids) {
    stopClock();
    state.mode = "study";
    state.section = "study";
    state.scoring = "paper";
    state.minutes = 0;
    state.untimed = true;
    state.cap = ids.length;
    state.durationMs = 0;
    state.questions = ids.map(function (id) { return Seq.question(id); });
    state.index = 0;
    state.answers = [];
    state.correct = 0;
    state.misses = 0;
    state.tries = 0;
    state.lastWrong = null;
    state.locked = false;
    state.finished = false;
    state.startedAt = Date.now();
    state.endsAt = 0;
    state.shownAt = state.startedAt;
    state.view = "test";
    render();
    startClock();
  }

  function startMode(mode) {
    if (mode === "sitting") openSection("math", 5, "paper", "sitting");
    else if (mode === "math") openSection("math", state.prefs.mathMinutes, state.prefs.mathScoring, "math");
    else openSection("seq", state.prefs.seqMinutes, state.prefs.seqScoring, "seq");
  }

  function showVeil(inner) {
    hideVeil();
    var veil = document.createElement("div");
    veil.id = "veil";
    veil.className = "veil";
    veil.innerHTML = '<div class="sheet" role="dialog" aria-modal="true">' + inner + "</div>";
    document.body.appendChild(veil);
    var focus = veil.querySelector("[data-autofocus]");
    if (focus) focus.focus();
  }

  function hideVeil() {
    var veil = document.getElementById("veil");
    if (veil) veil.remove();
  }

  function showEnd() {
    var meaningful = state.answers.length > 0 || state.misses > 0;
    showVeil(
      '<p class="sheet-title">' + (meaningful ? "End paper" : "Leave paper") + "</p>" +
      '<p class="sheet-copy">' + (meaningful ? "Save this run and stop the clock?" : "Nothing has been answered, so this run will not be saved.") + "</p>" +
      '<div class="sheet-actions"><button type="button" class="btn" data-action="confirm-end" data-autofocus>' + (meaningful ? "Save and end" : "Leave") + '</button><button type="button" class="btn ghost" data-action="dismiss">Keep going</button></div>'
    );
  }

  function exportLog() {
    var blob = new Blob([JSON.stringify(Store.load(), null, 2)], { type: "application/json" });
    var link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "seq-log-" + new Date().toISOString().slice(0, 10) + ".json";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(function () { URL.revokeObjectURL(link.href); }, 1500);
  }

  document.addEventListener("click", function (e) {
    var el = e.target.closest("[data-action]");
    if (!el) return;
    var action = el.getAttribute("data-action");
    if (action === "goto") {
      if (state.view === "test" && !state.finished) return;
      stopClock();
      state.view = el.getAttribute("data-view") || "home";
      render();
      return;
    }
    if (action === "pref") {
      var key = el.getAttribute("data-pref");
      var value = el.getAttribute("data-value");
      if (key === "mathMinutes" || key === "seqMinutes") value = Number(value);
      var patch = {};
      patch[key] = value;
      state.prefs = Store.setPrefs(patch);
      render();
      return;
    }
    if (action === "start") {
      startMode(el.getAttribute("data-mode"));
      return;
    }
    if (action === "begin") {
      begin();
      return;
    }
    if (action === "end") {
      showEnd();
      return;
    }
    if (action === "dismiss") {
      hideVeil();
      var input = document.getElementById("answer");
      if (input) input.focus();
      return;
    }
    if (action === "confirm-end") {
      hideVeil();
      finish("end");
      return;
    }
    if (action === "continue") {
      state.section = "seq";
      state.minutes = 6;
      state.scoring = "paper";
      begin();
      return;
    }
    if (action === "again") {
      if (state.mode === "sitting") openSection("math", 5, "paper", "sitting");
      else openSection(state.section, state.minutes, state.scoring, state.mode);
      return;
    }
    if (action === "open") {
      state.detailId = el.getAttribute("data-id");
      state.view = "detail";
      render();
      return;
    }
    if (action === "delete") {
      showVeil('<p class="sheet-title">Delete this paper?</p><p class="sheet-copy">It will leave the log on this browser.</p><div class="sheet-actions"><button type="button" class="btn" data-action="confirm-delete" data-autofocus>Delete</button><button type="button" class="btn ghost" data-action="dismiss">Keep</button></div>');
      return;
    }
    if (action === "confirm-delete") {
      Store.deleteRun(state.detailId);
      state.detailId = null;
      state.view = "log";
      render();
      return;
    }
    if (action === "clear") {
      showVeil('<p class="sheet-title">Clear the log?</p><p class="sheet-copy">Every saved paper and the pattern record on this browser will be removed.</p><div class="sheet-actions"><button type="button" class="btn" data-action="confirm-clear" data-autofocus>Clear</button><button type="button" class="btn ghost" data-action="dismiss">Keep</button></div>');
      return;
    }
    if (action === "confirm-clear") {
      Store.clearAll();
      state.prefs = Store.prefs();
      state.view = "log";
      render();
      return;
    }
    if (action === "export") {
      exportLog();
      return;
    }
    if (action === "filter") {
      state.filter = el.getAttribute("data-value");
      render();
      return;
    }
    if (action === "study-filter") {
      state.studyGroup = el.getAttribute("data-value") || "All";
      render();
      return;
    }
    if (action === "study-refresh") {
      state.studyCards = null;
      render();
      return;
    }
    if (action === "study-all") {
      startStudy(shuffleList(Seq.catalog().map(function (f) { return f.id; })));
      return;
    }
    if (action === "study-one") {
      startStudy([el.getAttribute("data-id")]);
      return;
    }
  });

  document.addEventListener("submit", function (e) {
    if (e.target && e.target.id === "qform") {
      e.preventDefault();
      submitAnswer();
    }
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      if (document.getElementById("veil")) {
        hideVeil();
        var input = document.getElementById("answer");
        if (input) input.focus();
        return;
      }
      if (state.view === "test" && !state.finished) {
        e.preventDefault();
        showEnd();
      }
      return;
    }
    if (e.target && e.target.closest && e.target.closest("input, textarea")) return;
    if (state.view === "home" && !document.getElementById("veil")) {
      if (e.key === "1") startMode("math");
      if (e.key === "2") startMode("seq");
      if (e.key === "3") startMode("sitting");
    }
  });

  window.addEventListener("beforeunload", function (e) {
    if (state.view === "test" && !state.finished) {
      e.preventDefault();
      e.returnValue = "";
    }
  });

  render();
})();
