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


  /* ---------- Describe-first variant: matches what the member types to jobs from the 25-job list ---------- */
  var FIND = body.classList.contains("variant-finder");
  var REDUCED = !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);
  state.finder = { phase: "ask", text: "", marks: [], questions: [], unmatched: [], src: {}, open: {}, down: false };
  state.browse = false;

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
  function announce(msg) { $("#finder-live").textContent = msg; }
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
    var res = { picks: [], questions: [], unmatched: [], marks: [] };
    clauses(text).forEach(function (c) {
      var hits = Object.keys(KW).filter(function (id) { return KW[id].test(c.text); });
      if (hits.indexOf("lock") > -1) hits = hits.filter(function (x) { return x !== "door"; });
      if (hits.indexOf("cab-hw") > -1) hits = hits.filter(function (x) { return x !== "knob"; });
      if (hits.indexOf("faucet-swap") > -1) hits = hits.filter(function (x) { return x !== "faucet-leak"; });
      if (hits.length) {
        hits.forEach(function (id) { if (!res.picks.some(function (p) { return p.id === id; })) res.picks.push({ id: id, quote: c.text }); });
        res.marks.push({ start: c.start, end: c.end, kind: "pick", ids: hits });
        return;
      }
      var amb = AMBIG.filter(function (a) { return a.re.test(c.text); })[0];
      if (amb) {
        res.questions.push({ kind: "ask", key: amb.key, text: amb.text, options: amb.options, quote: c.text, start: c.start, end: c.end });
        res.marks.push({ start: c.start, end: c.end, kind: "ask" });
        return;
      }
      if (c.text.split(/\s+/).length >= 3 && !FILLER.test(c.text)) {
        res.unmatched.push({ kind: "none", quote: c.text, start: c.start, end: c.end });
        res.marks.push({ start: c.start, end: c.end, kind: "none" });
      }
    });
    if (!res.picks.length && !res.questions.length && !res.unmatched.length) {
      res.unmatched.push({ kind: "none", quote: text, start: 0, end: text.length });
      res.marks.push({ start: 0, end: text.length, kind: "none" });
    }
    return res;
  }

  function addJob(id, quote) {
    if (!state.jobs[id]) { state.jobs[id] = true; state.order.push(id); }
    state.finder.src[id] = quote;
  }
  function resetPicks() { state.hours = 0; state.date = null; state.time = null; }

  function finderApply(res, offset) {
    var j = state.finder, before = selectedJobs().length;
    res.picks.forEach(function (p) { addJob(p.id, p.quote); });
    res.questions.forEach(function (q) { q.start += offset; q.end += offset; j.questions.push(q); });
    res.unmatched.forEach(function (u) { u.start += offset; u.end += offset; j.unmatched.push(u); });
    res.marks.forEach(function (m) { j.marks.push({ start: m.start + offset, end: m.end + offset, kind: m.kind, ids: m.ids }); });
    resetPicks();
    return selectedJobs().length - before;
  }

  function finderReset() {
    var j = state.finder;
    Object.keys(j.src).forEach(function (id) {
      state.jobs[id] = false;
      var at = state.order.indexOf(id); if (at > -1) state.order.splice(at, 1);
      delete state.notes[id];
    });
    j.src = {}; j.marks = []; j.questions = []; j.unmatched = []; j.open = {};
    resetPicks();
  }

  function finderSeed() {
    var text = "The toilet keeps running, the front door lock sticks, and I need a light fixture replaced in the second-story hallway.";
    finderReset();
    state.finder.text = text; state.finder.down = false;
    finderApply(finderParse(text), 0);
    state.finder.phase = "picks";
  }

  function finderSub() {
    var j = state.finder;
    if (j.phase !== "picks") return "Describe it in your own words and we’ll select the matching jobs. Adding details is optional.";
    return j.text ? "Selected based on what you wrote. Remove anything that doesn’t fit." : "Pick the jobs you need. Details are optional.";
  }

  function updateDock() {
    var s = state.screen, show = /^(job|check|time)$/.test(s) && !(FIND && s === "job" && state.finder.phase !== "picks");
    body.setAttribute("data-dock", show ? "on" : "off");
    $("#fdock").hidden = !show;
  }

  /* The member's own sentence with the matched phrases highlighted (DOM only: member text is never HTML) */
  function renderYou() {
    var j = state.finder, you = $("#finder-you"), box = $("#finder-you-text");
    you.hidden = !j.text;
    box.innerHTML = "";
    if (!j.text) return;
    var t = j.text, pos = 0;
    j.marks.slice().sort(function (a, b) { return a.start - b.start; }).forEach(function (m) {
      if (m.start < pos) return;
      var live = m.kind === "pick" ? (m.ids || []).some(function (id) { return state.jobs[id]; }) : true;
      if (m.start > pos) box.appendChild(document.createTextNode(t.slice(pos, m.start)));
      var seg = t.slice(m.start, m.end);
      if (m.kind === "pick" && live) box.appendChild(el("mark", "", seg));
      else if (m.kind === "ask" || m.kind === "none") box.appendChild(el("span", "finder__maybe", seg));
      else box.appendChild(document.createTextNode(seg));
      pos = m.end;
    });
    if (pos < t.length) box.appendChild(document.createTextNode(t.slice(pos)));
  }

  function finderSummary() {
    var j = state.finder, n = selectedJobs().length, q = j.questions.length, u = j.unmatched.length, parts = [];
    if (j.down) return "We couldn’t select jobs from that right now. You can still pick them from the list below.";
    if (!j.text) return "Pick the jobs you need from the list. Adding details is up to you.";
    if (n > 0) parts.push(n + (n === 1 ? " job" : " jobs") + " selected based on what you wrote.");
    else parts.push("We couldn’t match that to a job on our list yet.");
    if (q) parts.push(q === 1 ? "One question below." : q + " questions below.");
    if (u && n > 0) parts.push("Part of your description didn’t match a job.");
    return parts.join(" ");
  }

  function renderQuestions() {
    var j = state.finder, box = $("#finder-questions");
    box.innerHTML = "";
    j.questions.forEach(function (q) {
      var card = el("div", "finder-q"), row = el("div", "finder__chips");
      card.appendChild(el("p", "finder-q__text", q.text));
      q.options.forEach(function (o) {
        var b = el("button", "chip", o.label); b.type = "button";
        b.addEventListener("click", function () { finderAnswer(q, o); });
        row.appendChild(b);
      });
      var skip = el("button", "chip", "Skip"); skip.type = "button";
      skip.addEventListener("click", function () { finderDismiss(q); });
      row.appendChild(skip);
      card.appendChild(row);
      box.appendChild(card);
    });
    j.unmatched.forEach(function (u) {
      var card = el("div", "finder-q"), row = el("div", "finder__chips");
      card.appendChild(el("p", "finder-q__text", "We couldn’t match “" + u.quote + "” to a job on our list. Add it as Something else?"));
      var add = el("button", "chip", "Add as Something else"); add.type = "button";
      add.addEventListener("click", function () { finderAddOther(u); });
      var skip = el("button", "chip", "Skip"); skip.type = "button";
      skip.addEventListener("click", function () { finderDismiss(u); });
      row.appendChild(add); row.appendChild(skip);
      card.appendChild(row);
      box.appendChild(card);
    });
  }

  function dropMark(item) {
    var j = state.finder;
    j.marks = j.marks.filter(function (m) { return !((m.kind === "ask" || m.kind === "none") && m.start === item.start); });
  }
  function finderAnswer(q, opt) {
    var j = state.finder;
    opt.ids.forEach(function (id) { addJob(id, q.quote); });
    dropMark(q);
    j.marks.push({ start: q.start, end: q.end, kind: "pick", ids: opt.ids.slice() });
    j.questions = j.questions.filter(function (x) { return x !== q; });
    resetPicks();
    renderFinder();
    announce("Added " + titlesOf(opt.ids) + ".");
  }
  function finderAddOther(u) {
    var j = state.finder;
    var had = j.src.other;
    addJob("other", u.quote);
    if (had) j.src.other = had + "; " + u.quote;
    dropMark(u);
    j.marks.push({ start: u.start, end: u.end, kind: "pick", ids: ["other"] });
    j.unmatched = j.unmatched.filter(function (x) { return x !== u; });
    j.open.other = false;
    resetPicks();
    renderFinder();
    announce("Added Something else.");
  }
  function finderDismiss(item) {
    var j = state.finder;
    dropMark(item);
    j.questions = j.questions.filter(function (x) { return x !== item; });
    j.unmatched = j.unmatched.filter(function (x) { return x !== item; });
    renderFinder();
  }
  function finderRemove(id) {
    var j = state.finder, at = state.order.indexOf(id);
    state.jobs[id] = false;
    if (at > -1) state.order.splice(at, 1);
    delete j.src[id]; delete j.open[id];
    resetPicks();
    renderFinder();
    announce("Removed " + JOB[id].title + ".");
    var next = $("#picks-title"); if (next) next.focus();
  }

  /* One card per pick. Details are optional and start out holding the member's own words. */
  function renderPicks() {
    var j = state.finder, list = $("#picks"), jobs = selectedJobs();
    list.innerHTML = "";
    $("#picks-empty").hidden = jobs.length > 0;
    $("#picks-count").textContent = jobs.length ? jobs.length + (jobs.length === 1 ? " job" : " jobs") : "";
    jobs.forEach(function (jb) {
      var li = el("li", "pick"), top = el("div", "pick__top");
      var ic = el("span", "d-icon"); ic.setAttribute("aria-hidden", "true");
      ic.innerHTML = '<svg class="i"><use href="#' + jb.icon + '"/></svg>';
      var main = el("div", "pick__main");
      main.appendChild(el("p", "pick__title", jb.title));
      var q = j.src[jb.id];
      if (q) main.appendChild(el("p", "pick__quote", "“" + q + "”"));
      var rm = el("button", "icon-btn icon-btn--bare pick__remove"); rm.type = "button";
      rm.setAttribute("aria-label", "Remove " + jb.title);
      rm.innerHTML = '<svg class="i"><use href="#ri-close-line"/></svg>';
      rm.addEventListener("click", function () { finderRemove(jb.id); });
      top.appendChild(ic); top.appendChild(main); top.appendChild(rm);

      var more = el("div", "pick__more"), open = !!j.open[jb.id], has = !!(state.notes[jb.id] || "").trim();
      var tog = el("button", "link", open ? "Hide details" : (has ? "Edit details (optional)" : "Add details (optional)")); tog.type = "button";
      tog.setAttribute("aria-expanded", String(open)); tog.setAttribute("aria-controls", "pbox-" + jb.id);
      var box = el("div", "pick__box"); box.id = "pbox-" + jb.id; box.hidden = !open;
      var lab = el("label"); lab.setAttribute("for", "pnote-" + jb.id);
      lab.appendChild(document.createTextNode("More details about " + jb.title + " "));
      lab.appendChild(el("span", "", "(optional)"));
      var ta = el("textarea", "textarea"); ta.id = "pnote-" + jb.id; ta.rows = 3; ta.placeholder = jb.ex;
      ta.value = state.notes[jb.id] || ""; ta.setAttribute("data-note", jb.id);
      box.appendChild(lab); box.appendChild(ta);
      tog.addEventListener("click", function () {
        j.open[jb.id] = !j.open[jb.id];
        box.hidden = !j.open[jb.id];
        tog.setAttribute("aria-expanded", String(!!j.open[jb.id]));
        tog.textContent = j.open[jb.id] ? "Hide details" : ((state.notes[jb.id] || "").trim() ? "Edit details (optional)" : "Add details (optional)");
        if (j.open[jb.id]) ta.focus();
      });
      more.appendChild(tog); more.appendChild(box);
      li.appendChild(top); li.appendChild(more);
      list.appendChild(li);
    });
  }

  function renderFinder() {
    if (!FIND || state.screen !== "job") return;
    var j = state.finder;
    body.setAttribute("data-finder-phase", j.phase);
    $("#finder-ask").hidden = j.phase !== "ask";
    $("#finder-thinking").hidden = j.phase !== "thinking";
    $("#finder-picks").hidden = j.phase !== "picks";
    $("#finder-browse").classList.toggle("is-open", j.phase === "picks" && state.browse);
    var bt = $("#finder-browse-toggle");
    bt.setAttribute("aria-expanded", String(state.browse));
    $("[data-label]", bt).textContent = state.browse ? "Hide the full list" : "Browse all 25 jobs";
    $("use", bt).setAttribute("href", state.browse ? "#ri-arrow-up-s-line" : "#ri-arrow-down-s-line");
    $("#finder-add-wrap").hidden = j.down;
    if (j.phase === "thinking") $("#finder-said").textContent = j.text;
    if (j.phase === "picks") {
      renderYou();
      $("#finder-summary").textContent = finderSummary();
      renderQuestions();
      renderPicks();
      renderJobs();
    }
    $("#sub").textContent = finderSub();
    updateDock();
    refresh();
  }

  function finderSend() {
    var j = state.finder, input = $("#finder-input"), txt = input.value.trim();
    if (txt.length < 3) {
      $("#err-finder").hidden = false; $("#field-finder").classList.add("is-invalid"); input.focus();
      return;
    }
    $("#err-finder").hidden = true; $("#field-finder").classList.remove("is-invalid");
    finderReset();
    j.text = txt; j.down = false;
    if (body.classList.contains("is-finderdown")) {
      j.phase = "picks"; j.down = true; state.browse = true;
      renderFinder(); $("#picks-title").focus();
      return;
    }
    j.phase = "thinking";
    renderFinder();
    clearTimeout(finderTimer);
    finderTimer = setTimeout(function () {
      var added = finderApply(finderParse(txt), 0);
      j.phase = "picks";
      renderFinder();
      var n = selectedJobs().length;
      announce(n ? "Selected " + n + (n === 1 ? " job: " : " jobs: ") + titlesOf(state.order.filter(function (id) { return state.jobs[id]; })) + "." : "No jobs selected yet.");
      $("#picks-title").focus();
    }, REDUCED ? 0 : 700);
  }
  var finderTimer;

  function finderAdd() {
    var inp = $("#finder-more"), txt = inp.value.trim(), j = state.finder;
    if (txt.length < 2) { inp.focus(); return; }
    var offset = j.text ? j.text.length + 1 : 0;
    j.text = j.text ? j.text + " " + txt : txt;
    var added = finderApply(finderParse(txt), offset);
    inp.value = "";
    renderFinder();
    announce(added > 0 ? "Added " + added + (added === 1 ? " job." : " jobs.") : "Nothing new to add yet.");
    inp.focus();
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
  function updateOver() {
    $("#note-over").hidden = !overLimit();
    $("#note-over-finder").hidden = !overLimit();
  }

  /* Step 3: the recommended length, with a way to change it */
  function updateRec() {
    var rec = recommendedHours(), h = hours();
    $("#rec-value").textContent = hoursText(h);
    var n = selectedJobs().length;
    var lead = (h === rec ? "Recommended for the jobs you picked. " : "You changed this from the recommended " + hoursText(rec) + ". ");
    $("#rec-meta").textContent = lead + "$" + RATE + " per hour, " + money(h * RATE) + " total.";
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
    if (screen !== "type" && screen !== "job" && !selectedJobs().length) seedDemo(screen);
    if (screen === "booked" && (!state.date || state.time === null)) seedDemo(screen);
    if (screen === "sent" && !state.reason) seedDemo(screen);
    state.screen = screen;
    body.setAttribute("data-screen", screen);

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
    updateDock();

    if (screen === "job") {
      if (FIND && !selectedJobs().length && !state.finder.text && !state.browse && state.finder.phase !== "thinking") state.finder.phase = "ask";
      renderJobs(); renderDetails();
      renderFinder();
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

  function next() {
    var s = state.screen;
    if (s === "job" && FIND) {
      if (state.finder.phase !== "picks") { finderSend(); return; }
      if (!selectedJobs().length) { $("#err-picks").hidden = false; focusFirst("#finder-more"); return; }
      $("#err-picks").hidden = true;
      if (overLimit()) { state.reason = "time"; navigate("sent"); return; }
      navigate("check");
      return;
    }
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

    if (FIND) {
      var ex = t.closest("[data-finder-example]");
      if (ex) { var inp = $("#finder-input"); inp.value = ex.getAttribute("data-finder-example"); $("#err-finder").hidden = true; $("#field-finder").classList.remove("is-invalid"); inp.focus(); return; }
      if (t.closest("[data-finder-send]")) { finderSend(); return; }
      if (t.closest("[data-finder-browse]")) { state.finder.phase = "picks"; state.browse = true; renderFinder(); $("#picks-title").focus(); return; }
      if (t.closest("#finder-edit")) { state.finder.phase = "ask"; renderFinder(); $("#finder-input").value = state.finder.text; $("#finder-input").focus(); return; }
      if (t.closest("#finder-add")) { finderAdd(); return; }
      if (t.closest("#finder-browse-toggle")) { state.browse = !state.browse; renderFinder(); return; }
      if (t.closest("[data-jump-picks]")) {
        if (!selectedJobs().length) finderSeed();
        state.finder.phase = "picks";
        navigate("job"); renderFinder();
        return;
      }
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
      if (FIND) renderFinder();
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

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeMenus();
    if (FIND && e.target.id === "finder-input" && e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); finderSend(); }
    if (FIND && e.target.id === "finder-more" && e.key === "Enter") { e.preventDefault(); finderAdd(); }
  });
  window.addEventListener("hashchange", function () { render(fromHash()); });

  /* ---------- Init ---------- */
  renderJobs();
  applySwitch("multi", true);
  render(fromHash());
})();
