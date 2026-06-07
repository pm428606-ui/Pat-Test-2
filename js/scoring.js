/*
 * Scoring logic for every question type.
 *
 * Each grader returns: { points, max, correct, detail }
 *   points  : awarded points (may be partial / fractional rounded to int)
 *   max     : maximum possible for the question
 *   correct : boolean-ish "fully correct" flag (for display)
 *   detail  : human-readable explanation of the grade / correct answer
 */
(function (T) {
  "use strict";

  // ---- text normalization for written answers --------------------------
  function normalize(s) {
    return String(s == null ? "" : s)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "") // strip accents
      .replace(/^(the|a|an)\s+/, "") // leading articles
      .replace(/[^a-z0-9\s]/g, "") // punctuation
      .replace(/\s+/g, " ")
      .trim();
  }

  // Levenshtein distance, capped — for typo tolerance on written answers.
  function levenshtein(a, b) {
    const m = a.length, n = b.length;
    if (Math.abs(m - n) > 2) return 3; // early out beyond our tolerance
    const dp = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
    for (let j = 0; j <= n; j++) dp[0][j] = j;
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
      }
    }
    return dp[m][n];
  }

  // ---- great-circle distance (haversine) in km -------------------------
  function haversineKm(lat1, lng1, lat2, lng2) {
    const R = 6371;
    const toRad = (d) => (d * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(a));
  }

  // ---- graders ----------------------------------------------------------

  function gradeMC(q, response) {
    const correct = response === q.answer;
    return {
      points: correct ? q.points : 0,
      max: q.points,
      correct,
      detail: correct ? "Correct!" : `Correct answer: ${q.options[q.answer]}`
    };
  }

  function gradeWritten(q, response) {
    const guess = normalize(response);
    let hit = false;
    if (guess) {
      for (const ans of q.accept) {
        const target = normalize(ans);
        if (guess === target) { hit = true; break; }
        // allow small typos for answers of reasonable length
        if (target.length >= 5 && levenshtein(guess, target) <= 1) { hit = true; break; }
      }
    }
    return {
      points: hit ? q.points : 0,
      max: q.points,
      correct: hit,
      detail: hit ? "Correct!" : `Correct answer: ${q.display}`
    };
  }

  function gradeFlag(q, response) {
    const correct = response === q.code;
    return {
      points: correct ? q.points : 0,
      max: q.points,
      correct,
      detail: correct ? "Correct!" : `That was the flag of ${T.flagName(q.code)}.`
    };
  }

  // Map question: partial credit by distance, with a country bonus.
  //   - Full points within FULL_KM.
  //   - Linear decay to 0 at ZERO_KM.
  //   - If you land in the right country, you get at least COUNTRY_FLOOR of
  //     the max even if the city pin is far (the "right country" bonus).
  const MAP_FULL_KM = 50;
  const MAP_ZERO_KM = 2500;
  const COUNTRY_FLOOR = 0.4;

  function gradeMap(q, response) {
    if (!response || typeof response.lat !== "number") {
      return { points: 0, max: q.points, correct: false, detail: `No guess placed. It was ${q.place}, ${q.country}.` };
    }
    const dist = haversineKm(q.lat, q.lng, response.lat, response.lng);
    let frac;
    if (dist <= MAP_FULL_KM) frac = 1;
    else if (dist >= MAP_ZERO_KM) frac = 0;
    else frac = 1 - (dist - MAP_FULL_KM) / (MAP_ZERO_KM - MAP_FULL_KM);

    const inCountry = response.country && q.country &&
      response.country.toLowerCase() === q.country.toLowerCase();
    if (inCountry) frac = Math.max(frac, COUNTRY_FLOOR);

    const points = Math.round(frac * q.points);
    const distTxt = dist < 1 ? "<1 km" : `${Math.round(dist).toLocaleString()} km`;
    let detail = `You were ${distTxt} from ${q.place}.`;
    if (inCountry) detail += " ✅ Correct country bonus applied!";
    detail += ` (${points}/${q.points} pts)`;
    return { points, max: q.points, correct: dist <= MAP_FULL_KM, detail, distanceKm: dist, inCountry };
  }

  // Number estimate: partial credit by percentage error, over or under.
  //   error% = |guess - answer| / answer
  //   0% error  -> full points
  //   >= 50% err -> 0 points  (linear in between)
  const NUMBER_ZERO_ERROR = 0.5;

  function gradeNumber(q, response) {
    const guess = parseFloat(String(response).replace(/[, ]/g, ""));
    if (!isFinite(guess)) {
      return { points: 0, max: q.points, correct: false, detail: `No valid number entered. Answer: ${fmtNum(q.answer)} ${q.unit}`.trim() };
    }
    const err = Math.abs(guess - q.answer) / Math.abs(q.answer);
    let frac;
    if (err === 0) frac = 1;
    else if (err >= NUMBER_ZERO_ERROR) frac = 0;
    else frac = 1 - err / NUMBER_ZERO_ERROR;
    const points = Math.round(frac * q.points);
    const pct = (err * 100).toFixed(1);
    const detail = `Answer: ${fmtNum(q.answer)} ${q.unit}`.trim() +
      ` · You were ${pct}% off (${points}/${q.points} pts)`;
    return { points, max: q.points, correct: err < 0.001, detail };
  }

  function fmtNum(n) {
    return Number(n).toLocaleString();
  }

  // Dispatch to the right grader based on question type.
  function grade(q, response) {
    switch (q.type) {
      case "mc": return gradeMC(q, response);
      case "written": return gradeWritten(q, response);
      case "flag": return gradeFlag(q, response);
      case "map": return gradeMap(q, response);
      case "number": return gradeNumber(q, response);
      default: return { points: 0, max: q.points || 0, correct: false, detail: "" };
    }
  }

  T.scoring = { grade, haversineKm, normalize };
})(window.TRIVIA = window.TRIVIA || {});
