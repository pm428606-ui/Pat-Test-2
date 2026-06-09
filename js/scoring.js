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

  // Map question: partial credit by distance, with a small country bonus.
  //   - Full points within FULL_KM.
  //   - Linear decay to 0 at ZERO_KM.
  //   - Landing in the right country adds a flat +10% of the slot's points
  //     on top of the distance score (capped at full points).
  const MAP_FULL_KM = 50;
  const MAP_ZERO_KM = 2500;
  const COUNTRY_BONUS = 0.10;

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

    let raw = frac * q.points;
    if (inCountry) raw = Math.min(q.points, raw + COUNTRY_BONUS * q.points);

    const points = Math.round(raw);
    const distMi = dist * 0.621371; // grading bands are km internally; show miles (US)
    const distTxt = distMi < 1 ? "<1 mi" : `${Math.round(distMi).toLocaleString()} mi`;
    let detail = `You were ${distTxt} from ${q.place}.`;
    if (inCountry) detail += ` ✅ +${Math.round(COUNTRY_BONUS * 100)}% right-country bonus.`;
    detail += ` (${points}/${q.points} pts)`;
    return { points, max: q.points, correct: dist <= MAP_FULL_KM, detail, distanceKm: dist, inCountry };
  }

  // Number estimate: partial credit by closeness.
  //   - Year-type and other large-offset answers use an ABSOLUTE tolerance
  //     (set q.tolAbs): full credit at 0 error, linear to 0 at tolAbs. This
  //     stops a 4% miss on a year (e.g. 1776 -> 1850) scoring nearly full.
  //   - Everything else uses relative error with a stricter zero point
  //     (q.tol, default 0.25 — a guess 25%+ off earns nothing).
  const NUMBER_ZERO_ERROR = 0.25;

  function gradeNumber(q, response) {
    const guess = parseFloat(String(response).replace(/[, ]/g, ""));
    if (!isFinite(guess)) {
      return { points: 0, max: q.points, correct: false, detail: `No valid number entered. Answer: ${fmtNum(q.answer)} ${q.unit}`.trim() };
    }
    const absErr = Math.abs(guess - q.answer);
    let frac, offText, exact;
    if (q.tolAbs != null) {
      // absolute-tolerance scoring (years, etc.)
      frac = absErr >= q.tolAbs ? 0 : 1 - absErr / q.tolAbs;
      offText = `off by ${fmtNum(Math.round(absErr))}`;
      exact = absErr < 0.5;
    } else {
      const rel = absErr / Math.abs(q.answer);
      const zero = q.tol != null ? q.tol : NUMBER_ZERO_ERROR;
      frac = rel >= zero ? 0 : 1 - rel / zero;
      offText = `${(rel * 100).toFixed(1)}% off`;
      exact = rel < 0.001;
    }
    const points = Math.round(frac * q.points);
    const detail = `Answer: ${fmtNum(q.answer)} ${q.unit}`.trim() +
      ` · You were ${offText} (${points}/${q.points} pts)`;
    return { points, max: q.points, correct: exact, detail };
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
