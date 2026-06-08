/*
 * Flag helpers. Flag images come from flagcdn.com (free, no API key).
 * Only the country codes actually referenced in the question bank need names.
 */
(function (T) {
  "use strict";

  const NAMES = {
    jp: "Japan", kr: "South Korea", cn: "China", th: "Thailand",
    ca: "Canada", us: "United States", gb: "United Kingdom", au: "Australia",
    br: "Brazil", ar: "Argentina", pt: "Portugal", co: "Colombia",
    it: "Italy", ie: "Ireland", mx: "Mexico", hu: "Hungary",
    tw: "Taiwan", mn: "Mongolia", gr: "Greece", fi: "Finland",
    is: "Iceland", uy: "Uruguay", es: "Spain", nz: "New Zealand", fj: "Fiji",
    sk: "Slovakia", si: "Slovenia", hr: "Croatia", ru: "Russia",
    td: "Chad", ro: "Romania", md: "Moldova", be: "Belgium"
  };

  T.flagName = function (code) {
    return NAMES[code] || code.toUpperCase();
  };

  T.flagUrl = function (code, width) {
    return `https://flagcdn.com/w${width || 320}/${code}.png`;
  };
})(window.TRIVIA = window.TRIVIA || {});
