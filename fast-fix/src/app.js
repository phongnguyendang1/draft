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
  var FIND_SUB = "Describe it, pick from the list, or both. Adding details is optional.";
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


  /* ---------- Describe-first variant: what the member types selects jobs in the list ---------- */
  var FIND = body.classList.contains("variant-finder");
  var REDUCED = !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);

  /* PROTOTYPE NOTE: finderParse is a rule-based stand-in for the matching service. In production it returns only ids from the
     allowlist plus the phrase each one came from. Everything after the parse step is real UI. */
  var KW = {
    "toilet-run": /(toilet|commode)\b[^.,;]*\b(runn\w*|won'?t stop|constantly)|runn\w*\s+toilet|flapper|fill valve/i,
    "toilet-clog": /(toilet|commode)\b[^.,;]*\b(clog\w*|block\w*|backed|plung\w*|won'?t flush|overflow\w*)|clog\w*\s+toilet/i,
    lock: /\block\b|deadbolt|key\b[^.,;]*(stuck|won'?t|jam)/i,
    door: /\bdoor\b[^.,;]*\b(stick\w*|rub\w*|latch\w*|loose|squeak\w*|won'?t close|doesn'?t close|swollen|drag\w*)|\bstick\w*\s+door/i,
    disposal: /disposal|disposer/i,
    appliance: /dishwasher|washing machine|washer|dryer|fridge|refrigerator|oven|stove|microwave|appliance/i,
    tv: /\b(tv|television)\b/i,
    hang: /\b(shelf|shelves|curtain rods?|picture frames?|pictures|artwork|mirror|wall art|frames)\b/i,
    assemble: /assembl\w*|put together|ikea|flat[- ]?pack/i,
    caulk: /caulk\w*|re-?seal|seal\w*\s+(around|the)/i,
    "faucet-leak": /(faucet|\btap\b)[^.,;]*\b(leak\w*|drip\w*)|(leak\w*|drip\w*)\s+(faucet|tap)/i,
    "faucet-swap": /(replac\w*|swap\w*|install\w*|new)\b[^.,;]*(faucet|shower ?head)|(faucet|shower ?head)[^.,;]*\b(replac\w*|swap\w*|new)/i,
    light: /light fixture|ceiling light|chandelier|pendant( light)?|vanity light|(replac\w*|swap\w*|install\w*|chang\w*)\s+(the\s+|a\s+|my\s+)?(\w+\s+)?light\b/i,
    outlet: /\b(outlet|receptacle)s?\b|\bswitch(es)?\b/i,
    smart: /doorbell|thermostat|smart (home|lock|plug)/i,
    knob: /(knob|handle)s?\b[^.,;]*\b(replac\w*|swap\w*|loose|broken|new)|(replac\w*|swap\w*)\b[^.,;]*(knob|handle)/i,
    "cab-door": /cabinet[^.,;]*(door|hinge)|\bhinges?\b/i,
    "cab-hw": /cabinet[^.,;]*(handle|pull|knob|hardware)|drawer pulls?/i,
    drywall: /drywall|hole in (the |a |my )?(wall|ceiling)|\bpatch\w*/i,
    blinds: /\bblinds?\b|\bshades?\b|\bcurtains?\b(?!\s*rods?)/i,
    weather: /weather ?strip\w*|door sweep|\bdraft/i,
    smoke: /smoke (detector|alarm)s?|\bbatter(y|ies)\b|chirp\w*/i,
    towel: /towel (bar|ring|rack)|toilet paper holder|robe hook|bath accessor\w*/i,
    childproof: /child ?proof\w*|baby gate|safety latch\w*|cabinet lock/i
  };
  var AMBIG = [
    { key: "toilet", re: /\b(toilet|commode)\b/i, text: "Is the toilet running, or clogged?",
      options: [{ label: "Running", ids: ["toilet-run"] }, { label: "Clogged", ids: ["toilet-clog"] }, { label: "Both", ids: ["toilet-run", "toilet-clog"] }] },
    { key: "door", re: /\bdoor\b/i, text: "What’s going on with the door?",
      options: [{ label: "It sticks or is loose", ids: ["door"] }, { label: "The lock", ids: ["lock"] }, { label: "The knob or handle", ids: ["knob"] }] },
    { key: "faucet", re: /\b(faucet|tap)\b/i, text: "Is the faucet leaking, or do you want it replaced?",
      options: [{ label: "Leaking", ids: ["faucet-leak"] }, { label: "Replace it", ids: ["faucet-swap"] }] }
  ];
  var FILLER = /^(please|thanks|thank you|hi|hello|hey|i need|i want|need help|can you|could you)\b.{0,12}$/i;

  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
  function announce(msg) { $("#finder-live").textContent = ""; setTimeout(function () { $("#finder-live").textContent = msg; }, 30); }
  function setText(node, txt) { if (node.textContent !== txt) node.textContent = txt; }
  function titlesOf(ids) { return ids.map(function (id) { return JOB[id].title; }).join(", "); }

  /* Split into clauses (with positions) on punctuation and "and / also / plus / &" */
  function clauses(text) {
    var out = [], re = /[^,;.\n]+/g, m;
    while ((m = re.exec(text))) {
      var base = m.index, pos = 0;
      m[0].split(/(\s+and\s+|\s+also\s+|\s+plus\s+|\s*&\s*)/i).forEach(function (p) {
        if (/^(\s+and\s+|\s+also\s+|\s+plus\s+|\s*&\s*)$/i.test(p)) { pos += p.length; return; }
        var lead = p.length - p.replace(/^\s+/, "").length, t = p.trim();
        if (t) out.push({ text: t, start: base + pos + lead, end: base + pos + lead + t.length });
        pos += p.length;
      });
    }
    return out;
  }

  function finderParse(text) {
    var res = { picks: [], questions: [], unmatched: [] };
    clauses(text).forEach(function (c) {
      var hits = Object.keys(KW).filter(function (id) { return KW[id].test(c.text); });
      if (hits.indexOf("lock") > -1 || hits.indexOf("knob") > -1) hits = hits.filter(function (x) { return x !== "door"; });
      if (hits.indexOf("cab-hw") > -1) hits = hits.filter(function (x) { return x !== "knob"; });
      if (hits.indexOf("faucet-swap") > -1) hits = hits.filter(function (x) { return x !== "faucet-leak"; });
      if (hits.length) {
        hits.forEach(function (id) { if (!res.picks.some(function (p) { return p.id === id; })) res.picks.push({ id: id, quote: c.text }); });
        return;
      }
      var amb = AMBIG.filter(function (a) { return a.re.test(c.text); })[0];
      if (amb) {
        res.questions.push({ kind: "ask", key: amb.key, text: amb.text, options: amb.options, quote: c.text, start: c.start, end: c.end });
        return;
      }
      if (c.text.split(/\s+/).length >= 3 && !FILLER.test(c.text)) {
        res.unmatched.push({ kind: "none", quote: c.text, start: c.start, end: c.end });
      }
    });
    if (!res.picks.length && !res.questions.length && !res.unmatched.length && text.length >= 8 && /\s/.test(text)) {
      res.unmatched.push({ kind: "none", quote: text, start: 0, end: text.length });
    }
    return res;
  }

  /* The member's description and the list are ONE selection. Typing selects matching jobs in the list below;
     ticking a job yourself always wins. state.finder keeps only the bookkeeping:
       src      job id -> the phrase it was selected from (shown under the job)
       auto     ids selected by the text and not touched since (these follow the text if it changes)
       removed  ids the member unticked while the text still matches (do not re-select them)
       answers  ambiguity topic -> chosen job ids, or {skip:true}
       others   unmatched phrases the member chose to add as "Something else";  dismissed: ones they skipped */
  var finderTimer = null;
  function finderFresh() {
    return { text: "", src: {}, auto: {}, removed: {}, answers: {}, others: [], dismissed: [], questions: [], unmatched: [], open: {}, down: false, flash: "", warned: "", pin: "", qsig: "" };
  }
  state.finder = finderFresh();

  function resetPicks() { state.hours = 0; state.date = null; state.time = null; }
  function selectJob(id) { if (!state.jobs[id]) { state.jobs[id] = true; state.order.push(id); } }
  function unselectJob(id) {
    state.jobs[id] = false;
    var at = state.order.indexOf(id); if (at > -1) state.order.splice(at, 1);
  }

  /* Phrases are matched loosely so a few more typed words do not look like a different phrase */
  function sameQuote(x, y) {
    x = x.toLowerCase(); y = y.toLowerCase();
    return x === y || (Math.min(x.length, y.length) >= 6 && (x.indexOf(y) === 0 || y.indexOf(x) === 0));
  }
  function findQuote(list, q) { for (var i = 0; i < list.length; i++) if (sameQuote(list[i], q)) return i; return -1; }
  function selIds() { return state.order.filter(function (id) { return state.jobs[id]; }); }

  /* Re-read the description and bring the list in line with it */
  function finderSync() {
    var j = state.finder, text = j.text.trim();
    clearTimeout(finderTimer); finderTimer = null;
    if (body.classList.contains("is-finderdown")) { j.down = true; j.questions = []; j.unmatched = []; renderFinderMeta(); return; }
    j.down = false;
    var res = text.length >= 2 ? finderParse(text) : { picks: [], questions: [], unmatched: [] };

    var want = {}, order = [], other = [];
    function wantJob(id, quote) { if (!(id in want)) { want[id] = quote; order.push(id); } }
    res.picks.forEach(function (p) { wantJob(p.id, p.quote); });

    var topics = {};
    j.questions = []; j.unmatched = [];
    res.questions.forEach(function (q) {
      if (topics[q.key]) return;
      topics[q.key] = 1;
      var a = j.answers[q.key];
      if (!a) j.questions.push(q);
      else if (a.other) other.push(q.quote);
      else (a.ids || []).forEach(function (id) { wantJob(id, q.quote); });
    });
    Object.keys(j.answers).forEach(function (k) { if (!topics[k]) delete j.answers[k]; });

    var keepO = [], keepD = [];
    res.unmatched.forEach(function (u) {
      if (findQuote(j.others, u.quote) > -1) { keepO.push(u.quote); other.push(u.quote); }
      else if (findQuote(j.dismissed, u.quote) > -1) keepD.push(u.quote);
      else j.unmatched.push(u);
    });
    j.others = keepO; j.dismissed = keepD;
    if (other.length) wantJob("other", other.join("; "));

    var added = [], dropped = [];
    Object.keys(j.auto).forEach(function (id) {
      if (id in want) return;
      delete j.auto[id];
      if (state.jobs[id] && !(state.notes[id] || "").trim()) { unselectJob(id); dropped.push(id); }
    });
    Object.keys(j.removed).forEach(function (id) { if (!(id in want)) delete j.removed[id]; });
    j.src = {};
    order.forEach(function (id) {
      j.src[id] = want[id];
      if (!state.jobs[id] && !j.removed[id]) { selectJob(id); j.auto[id] = true; added.push(id); }
    });
    if (added.length || dropped.length) resetPicks();
    if (selectedJobs().length) { setError("jobs", false); setError("finder", false); }

    renderFinderMeta();
    if (added.length) announce("Selected " + titlesOf(added) + ".");
    else if (dropped.length) announce("Removed " + titlesOf(dropped) + ".");
  }
  function finderQueue() {
    clearTimeout(finderTimer);
    finderTimer = setTimeout(finderSync, REDUCED ? 250 : 500);
  }
  function finderSetText(text) {
    var j = state.finder, ta = $("#finder-input");
    j.text = text; ta.value = text;
    finderSync();
  }
  /* Prototype helpers: start clean, then apply a description */
  function finderClearAll() {
    JOBS.forEach(function (jb) { state.jobs[jb.id] = false; });
    state.order = []; state.notes = {}; resetPicks();
    state.finder = finderFresh();
  }
  function finderSeed() {
    finderClearAll();
    finderSetText("The toilet keeps running, the front door lock sticks, and I need a light fixture replaced in the second-story hallway.");
  }

  function updateDock() {
    var show = /^(job|check|time)$/.test(state.screen);
    body.setAttribute("data-dock", show ? "on" : "off");
    $("#fdock").hidden = !show;
  }

  /* Under the input: what the text did, plus the one-tap questions it raised */
  function renderFinderMeta() {
    var j = state.finder, text = j.text.trim();
    var st = $("#finder-status"), from = state.order.filter(function (id) { return state.jobs[id] && j.src[id]; });
    var msg = "", icon = "ri-check-line";
    if (j.flash) { msg = j.flash; icon = "ri-information-line"; }
    else if (j.down) { msg = "We couldn’t select jobs from that right now. Pick them from the list below."; icon = "ri-information-line"; }
    else if (from.length) msg = "Selected from your description: " + titlesOf(from) + ".";
    else if (text.length >= 4 && !j.questions.length && !j.unmatched.length && !selectedJobs().length) { msg = "Nothing matched yet. Add a few more words, or pick from the list below."; icon = "ri-information-line"; }
    else if (j.text.length >= 520) { msg = (600 - j.text.length) + " characters left."; icon = "ri-information-line"; }
    if (st.getAttribute("data-msg") !== msg + "|" + icon) {
      st.setAttribute("data-msg", msg + "|" + icon);
      st.innerHTML = "";
      if (msg) { st.appendChild(statusIcon(icon)); st.appendChild(el("span", "finder__status-text", msg)); }
    }
    renderQuestions();
    syncJobs();
    updateOver();
    updateCta();
    updateSummary();
  }
  function statusIcon(name) {
    var s = el("span", "finder__status-icon"); s.setAttribute("aria-hidden", "true");
    s.innerHTML = '<svg class="i"><use href="#' + name + '"/></svg>';
    return s;
  }
  /* Show a message under the input, where the member is looking, and bring it into view */
  function finderFlash(msg, focusSel) {
    state.finder.flash = msg;
    renderFinderMeta();
    announce(msg);
    var st = $("#finder-status");
    st.scrollIntoView({ block: "center", behavior: REDUCED ? "auto" : "smooth" });
    var f = focusSel && $(focusSel); if (f) f.focus({ preventScroll: true });
  }

  function chipRow(card, labels, fn) {
    var row = el("div", "finder__chips");
    labels.forEach(function (l) {
      var b = el("button", "chip", l.label); b.type = "button";
      b.addEventListener("click", function () { fn(l); });
      row.appendChild(b);
    });
    card.appendChild(row);
  }
  function renderQuestions() {
    var j = state.finder, box = $("#finder-questions");
    var sig = j.questions.map(function (q) { return q.key + ":" + q.quote; }).concat(j.unmatched.map(function (u) { return "u:" + u.quote; })).join("|");
    if (sig === j.qsig && (box.firstElementChild || !sig)) return;
    var first = !j.qsig;
    j.qsig = sig;
    box.innerHTML = "";
    j.questions.forEach(function (q) {
      var card = el("div", "finder-q");
      card.setAttribute("role", "group"); card.setAttribute("aria-label", q.text);
      card.appendChild(el("p", "finder-q__text", q.text));
      chipRow(card, q.options.concat([{ label: "Something else", ids: [], other: true }, { label: "Skip", ids: [] }]), function (o) { finderAnswer(q, o); });
      box.appendChild(card);
    });
    j.unmatched.forEach(function (u) {
      var card = el("div", "finder-q");
      var t = "We couldn’t match “" + u.quote + "” to a job on our list. Add it as Something else?";
      card.setAttribute("role", "group"); card.setAttribute("aria-label", t);
      card.appendChild(el("p", "finder-q__text", t));
      chipRow(card, [{ label: "Add as Something else", add: true }, { label: "Skip" }], function (o) { finderUnmatched(u, o.add); });
      box.appendChild(card);
    });
    var n = j.questions.length + j.unmatched.length;
    if (n && !first) announce(n === 1 ? "One question about your description, below the input." : n + " questions about your description, below the input.");
  }
  function afterChoice(msg, focusId) {
    var chip = $("#finder-questions .chip");
    if (chip) chip.focus();
    else {
      var cb = focusId && $("#job-" + focusId + " input");
      if (cb && cb.offsetParent) cb.focus(); else $("#finder-input").focus({ preventScroll: true });
    }
    if (msg) announce(msg);
  }
  function finderAnswer(q, opt) {
    var j = state.finder, id = opt.ids[0] || (opt.other ? "other" : "");
    j.answers[q.key] = opt.other ? { other: true } : (opt.ids.length ? { ids: opt.ids.slice() } : { skip: true });
    j.flash = "";
    finderSync();
    afterChoice(opt.other ? "Selected Something else." : (opt.ids.length ? "Selected " + titlesOf(opt.ids) + "." : ""), id);
  }
  function finderUnmatched(u, add) {
    var j = state.finder;
    (add ? j.others : j.dismissed).push(u.quote);
    j.flash = "";
    finderSync();
    afterChoice(add ? "Selected Something else." : "", add ? "other" : "");
  }

  /* A tick or untick in the list is the member's own choice */
  function finderToggled(id, on) {
    var j = state.finder;
    delete j.auto[id];
    j.flash = "";
    if (on) {
      j.questions.forEach(function (q) {
        if (q.options.some(function (o) { return o.ids.indexOf(id) > -1; })) j.answers[q.key] = { skip: true };
      });
      delete j.removed[id];
    } else {
      j.removed[id] = true; delete j.src[id];
      if (JOBS.findIndex(function (x) { return x.id === id; }) >= TOP && !state.showAll) j.pin = id;
    }
    resetPicks();
    if (on) { setError("jobs", false); setError("finder", false); }
    finderSync();
  }

  /* The list: all 25 rows exist once; selection, quotes and the details box are updated in place so focus never jumps */
  function buildJobRows() {
    $("#jobs").innerHTML = JOBS.map(function (jb) {
      return '<div class="job" id="job-' + jb.id + '">' +
        '<label class="opt"><input type="checkbox" name="jobs" value="' + jb.id + '">' +
        '<span class="d-icon" aria-hidden="true"><svg class="i"><use href="#' + jb.icon + '"/></svg></span>' +
        '<span class="opt__main"><span class="opt__title">' + jb.title + '</span><span class="opt__quote" hidden></span></span>' +
        '<span class="opt__box" aria-hidden="true"><svg class="i"><use href="#ri-check-line"/></svg></span></label>' +
        '<div class="job__more" hidden>' +
        '<button class="link" type="button" data-details-toggle="' + jb.id + '" aria-expanded="false" aria-controls="pbox-' + jb.id + '">Add details (optional)</button>' +
        '<div class="job__box" id="pbox-' + jb.id + '" hidden>' +
        '<label for="pnote-' + jb.id + '">More details about ' + jb.title + ' <span>(optional)</span></label>' +
        '<textarea class="textarea" id="pnote-' + jb.id + '" rows="3" data-note="' + jb.id + '"></textarea>' +
        '<p class="error" id="err-note-' + jb.id + '" role="alert" hidden><svg class="i"><use href="#ri-error-warning-fill"/></svg><span>Add a few words so we know what you need.</span></p></div></div></div>';
    }).join("");
    JOBS.forEach(function (jb) { $("#pnote-" + jb.id).placeholder = jb.ex; });
  }
  function syncJobs() {
    var j = state.finder;
    if (!$("#jobs").firstElementChild) buildJobRows();
    if (j.pin && !(document.activeElement && document.activeElement.closest && document.activeElement.closest("#job-" + j.pin))) j.pin = "";
    var shown = 0;
    JOBS.forEach(function (jb, i) {
      var row = $("#job-" + jb.id), on = !!state.jobs[jb.id], show = state.showAll || i < TOP || on || j.pin === jb.id;
      if (show) shown++;
      row.hidden = !show;
      row.classList.toggle("is-on", on);
      $("input", row).checked = on;
      var q = $(".opt__quote", row), src = on ? j.src[jb.id] : "";
      q.hidden = !src; q.textContent = src ? "“" + src + "”" : "";
      $(".job__more", row).hidden = !on;
      var open = on && !!j.open[jb.id], tog = $("[data-details-toggle]", row), ta = $("textarea", row);
      if (ta.value !== (state.notes[jb.id] || "")) ta.value = state.notes[jb.id] || "";
      $(".job__box", row).hidden = !open;
      tog.setAttribute("aria-expanded", String(open));
      var tl = open ? "Hide details" : ((state.notes[jb.id] || "").trim() ? "Edit details (optional)" : "Add details (optional)");
      setText(tog, tl);
      tog.setAttribute("aria-label", tl + " for " + jb.title);
    });
    var t = $("#jobs-toggle");
    t.setAttribute("aria-expanded", String(state.showAll));
    $("[data-label]", t).textContent = state.showAll ? "Show fewer jobs" : "Show all " + JOBS.length + " jobs";
    $("use", t).setAttribute("href", state.showAll ? "#ri-arrow-up-s-line" : "#ri-arrow-down-s-line");
    setText($("#jobs-count"), "Showing " + shown + " of " + JOBS.length + " jobs");
  }
  function syncJobsLabels(id) {
    var tog = $("#job-" + id + " [data-details-toggle]");
    if (!tog || state.finder.open[id]) return;
    var tl = (state.notes[id] || "").trim() ? "Edit details (optional)" : "Add details (optional)";
    setText(tog, tl); tog.setAttribute("aria-label", tl + " for " + JOB[id].title);
  }
  function toggleDetails(id) {
    var j = state.finder;
    j.open[id] = !j.open[id];
    syncJobs();
    if (j.open[id]) $("#pnote-" + id).focus();
  }


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
    if (FIND) { syncJobs(); return; }
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
    if (FIND) return;
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
  var lastOver = false;
  function updateOver() {
    var now = overLimit();
    $("#note-over").hidden = !now;
    if (FIND && now !== lastOver) { lastOver = now; if (now) announce("That is more than a Fast Fix covers. We will send this to our team."); }
  }

  /* Step 3: the recommended length, with a way to change it */
  function updateRec() {
    var rec = recommendedHours(), h = hours();
    $("#rec-value").textContent = hoursText(h);
    if (FIND) setText($(".rec__label"), "Visit length");
    var n = selectedJobs().length;
    var lead = FIND ? (h === rec ? "Based on the jobs you selected. " : "You changed this from " + hoursText(rec) + ". ") : (h === rec ? "Recommended for the jobs you picked. " : "You changed this from the recommended " + hoursText(rec) + ". ");
    $("#rec-meta").textContent = lead + "$" + RATE + " per hour, " + money(h * RATE) + " total.";
    $all('input[name="hours"]').forEach(function (r) { r.checked = +r.value === h; });
    $all("[data-rec-for]").forEach(function (el) { el.hidden = +el.getAttribute("data-rec-for") !== rec; });
    var note = $("#note-hours");
    note.hidden = h >= rec;
    $("#note-hours-text").textContent = h >= rec ? "" : (FIND ? "These jobs usually need about " + hoursText(rec) + ". " : "We recommend " + hoursText(rec) + " for these jobs. ") + "Booking " + hoursText(h) + " may not be enough, so your Home Manager might not finish everything.";
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
        status: FIND && overLimit() ? "More than a Fast Fix covers" : n ? n + (n === 1 ? " job" : " jobs") + (FIND ? " selected" : " picked") : (FIND ? "" : "Nothing picked yet")
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
    $all("[data-next]").forEach(function (b) { setText(b, c.label); });
    setText($("#status-" + state.screen), c.status);
    setText($("#dock-status"), c.status);
  }

  function updateSummary() {
    var h = HOMES[state.home], s = state.screen;
    $("#s-home-label").classList.toggle("sr-only", s === "type");
    $("#summary-title").textContent = s === "type" ? "Your home" : (s === "sent" ? "What you sent" : "Your request");
    $("#s-addr").textContent = h.addr;
    $("#s-city").textContent = h.city;

    var said = FIND ? (state.finder.text || "").trim() : "";
    $("#s-desc-row").hidden = !(FIND && said && s !== "type");
    $("#s-desc").textContent = said;
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
    var host = id === "jobs" ? $("#fs-jobs") : id === "finder" ? $("#finder-input") : null;
    if (host) host.setAttribute("aria-describedby", (id === "jobs" ? "jobs-hint" : "finder-hint") + (on ? " err-" + id : ""));
  }
  function clearErrors(ids) { ids.forEach(function (id) { setError(id, false); }); }

  /* ---------- Navigation ---------- */
  function seedDemo(screen) {
    if (!selectedJobs().length && FIND) {
      finderSeed();
    } else if (!selectedJobs().length) {
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
    if (FIND && screen !== "job" && finderTimer) finderSync();
    if (FIND && /^(check|time|booked)$/.test(screen) && !selectedJobs().length && state.finder.text.trim()) { navigate("job"); return; }
    if (/^(check|time)$/.test(screen) && selectedJobs().length && overLimit()) { state.reason = "time"; navigate("sent"); return; }
    if (screen !== "type" && screen !== "job" && !selectedJobs().length) seedDemo(screen);
    if (screen === "booked" && (!state.date || state.time === null)) seedDemo(screen);
    if (screen === "sent" && !state.reason) seedDemo(screen);
    state.screen = screen;
    body.setAttribute("data-screen", screen);

    SCREENS.forEach(function (s) { $('[data-screen-id="' + s + '"]').hidden = s !== screen; });
    $("#h1").textContent = TITLES[screen][0];
    var sub = FIND && screen === "job" ? FIND_SUB : TITLES[screen][1];
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
    updateDock();

    if (screen === "job") {
      if (FIND) {
        var ta = $("#finder-input");
        if (ta.value !== state.finder.text) ta.value = state.finder.text;
        renderFinderMeta();
      } else { renderJobs(); renderDetails(); }
    }
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

  /* Describe-first step 1: Continue. Returns true when it handled the click (feedback shown, stay on the step). */
  function finderNext() {
    var j = state.finder, before = selIds().join();
    if (finderTimer) {
      finderSync();
      if (selIds().join() !== before) { finderFlash("We updated your jobs from what you wrote. Check them, then continue."); return true; }
    }
    if (!selectedJobs().length) {
      setError("finder", true);
      announce("Describe what you need or pick a job below.");
      $("#finder-input").scrollIntoView({ block: "center", behavior: REDUCED ? "auto" : "smooth" });
      $("#finder-input").focus({ preventScroll: true });
      return true;
    }
    var o = state.jobs.other && !(state.notes.other || "").trim() && !j.text.trim();
    if (o) {
      j.open.other = true; syncJobs();
      setError("note-other", true);
      $("#job-other").scrollIntoView({ block: "center", behavior: REDUCED ? "auto" : "smooth" });
      $("#pnote-other").focus({ preventScroll: true });
      return true;
    }
    var qn = j.questions.length + j.unmatched.length;
    j.flash = "";
    if (qn && j.warned !== j.qsig) {
      j.warned = j.qsig;
      finderFlash((qn === 1 ? "1 question is left. " : qn + " questions are left. ") + "Answer or skip, then continue. Anything you skip stays in your description.", "#finder-questions .chip");
      return true;
    }
    return false;
  }

  function next() {
    var s = state.screen;
    if (s === "job") {
      if (FIND) { if (finderNext()) return; }
      var jobs = selectedJobs(), bad = [];
      if (!jobs.length) bad.push("jobs");
      if (!FIND) jobs.forEach(function (j) { if (!(state.notes[j.id] || "").trim()) bad.push("note-" + j.id); });
      if (!FIND) setError("jobs", bad.indexOf("jobs") > -1);
      if (!FIND) jobs.forEach(function (j) { setError("note-" + j.id, bad.indexOf("note-" + j.id) > -1); });
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

    if (FIND) {
      var ex = t.closest("[data-finder-example]");
      if (ex) { finderClearAll(); finderSetText(ex.getAttribute("data-finder-example")); navigate("job"); return; }
      var dt = t.closest("[data-details-toggle]");
      if (dt) { toggleDetails(dt.getAttribute("data-details-toggle")); return; }
      if (t.closest("[data-jump-picks]")) { if (!selectedJobs().length) finderSeed(); navigate("job"); return; }
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
      if (FIND) { finderToggled(el.value, el.checked); return; }
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
      if (name === "finderdown" && FIND) finderSync();
    }
    refresh();
  });

  document.addEventListener("input", function (e) {
    if (FIND && e.target.id === "finder-input") { state.finder.text = e.target.value; state.finder.flash = ""; setError("finder", false); finderQueue(); updateSummary(); return; }
    var id = e.target.getAttribute && e.target.getAttribute("data-note");
    if (id) { state.notes[id] = e.target.value; if (e.target.value.trim()) setError("note-" + id, false); if (FIND) syncJobsLabels(id); refresh(); }
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeMenus();
  });
  window.addEventListener("hashchange", function () { render(fromHash()); });

  /* ---------- Init ---------- */
  if (FIND) $("#finder").appendChild($("#note-over"));
  renderJobs();
  applySwitch("multi", true);
  render(fromHash());
})();
