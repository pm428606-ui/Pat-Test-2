/*
 * Local persistence. We keep the player's name and one saved result per
 * Eastern date so the daily challenge can't be replayed for a better score.
 */
(function (T) {
  "use strict";

  const KEY = "dailyTrivia.v1";

  function load() {
    try {
      return JSON.parse(localStorage.getItem(KEY)) || {};
    } catch (e) {
      return {};
    }
  }

  function save(state) {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch (e) {
      /* storage may be unavailable (private mode); fail silently */
    }
  }

  T.storage = {
    getName() {
      return load().name || "";
    },
    setName(name) {
      const s = load();
      s.name = name;
      save(s);
    },
    getResult(dateStr) {
      const s = load();
      return (s.results || {})[dateStr] || null;
    },
    saveResult(dateStr, result) {
      const s = load();
      s.results = s.results || {};
      s.results[dateStr] = result;
      save(s);
    },
    // running stats across days
    recordStats(dateStr, total) {
      const s = load();
      s.stats = s.stats || { played: 0, best: 0, totalScore: 0, days: {} };
      if (!s.stats.days[dateStr]) {
        s.stats.days[dateStr] = total;
        s.stats.played += 1;
        s.stats.totalScore += total;
        s.stats.best = Math.max(s.stats.best, total);
      }
      save(s);
      return s.stats;
    },
    getStats() {
      return load().stats || { played: 0, best: 0, totalScore: 0, days: {} };
    }
  };
})(window.TRIVIA = window.TRIVIA || {});
