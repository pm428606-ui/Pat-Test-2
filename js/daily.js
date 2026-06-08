/*
 * Daily challenge selection.
 *
 * The puzzle resets at midnight US Eastern time. We compute the current
 * Eastern calendar date, hash it into a seed, and use a seeded PRNG to pick
 * one question per slot. Because the seed only depends on the date, every
 * player who plays on the same Eastern day gets the identical 10 questions.
 */
(function (T) {
  "use strict";

  // Bump EDITION to publish a fresh set of questions for the current day
  // (and every day) without waiting for the date to roll over — e.g. after
  // expanding the question bank. It folds into the daily seed, so the
  // selection stays deterministic and identical for every player.
  const EDITION = "2026-06-08.2";

  // Return the calendar date in America/New_York as a "YYYY-MM-DD" string.
  // Using Intl avoids manual DST math (EST/EDT handled for us).
  function easternDateString(now) {
    now = now || new Date();
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/New_York",
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).formatToParts(now);
    const get = (t) => parts.find((p) => p.type === t).value;
    return `${get("year")}-${get("month")}-${get("day")}`;
  }

  // Milliseconds until the next Eastern midnight, for the countdown timer.
  function msUntilEasternMidnight(now) {
    now = now || new Date();
    // Current Eastern wall-clock time, as parts.
    const fmt = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/New_York",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false
    });
    const parts = fmt.formatToParts(now);
    const get = (t) => parseInt(parts.find((p) => p.type === t).value, 10);
    let h = get("hour");
    if (h === 24) h = 0; // some engines emit 24 for midnight
    const secsIntoDay = h * 3600 + get("minute") * 60 + get("second");
    const secsLeft = 24 * 3600 - secsIntoDay;
    return secsLeft * 1000;
  }

  // Deterministic 32-bit string hash (xfnv1a-ish) -> seed for the PRNG.
  function hashSeed(str) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  // mulberry32 PRNG — small, fast, good enough for question shuffling.
  function mulberry32(a) {
    return function () {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // Pick one item from a pool using the rng.
  function pick(pool, rng) {
    return pool[Math.floor(rng() * pool.length)];
  }

  // Build the 10-question challenge for a given date string.
  // Returns an array of fully-resolved question objects, each annotated with
  // slot, points, and a normalized `type`.
  function buildChallenge(dateStr) {
    const rng = mulberry32(hashSeed("daily-trivia::" + EDITION + "::" + dateStr));
    const B = T.BANK;

    const layout = [
      { pool: "mc1", type: "mc", points: 5 },
      { pool: "mc2", type: "mc", points: 10 },
      { pool: "mc3", type: "mc", points: 15 },
      { pool: "written1", type: "written", points: 5 },
      { pool: "written2", type: "written", points: 10 },
      { pool: "written3", type: "written", points: 15 },
      { pool: "visual1", type: "visual", points: 5 },
      { pool: "visual2", type: "visual", points: 10 },
      { pool: "visual3", type: "visual", points: 15 },
      { pool: "number", type: "number", points: 25 }
    ];

    // Enforce at most one flag question per round: once a flag is chosen,
    // later visual slots draw only from the non-flag (map) questions.
    let flagUsed = false;

    return layout.map((slot, i) => {
      let poolItems = B[slot.pool];
      if (slot.type === "visual" && flagUsed) {
        poolItems = poolItems.filter((it) => it.type !== "flag");
      }
      const chosen = pick(poolItems, rng);
      const q = Object.assign({}, chosen);
      q.slot = i + 1;
      q.points = slot.points;
      // For MC and flag questions, shuffle option order deterministically so
      // the correct answer isn't always in the same position.
      if (slot.type === "mc") {
        const order = shuffledIndices(q.options.length, rng);
        q.options = order.map((idx) => chosen.options[idx]);
        q.answer = order.indexOf(chosen.answer);
        q.type = "mc";
      } else if (chosen.type === "flag") {
        q.options = shuffleArray(chosen.options.slice(), rng);
        q.type = "flag";
        flagUsed = true;
      } else if (chosen.type === "map") {
        q.type = "map";
      } else {
        q.type = slot.type;
      }
      return q;
    });
  }

  function shuffledIndices(n, rng) {
    const arr = Array.from({ length: n }, (_, i) => i);
    return shuffleArray(arr, rng);
  }

  // Fisher-Yates with seeded rng.
  function shuffleArray(arr, rng) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  T.daily = {
    easternDateString,
    msUntilEasternMidnight,
    buildChallenge
  };
})(window.TRIVIA = window.TRIVIA || {});
