/*
 * Scorecard generation and sharing.
 *
 * Produces a compact, emoji-based text scorecard (Wordle-style) that friends
 * can read at a glance, plus a link back to the game so they can play and
 * compete for the high score. Sharing prefers the native share sheet (which
 * lets the user pick Messages/SMS), and falls back to an `sms:` link and
 * clipboard copy.
 */
(function (T) {
  "use strict";

  // Per-question emoji based on fraction of points earned.
  function tile(points, max) {
    if (max <= 0) return "⬜";
    const f = points / max;
    if (f >= 0.999) return "🟩"; // full
    if (f >= 0.5) return "🟨";   // strong partial
    if (f > 0) return "🟧";      // some partial
    return "🟥";                 // miss
  }

  function buildScorecardText(opts) {
    // opts: { name, dateStr, total, max, grades, url }
    const tiles = opts.grades.map((g) => tile(g.points, g.max));
    const row1 = tiles.slice(0, 5).join("");
    const row2 = tiles.slice(5, 10).join("");
    const lines = [
      `🧠 Daily Trivia Challenge — ${opts.dateStr}`,
      `${opts.name ? opts.name + ": " : ""}${opts.total}/${opts.max} pts`,
      row1,
      row2,
      "",
      `Beat my score 👉 ${opts.url}`
    ];
    return lines.join("\n");
  }

  async function share(text) {
    // 1) Native share sheet (mobile) — lets the user choose Messages/SMS.
    if (navigator.share) {
      try {
        await navigator.share({ title: "Daily Trivia Challenge", text });
        return { method: "native" };
      } catch (e) {
        if (e && e.name === "AbortError") return { method: "cancelled" };
        // otherwise fall through to fallbacks
      }
    }
    // 2) Copy to clipboard so it can be pasted into any messaging app.
    try {
      await navigator.clipboard.writeText(text);
      return { method: "clipboard" };
    } catch (e) {
      return { method: "manual" };
    }
  }

  // Direct "open SMS app" link with the body prefilled.
  function smsHref(text) {
    // The "?&body=" form is the most broadly compatible across iOS/Android.
    return "sms:?&body=" + encodeURIComponent(text);
  }

  T.share = { buildScorecardText, share, smsHref };
})(window.TRIVIA = window.TRIVIA || {});
