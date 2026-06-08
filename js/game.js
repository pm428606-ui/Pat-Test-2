/*
 * Game flow + rendering. Drives the screens: start -> question 1..10 ->
 * results/scorecard. State is intentionally simple and lives in this module.
 */
(function (T) {
  "use strict";

  const $ = (id) => document.getElementById(id);

  const state = {
    dateStr: null,
    questions: [],
    idx: 0,
    response: null,    // pending response for the current question
    grades: [],        // grade per question
    name: "",
    isPractice: false  // true once today's official run is already saved
  };

  // ---- bootstrap --------------------------------------------------------
  function init() {
    state.dateStr = T.daily.easternDateString();
    state.questions = T.daily.buildChallenge(state.dateStr);
    state.name = T.storage.getName();

    $("today-date").textContent = formatDateLong(state.dateStr);
    startCountdown();

    // already played today?
    const prior = T.storage.getResult(state.dateStr);
    if (prior) {
      state.grades = prior.grades;
      showResults({ replay: true });
    } else {
      showStart();
    }

    $("start-btn").addEventListener("click", onStart);
    $("name-input").addEventListener("input", (e) => {
      state.name = e.target.value.trim();
    });
    if (state.name) $("name-input").value = state.name;

    renderStats();
  }

  function onStart() {
    const name = $("name-input").value.trim();
    if (name) T.storage.setName(name);
    state.name = name;
    beginGame();
  }

  // Restart today's challenge from scratch. Players can replay as many times
  // as they like, even after they've already finished today's puzzle.
  function playAgain() {
    beginGame();
  }

  function beginGame() {
    // If today's official result already exists, this is a practice run.
    state.isPractice = !!T.storage.getResult(state.dateStr);
    state.idx = 0;
    state.grades = [];
    show("screen-game");
    renderQuestion();
  }

  // ---- screen helpers ---------------------------------------------------
  function show(id) {
    ["screen-start", "screen-game", "screen-results"].forEach((s) => {
      $(s).classList.toggle("hidden", s !== id);
    });
    window.scrollTo(0, 0);
  }
  function showStart() { show("screen-start"); }

  // ---- question rendering ----------------------------------------------
  function renderQuestion() {
    T.mapq.teardown();
    state.response = null;
    const q = state.questions[state.idx];
    const host = $("question-host");
    host.innerHTML = "";

    // progress / meta
    $("q-progress").textContent = `Question ${q.slot} of 10`;
    $("q-points").textContent = `${q.points} pts`;
    $("q-category").textContent = q.category;
    $("q-type").textContent = typeLabel(q.type);
    setProgressBar(state.idx / 10);
    $("running-score").textContent = `${currentTotal()} pts`;

    const prompt = document.createElement("h2");
    prompt.className = "q-prompt";
    prompt.textContent = q.q;
    host.appendChild(prompt);

    const body = document.createElement("div");
    body.className = "q-body";
    host.appendChild(body);

    switch (q.type) {
      case "mc": renderMC(q, body); break;
      case "written": renderWritten(q, body); break;
      case "flag": renderFlag(q, body); break;
      case "map": renderMap(q, body); break;
      case "number": renderNumber(q, body); break;
    }

    const submit = $("submit-btn");
    submit.textContent = state.idx === 9 ? "Finish & See Score" : "Submit Answer";
    submit.disabled = true;
    submit.onclick = onSubmit;

    $("feedback").classList.add("hidden");
    $("feedback").textContent = "";
  }

  function enableSubmit() { $("submit-btn").disabled = false; }

  function renderMC(q, body) {
    q.options.forEach((opt, i) => {
      const b = document.createElement("button");
      b.className = "option";
      b.type = "button";
      b.textContent = opt;
      b.onclick = () => {
        body.querySelectorAll(".option").forEach((o) => o.classList.remove("selected"));
        b.classList.add("selected");
        state.response = i;
        enableSubmit();
      };
      body.appendChild(b);
    });
  }

  function renderWritten(q, body) {
    const input = document.createElement("input");
    input.type = "text";
    input.className = "text-answer";
    input.placeholder = "Type your answer…";
    input.autocomplete = "off";
    input.oninput = () => {
      state.response = input.value;
      $("submit-btn").disabled = input.value.trim().length === 0;
    };
    input.onkeydown = (e) => {
      if (e.key === "Enter" && input.value.trim()) onSubmit();
    };
    body.appendChild(input);
    setTimeout(() => input.focus(), 30);
    const hint = document.createElement("p");
    hint.className = "hint";
    hint.textContent = "Spelling is forgiving — small typos still count.";
    body.appendChild(hint);
  }

  function renderFlag(q, body) {
    const grid = document.createElement("div");
    grid.className = "flag-grid";
    q.options.forEach((code) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "flag-option";
      const img = document.createElement("img");
      img.src = T.flagUrl(code, 320);
      img.alt = "flag option";
      img.loading = "lazy";
      b.appendChild(img);
      b.onclick = () => {
        grid.querySelectorAll(".flag-option").forEach((o) => o.classList.remove("selected"));
        b.classList.add("selected");
        state.response = code;
        enableSubmit();
      };
      grid.appendChild(b);
    });
    body.appendChild(grid);
  }

  function renderMap(q, body) {
    const tip = document.createElement("p");
    tip.className = "hint";
    tip.textContent = "Click the map to drop your pin. Closer = more points. Right country earns a bonus.";
    body.appendChild(tip);
    const mapEl = document.createElement("div");
    mapEl.id = "leaflet-map";
    mapEl.className = "map-host";
    body.appendChild(mapEl);
    T.mapq.mount("leaflet-map", (resp) => {
      state.response = resp;
      enableSubmit();
    });
  }

  function renderNumber(q, body) {
    const input = document.createElement("input");
    input.type = "text";
    input.inputMode = "decimal";
    input.className = "text-answer";
    input.placeholder = q.unit ? `Your estimate in ${q.unit}…` : "Your number estimate…";
    input.autocomplete = "off";
    input.oninput = () => {
      state.response = input.value;
      $("submit-btn").disabled = input.value.trim().length === 0;
    };
    input.onkeydown = (e) => {
      if (e.key === "Enter" && input.value.trim()) onSubmit();
    };
    body.appendChild(input);
    setTimeout(() => input.focus(), 30);
    const hint = document.createElement("p");
    hint.className = "hint";
    hint.textContent = "Closer estimates earn partial credit — being over or under both count.";
    body.appendChild(hint);
  }

  // ---- submit / feedback ------------------------------------------------
  function onSubmit() {
    const q = state.questions[state.idx];
    const grade = T.scoring.grade(q, state.response);
    state.grades[state.idx] = grade;

    if (q.type === "map") {
      T.mapq.reveal(q, state.response);
    }

    showFeedback(grade);
    $("running-score").textContent = `${currentTotal()} pts`;

    const submit = $("submit-btn");
    submit.disabled = false;
    submit.textContent = state.idx === 9 ? "See Scorecard →" : "Next Question →";
    submit.onclick = next;
  }

  function showFeedback(grade) {
    const fb = $("feedback");
    fb.classList.remove("hidden", "good", "bad", "partial");
    const f = grade.max > 0 ? grade.points / grade.max : 0;
    fb.classList.add(f >= 0.999 ? "good" : f > 0 ? "partial" : "bad");
    fb.innerHTML = `<strong>+${grade.points} pts.</strong> ${grade.detail}`;
    // lock inputs
    document.querySelectorAll(".option, .flag-option").forEach((b) => (b.disabled = true));
    document.querySelectorAll(".text-answer").forEach((b) => (b.disabled = true));
  }

  function next() {
    if (state.idx === 9) {
      finish();
      return;
    }
    state.idx += 1;
    renderQuestion();
  }

  function currentTotal() {
    return state.grades.reduce((s, g) => s + (g ? g.points : 0), 0);
  }
  function maxTotal() {
    return state.questions.reduce((s, q) => s + q.points, 0);
  }

  // ---- finish / results -------------------------------------------------
  function finish() {
    const total = currentTotal();
    if (state.isPractice) {
      // Practice runs never overwrite the official result or the stats.
      showResults({ practice: true });
      return;
    }
    T.storage.saveResult(state.dateStr, {
      name: state.name,
      total,
      grades: state.grades,
      finishedAt: new Date().toISOString()
    });
    T.storage.recordStats(state.dateStr, total);
    showResults({});
  }

  function showResults(opts) {
    opts = opts || {};
    const practice = !!opts.practice; // a replay finished after the official run
    const replay = !!opts.replay;     // viewing a prior official result (no new play)
    show("screen-results");
    const total = currentTotal();
    const max = maxTotal();
    $("final-score").textContent = `${total}`;
    $("final-max").textContent = `/ ${max}`;
    $("final-headline").textContent = (practice ? "🧪 Practice run · " : "") + headline(total, max);
    $("results-date").textContent = formatDateLong(state.dateStr);
    $("play-again-btn").onclick = playAgain;

    // The first finish of the day is the official, shareable result; later
    // runs are practice and never replace it or the running stats.
    const official = T.storage.getResult(state.dateStr);
    const note = $("replay-note");
    if (practice) {
      const off = official ? `${official.total}/${max}` : `${total}/${max}`;
      note.textContent = `Practice run — not counted. Your official score for today stays ${off}. Replay as often as you like.`;
    } else if (replay) {
      note.textContent = "You already played today — here's your official result. Hit Play Again for a practice run.";
    } else {
      note.textContent = "Official result saved! Hit Play Again any time for unlimited practice runs.";
    }
    note.classList.remove("hidden");

    // per-question breakdown
    const list = $("breakdown");
    list.innerHTML = "";
    state.questions.forEach((q, i) => {
      const g = state.grades[i] || { points: 0, max: q.points, detail: "" };
      const row = document.createElement("div");
      row.className = "breakdown-row";
      const f = g.max > 0 ? g.points / g.max : 0;
      const dot = f >= 0.999 ? "🟩" : f > 0 ? "🟨" : "🟥";
      row.innerHTML =
        `<span class="bd-icon">${dot}</span>` +
        `<span class="bd-q">Q${q.slot} · ${q.category}</span>` +
        `<span class="bd-pts">${g.points}/${q.points}</span>`;
      list.appendChild(row);
    });

    renderStats();

    // Scorecard always reflects the OFFICIAL result, so a practice run can't
    // be used to text friends an inflated score.
    const shareSrc = official || { total, grades: state.grades };
    const url = gameUrl();
    const text = T.share.buildScorecardText({
      name: state.name, dateStr: state.dateStr, total: shareSrc.total, max,
      grades: state.questions.map((q, i) => (shareSrc.grades && shareSrc.grades[i]) || { points: 0, max: q.points }),
      url
    });
    $("scorecard-preview").textContent = text;

    $("share-btn").onclick = async () => {
      const r = await T.share.share(text);
      const note = $("share-note");
      note.classList.remove("hidden");
      note.textContent =
        r.method === "native" ? "Shared!" :
        r.method === "clipboard" ? "Scorecard copied — paste it into Messages!" :
        r.method === "cancelled" ? "Share cancelled." :
        "Copy the scorecard above to share.";
    };
    $("sms-btn").href = T.share.smsHref(text);
    $("copy-btn").onclick = async () => {
      try {
        await navigator.clipboard.writeText(text);
        $("share-note").classList.remove("hidden");
        $("share-note").textContent = "Copied to clipboard!";
      } catch (e) {
        $("share-note").classList.remove("hidden");
        $("share-note").textContent = "Select the text above and copy it.";
      }
    };
  }

  function renderStats() {
    const s = T.storage.getStats();
    const avg = s.played ? Math.round(s.totalScore / s.played) : 0;
    const el = $("stats-line");
    if (el) el.textContent = `Played: ${s.played} · Best: ${s.best} · Avg: ${avg}`;
  }

  // ---- countdown to next puzzle ----------------------------------------
  function startCountdown() {
    const el = $("countdown");
    if (!el) return;
    const tick = () => {
      let ms = T.daily.msUntilEasternMidnight();
      if (ms < 0) ms = 0;
      const h = Math.floor(ms / 3600000);
      const m = Math.floor((ms % 3600000) / 60000);
      const sec = Math.floor((ms % 60000) / 1000);
      el.textContent = `${pad(h)}:${pad(m)}:${pad(sec)}`;
    };
    tick();
    setInterval(tick, 1000);
  }

  // ---- misc helpers -----------------------------------------------------
  function setProgressBar(frac) {
    const bar = $("progress-fill");
    if (bar) bar.style.width = `${Math.round(frac * 100)}%`;
  }
  function typeLabel(t) {
    return { mc: "Multiple choice", written: "Written answer", flag: "Pick the flag", map: "Map location", number: "Number estimate" }[t] || "";
  }
  function headline(total, max) {
    const f = total / max;
    if (f >= 0.9) return "🏆 Trivia legend!";
    if (f >= 0.75) return "🔥 Outstanding!";
    if (f >= 0.6) return "💪 Great run!";
    if (f >= 0.4) return "👍 Solid effort!";
    if (f >= 0.2) return "🙂 Room to grow — come back tomorrow!";
    return "🎯 Tomorrow's a fresh challenge!";
  }
  function pad(n) { return String(n).padStart(2, "0"); }
  function formatDateLong(dateStr) {
    const [y, m, d] = dateStr.split("-").map(Number);
    const dt = new Date(Date.UTC(y, m - 1, d));
    return dt.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });
  }
  function gameUrl() {
    return location.origin && location.origin !== "null"
      ? location.origin + location.pathname
      : "https://your-trivia-site.example";
  }

  document.addEventListener("DOMContentLoaded", init);
  T.game = { init };
})(window.TRIVIA = window.TRIVIA || {});
