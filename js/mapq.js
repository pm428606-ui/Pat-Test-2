/*
 * Interactive map question (geoguessr / maptap.gg style) built on Leaflet.
 *
 * The player clicks anywhere on the world map to drop a pin. We resolve which
 * country the pin landed in via a free reverse-geocode (used only to award the
 * "correct country" bonus). Geocoding is best-effort: if it fails or is
 * offline, distance-based scoring still works.
 */
(function (T) {
  "use strict";

  let map = null;
  let marker = null;
  let current = null; // { lat, lng, country }

  function mount(containerId, onPlaced) {
    teardown();
    map = L.map(containerId, {
      worldCopyJump: true,
      minZoom: 1,
      maxZoom: 8
    }).setView([20, 0], 2);

    // Label-free basemap: shows coastlines, terrain and roads but NO place
    // names, so players can't zoom in and simply read off the country/city.
    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png", {
      attribution: "© OpenStreetMap contributors © CARTO",
      subdomains: "abcd",
      maxZoom: 8,
      noWrap: false
    }).addTo(map);

    current = null;

    map.on("click", async (e) => {
      const { lat, lng } = e.latlng;
      placeMarker(lat, lng);
      current = { lat, lng, country: null };
      if (onPlaced) onPlaced(current); // distance is already gradeable
      // enrich with country in the background for the bonus
      const country = await reverseCountry(lat, lng);
      if (current && current.lat === lat && current.lng === lng) {
        current.country = country;
        if (onPlaced) onPlaced(current);
      }
    });

    // Leaflet needs a size recalculation when shown inside a flex layout.
    setTimeout(() => map && map.invalidateSize(), 60);
  }

  function placeMarker(lat, lng) {
    if (marker) marker.setLatLng([lat, lng]);
    else marker = L.marker([lat, lng]).addTo(map);
  }

  // Show the correct location + the player's guess after grading.
  function reveal(target, guess) {
    if (!map) return;
    const pts = [];
    const tgt = L.circleMarker([target.lat, target.lng], {
      radius: 8, color: "#16a34a", fillColor: "#22c55e", fillOpacity: 0.9
    }).addTo(map).bindTooltip(`${target.place} (answer)`, { permanent: false });
    pts.push([target.lat, target.lng]);
    if (guess && typeof guess.lat === "number") {
      L.polyline([[guess.lat, guess.lng], [target.lat, target.lng]], {
        color: "#ef4444", dashArray: "6 6", weight: 2
      }).addTo(map);
      pts.push([guess.lat, guess.lng]);
    }
    map.off("click");
    try { map.fitBounds(pts, { padding: [40, 40], maxZoom: 6 }); } catch (e) {}
  }

  async function reverseCountry(lat, lng) {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=3&accept-language=en`;
      const res = await fetch(url, { headers: { Accept: "application/json" } });
      if (!res.ok) return null;
      const data = await res.json();
      return (data.address && data.address.country) || null;
    } catch (e) {
      return null; // offline / rate-limited: skip the bonus, keep distance score
    }
  }

  function teardown() {
    if (map) { map.remove(); map = null; }
    marker = null;
    current = null;
  }

  T.mapq = { mount, reveal, teardown, getCurrent: () => current };
})(window.TRIVIA = window.TRIVIA || {});
