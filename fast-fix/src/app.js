/* HomeHub Request flow prototype. In-page only: links to other pages show a toast.
   Screens: type, job (1), check (2), time (3), booked, sent. Deep-linkable with #/job etc. */
(function () {
  "use strict";

  var body = document.body;
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function pad(n) { return (n < 10 ? "0" : "") + n; }

  /* ---------- Data (illustrative: the real list and times are curated with Ops) ---------- */
  var HOMES = {
    mueller: { addr: "4817 Mueller Blvd", city: "Austin, TX 78723", hm: "Marcus Reyes", ini: "MR" },
    elm: { addr: "1206 Elm Ridge Dr", city: "Round Rock, TX 78664", hm: "Tom Alvarez", ini: "TA" }
  };
  var JOBS = [
    { id: "toilet-run", title: "Running toilet", icon: "ri-drop-line", min: 60 },
    { id: "toilet-clog", title: "Clogged toilet", icon: "ri-water-flash-line", min: 60 },
    { id: "lock", title: "Door lock issue", icon: "ri-door-lock-line", min: 60 },
    { id: "door", title: "Sticking or loose door", icon: "ri-door-closed-line", min: 30 },
    { id: "disposal", title: "Garbage disposal issue", icon: "ri-recycle-line", min: 60 },
    { id: "appliance", title: "Appliance diagnostic", icon: "ri-fridge-line", min: 60 },
    { id: "tv", title: "Mount a TV", icon: "ri-tv-line", min: 60 },
    { id: "hang", title: "Hang shelves, curtain rods or art", icon: "ri-ruler-line", min: 60 },
    { id: "assemble", title: "Assemble furniture", icon: "ri-sofa-line", min: 60 },
    { id: "caulk", title: "Caulk or seal", icon: "ri-paint-brush-line", min: 60 },
    { id: "other", title: "Something else", icon: "ri-add-line", min: 60 }
  ];
  var RATE = 55;
  var MAX_MIN = 180;
  var TODAY = new Date(2026, 9, 8);
  var FIRST_DAY = new Date(2026, 9, 12);
  var LAST_MONTH = { y: 2027, m: 1 };
  var FIRST_MONTH = { y: 2026, m: 9 };
  var STARTS = [480, 570, 660, 780, 870, 960];
  var SUFFIX = " | PreFix Home Maintenance";

  var SCREENS = ["type", "job", "check", "time", "booked", "sent"];
  var TITLES = {
    type: ["How can we help?", "Choose what fits best."],
    job: ["What do you need done?", "Fast Fix is for small handyman jobs. All fields are required."],
    check: ["A quick check", "Three quick questions so we book the right visit. All are required."],
    time: ["Pick a time", "Real open times with your Home Manager. Your booking is confirmed right away."],
    booked: ["You’re booked", "Confirmed. Nothing else to do."],
    sent: ["Request sent", "Our team will take it from here."]
  };
  var PAGE_TITLE = {
    type: "Request service", job: "Fast Fix: the job", check: "Fast Fix: quick check",
    time: "Fast Fix: pick a time", booked: "Fast Fix: booked", sent: "Request sent"
  };
  var BACK = { type: null, job: "type", check: "job", time: "check", booked: null, sent: null };
  var WHY = {
    ladder: "This needs more than a standard step ladder, so our team will plan the right equipment.",
    trade: "Work with gas, wiring or water lines can need a licensed trade, so our team will plan it.",
    part: "You still need the part, so our team will help plan it.",
    time: "These jobs add up to more than 3 hours, so our team will plan the visit.",
    slots: "We could not find an open time, so our team will find one for you."
  };
  /* Step 2: the vetting questions (Mark's wording). Any answer listed in BAD sends the request to the team. */
  var Q = ["ladder", "trade", "part"];
  var BAD = { ladder: ["no", "unsure"], trade: ["yes", "unsure"], part: ["need"] };
  var HINT = {
    ladder: "Think roofs, second-story outsides and vaulted ceilings.",
    trade: "Swapping a fixture is fine. Adding or relocating one is not.",
    part: "For example a new faucet, lock set or TV mount."
  };
  var QNAME = { ladder: "Standard step ladder", trade: "Gas, wiring or water lines", part: "Part or fixture" };
  var QLABEL = {
    ladder: { yes: "Yes", no: "No, it’s higher", unsure: "Not sure" },
    trade: { no: "No", yes: "Yes", unsure: "Not sure" },
    part: { have: "Have it", none: "No part needed", need: "Need one" }
  };

  /* ---------- State ---------- */
  var state = {
    screen: "type", home: "mueller", jobs: {}, desc: "", hours: 0, ladder: "", trade: "", part: "",
    date: null, time: null, month: { y: 2026, m: 9 }, reason: "", taken: {}
  };

  /* ---------- Formatting ---------- */
  function fmtMin(m) {
    var h = Math.floor(m / 60), r = m % 60;
    if (!h) return r + " min";
    return h + " hr" + (r ? " " + r + " min" : "");
  }
  function t12(min) {
    var h = Math.floor(min / 60), m = min % 60;
    return ((h % 12) || 12) + ":" + pad(m) + " " + (h >= 12 ? "PM" : "AM");
  }
  function range(start, hours) {
    var a = t12(start), b = t12(start + hours * 60);
    if (a.slice(-2) === b.slice(-2)) a = a.slice(0, -3);
    return a + " – " + b;
  }
  function iso(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function parse(s) { var p = s.split("-"); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function longDate(d) { return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }); }
  function shortDate(d) { return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }); }
  function monthName(y, m) { return new Date(y, m, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" }); }
  function money(n) { return "$" + n; }

  /* ---------- Derived ---------- */
  function pickedJobs() { return JOBS.filter(function (j) { return state.jobs[j.id]; }); }
  /* "Top 10 list or free form": a described job with nothing ticked counts as "Something else" */
  function selectedJobs() {
    var p = pickedJobs();
    if (!p.length && state.desc.trim()) return [JOBS[JOBS.length - 1]];
    return p;
  }
  function overLimit() { return totalMin() > MAX_MIN; }
  function totalMin() { return selectedJobs().reduce(function (s, j) { return s + j.min; }, 0); }
  function isBad(q) { return BAD[q].indexOf(state[q]) > -1; }
  function routedBy() { return Q.filter(isBad); }
  function checkOutcome() { var r = routedBy(); return r.length ? r[0] : ""; }
  function hours() { return state.hours || 2; }

  /* ---------- Availability (deterministic stand-in for the real calendar) ---------- */
  var BLOCKED = { "2026-10-19": 1, "2026-10-27": 1, "2026-11-11": 1, "2026-11-26": 1, "2026-11-27": 1, "2026-12-25": 1 };
  function dayOpen(d) {
    var w = d.getDay();
    if (w === 0 || w === 6) return false;
    if (d < FIRST_DAY) return false;
    if (BLOCKED[iso(d)]) return false;
    if ((d.getDate() * 7 + d.getMonth()) % 5 === 0) return false;
    return slotsFor(iso(d)).length > 0;
  }
  function slotsFor(isoDate) {
    var d = parse(isoDate), h = hours(), out = [];
    STARTS.forEach(function (s, i) {
      if (s + h * 60 > 18 * 60) return;
      if ((d.getDate() + i * 3 + h) % 4 === 0) return;
      if (state.taken[isoDate + "@" + s]) return;
      out.push(s);
    });
    return out;
  }
  function firstOpenDay() {
    var d = new Date(FIRST_DAY);
    for (var i = 0; i < 60; i++) { if (dayOpen(d)) return iso(d); d.setDate(d.getDate() + 1); }
    return null;
  }

  /* ---------- Rendering: jobs ---------- */
  function renderJobs() {
    $("#jobs").innerHTML = JOBS.map(function (j) {
      var meta = j.id === "other" ? "Describe it below" : "About " + fmtMin(j.min);
      return '<label class="opt"><input type="checkbox" name="jobs" value="' + j.id + '">' +
        '<span class="d-icon" aria-hidden="true"><svg class="i"><use href="#' + j.icon + '"/></svg></span>' +
        '<span class="opt__main"><span class="opt__title">' + j.title + '</span><span class="opt__meta">' + meta + '</span></span>' +
        '<span class="opt__box" aria-hidden="true"><svg class="i"><use href="#ri-check-line"/></svg></span></label>';
    }).join("");
  }

  /* Push state into the form controls (used when jumping straight to a screen) */
  function syncInputs() {
    $all('input[name="jobs"]').forEach(function (c) { c.checked = !!state.jobs[c.value]; });
    $("#desc").value = state.desc;
    $all('input[name="hours"]').forEach(function (r) { r.checked = +r.value === state.hours; });
    Q.forEach(function (q) {
      $all('input[name="' + q + '"]').forEach(function (r) { r.checked = r.value === state[q]; });
    });
  }

  /* ---------- Rendering: calendar and times ---------- */
  function renderCal() {
    var y = state.month.y, m = state.month.m;
    $("#cal-month").textContent = monthName(y, m);
    $("#cal-prev").disabled = (y === FIRST_MONTH.y && m === FIRST_MONTH.m);
    $("#cal-next").disabled = (y === LAST_MONTH.y && m === LAST_MONTH.m);
    var html = ["S", "M", "T", "W", "T", "F", "S"].map(function (l, i) {
      return '<span class="cal__dow" aria-hidden="true">' + l + '</span>';
    }).join("");
    var first = new Date(y, m, 1), days = new Date(y, m + 1, 0).getDate();
    for (var b = 0; b < first.getDay(); b++) html += '<span class="cal__cell"></span>';
    for (var n = 1; n <= days; n++) {
      var d = new Date(y, m, n), open = dayOpen(d), key = iso(d);
      html += '<span class="cal__cell"><button type="button" class="cal__day" data-date="' + key + '"' +
        (open ? "" : " disabled") + ' aria-pressed="' + (state.date === key) + '" aria-label="' +
        longDate(d) + (open ? ", open times" : ", no open times") + '">' + n + '</button></span>';
    }
    $("#cal-grid").innerHTML = html;
  }

  function renderTimes() {
    var box = $("#times"), meta = $("#times-meta");
    if (!state.date) {
      box.innerHTML = "";
      meta.textContent = "Choose a date to see open times. Times are in Central Time.";
      return;
    }
    var d = parse(state.date);
    meta.textContent = "Open times on " + longDate(d) + ". Times are in Central Time.";
    box.innerHTML = slotsFor(state.date).map(function (s) {
      return '<label class="time"><input type="radio" name="slot" value="' + s + '"' + (state.time === s ? " checked" : "") + '>' +
        '<span>' + range(s, hours()) + '</span><svg class="i" aria-hidden="true"><use href="#ri-check-line"/></svg></label>';
    }).join("");
  }

  /* ---------- Rendering: notes, status, CTA, summary ---------- */
  function updateHoursNote() {
    var t = totalMin(), over = overLimit(), note = $("#note-hours"), txt = "";
    $("#note-over").hidden = !over;
    $("#over-time").textContent = fmtMin(t);
    $("#fsec-hours").hidden = over;
    if (t > 0 && !over) {
      txt = "Your jobs add up to about " + fmtMin(t) + ".";
      if (state.hours && state.hours * 60 < t) {
        txt += " Booking " + state.hours + (state.hours === 1 ? " hour" : " hours") + " may not be enough, so your Home Manager might not finish everything.";
      }
    }
    note.hidden = !txt;
    $("#note-hours-text").textContent = txt;
  }

  function updateChecksNotes() {
    var routed = routedBy().length > 0;
    Q.forEach(function (q) {
      $("#note-" + q).hidden = !isBad(q);
      $("#hint-" + q).textContent = (routed && !state[q] ? "Optional. " : "") + HINT[q];
    });
  }

  function ctaFor(screen) {
    var n = selectedJobs().length, t = totalMin(), h = state.hours;
    if (screen === "job") {
      return {
        label: overLimit() ? "Send to our team" : "Continue",
        status: n ? n + (n === 1 ? " job" : " jobs") + " · about " + fmtMin(t) : "Nothing picked yet"
      };
    }
    if (screen === "check") {
      return {
        label: checkOutcome() ? "Send to our team" : "Continue to times",
        status: n + (n === 1 ? " job" : " jobs") + " · " + (h ? h + (h === 1 ? " hour" : " hours") : "")
      };
    }
    if (screen === "time") {
      var noSlots = body.classList.contains("is-noslots");
      var slot = state.date && state.time !== null ? shortDate(parse(state.date)) + " · " + range(state.time, hours()) : "Pick a date and a time";
      return { label: noSlots ? "Send to our team" : "Confirm booking", status: noSlots ? "Ready to send" : slot };
    }
    return null;
  }

  function updateCta() {
    var c = ctaFor(state.screen);
    if (!c) return;
    $all("[data-next]").forEach(function (b) { b.textContent = c.label; });
    $("#status-" + state.screen).textContent = c.status;
    $("#dock-status").textContent = c.status;
  }

  function updateSummary() {
    var h = HOMES[state.home], s = state.screen;
    $("#s-home-label").classList.toggle("sr-only", s === "type");
    $("#summary-title").textContent = s === "type" ? "Your home" : (s === "sent" ? "What you sent" : "Your request");
    $("#s-addr").textContent = h.addr;
    $("#s-city").textContent = h.city;

    var jobs = selectedJobs(), showJobs = s !== "type" && jobs.length > 0;
    $("#s-jobs-row").hidden = !showJobs;
    $("#s-jobs").innerHTML = jobs.map(function (j) {
      return "<li><span>" + j.title + "</span><span>" + fmtMin(j.min) + "</span></li>";
    }).join("");
    var txt = state.desc.trim();
    $("#s-text").hidden = !(showJobs && txt);
    $("#s-text").textContent = txt;

    var showWhen = (s === "time") && state.date && state.time !== null;
    $("#s-when-row").hidden = !showWhen;
    if (showWhen) {
      $("#s-when").textContent = shortDate(parse(state.date)) + " · " + range(state.time, hours());
      $("#s-hm").textContent = "with " + h.hm;
    }

    var ans = [];
    if (s === "sent") {
      Q.forEach(function (q) { if (state[q]) ans.push([QNAME[q], QLABEL[q][state[q]]]); });
      if (state.hours && !overLimit()) ans.push(["Time asked for", state.hours + (state.hours === 1 ? " hour" : " hours")]);
    }
    $("#s-answers-row").hidden = ans.length === 0;
    $("#s-answers").innerHTML = ans.map(function (r) { return "<li><span>" + r[0] + "</span><span>" + r[1] + "</span></li>"; }).join("");

    var showLedger = state.hours && !overLimit() && (s === "job" || s === "check" || s === "time");
    $("#s-ledger").hidden = !showLedger;
    if (showLedger) {
      $("#l-time").textContent = state.hours + (state.hours === 1 ? " hour" : " hours");
      $("#l-total").textContent = money(state.hours * RATE);
    }
  }

  function refresh() {
    updateHoursNote();
    updateChecksNotes();
    updateCta();
    updateSummary();
  }

  /* ---------- Errors ---------- */
  function setError(id, on) {
    var el = $("#err-" + id);
    if (el) el.hidden = !on;
    var field = { desc: "#field-desc" }[id];
    if (field) $(field).classList.toggle("is-invalid", on);
  }
  function clearErrors(ids) { ids.forEach(function (id) { setError(id, false); }); }

  /* ---------- Navigation ---------- */
  function seedDemo(screen) {
    if (!selectedJobs().length) {
      state.jobs = { "toilet-run": true, lock: true };
      state.desc = "The toilet in the hall bath keeps running after I flush, and the front door lock sticks.";
      state.hours = 2;
    }
    if (screen === "time" || screen === "booked") { state.ladder = state.ladder || "yes"; state.trade = state.trade || "no"; state.part = state.part || "have"; }
    if (screen === "sent" && !state.reason) { state.reason = "ladder"; state.ladder = "no"; }
    if (screen === "booked" && (!state.date || state.time === null)) {
      state.date = firstOpenDay();
      var s = slotsFor(state.date);
      state.time = s.length ? s[0] : STARTS[0];
      var d = parse(state.date); state.month = { y: d.getFullYear(), m: d.getMonth() };
    }
    syncInputs();
  }

  function fromHash() {
    var m = /^#\/([a-z]+)$/.exec(location.hash);
    return m && SCREENS.indexOf(m[1]) > -1 ? m[1] : "type";
  }
  function navigate(screen) {
    if (location.hash === "#/" + screen) render(screen); else location.hash = "#/" + screen;
  }

  var firstRender = true;
  function render(screen) {
    if (screen !== "type" && screen !== "job" && !selectedJobs().length) seedDemo(screen);
    if (screen === "booked" && (!state.date || state.time === null)) seedDemo(screen);
    if (screen === "sent" && !state.reason) seedDemo(screen);
    state.screen = screen;
    body.setAttribute("data-screen", screen);
    body.setAttribute("data-dock", /^(job|check|time)$/.test(screen) ? "on" : "off");

    SCREENS.forEach(function (s) { $('[data-screen-id="' + s + '"]').hidden = s !== screen; });
    $("#h1").textContent = TITLES[screen][0];
    var sub = TITLES[screen][1];
    $("#sub").textContent = sub;
    document.title = PAGE_TITLE[screen] + SUFFIX;

    /* stepper */
    var idx = ["job", "check", "time"].indexOf(screen);
    $("#steps").hidden = idx < 0;
    $all(".step").forEach(function (el, i) {
      el.classList.toggle("is-done", i < idx);
      el.classList.toggle("is-current", i === idx);
      if (i === idx) el.setAttribute("aria-current", "step"); else el.removeAttribute("aria-current");
    });

    /* result icon */
    var isResult = screen === "booked" || screen === "sent";
    $("#result-icon").hidden = !isResult;
    if (isResult) $("#result-icon-svg").firstElementChild.setAttribute("href", screen === "booked" ? "#ri-checkbox-circle-line" : "#ri-send-plane-line");

    /* home switcher, back link */
    $("#home-switch").hidden = screen !== "type";
    $(".back").hidden = screen === "booked" || screen === "sent";
    $("[data-back-label]").textContent = BACK[screen] ? "Back" : "Back to dashboard";

    /* rail */
    $("#summary").hidden = screen === "booked";
    $("#hmcard").hidden = screen !== "booked";

    /* dock */
    $("#fdock").hidden = !/^(job|check|time)$/.test(screen);

    if (screen === "time") {
      var noSlots = body.classList.contains("is-noslots");
      $("#book").hidden = noSlots;
      $("#noslots").hidden = !noSlots;
      $("#note-fits").hidden = noSlots;
      setError("time", false);
      if (!state.date && !noSlots) {
        state.date = firstOpenDay();
        if (state.date) { var fd = parse(state.date); state.month = { y: fd.getFullYear(), m: fd.getMonth() }; }
      }
      if (state.date && state.time !== null && slotsFor(state.date).indexOf(state.time) < 0) state.time = null;
      renderCal();
      renderTimes();
    }
    if (screen === "booked") fillBooked();
    if (screen === "sent") $("#sent-why").textContent = WHY[state.reason] || WHY.ladder;

    refresh();
    if (!firstRender) { window.scrollTo(0, 0); $("#h1").focus({ preventScroll: true }); }
    firstRender = false;
    $all("[data-jump]").forEach(function (b) { if (b.getAttribute("data-jump") === screen) b.setAttribute("aria-current", "true"); else b.removeAttribute("aria-current"); });
  }

  function fillBooked() {
    var h = HOMES[state.home], d = parse(state.date);
    $("#b-date").textContent = longDate(d);
    $("#b-time").textContent = range(state.time, hours()) + " · Central Time";
    $("#b-addr").textContent = h.addr;
    $("#b-city").textContent = h.city;
    $("#b-jobs").textContent = selectedJobs().map(function (j) { return j.title; }).join(", ");
    $("#b-len").textContent = hours() + (hours() === 1 ? " hour" : " hours") + " booked";
    $("#hm-initials").textContent = h.ini;
    $("#hm-role").textContent = h.hm;
    $("#hm-meta").textContent = "Home Manager";
    $("#hm-msg").setAttribute("aria-label", "Message " + h.hm + ", your Home Manager");
  }

  /* ---------- Step actions ---------- */
  function focusFirst(sel) { var el = $(sel); if (el) el.focus(); }
  function timeError(lead, text) {
    $("#err-time-lead").textContent = lead;
    $("#err-time-text").textContent = text;
    setError("time", true);
  }

  function next() {
    var s = state.screen;
    if (s === "job") {
      var bad = [];
      if (!selectedJobs().length) bad.push("jobs");
      if (!state.desc.trim()) bad.push("desc");
      if (!state.hours && !overLimit()) bad.push("hours");
      ["jobs", "desc", "hours"].forEach(function (id) { setError(id, bad.indexOf(id) > -1); });
      if (bad.length) {
        focusFirst({ jobs: '#jobs input', desc: "#desc", hours: '#hours input' }[bad[0]]);
        return;
      }
      if (overLimit()) { state.reason = "time"; navigate("sent"); return; }
      navigate("check");
      return;
    }
    if (s === "check") {
      var bad2 = [];
      /* Once an answer sends the request to the team, the other questions stop blocking */
      if (routedBy().length === 0) Q.forEach(function (q) { if (!state[q]) bad2.push(q); });
      Q.forEach(function (q) { setError(q, bad2.indexOf(q) > -1); });
      if (bad2.length) { focusFirst("#" + bad2[0] + "-opts input"); return; }
      var out = checkOutcome();
      if (out) { state.reason = out; navigate("sent"); return; }
      navigate("time");
      return;
    }
    if (s === "time") {
      if (body.classList.contains("is-noslots")) { state.reason = "slots"; navigate("sent"); return; }
      if (state.date && state.time !== null && slotsFor(state.date).indexOf(state.time) < 0) state.time = null;
      if (!state.date || state.time === null) {
        timeError(!state.date ? "Pick a date and a time." : "Pick a time.", "");
        focusFirst(!state.date ? ".cal__day:not(:disabled)" : "#times input");
        return;
      }
      if (body.classList.contains("is-taken")) {
        state.taken[state.date + "@" + state.time] = true;
        var gone = range(state.time, hours());
        state.time = null;
        applySwitch("taken", false);
        renderCal(); renderTimes();
        timeError(gone + " was just taken.", "We updated the list. Pick another time.");
        refresh();
        focusFirst("#times input");
        return;
      }
      setError("time", false);
      navigate("booked");
    }
  }

  /* ---------- Menus, toggles, toast ---------- */
  var toastTimer;
  function toast(message) {
    var el = $("#toast");
    $("[data-toast-text]", el).textContent = message;
    el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.hidden = true; }, 2800);
  }
  function closeMenus(except) {
    $all("[data-menu]").forEach(function (btn) {
      var menu = document.getElementById(btn.getAttribute("data-menu"));
      if (menu && menu !== except) { menu.hidden = true; btn.setAttribute("aria-expanded", "false"); }
    });
  }
  function applySwitch(name, on) {
    body.classList.toggle("is-" + name, on);
    $all('[data-state-switch="' + name + '"]').forEach(function (i) { i.checked = on; });
  }
  function pickHome(id) {
    state.home = id;
    state.date = null; state.time = null;
    $all("[data-home-pick]").forEach(function (el) { el.setAttribute("aria-checked", String(el.getAttribute("data-home-pick") === id)); });
    $("#home-label").textContent = HOMES[id].addr;
    closeMenus();
    refresh();
  }

  /* ---------- Events ---------- */
  document.addEventListener("click", function (e) {
    var t = e.target;
    var dead = t.closest('a[href="#"]');
    if (dead) e.preventDefault();

    var tg = t.closest("[data-toggle]");
    if (tg) {
      var open = tg.getAttribute("aria-expanded") !== "true";
      tg.setAttribute("aria-expanded", String(open));
      document.getElementById(tg.getAttribute("data-toggle")).hidden = !open;
      return;
    }
    var menuBtn = t.closest("[data-menu]");
    if (menuBtn) {
      var menu = document.getElementById(menuBtn.getAttribute("data-menu"));
      var willOpen = menu.hidden;
      closeMenus(menu);
      menu.hidden = !willOpen;
      menuBtn.setAttribute("aria-expanded", String(willOpen));
      return;
    }
    var pick = t.closest("[data-home-pick]");
    if (pick) { pickHome(pick.getAttribute("data-home-pick")); return; }

    var go = t.closest("[data-go]");
    if (go) { e.preventDefault(); navigate(go.getAttribute("data-go")); return; }
    var hand = t.closest("[data-handoff]");
    if (hand) {
      var n = hand.getAttribute("data-handoff");
      toast(n === "Dashboard" ? "Returns to the dashboard" : "Continues in the current " + n.toLowerCase() + " flow");
      return;
    }
    var msg = t.closest("[data-toast]");
    if (msg) { toast(msg.getAttribute("data-toast")); return; }

    if (t.closest("[data-back]")) {
      var to = BACK[state.screen];
      if (to) navigate(to); else toast("Returns to the dashboard");
      return;
    }
    if (t.closest("[data-next]")) { next(); return; }

    var day = t.closest(".cal__day");
    if (day && !day.disabled) {
      state.date = day.getAttribute("data-date"); state.time = null;
      setError("time", false);
      renderCal(); renderTimes(); refresh();
      if ($(".app").getBoundingClientRect().width < 768) {
        var tt = $("#times-title");
        if (tt.getBoundingClientRect().top > window.innerHeight * 0.6) tt.scrollIntoView({ block: "start", behavior: "smooth" });
      }
      return;
    }
    if (t.closest("#cal-prev")) { state.month = { y: state.month.m === 0 ? state.month.y - 1 : state.month.y, m: (state.month.m + 11) % 12 }; renderCal(); return; }
    if (t.closest("#cal-next")) { state.month = { y: state.month.m === 11 ? state.month.y + 1 : state.month.y, m: (state.month.m + 1) % 12 }; renderCal(); return; }

    var jump = t.closest("[data-jump]");
    if (jump) { navigate(jump.getAttribute("data-jump")); return; }
    var pt = t.closest("[data-proto-toggle]");
    if (pt) {
      var panel = $("[data-proto-panel]");
      panel.hidden = !panel.hidden;
      pt.setAttribute("aria-expanded", String(!panel.hidden));
      return;
    }
    if (!t.closest(".menu")) closeMenus();
  });

  document.addEventListener("change", function (e) {
    var el = e.target;
    if (el.name === "jobs") { state.jobs[el.value] = el.checked; setError("jobs", false); }
    else if (el.name === "hours") { state.hours = +el.value; state.date = null; state.time = null; setError("hours", false); }
    else if (Q.indexOf(el.name) > -1) { state[el.name] = el.value; setError(el.name, false); }
    else if (el.name === "slot") { state.time = +el.value; setError("time", false); }
    else if (el.hasAttribute("data-state-switch")) {
      var name = el.getAttribute("data-state-switch");
      applySwitch(name, el.checked);
      if (name === "noslots" && state.screen === "time") render("time");
    }
    refresh();
  });

  document.addEventListener("input", function (e) {
    if (e.target.id === "desc") { state.desc = e.target.value; if (state.desc.trim()) setError("desc", false); refresh(); }
  });

  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeMenus(); });
  window.addEventListener("hashchange", function () { render(fromHash()); });

  /* ---------- Init ---------- */
  renderJobs();
  applySwitch("multi", true);
  render(fromHash());
})();
