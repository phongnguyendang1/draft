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
  /* 25 jobs (illustrative; the real list is curated with Ops). `min` is an internal estimate used only to
     recommend a booking length. It is never shown to the member. `ex` is the placeholder example. */
  var JOBS = [
    { id: "toilet-run", title: "Running toilet", icon: "ri-drop-line", min: 60, ex: "Example: The hall bath toilet keeps running after I flush." },
    { id: "toilet-clog", title: "Clogged toilet", icon: "ri-water-flash-line", min: 60, ex: "Example: The guest bath toilet clogs every few days." },
    { id: "lock", title: "Door lock issue", icon: "ri-door-lock-line", min: 60, ex: "Example: The front door lock sticks and is hard to turn." },
    { id: "door", title: "Sticking or loose door", icon: "ri-door-closed-line", min: 30, ex: "Example: The bedroom door rubs the frame and will not latch." },
    { id: "disposal", title: "Garbage disposal issue", icon: "ri-recycle-line", min: 60, ex: "Example: The kitchen disposal hums but does not spin." },
    { id: "appliance", title: "Appliance diagnostic", icon: "ri-fridge-line", min: 60, ex: "Example: The dishwasher stopped draining." },
    { id: "tv", title: "Mount a TV", icon: "ri-tv-line", min: 60, ex: "Example: Mount one 55 inch TV on the living room wall." },
    { id: "hang", title: "Hang shelves, curtain rods or art", icon: "ri-ruler-line", min: 60, ex: "Example: Hang 2 curtain rods and 3 framed pictures." },
    { id: "assemble", title: "Assemble furniture", icon: "ri-sofa-line", min: 60, ex: "Example: Assemble 1 dresser and 2 bookshelves." },
    { id: "caulk", title: "Caulk or seal", icon: "ri-paint-brush-line", min: 60, ex: "Example: Re-caulk around the kitchen sink." },
    { id: "faucet-leak", title: "Leaky faucet", icon: "ri-contrast-drop-line", min: 60, ex: "Example: The bathroom faucet drips when it is off." },
    { id: "faucet-swap", title: "Replace a faucet or showerhead", icon: "ri-showers-line", min: 60, ex: "Example: Replace the kitchen faucet. I have the new one." },
    { id: "light", title: "Replace a light fixture", icon: "ri-lightbulb-line", min: 60, ex: "Example: Replace 2 light fixtures in the hallway." },
    { id: "outlet", title: "Replace an outlet or switch", icon: "ri-plug-line", min: 60, ex: "Example: Replace 3 outlets and 1 switch with new ones." },
    { id: "smart", title: "Install a doorbell or thermostat", icon: "ri-router-line", min: 60, ex: "Example: Install a video doorbell at the front door." },
    { id: "knob", title: "Replace a door knob or handle", icon: "ri-key-2-line", min: 30, ex: "Example: Replace 4 interior door knobs." },
    { id: "cab-door", title: "Fix a cabinet door or hinge", icon: "ri-archive-drawer-line", min: 30, ex: "Example: A kitchen cabinet door hangs crooked." },
    { id: "cab-hw", title: "Install cabinet handles", icon: "ri-hammer-line", min: 60, ex: "Example: Install handles on 12 kitchen cabinets." },
    { id: "drywall", title: "Patch a small drywall hole", icon: "ri-brush-line", min: 60, ex: "Example: Patch a small hole in the hallway wall." },
    { id: "blinds", title: "Install blinds or curtains", icon: "ri-window-line", min: 60, ex: "Example: Install blinds on 3 windows." },
    { id: "weather", title: "Add weatherstripping or a door sweep", icon: "ri-home-gear-line", min: 30, ex: "Example: Add a door sweep to the back door." },
    { id: "smoke", title: "Replace smoke detector batteries", icon: "ri-alarm-warning-line", min: 30, ex: "Example: Replace batteries in 4 smoke detectors." },
    { id: "towel", title: "Install a towel bar or bath accessory", icon: "ri-ruler-2-line", min: 30, ex: "Example: Install a towel bar and a toilet paper holder." },
    { id: "childproof", title: "Install safety latches or gates", icon: "ri-lock-line", min: 60, ex: "Example: Install safety latches on 6 lower cabinets." },
    { id: "other", title: "Something else", icon: "ri-add-line", min: 60, ex: "Example: Tell us what you need and how many items." }
  ];
  var JOB = {};
  JOBS.forEach(function (j) { JOB[j.id] = j; });
  var TOP = 10;
  var RATE = 55;
  var MAX_MIN = 180;
  var TODAY = new Date(2026, 9, 13);
  var FIRST_DAY = new Date(2026, 9, 14);
  var LAST_MONTH = { y: 2027, m: 1 };
  var FIRST_MONTH = { y: 2026, m: 9 };
  var STARTS = [480, 570, 660, 780, 870, 960];
  var SUFFIX = " | PreFix Home Maintenance";

  var SCREENS = ["type", "job", "check", "time", "booked", "sent"];
  var TITLES = {
    type: ["How can we help?", "Choose what fits best."],
    job: ["What do you need done?", "Fast Fix is for small jobs. All fields are required."],
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
    time: "These jobs add up to more than a Fast Fix covers, so our team will plan the visit.",
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
    screen: "type", home: "mueller", jobs: {}, order: [], notes: {}, showAll: false, hours: 0, ladder: "", trade: "", part: "",
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
  function selectedJobs() {
    return state.order.filter(function (id) { return state.jobs[id]; }).map(function (id) { return JOB[id]; });
  }
  function totalMin() { return selectedJobs().reduce(function (s, j) { return s + j.min; }, 0); }
  function overLimit() { return totalMin() > MAX_MIN; }
  /* Recommended booking length: what the picked jobs add up to, rounded up to a whole hour, 1 to 3 */
  function recommendedHours() { return Math.min(3, Math.max(1, Math.ceil(totalMin() / 60))); }
  function isBad(q) { return BAD[q].indexOf(state[q]) > -1; }
  function routedBy() { return Q.filter(isBad); }
  function checkOutcome() { var r = routedBy(); return r.length ? r[0] : ""; }
  function hours() { return state.hours || recommendedHours(); }
  function hoursText(h) { return h + (h === 1 ? " hour" : " hours"); }

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
  /* 10 jobs plus "Show all"; anything already picked stays visible when the list is collapsed */
  function renderJobs() {
    var shown = JOBS.filter(function (j, i) { return state.showAll || i < TOP || state.jobs[j.id]; });
    $("#jobs").innerHTML = shown.map(function (j) {
      return '<label class="opt"><input type="checkbox" name="jobs" value="' + j.id + '"' + (state.jobs[j.id] ? " checked" : "") + '>' +
        '<span class="d-icon" aria-hidden="true"><svg class="i"><use href="#' + j.icon + '"/></svg></span>' +
        '<span class="opt__main"><span class="opt__title">' + j.title + '</span></span>' +
        '<span class="opt__box" aria-hidden="true"><svg class="i"><use href="#ri-check-line"/></svg></span></label>';
    }).join("");
    var t = $("#jobs-toggle");
    t.setAttribute("aria-expanded", String(state.showAll));
    $("[data-label]", t).textContent = state.showAll ? "Show fewer jobs" : "Show all " + JOBS.length + " jobs";
    $("use", t).setAttribute("href", state.showAll ? "#ri-arrow-up-s-line" : "#ri-arrow-down-s-line");
    $("#jobs-count").textContent = "Showing " + shown.length + " of " + JOBS.length + " jobs";
  }

  /* One labelled text box per picked job, in the order picked. Built with the DOM (member text is never HTML). */
  function renderDetails() {
    var box = $("#details"), jobs = selectedJobs();
    $("#details-empty").hidden = jobs.length > 0;
    box.innerHTML = "";
    jobs.forEach(function (j) {
      var wrap = document.createElement("div");
      wrap.className = "field detail";
      wrap.id = "field-note-" + j.id;
      var label = document.createElement("label");
      label.setAttribute("for", "note-" + j.id);
      label.textContent = j.title;
      var ta = document.createElement("textarea");
      ta.className = "textarea";
      ta.id = "note-" + j.id;
      ta.rows = 3;
      ta.placeholder = j.ex;
      ta.value = state.notes[j.id] || "";
      ta.setAttribute("data-note", j.id);
      ta.setAttribute("aria-describedby", "details-hint err-note-" + j.id);
      var err = document.createElement("p");
      err.className = "error";
      err.id = "err-note-" + j.id;
      err.hidden = true;
      err.setAttribute("role", "alert");
      err.innerHTML = '<svg class="i"><use href="#ri-error-warning-fill"/></svg><span></span>';
      err.lastChild.textContent = "Add a few details about " + j.title.toLowerCase() + ".";
      wrap.appendChild(label); wrap.appendChild(ta); wrap.appendChild(err);
      box.appendChild(wrap);
    });
  }

  /* Push state into the form controls (used when jumping straight to a screen) */
  function syncInputs() {
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
  function updateOver() { $("#note-over").hidden = !overLimit(); }

  /* Step 3: the recommended length, with a way to change it */
  function updateRec() {
    var rec = recommendedHours(), h = hours();
    $("#rec-value").textContent = hoursText(h);
    $("#rec-meta").textContent = (h === rec ? "Recommended for the jobs you picked. " : "You changed this from the recommended " + hoursText(rec) + ". ") + "$" + RATE + " per hour, " + money(h * RATE) + " total.";
    $all('input[name="hours"]').forEach(function (r) { r.checked = +r.value === h; });
    $all("[data-rec-for]").forEach(function (el) { el.hidden = +el.getAttribute("data-rec-for") !== rec; });
    var note = $("#note-hours");
    note.hidden = h >= rec;
    $("#note-hours-text").textContent = h >= rec ? "" : "We recommend " + hoursText(rec) + " for these jobs. Booking " + hoursText(h) + " may not be enough, so your Home Manager might not finish everything.";
  }

  function updateChecksNotes() {
    var routed = routedBy().length > 0;
    Q.forEach(function (q) {
      $("#note-" + q).hidden = !isBad(q);
      $("#hint-" + q).textContent = (routed && !state[q] ? "Optional. " : "") + HINT[q];
    });
  }

  function ctaFor(screen) {
    var n = selectedJobs().length;
    if (screen === "job") {
      return {
        label: overLimit() ? "Send to our team" : "Continue",
        status: n ? n + (n === 1 ? " job" : " jobs") + " picked" : "Nothing picked yet"
      };
    }
    if (screen === "check") {
      return {
        label: checkOutcome() ? "Send to our team" : "Continue to times",
        status: n + (n === 1 ? " job" : " jobs")
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
    var list = $("#s-jobs");
    list.innerHTML = "";
    jobs.forEach(function (j) {
      var li = document.createElement("li");
      var t = document.createElement("span");
      t.className = "sum__jobname";
      t.textContent = j.title;
      li.appendChild(t);
      var note = (state.notes[j.id] || "").trim();
      if (note) {
        var n = document.createElement("span");
        n.className = "sum__jobnote";
        n.textContent = note;
        li.appendChild(n);
      }
      list.appendChild(li);
    });

    var showWhen = (s === "time") && state.date && state.time !== null;
    $("#s-when-row").hidden = !showWhen;
    if (showWhen) {
      $("#s-when").textContent = shortDate(parse(state.date)) + " · " + range(state.time, hours());
      $("#s-hm").textContent = "with " + h.hm;
    }

    var ans = [];
    if (s === "sent") {
      Q.forEach(function (q) { if (state[q]) ans.push([QNAME[q], QLABEL[q][state[q]]]); });
    }
    $("#s-answers-row").hidden = ans.length === 0;
    $("#s-answers").innerHTML = ans.map(function (r) { return "<li><span>" + r[0] + "</span><span>" + r[1] + "</span></li>"; }).join("");

    var showLedger = s === "time" && !body.classList.contains("is-noslots");
    $("#s-ledger").hidden = !showLedger;
    if (showLedger) {
      $("#l-time").textContent = hoursText(hours());
      $("#l-total").textContent = money(hours() * RATE);
    }
  }

  function refresh() {
    updateOver();
    updateChecksNotes();
    if (state.screen === "time") updateRec();
    updateCta();
    updateSummary();
  }

  /* ---------- Errors ---------- */
  function setError(id, on) {
    var el = $("#err-" + id);
    if (el) el.hidden = !on;
    var field = $("#field-" + id);
    if (field) field.classList.toggle("is-invalid", on);
  }
  function clearErrors(ids) { ids.forEach(function (id) { setError(id, false); }); }

  /* ---------- Navigation ---------- */
  function seedDemo(screen) {
    if (!selectedJobs().length) {
      state.jobs = { "toilet-run": true, lock: true };
      state.order = ["toilet-run", "lock"];
      state.notes = { "toilet-run": "The toilet in the hall bath keeps running after I flush.", lock: "The front door lock sticks and is hard to turn." };
      state.hours = 0;
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

    if (screen === "job") { renderJobs(); renderDetails(); }
    if (screen === "time") {
      var noSlots = body.classList.contains("is-noslots");
      $("#rec").hidden = noSlots;
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
    $("#b-len").textContent = hoursText(hours()) + " booked";
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
      var jobs = selectedJobs(), bad = [];
      if (!jobs.length) bad.push("jobs");
      jobs.forEach(function (j) { if (!(state.notes[j.id] || "").trim()) bad.push("note-" + j.id); });
      setError("jobs", bad.indexOf("jobs") > -1);
      jobs.forEach(function (j) { setError("note-" + j.id, bad.indexOf("note-" + j.id) > -1); });
      if (bad.length) { focusFirst(bad[0] === "jobs" ? "#jobs input" : "#" + bad[0]); return; }
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

    if (t.closest("#jobs-toggle")) { state.showAll = !state.showAll; renderJobs(); return; }
    if (t.closest("#rec-change")) {
      var rc = $("#rec-change"), openRec = rc.getAttribute("aria-expanded") !== "true";
      rc.setAttribute("aria-expanded", String(openRec));
      $("[data-label]", rc).textContent = openRec ? "Done" : "Change";
      $("#rec-options").hidden = !openRec;
      return;
    }

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
    if (el.name === "jobs") {
      state.jobs[el.value] = el.checked;
      var at = state.order.indexOf(el.value);
      if (el.checked && at < 0) state.order.push(el.value);
      if (!el.checked && at > -1) state.order.splice(at, 1);
      /* a different set of jobs means a different recommendation: drop any chosen length and time */
      state.hours = 0; state.date = null; state.time = null;
      setError("jobs", false);
      renderDetails();
    }
    else if (el.name === "hours") {
      state.hours = +el.value === recommendedHours() ? 0 : +el.value;
      state.time = null; state.date = firstOpenDay();
      if (state.date) { var hd = parse(state.date); state.month = { y: hd.getFullYear(), m: hd.getMonth() }; }
      renderCal(); renderTimes();
    }
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
    var id = e.target.getAttribute && e.target.getAttribute("data-note");
    if (id) { state.notes[id] = e.target.value; if (e.target.value.trim()) setError("note-" + id, false); refresh(); }
  });

  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeMenus(); });
  window.addEventListener("hashchange", function () { render(fromHash()); });

  /* ---------- Init ---------- */
  renderJobs();
  applySwitch("multi", true);
  render(fromHash());
})();
