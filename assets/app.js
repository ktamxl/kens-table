/* Ken's Table — status memory + list filtering
   No external dependencies. Status is stored in this browser only. */
(function () {
  "use strict";

  var KEY = "kentable.status.v1";
  var LABELS = { want: "Want to go", tried: "Tried" };

  function readStore() {
    try {
      var raw = window.localStorage.getItem(KEY);
      var parsed = raw ? JSON.parse(raw) : {};
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch (e) {
      return {};
    }
  }

  function writeStore(store) {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(store));
    } catch (e) {
      /* storage unavailable: the page still works, the choice just will not persist */
    }
  }

  var store = readStore();

  function statusOf(slug, fallback) {
    return store[slug] || fallback || "want";
  }

  /* ── status badges (cards, mentions) ─────────────────── */
  function paintBadges() {
    var nodes = document.querySelectorAll("[data-status-badge]");
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      var slug = el.getAttribute("data-status-badge");
      var state = statusOf(slug, el.getAttribute("data-default"));
      el.setAttribute("data-state", state);
      el.textContent = LABELS[state];
      el.hidden = false;
    }
  }

  /* ── detail page switch ──────────────────────────────── */
  function paintSwitches() {
    var switches = document.querySelectorAll("[data-status-switch]");
    for (var i = 0; i < switches.length; i++) {
      var box = switches[i];
      var slug = box.getAttribute("data-status-switch");
      var fallback = box.getAttribute("data-default") || "want";
      var state = statusOf(slug, fallback);
      var buttons = box.querySelectorAll("button[data-set-status]");
      for (var j = 0; j < buttons.length; j++) {
        buttons[j].setAttribute("aria-pressed", String(buttons[j].getAttribute("data-set-status") === state));
      }
      var hint = document.querySelector('[data-status-hint="' + slug + '"]');
      if (hint) {
        hint.textContent =
          state === "tried"
            ? "Marked as tried. Your notes stay on this device."
            : "On the list. Tap “Tried it” once you have eaten here.";
      }
    }
  }

  function setStatus(slug, value) {
    store[slug] = value;
    writeStore(store);
    paintBadges();
    paintSwitches();
    paintCounts();
    applyFilters();
  }

  document.addEventListener("click", function (event) {
    var btn = event.target.closest ? event.target.closest("[data-set-status]") : null;
    if (!btn) return;
    event.preventDefault();
    var slug = btn.getAttribute("data-slug");
    var value = btn.getAttribute("data-set-status");
    if (!slug || !value) return;
    setStatus(slug, value);
  });

  /* ── counts ──────────────────────────────────────────── */
  function paintCounts() {
    var cards = document.querySelectorAll("[data-restaurant]");
    var counts = { want: 0, tried: 0 };
    for (var i = 0; i < cards.length; i++) {
      var slug = cards[i].getAttribute("data-slug");
      var state = statusOf(slug, cards[i].getAttribute("data-default"));
      if (counts[state] !== undefined) counts[state]++;
    }
    var map = document.querySelectorAll("[data-count-for]");
    for (var k = 0; k < map.length; k++) {
      var key = map[k].getAttribute("data-count-for");
      if (counts[key] !== undefined) map[k].textContent = counts[key];
    }
  }

  /* ── list filtering (home page) ──────────────────────── */
  var state = { city: "all", status: "all", q: "" };

  function applyFilters() {
    var cards = document.querySelectorAll("[data-restaurant]");
    if (!cards.length) return;
    var shown = 0;

    for (var i = 0; i < cards.length; i++) {
      var card = cards[i];
      var slug = card.getAttribute("data-slug");
      var city = card.getAttribute("data-city") || "";
      var hay = (card.getAttribute("data-search") || "").toLowerCase();
      var st = statusOf(slug, card.getAttribute("data-default"));
      var okCity = state.city === "all" || city === state.city;
      var okStatus = state.status === "all" || st === state.status;
      var okQuery = !state.q || hay.indexOf(state.q) !== -1;
      var visible = okCity && okStatus && okQuery;
      card.hidden = !visible;
      card.style.display = visible ? "" : "none";
      if (visible) shown++;
    }

    var empty = document.querySelector("[data-empty]");
    if (empty) empty.hidden = shown !== 0;

    var sections = document.querySelectorAll("[data-city-section]");
    for (var s = 0; s < sections.length; s++) {
      var visibleCards = sections[s].querySelectorAll("[data-restaurant]:not([hidden])");
      sections[s].hidden = visibleCards.length === 0;
    }
  }

  function initFilters() {
    var chips = document.querySelectorAll("[data-filter-city]");
    for (var i = 0; i < chips.length; i++) {
      chips[i].addEventListener("click", function () {
        state.city = this.getAttribute("data-filter-city");
        for (var j = 0; j < chips.length; j++) {
          chips[j].setAttribute("aria-pressed", String(chips[j] === this));
        }
        applyFilters();
      });
    }

    var statusChips = document.querySelectorAll("[data-filter-status]");
    for (var k = 0; k < statusChips.length; k++) {
      statusChips[k].addEventListener("click", function () {
        state.status = this.getAttribute("data-filter-status");
        for (var m = 0; m < statusChips.length; m++) {
          statusChips[m].setAttribute("aria-pressed", String(statusChips[m] === this));
        }
        applyFilters();
      });
    }

    var search = document.querySelector("[data-search-input]");
    if (search) {
      search.addEventListener("input", function () {
        state.q = this.value.trim().toLowerCase();
        applyFilters();
      });
    }
  }

  function init() {
    paintBadges();
    paintSwitches();
    paintCounts();
    initFilters();
    applyFilters();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
