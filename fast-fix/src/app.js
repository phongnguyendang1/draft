/* HomeHub Request flow prototype. In-page only: links to other pages show a toast.
   Screens: type, job (1), check (2), time (3), booked, sent. Deep-linkable with #/job etc. */
(function () {
  "use strict";

  var body = document.body;
  var FIND = body.classList.contains("variant-finder");
  var WIZ = body.classList.contains("variant-wizard");   /* one job at a time: pick, describe, photos, question, add another */
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
  /* Describe-first: the 100-job catalog (catalog.js), flattened. Each job knows its group. */
  function catalogJobs() {
    var out = [];
    CATALOG.forEach(function (g) {
      g.jobs.forEach(function (t) {
        var o = Array.isArray(t) ? { id: t[0], title: t[1], kw: t[2], min: t[3] } : t;
        out.push({ id: o.id, title: o.title, kw: o.kw, min: o.min, icon: g.icon, group: g.id, groupTitle: g.title, groupKw: g.kw,
          ex: o.ex || "Example: how many, which room, or anything we should know.", ko: o.ko || [] });
      });
    });
    return out;
  }
  var JOBS = catalogJobs();
  var JOB = {};
  JOBS.forEach(function (j) { JOB[j.id] = j; });
  var RATE = 55;
  var MAX_MIN = 180;
  var MAX_TASKS = 4;   /* pick-it-yourself version: more than this goes to a service request */
  var TODAY = new Date(2026, 9, 13);
  var FIRST_DAY = new Date(2026, 9, 14);
  var LAST_MONTH = { y: 2027, m: 1 };
  var FIRST_MONTH = { y: 2026, m: 9 };
  var STARTS = [480, 570, 660, 780, 870, 960];
  var SUFFIX = " | PreFix Home Maintenance";

  var SCREENS = ["type", "job", "check", "time", "booked", "sent"];
  var TITLES = {
    type: ["How can we help?", "Choose what fits best."],
    job: ["What do you need done?", "Search, or open a category, and pick up to 4 jobs. Add a short note to each."],
    check: ["A quick check", "A few quick questions so we book the right visit. All are required."],
    time: ["Pick a time", "Real open times with your Home Manager. Your booking is confirmed right away."],
    booked: ["You’re booked", "Confirmed. Nothing else to do."],
    sent: ["Request sent", "Our team will take it from here."]
  };
  var PAGE_TITLE = {
    type: "Request service", job: "Fast Fix: the job", check: "Fast Fix: quick check",
    time: "Fast Fix: pick a time", booked: "Fast Fix: booked", sent: "Request sent"
  };
  var BACK = { type: null, job: "type", check: "job", time: "check", booked: null, sent: null };
  if (WIZ) {
    SCREENS = ["type", "job", "details", "question", "more", "check", "time", "booked", "sent"];
    TITLES.job = ["What needs fixing?", ""];
    TITLES.details = ["Tell us about the job", "Tell us what\u2019s going on. Photos are optional."];
    TITLES.question = ["One quick question", ""];
    TITLES.more = ["Add another job?", "Each job gets its own description, photos and question. You can add up to 4."];
    TITLES.check = ["A quick check", "Three questions about the whole visit. All are required."];
    PAGE_TITLE.job = "Fast Fix: pick a job"; PAGE_TITLE.details = "Fast Fix: about the job"; PAGE_TITLE.question = "Fast Fix: one question"; PAGE_TITLE.more = "Fast Fix: add another job";
    BACK = { type: null, job: "type", details: "job", question: "details", more: "question", check: "more", time: "check", booked: null, sent: null };
  }
  if (FIND) {
    SCREENS = ["type", "describe", "job", "check", "time", "booked", "sent"];
    TITLES.describe = ["What do you need done?", "Tell us in your own words. We’ll select the jobs for you."];
    TITLES.job = ["Your jobs", "Remove any that don’t fit, or add more below."];
    PAGE_TITLE.describe = "Fast Fix: describe the job";
    PAGE_TITLE.job = "Fast Fix: your jobs";
    BACK = { type: null, describe: "type", job: "describe", check: "job", time: "check", booked: null, sent: null };
  }
  var WHY = {
    ladder: "This needs more than a standard step ladder, so our team will plan the right equipment.",
    trade: "Work with gas, wiring or water lines can need a licensed trade, so our team will plan it.",
    part: "You still need the part, so our team will help plan it.",
    time: "These jobs add up to more than a Fast Fix covers, so our team will plan the visit.",
    count: "You picked more than 4 jobs, so our team will plan the visit.",
    ko: "One of your answers means our team should plan this visit.",
    slots: "We could not find an open time, so our team will find one for you."
  };
  /* Step 2: the vetting questions (Mark's wording). Any answer listed in BAD sends the request to the team. */
  var Q = ["ladder", "trade", "part"];
  var BAD = { ladder: ["no", "unsure"], trade: ["no", "unsure"], part: ["no"] };
  var HINT = {
    ladder: "Think roofs, second-story outsides and vaulted ceilings.",
    trade: "Swapping a fixture is fine. Adding or relocating one is not.",
    part: "If the job needs no part, answer Yes. For example a new faucet, lock set or TV mount."
  };
  var QNAME = { ladder: "Standard step ladder", trade: "Gas, wiring or water lines", part: "Part or fixture" };
  var QLABEL = {
    ladder: { yes: "Yes", no: "No, it’s higher", unsure: "Not sure" },
    trade: { yes: "Yes", no: "No", unsure: "Not sure" },
    part: { yes: "Yes", no: "No" }
  };

  /* ---------- State ---------- */
  var state = {
    screen: "type", home: "mueller", jobs: {}, order: [], notes: {}, showAll: false, hours: 0, ladder: "", trade: "", part: "",
    date: null, time: null, month: { y: 2026, m: 9 }, reason: "", taken: {}, ko: {}, srAfter: false, srModal: false, dropped: {}, photos: {}, perr: {}, cur: null, committed: {}, editing: false
  };


  /* ---------- Describe-first variant ----------
     Step 1: one text box. Step 2: the matching jobs are already selected (remove or add more), with search and
     100 jobs in 10 groups underneath. The description is carried with the request but never shown again. */
  var REDUCED = !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);
  state.desc = "";        /* what was typed in step 1: carried with the request, never displayed */
  state.q = "";           /* search text */
  state.open = {};        /* group id -> expanded */
  state.sc = {};          /* group id -> collapsed while searching */
  state.det = {};         /* job id -> details box open */
  state.msg = "";         /* a plain note above the selected list (nothing matched / matching unavailable) */

  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
  function announce(msg) { var n = $("#finder-live"); n.textContent = ""; setTimeout(function () { n.textContent = msg; }, 30); }
  function setText(node, txt) { if (node && node.textContent !== txt) node.textContent = txt; }
  function resetPicks() { state.hours = 0; state.date = null; state.time = null; }
  /* The "service request afterwards" pointer is on when the member chose it in the modal or dropped a task that did not qualify */
  function syncSr() { state.srAfter = state.srModal || Object.keys(state.dropped).length > 0; }
  function selectJob(id) {
    if (!state.jobs[id]) { state.jobs[id] = true; state.order.push(id); }
    if (state.dropped[id]) { delete state.dropped[id]; syncSr(); }
  }
  function unselectJob(id) {
    state.jobs[id] = false; dropPhotos(id);
    var at = state.order.indexOf(id); if (at > -1) state.order.splice(at, 1);
  }
  function icon(name) { var s = el("span", "d-icon"); s.setAttribute("aria-hidden", "true"); s.innerHTML = '<svg class="i"><use href="#' + name + '"/></svg>'; return s; }

  /* PROTOTYPE NOTE: matching is a rule-based stand-in for the real service. It returns job ids only, from the catalog.
     Everything after it is real UI. Words are reduced to a rough stem so "running" and "runs" meet. */
  function stem(w) {
    w = w.toLowerCase().replace(/'/g, "");
    if (w.length >= 4) { var t = w.replace(/(ing|ed|es|s|y|e|er)$/, ""); if (t.length >= 3) w = t; }
    return w.replace(/([a-z])\1$/, "$1");
  }
  function compileMatch() {
    JOBS.forEach(function (j) {
      j.alts = (j.kw || "").split("|").map(function (p) { return p.trim(); }).filter(Boolean).map(function (p) {
        var generic = p.charAt(0) === "~", words = p.replace(/^~/, "").split(/\s+/).map(stem);
        return { w: generic ? 0.5 : words.length, words: words };
      });
      j.titleHay = j.title.toLowerCase();
      j.hay = (j.title + " " + j.groupTitle + " " + j.groupKw + " " + (j.kw || "").replace(/[|~]/g, " ")).toLowerCase();
    });
  }
  function clauses(text) {
    return text.split(/[,;.\n]+|\s+(?:and|also|plus)\s+|\s*&\s*/i).map(function (c) { return c.trim(); }).filter(Boolean);
  }
  function matchText(text) {
    var ids = [];
    clauses(text).forEach(function (c) {
      var words = {};
      c.toLowerCase().split(/[^a-z']+/).forEach(function (w) { if (w) words[stem(w)] = 1; });
      var best = 0, hit = null;
      JOBS.forEach(function (j) {
        var s = 0;
        j.alts.forEach(function (a) { if (a.w > s && a.words.every(function (w) { return words[w]; })) s = a.w; });
        if (s > best) { best = s; hit = j; }        /* strict: on a tie the first job in the catalog wins */
      });
      if (hit && ids.indexOf(hit.id) < 0) ids.push(hit.id);
    });
    return ids;
  }

  function updateDock() {
    var show = /^(describe|job|details|question|more|check|time)$/.test(state.screen);
    body.setAttribute("data-dock", show ? "on" : "off");
    $("#fdock").hidden = !show;
  }

  /* ----- Optional photos for each picked job (prototype: kept in the page, never uploaded) ----- */
  var MAX_PHOTOS = 3, MAX_PHOTO_MB = 10;
  function photosOf(id) { return state.photos[id] || []; }
  function dropPhotos(id) { photosOf(id).forEach(function (p) { URL.revokeObjectURL(p.url); }); delete state.photos[id]; delete state.perr[id]; }
  function photoBlock(jb) {
    var list = photosOf(jb.id), full = list.length >= MAX_PHOTOS, box = el("div", "photos");
    var ttl = el("p", "photos__title"); ttl.id = "photos-t-" + jb.id;
    ttl.appendChild(document.createTextNode("Photos ")); ttl.appendChild(el("span", "", "(optional)"));
    box.appendChild(ttl);
    box.appendChild(el("p", "t-meta", "A photo helps your Home Manager come prepared. Add up to " + MAX_PHOTOS + "."));
    if (list.length) {
      var ul = el("ul", "photos__list");
      list.forEach(function (ph, i) {
        var li = el("li", "photo"), img = el("img"), rm = el("button", "link photo__rm", "Remove");
        img.src = ph.url; img.alt = "Photo " + (i + 1) + " for " + jb.title;
        rm.type = "button"; rm.setAttribute("data-photo-rm", jb.id + ":" + i); rm.setAttribute("aria-label", "Remove photo " + (i + 1) + " for " + jb.title);
        li.appendChild(img); li.appendChild(rm); ul.appendChild(li);
      });
      box.appendChild(ul);
    }
    var err = el("p", "error"); err.id = "err-photo-" + jb.id; err.setAttribute("role", "alert"); err.hidden = !state.perr[jb.id];
    err.innerHTML = '<svg class="i"><use href="#ri-error-warning-fill"/></svg><span></span>'; err.lastChild.textContent = state.perr[jb.id] || "";
    box.appendChild(err);
    if (full) {
      box.appendChild(el("p", "t-meta", "You have added " + MAX_PHOTOS + " photos. Remove one to add another."));
    } else {
      var inp = el("input"); inp.type = "file"; inp.accept = "image/*"; inp.multiple = true; inp.hidden = true; inp.tabIndex = -1; inp.setAttribute("data-photo-in", jb.id); inp.id = "photo-in-" + jb.id;
      var add = el("button", "btn btn--secondary photos__add", list.length ? "Add another photo" : "Add photos"); add.type = "button"; add.id = "photo-add-" + jb.id;
      add.setAttribute("data-photo-add", jb.id); add.setAttribute("aria-label", add.textContent + " for " + jb.title);
      box.appendChild(add); box.appendChild(inp);
    }
    return box;
  }
  function redrawPhotos() {
    if (!WIZ) { renderSelected(); return; }
    var jb = curJob(), host = $("#w-photos"); if (!jb || !host) return;
    host.innerHTML = ""; host.appendChild(photoBlock(jb));
  }
  function addPhotos(id, files) {
    var room = MAX_PHOTOS - photosOf(id).length, added = 0, msg = "";
    Array.prototype.slice.call(files).forEach(function (f) {
      if (!/^image\//.test(f.type)) { msg = "Only photos can be added."; return; }
      if (f.size > MAX_PHOTO_MB * 1048576) { msg = "A photo can be up to " + MAX_PHOTO_MB + " MB."; return; }
      if (added >= room) { msg = "You can add up to " + MAX_PHOTOS + " photos."; return; }
      (state.photos[id] = state.photos[id] || []).push({ url: URL.createObjectURL(f), name: f.name }); added++;
    });
    state.perr[id] = msg;
    redrawPhotos(); refresh();
    var n = photosOf(id).length, b = $("#photo-add-" + id) || $all('[data-photo-rm^="' + id + ':"]').pop();
    if (b) b.focus({ preventScroll: true });
    announce((added ? added + (added === 1 ? " photo added. " : " photos added. ") + n + " of " + MAX_PHOTOS + "." : msg));
  }
  function removePhoto(id, i) {
    var p = photosOf(id)[i]; if (!p) return;
    URL.revokeObjectURL(p.url); state.photos[id].splice(i, 1); state.perr[id] = "";
    redrawPhotos(); refresh();
    var b = $("#photo-add-" + id); if (b) b.focus({ preventScroll: true });
    announce("Photo removed. " + photosOf(id).length + " of " + MAX_PHOTOS + ".");
  }

  /* ----- Step 2: selected jobs (top) ----- */
  function renderSelected() {
    var jobs = selectedJobs(), list = $("#sel");
    list.innerHTML = "";
    if (!FIND) $("#sel-sec").hidden = jobs.length === 0;
    setText($("#sel-count"), jobs.length ? (FIND ? jobs.length + " selected" : jobs.length + " of " + MAX_TASKS + " selected") : "");
    var msg = $("#sel-msg");
    msg.hidden = jobs.length > 0 || !state.msg;
    setText(msg, jobs.length ? "" : state.msg);
    jobs.forEach(function (jb) {
      var li = el("li", "pick"), top = el("div", "pick__top"), main = el("div", "pick__main");
      main.appendChild(el("p", "pick__title", jb.title));
      main.appendChild(el("p", "pick__group", jb.groupTitle));
      var rm = el("button", "link pick__remove", "Remove"); rm.type = "button";
      rm.setAttribute("aria-label", "Remove " + jb.title);
      rm.addEventListener("click", function () { toggleJob(jb.id, false, "sel-title"); });
      top.appendChild(icon(jb.icon)); top.appendChild(main); top.appendChild(rm);
      if (!FIND) {
        var req = el("div", "job__box job__box--req field"); req.id = "field-note-" + jb.id;
        var rl = el("label"); rl.setAttribute("for", "pnote-" + jb.id);
        rl.appendChild(document.createTextNode("Tell us more about " + jb.title + " ")); rl.appendChild(el("span", "", "(required). If there is more than one, say how many."));
        var rt = el("textarea", "textarea"); rt.id = "pnote-" + jb.id; rt.rows = 3; rt.placeholder = jb.ex; rt.value = state.notes[jb.id] || "";
        rt.setAttribute("data-note", jb.id); rt.setAttribute("aria-required", "true"); rt.setAttribute("aria-describedby", "err-note-" + jb.id);
        var re = el("p", "error"); re.id = "err-note-" + jb.id; re.hidden = true; re.setAttribute("role", "alert");
        re.innerHTML = '<svg class="i"><use href="#ri-error-warning-fill"/></svg><span></span>';
        re.lastChild.textContent = "Add a few words about this job so your Home Manager knows what to expect.";
        req.appendChild(rl); req.appendChild(rt); req.appendChild(re); req.appendChild(photoBlock(jb));
        li.appendChild(top); li.appendChild(req);
        list.appendChild(li);
        return;
      }
      var more = el("div", "job__more"), open = !!state.det[jb.id], has = !!(state.notes[jb.id] || "").trim();
      var tog = el("button", "link", open ? "Hide details" : (has ? "Edit details (optional)" : "Add details (optional)")); tog.type = "button";
      tog.setAttribute("data-details-toggle", jb.id); tog.setAttribute("aria-expanded", String(open)); tog.setAttribute("aria-controls", "pbox-" + jb.id);
      tog.setAttribute("aria-label", tog.textContent + " for " + jb.title);
      var box = el("div", "job__box"); box.id = "pbox-" + jb.id; box.hidden = !open;
      var lab = el("label"); lab.setAttribute("for", "pnote-" + jb.id);
      lab.appendChild(document.createTextNode("More details about " + jb.title + " ")); lab.appendChild(el("span", "", "(optional)"));
      var ta = el("textarea", "textarea"); ta.id = "pnote-" + jb.id; ta.rows = 3; ta.placeholder = jb.ex; ta.value = state.notes[jb.id] || "";
      ta.setAttribute("data-note", jb.id);
      var err = el("p", "error"); err.id = "err-note-" + jb.id; err.hidden = true; err.setAttribute("role", "alert");
      err.innerHTML = '<svg class="i"><use href="#ri-error-warning-fill"/></svg><span></span>';
      err.lastChild.textContent = "Add a few words so we know what you need.";
      box.appendChild(lab); box.appendChild(ta); box.appendChild(err);
      more.appendChild(tog); more.appendChild(box);
      li.appendChild(top); li.appendChild(more);
      list.appendChild(li);
    });
  }
  function toggleDetails(id) {
    state.det[id] = !state.det[id];
    renderSelected();
    var t = $('[data-details-toggle="' + id + '"]');
    if (state.det[id]) $("#pnote-" + id).focus(); else if (t) t.focus();
  }

  /* ----- Step 2: search + groups (bottom) ----- */
  var GROUPS = [];
  function buildTree() {
    var tree = $("#tree"); tree.innerHTML = "";
    CATALOG.forEach(function (g) {
      var root = el("div", "grp"), h = el("h3", "grp__h"), btn = el("button", "grp__btn"); btn.type = "button";
      btn.setAttribute("aria-expanded", "false"); btn.setAttribute("aria-controls", "gp-" + g.id); btn.setAttribute("data-grp", g.id);
      btn.appendChild(icon(g.icon));
      btn.appendChild(el("span", "grp__title", g.title));
      var sel = el("span", "grp__sel"); sel.hidden = true; btn.appendChild(sel);
      var meta = el("span", "grp__meta"); btn.appendChild(meta);
      var chev = el("span", "grp__chev"); chev.setAttribute("aria-hidden", "true"); chev.innerHTML = '<svg class="i"><use href="#ri-arrow-down-s-line"/></svg>'; btn.appendChild(chev);
      h.appendChild(btn);
      var panel = el("div", "grp__panel"); panel.id = "gp-" + g.id; panel.hidden = true;
      panel.setAttribute("role", "group"); panel.setAttribute("aria-label", g.title);
      var tiles = [];
      JOBS.filter(function (j) { return j.group === g.id; }).forEach(function (j) {
        var lab = el("label", "opt"), inp = el("input"); inp.type = "checkbox"; inp.name = "jobs"; inp.value = j.id;
        lab.appendChild(inp);
        var m = el("span", "opt__main"); m.appendChild(el("span", "opt__title", j.title)); lab.appendChild(m);
        var bx = el("span", "opt__box"); bx.setAttribute("aria-hidden", "true"); bx.innerHTML = '<svg class="i"><use href="#ri-check-line"/></svg>'; lab.appendChild(bx);
        var ad = null;
        if (WIZ) { ad = el("span", "opt__added", "Added"); ad.hidden = true; lab.appendChild(ad); }
        panel.appendChild(lab);
        tiles.push({ job: j, el: lab, input: inp, added: ad });
      });
      root.appendChild(h); root.appendChild(panel); tree.appendChild(root);
      GROUPS.push({ id: g.id, title: g.title, titleHay: g.title.toLowerCase(), root: root, btn: btn, panel: panel, sel: sel, meta: meta, tiles: tiles });
    });
  }
  /* A search word matches the start of a word ("door" finds doorbell, not outdoor) */
  function wordStart(hay, tk) {
    var i = hay.indexOf(tk);
    while (i > -1) { if (i === 0 || /[^a-z0-9]/.test(hay.charAt(i - 1))) return true; i = hay.indexOf(tk, i + 1); }
    return false;
  }
  function hit(hay, tk) { return wordStart(hay, tk) || (tk.length > 3 && wordStart(hay, tk.replace(/(es|s)$/, ""))); }
  /* Search: a group name shows the whole group; otherwise job names; if neither hits, related words and the group's keywords */
  function syncTree() {
    var toks = state.q.toLowerCase().split(/[^a-z0-9']+/).filter(Boolean), total = 0, any = false;
    var byGroup = {}, byTitle = {};
    if (toks.length) {
      GROUPS.forEach(function (g) { byGroup[g.id] = toks.every(function (t) { return hit(g.titleHay, t); }); });
      JOBS.forEach(function (j) { byTitle[j.id] = toks.every(function (t) { return hit(j.titleHay, t); }); });
      var found = GROUPS.some(function (g) { return byGroup[g.id]; }) || JOBS.some(function (j) { return byTitle[j.id]; });
      if (!found) JOBS.forEach(function (j) { byTitle[j.id] = toks.every(function (t) { return hit(j.hay, t); }); });
    }
    GROUPS.forEach(function (g) {
      var shown = 0, n = 0;
      g.tiles.forEach(function (t) {
        var on = !!state.jobs[t.job.id];
        if (on) n++;
        t.input.checked = on;
        if (WIZ) { var done = on && !!state.committed[t.job.id]; t.input.disabled = done; t.el.classList.toggle("is-added", done); t.added.hidden = !done; }
        var show = !toks.length || byGroup[g.id] || byTitle[t.job.id];
        t.el.hidden = !show; if (show) shown++;
      });
      total += toks.length ? shown : 0;
      var open = toks.length ? shown > 0 && !state.sc[g.id] : !!state.open[g.id];
      g.root.hidden = toks.length > 0 && shown === 0;
      if (shown) any = true;
      g.btn.setAttribute("aria-expanded", String(open));
      g.panel.hidden = !open;
      setText(g.meta, toks.length ? shown + " of " + g.tiles.length : g.tiles.length + " jobs");
      g.sel.hidden = n === 0; setText(g.sel, n + " selected");
    });
    $("#search-none").hidden = !(toks.length && !any);
    $("#search-clear").hidden = !state.q;
    setText($("#search-live"), toks.length ? (any ? total + (total === 1 ? " job" : " jobs") + " found" : "No jobs found") : "");
  }

  /* ----- "I can not find my job": point to a service request; if jobs are already picked, finish booking first ----- */
  var lastFocus = null;
  function srAction() {
    if ((WIZ ? committedIds() : selectedJobs()).length) openModal(); else toast("Continues in the current service request flow");
  }
  function modalEls() { return $all("#sr-modal button"); }
  function openModal() {
    lastFocus = document.activeElement;
    $("#sr-modal").hidden = false; body.classList.add("is-modal");
    $("[data-sr-confirm]").focus();
  }
  function closeModal() {
    $("#sr-modal").hidden = true; body.classList.remove("is-modal");
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  function updateSrFlag() {
    $("#sr-flag").hidden = !state.srAfter;
    $("#b-sr").hidden = !state.srAfter;
    $("#sent-sr").hidden = !state.srAfter;
  }

  /* ----- one place for every add / remove ----- */
  function wizPick(id, on) {
    var prev = state.cur;
    if (on) {
      if (prev && prev !== id && !state.committed[prev]) unselectJob(prev);
      selectJob(id); state.cur = id;
    } else if (!state.committed[id]) {
      unselectJob(id); if (state.cur === id) state.cur = null;
    }
    resetPicks(); setError("sel", false); syncTree(); refresh();
    announce(on ? JOB[id].title + " selected." : "Selection cleared.");
  }
  function toggleJob(id, on, focusId) {
    if (WIZ) { wizPick(id, on); return; }
    if (on) selectJob(id); else unselectJob(id);
    resetPicks();
    setError("sel", false); setError("note-other", false);
    renderSelected(); syncTree(); refresh();
    var n = selectedJobs().length;
    announce((on ? "Added " : "Removed ") + JOB[id].title + ". " + n + (n === 1 ? " job" : " jobs") + " selected.");
    if (focusId) { var f = $("#" + focusId); if (f) f.focus({ preventScroll: false }); }
  }

  function renderJobsStep() {
    if (WIZ) { syncTree(); return; }
    renderSelected(); syncTree();
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

  /* ---------- Wizard helpers ---------- */
  function committedIds() { return state.order.filter(function (id) { return state.jobs[id] && state.committed[id]; }); }
  function curJob() { return state.cur && state.jobs[state.cur] ? JOB[state.cur] : null; }
  function koFor(id) { return koItems().filter(function (k) { return k.job.id === id; })[0] || null; }
  function dropPending() {
    state.order.slice().forEach(function (id) { if (state.jobs[id] && !state.committed[id]) unselectJob(id); });
    if (state.cur && !state.committed[state.cur]) state.cur = null;
  }
  function backFor(s) {
    if (!WIZ) return BACK[s];
    if (s === "job") return committedIds().length ? "more" : "type";
    if (s === "details") return state.editing ? "more" : "job";
    if (s === "more") { var cj = curJob(); return cj ? (cj.ko.length ? "question" : "details") : "job"; }
    return BACK[s];
  }
  function wizTitles() {
    var cj = curJob(), n = Math.min(MAX_TASKS, committedIds().length + 1);
    TITLES.job = ["What needs fixing?", "Job " + n + " of up to " + MAX_TASKS + ". Pick one, then describe it next."];
    TITLES.details = [cj ? cj.title : "Tell us about the job", "Tell us what\u2019s going on. Photos are optional."];
    TITLES.question = ["One quick question", cj ? "About: " + cj.title : ""];
  }
  /* Deep links (and the "Jump to screen" panel) land on a sensible state when nothing has been picked yet */
  function wizEnter(screen) {
    if (screen === "type" || screen === "more" || screen === "check") dropPending();
    if (/^(details|question|more)$/.test(screen) && !selectedJobs().length) {
      var id = JOB["running-toilet"] ? "running-toilet" : JOBS[0].id;
      selectJob(id); state.cur = id; state.notes[id] = state.notes[id] || "Water keeps running after I flush.";
      if (screen === "more") { state.committed[id] = true; var kk = koFor(id); if (kk) state.ko[kk.key] = "yes"; }
    }
    if (/^(details|question)$/.test(screen) && !curJob()) state.cur = state.order.filter(function (i) { return state.jobs[i]; }).pop() || null;
    if (screen === "more" && !curJob()) state.cur = committedIds().pop() || null;
  }

  /* ---------- Derived ---------- */
  function selectedJobs() {
    return state.order.filter(function (id) { return state.jobs[id]; }).map(function (id) { return JOB[id]; });
  }
  function totalMin() { return selectedJobs().reduce(function (s, j) { return s + j.min; }, 0); }
  function overCount() { return !FIND && selectedJobs().length > MAX_TASKS; }
  function overLimit() { return overCount() || totalMin() > MAX_MIN; }
  function overReason() { return overCount() ? "count" : "time"; }
  /* Recommended booking length: what the picked jobs add up to, rounded up to a whole hour, 1 to 3 */
  function recommendedHours() { return Math.min(3, Math.max(1, Math.ceil(totalMin() / 60))); }
  function isBad(q) { return BAD[q].indexOf(state[q]) > -1; }
  /* Per-task knockout questions (placeholder copy): every question is worded so Yes is the right answer */
  function koItems() {
    var out = [];
    selectedJobs().forEach(function (jb) { (jb.ko || []).forEach(function (q, i) { out.push({ key: jb.id + "-" + i, job: jb, q: q }); }); });
    return out;
  }
  function koBad() { return koItems().filter(function (k) { return state.ko[k.key] === "no"; }); }
  function routedBy() { return Q.filter(isBad).concat(koBad().length ? ["ko"] : []); }
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
    meta.textContent = "Open times on " + longDate(d) + ". Visit length: " + hoursText(hours()) + ". Times are in Central Time.";
    box.innerHTML = slotsFor(state.date).map(function (s) {
      return '<label class="time"><input type="radio" name="slot" value="' + s + '"' + (state.time === s ? " checked" : "") + '>' +
        '<span>' + t12(s) + '</span><svg class="i" aria-hidden="true"><use href="#ri-check-line"/></svg></label>';
    }).join("");
  }

  /* ---------- Rendering: notes, status, CTA, summary ---------- */
  var lastOver = false;
  function updateOver() {
    var now = overLimit();
    ["#note-over-sel", "#note-over-more"].forEach(function (id) {
      var n = $(id); if (!n) return;
      n.hidden = !now;
      if (now) n.querySelector("span").innerHTML = overCount()
        ? "<strong>That’s more than 4 jobs.</strong> To book a time now, keep it to 4 jobs or fewer. Otherwise we’ll send this to our team as a service request, and you won’t need to enter anything else."
        : "<strong>That is more than a Fast Fix covers.</strong> We will send this to our team as a service request. You will not need to enter anything else.";
    });
    if (now !== lastOver) { lastOver = now; if (now) announce("That is more than a Fast Fix covers. We will send this to our team."); }
  }

  /* Step 3: the visit length (worked out from the tasks; members can not change it, so it is labelled as a fact, not a recommendation) */
  function updateRec() {
    var h = hours();
    $("#rec-value").textContent = hoursText(h);
    setText($(".rec__label"), "Visit length");
    $("#rec-meta").textContent = (FIND ? "Based on the jobs you selected. " : "Based on the tasks you chose. ") + "$" + RATE + " per hour, " + money(h * RATE) + " total.";
  }

  function updateChecksNotes() {
    var routed = routedBy().length > 0;
    Q.forEach(function (q) {
      $("#note-" + q).hidden = !isBad(q);
      $("#hint-" + q).textContent = (routed && !state[q] ? "Optional. " : "") + HINT[q];
    });
    koItems().forEach(function (k) { var n = $("#note-ko-" + k.key); if (n) n.hidden = state.ko[k.key] !== "no"; });
    var dk = Object.keys(state.dropped), rm = $("#ko-removed"), mr = $("#more-removed");
    var dtxt = dk.length ? "Removed " + dk.map(function (id) { return state.dropped[id]; }).join(", ") + ". After you book, we\u2019ll take you to a service request for " + (dk.length > 1 ? "them" : "it") + "." : "";
    if (rm) { rm.hidden = !dk.length || state.screen !== "check"; if (dk.length) setText(rm.lastChild, dtxt); }
    if (mr) { mr.hidden = !dk.length || state.screen !== "more"; if (dk.length) setText(mr.lastChild, dtxt); }
  }
  /* A task failed its knockout question: drop just that task, keep the rest, and point to a service request for it afterwards */
  function removeFailed(id) {
    var title = JOB[id].title, re = new RegExp("^" + id + "-\\d+$");
    Object.keys(state.ko).forEach(function (k) { if (re.test(k)) delete state.ko[k]; });
    unselectJob(id); state.dropped[id] = title; syncSr(); resetPicks();
    if (WIZ) {
      delete state.committed[id]; if (state.cur === id) state.cur = null;
      announce("Removed " + title + ". After you book, you can submit a service request for it.");
      navigate(committedIds().length ? "more" : "job"); return;
    }
    renderKo(); refresh();
    announce("Removed " + title + ". After you book, you can submit a service request for it.");
    var rm = $("#ko-removed"); if (rm) { rm.setAttribute("tabindex", "-1"); rm.focus(); }
  }
  /* Task-specific questions: one card per picked job, under its own heading, apart from the three overall questions */
  function koCard(k, noHead) {
    var card = el("div", "ko");
    if (!noHead) {
      var head = el("div", "ko__head"), tx = el("div", "ko__text");
      var hd = el("h3", "t-strong ko__job", k.job.title); hd.id = "ko-h-" + k.key;
      tx.appendChild(hd); tx.appendChild(el("p", "t-meta", k.job.groupTitle));
      head.appendChild(icon(k.job.icon)); head.appendChild(tx); card.appendChild(head);
    }
    var fs = el("fieldset"); fs.id = "fs-ko-" + k.key; fs.className = "ko__fs";
    var lg = el("legend", "t-strong", k.q);
    var opts = el("div", "opts opts--2 opts--stack");
    [["yes", "Yes"], ["no", "No"]].forEach(function (o) {
      var lab = el("label", "opt"), inp = el("input"); inp.type = "radio"; inp.name = "ko-" + k.key; inp.value = o[0]; inp.checked = state.ko[k.key] === o[0];
      var rd = el("span", "opt__radio"); rd.setAttribute("aria-hidden", "true");
      lab.appendChild(inp); lab.appendChild(rd); lab.appendChild(el("span", "opt__title", o[1]));
      opts.appendChild(lab);
    });
    var err = el("p", "error"); err.id = "err-ko-" + k.key; err.hidden = true; err.setAttribute("role", "alert");
    err.innerHTML = '<svg class="i"><use href="#ri-error-warning-fill"/></svg><span>Choose yes or no.</span>';
    var note = el("div", "note"); note.id = "note-ko-" + k.key; note.hidden = true; note.setAttribute("role", "status");
    note.innerHTML = '<svg class="i"><use href="#ri-information-line"/></svg><span></span>';
    var sp = note.lastChild, others = selectedJobs().length > 1;
    sp.appendChild(el("strong", "", k.job.title + " needs our team. "));
    if (others) {
      sp.appendChild(document.createTextNode("It can\u2019t be done as a Fast Fix. Remove it to keep booking your other jobs, and we\u2019ll point you to a service request for it afterwards. Or continue to send everything to our team. "));
      var rb = el("button", "link", WIZ ? "Remove this job and keep going" : "Remove this job and keep booking the others"); rb.type = "button"; rb.setAttribute("data-ko-remove", k.job.id);
      sp.appendChild(rb);
    } else {
      sp.appendChild(document.createTextNode("We will send this to our team as a service request. You will not need to enter anything again."));
      if (WIZ) { sp.appendChild(document.createTextNode(" ")); var cb = el("button", "link", "Pick a different job instead"); cb.type = "button"; cb.setAttribute("data-wiz-change", k.job.id); sp.appendChild(cb); }
    }
    fs.setAttribute("aria-describedby", (noHead ? "" : "ko-h-" + k.key + " ") + "err-ko-" + k.key);
    fs.appendChild(lg); fs.appendChild(opts); fs.appendChild(err); fs.appendChild(note);
    card.appendChild(fs);
    return card;
  }
  /* Task-specific questions: one card per picked job, under its own heading, apart from the three overall questions */
  function renderKo() {
    var box = $("#ko-box"), items = koItems();
    box.innerHTML = "";
    if (WIZ) { $("#ko-sec").hidden = true; $("#global-head").hidden = true; return; }   /* asked one job at a time instead */
    $("#ko-sec").hidden = items.length === 0;
    $("#global-head").hidden = items.length === 0;
    items.forEach(function (k) { box.appendChild(koCard(k)); });
  }

  /* ---------- Wizard screens ---------- */
  function renderDetails() {
    var jb = curJob(); if (!jb) return;
    var ta = $("#wnote"); ta.value = state.notes[jb.id] || ""; ta.placeholder = jb.ex; ta.setAttribute("data-note", jb.id);
    setError("wnote", false);
    redrawPhotos();
  }
  function renderWizQuestion() {
    var box = $("#wq-box"); box.innerHTML = "";
    var k = koFor(state.cur); if (k) box.appendChild(koCard(k, true));
  }
  function renderMore() {
    var list = $("#more-list"); list.innerHTML = "";
    var ids = committedIds();
    ids.forEach(function (id) {
      var jb = JOB[id], li = el("li", "pick"), top = el("div", "pick__top"), main = el("div", "pick__main"), acts = el("div", "pick__acts");
      main.appendChild(el("p", "pick__title", jb.title)); main.appendChild(el("p", "pick__group", jb.groupTitle));
      var note = (state.notes[id] || "").trim(); if (note) main.appendChild(el("p", "pick__note", note));
      var np = photosOf(id).length; if (np) main.appendChild(el("p", "pick__group", np + (np === 1 ? " photo" : " photos")));
      var ed = el("button", "link pick__remove", "Edit"); ed.type = "button"; ed.setAttribute("data-wiz-edit", id); ed.setAttribute("aria-label", "Edit " + jb.title);
      var rm = el("button", "link pick__remove", "Remove"); rm.type = "button"; rm.setAttribute("data-wiz-remove", id); rm.setAttribute("aria-label", "Remove " + jb.title);
      acts.appendChild(ed); acts.appendChild(rm);
      top.appendChild(icon(jb.icon)); top.appendChild(main); top.appendChild(acts); li.appendChild(top); list.appendChild(li);
    });
    var full = ids.length >= MAX_TASKS, over = overLimit();
    $("#more-add").setAttribute("aria-disabled", String(full || over));
    $("#more-cap").hidden = !(full && !over);
  }
  function wizNext() {
    var s = state.screen, jb;
    if (s === "job") {
      if (!curJob()) {
        setText($("#err-sel span"), "Pick a job to continue."); setError("sel", true); announce("Pick a job to continue.");
        $("#err-sel").scrollIntoView({ block: "center", behavior: REDUCED ? "auto" : "smooth" });
        $("#search").focus({ preventScroll: true });
        return true;
      }
      state.editing = false; navigate("details"); return true;
    }
    if (s === "details") {
      jb = curJob(); if (!jb) { navigate("job"); return true; }
      if ((state.notes[jb.id] || "").trim().length < 3) { setError("wnote", true); announce("Add a few words about this job."); $("#wnote").focus(); return true; }
      if (koFor(jb.id)) navigate("question"); else { state.committed[jb.id] = true; state.editing = false; navigate("more"); }
      return true;
    }
    if (s === "question") {
      var k = koFor(state.cur); if (!k) { navigate("more"); return true; }
      var a = state.ko[k.key];
      if (!a) { setError("ko-" + k.key, true); focusFirst("#fs-ko-" + k.key + " input"); return true; }
      if (a === "no") { state.reason = "ko"; navigate("sent"); return true; }
      state.committed[state.cur] = true; state.editing = false; navigate("more"); return true;
    }
    if (s === "more") {
      if (!committedIds().length) { navigate("job"); return true; }
      if (overLimit()) { state.reason = overReason(); navigate("sent"); return true; }
      navigate("check"); return true;
    }
    return false;
  }
  function wizAdd() {
    if ($("#more-add").getAttribute("aria-disabled") === "true") { announce(overLimit() ? "That is more than a Fast Fix covers." : "A Fast Fix covers up to " + MAX_TASKS + " jobs."); return; }
    state.cur = null; state.editing = false; navigate("job");
  }
  function wizRemove(id) {
    var title = JOB[id].title;
    unselectJob(id); delete state.committed[id]; if (state.cur === id) state.cur = null; resetPicks();
    if (!committedIds().length) { navigate("job"); announce("Removed " + title + ". Pick a job to start."); return; }
    renderMore(); refresh(); announce("Removed " + title + ".");
    var f = $("#more-add"); if (f) f.focus({ preventScroll: true });
  }

  function ctaFor(screen) {
    var n = selectedJobs().length;
    if (screen === "describe") return { label: "Continue", status: "" };
    if (WIZ && screen === "job") return { label: "Continue", status: curJob() ? curJob().title : "" };
    if (WIZ && screen === "details") return { label: "Continue", status: "" };
    if (WIZ && screen === "question") { var wk = koFor(state.cur); return { label: wk && state.ko[wk.key] === "no" ? "Send to our team" : "Continue", status: "" }; }
    if (WIZ && screen === "more") { var wc = committedIds().length; return { label: overLimit() ? "Send to our team" : "Continue", status: overLimit() ? "More than a Fast Fix covers" : wc + " of " + MAX_TASKS + " jobs" }; }
    if (screen === "job") {
      return {
        label: overLimit() ? "Send to our team" : "Continue",
        status: overLimit() ? "More than a Fast Fix covers" : n ? (FIND ? n + (n === 1 ? " job" : " jobs") + " selected" : n + " of " + MAX_TASKS + " jobs selected") : ""
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
      var slot = state.date && state.time !== null ? shortDate(parse(state.date)) + " · " + t12(state.time) : "Pick a date and a time";
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

    var jobs = selectedJobs(), showJobs = s !== "type" && s !== "describe" && jobs.length > 0;
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
      var np = photosOf(j.id).length;
      if (np) { var pn = document.createElement("span"); pn.className = "sum__jobnote"; pn.textContent = np + (np === 1 ? " photo" : " photos"); li.appendChild(pn); }
      list.appendChild(li);
    });

    var showWhen = (s === "time") && state.date && state.time !== null;
    $("#s-when-row").hidden = !showWhen;
    if (showWhen) {
      $("#s-when").textContent = shortDate(parse(state.date)) + " · " + t12(state.time);
      $("#s-hm").textContent = "with " + h.hm;
    }

    var ans = [];
    if (s === "sent") {
      Q.forEach(function (q) { if (state[q]) ans.push([QNAME[q], QLABEL[q][state[q]]]); });
      koItems().forEach(function (k) { if (state.ko[k.key]) ans.push([k.job.title, state.ko[k.key] === "yes" ? "Yes" : "No"]); });
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
    updateSrFlag();
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
    var host = id === "jobs" ? $("#fs-jobs") : id === "describe" ? $("#desc") : null;
    if (host) host.setAttribute("aria-describedby", (id === "jobs" ? "jobs-hint" : "desc-hint") + (on ? " err-" + id : ""));
  }
  function clearErrors(ids) { ids.forEach(function (id) { setError(id, false); }); }

  /* ---------- Navigation ---------- */
  function seedDemo(screen) {
    if (!selectedJobs().length) {
      var demo = ["toilet-run", "lock", "light-fixture"].filter(function (i) { return JOB[i]; });
      if (!demo.length) demo = ["running-toilet", "hang-pictures-or-wall-art", "change-light-bulbs-too-high-to-reach"].filter(function (i) { return JOB[i]; });
      demo.forEach(function (i) { selectJob(i); if (WIZ) state.committed[i] = true; state.notes[i] = state.notes[i] || "Demo note"; });
      state.hours = 0;
    }
    if (screen === "time" || screen === "booked") {
      state.ladder = state.ladder || "yes"; state.trade = state.trade || "yes"; state.part = state.part || "yes";
      koItems().forEach(function (k) { state.ko[k.key] = state.ko[k.key] || "yes"; });
    }
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
    if (WIZ) wizEnter(screen);
    if (/^(check|time)$/.test(screen) && selectedJobs().length && overLimit()) { state.reason = overReason(); navigate("sent"); return; }
    if (WIZ && screen === "question" && !koFor(state.cur)) { if (curJob()) state.committed[state.cur] = true; navigate("more"); return; }
    if (screen !== "type" && screen !== "describe" && screen !== "job" && !selectedJobs().length) seedDemo(screen);
    if (screen === "booked" && (!state.date || state.time === null)) seedDemo(screen);
    if (screen === "sent" && !state.reason) seedDemo(screen);
    state.screen = screen;
    body.setAttribute("data-screen", screen);

    SCREENS.forEach(function (s) { $('[data-screen-id="' + s + '"]').hidden = s !== screen; });
    if (WIZ) wizTitles();
    $("#h1").textContent = TITLES[screen][0];
    $("#sub").textContent = TITLES[screen][1];
    document.title = PAGE_TITLE[screen] + SUFFIX;

    /* stepper */
    var idx = (FIND ? ["describe", "job", "check", "time"] : ["job", "check", "time"]).indexOf(WIZ && /^(details|question|more)$/.test(screen) ? "job" : screen);
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
    $("[data-back-label]").textContent = backFor(screen) ? "Back" : "Back to dashboard";

    /* rail */
    $("#summary").hidden = screen === "booked";
    $("#hmcard").hidden = screen !== "booked";

    /* dock */
    updateDock();

    if (screen === "job") {
      renderJobsStep();
    }
    if (screen === "check") renderKo();
    if (screen === "details") renderDetails();
    if (screen === "question") renderWizQuestion();
    if (screen === "more") renderMore();
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
    if (screen === "sent") $("#sent-why").textContent = state.reason === "ko" && koBad().length ? koBad()[0].job.title + " can\u2019t be done as a Fast Fix, so our team will plan this visit." : (WHY[state.reason] || WHY.ladder);

    refresh();
    if (!firstRender) { window.scrollTo(0, 0); $("#h1").focus({ preventScroll: true }); }
    firstRender = false;
    $all("[data-jump]").forEach(function (b) { if (b.getAttribute("data-jump") === screen) b.setAttribute("aria-current", "true"); else b.removeAttribute("aria-current"); });
  }

  function fillBooked() {
    var h = HOMES[state.home], d = parse(state.date);
    $("#b-date").textContent = longDate(d);
    $("#b-time").textContent = t12(state.time) + " · Central Time";
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

  /* Describe-first, step 1: the description selects jobs. It is kept with the request, never shown again. */
  function describeNext() {
    var ta = $("#desc"), txt = ta.value.trim();
    if (txt.length < 3) {
      setError("describe", true);
      $("#err-describe").scrollIntoView({ block: "center", behavior: REDUCED ? "auto" : "smooth" });
      ta.focus({ preventScroll: true });
      return;
    }
    setError("describe", false);
    state.desc = state.desc ? state.desc + " " + txt : txt;
    state.msg = "";
    if (body.classList.contains("is-finderdown")) state.msg = "We couldn’t select jobs from your description. Search or browse below to add them.";
    else {
      var ids = matchText(txt);
      ids.forEach(selectJob);
      if (!ids.length && !selectedJobs().length) state.msg = "We couldn’t match your description to a job. Search or browse below to add some.";
    }
    resetPicks();
    ta.value = "";
    state.q = ""; $("#search").value = ""; state.sc = {};
    navigate("job");
  }
  /* Describe-first, step 2: Continue. Returns true when it handled the click (feedback shown, stay on the step). */
  function jobsNext() {
    if (!selectedJobs().length) {
      setError("sel", true);
      announce("Select at least one job.");
      $("#err-sel").scrollIntoView({ block: "center", behavior: REDUCED ? "auto" : "smooth" });
      $("#search").focus({ preventScroll: true });
      return true;
    }
    if (!FIND) {
      var miss = selectedJobs().filter(function (j) { return (state.notes[j.id] || "").trim().length < 3; });
      selectedJobs().forEach(function (j) { setError("note-" + j.id, miss.indexOf(j) > -1); });
      if (miss.length) {
        announce("Add a note for " + miss[0].title + (miss.length > 1 ? " and " + (miss.length - 1) + " more" : "") + ".");
        var box0 = $("#pnote-" + miss[0].id);
        box0.scrollIntoView({ block: "center", behavior: REDUCED ? "auto" : "smooth" });
        box0.focus({ preventScroll: true });
        return true;
      }
    }
    if (FIND && state.jobs.other && !(state.notes.other || "").trim()) {
      state.det.other = true; renderSelected();
      setError("note-other", true);
      $("#pnote-other").scrollIntoView({ block: "center", behavior: REDUCED ? "auto" : "smooth" });
      $("#pnote-other").focus({ preventScroll: true });
      return true;
    }
    return false;
  }

  function next() {
    var s = state.screen;
    if (WIZ && wizNext()) return;
    if (s === "describe") { describeNext(); return; }
    if (s === "job") {
      if (jobsNext()) return;
      if (overLimit()) { state.reason = overReason(); navigate("sent"); return; }
      navigate("check");
      return;
    }
    if (s === "check") {
      var bad2 = [];
      /* Once an answer sends the request to the team, the other questions stop blocking */
      if (routedBy().length === 0) {
        Q.forEach(function (q) { if (!state[q]) bad2.push(q); });
        koItems().forEach(function (k) { if (!state.ko[k.key]) bad2.push("ko-" + k.key); });
      }
      Q.forEach(function (q) { setError(q, bad2.indexOf(q) > -1); });
      koItems().forEach(function (k) { setError("ko-" + k.key, bad2.indexOf("ko-" + k.key) > -1); });
      if (bad2.length) { focusFirst(/^ko-/.test(bad2[0]) ? "#fs-" + bad2[0] + " input" : "#" + bad2[0] + "-opts input"); return; }
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
        var gone = t12(state.time);
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

    {
      var dt = t.closest("[data-details-toggle]");
      if (dt) { toggleDetails(dt.getAttribute("data-details-toggle")); return; }
      var gb = t.closest("[data-grp]");
      if (gb) {
        var gid = gb.getAttribute("data-grp");
        if (state.q.trim()) state.sc[gid] = !state.sc[gid];
        else {
          var willOpen = !state.open[gid];
          /* on a phone only one group is open at a time, so the page never grows without limit */
          if (willOpen && !FIND && $(".app").getBoundingClientRect().width < 768) state.open = {};
          state.open[gid] = willOpen;
        }
        syncTree();
        if (state.open[gid] && !FIND && $(".app").getBoundingClientRect().width < 768) gb.scrollIntoView({ block: "start", behavior: REDUCED ? "auto" : "smooth" });
        return;
      }
      if (t.closest("[data-sr-link]")) { srAction(); return; }
      var wa = t.closest("[data-wiz-add]"); if (wa) { wizAdd(); return; }
      var we = t.closest("[data-wiz-edit]"); if (we) { state.cur = we.getAttribute("data-wiz-edit"); state.editing = true; navigate("details"); return; }
      var wr = t.closest("[data-wiz-remove]"); if (wr) { wizRemove(wr.getAttribute("data-wiz-remove")); return; }
      var wc2 = t.closest("[data-wiz-change]"); if (wc2) { var wid = wc2.getAttribute("data-wiz-change"); unselectJob(wid); delete state.committed[wid]; if (state.cur === wid) state.cur = null; resetPicks(); navigate("job"); return; }
      var pa = t.closest("[data-photo-add]"); if (pa) { var pi = $("#photo-in-" + pa.getAttribute("data-photo-add")); if (pi) pi.click(); return; }
      var pr = t.closest("[data-photo-rm]"); if (pr) { var pp = pr.getAttribute("data-photo-rm").split(":"); removePhoto(pp[0], +pp[1]); return; }
      var kr = t.closest("[data-ko-remove]"); if (kr) { removeFailed(kr.getAttribute("data-ko-remove")); return; }
      if (t.closest("[data-sr-confirm]")) { state.srModal = true; syncSr(); closeModal(); updateSrFlag(); announce("After you book, you can submit a service request for your other job."); return; }
      if (t.closest("[data-sr-undo]")) { state.srModal = false; state.dropped = {}; syncSr(); updateSrFlag(); return; }
      if (t.closest("[data-modal-close]")) { closeModal(); return; }
      if (t.closest("#search-clear")) { state.q = ""; state.sc = {}; $("#search").value = ""; syncTree(); $("#search").focus(); return; }
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
      var to = backFor(state.screen);
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
    if (el.hasAttribute && el.hasAttribute("data-photo-in")) { addPhotos(el.getAttribute("data-photo-in"), el.files); return; }
    if (el.name === "jobs") { toggleJob(el.value, el.checked); return; }
    else if (Q.indexOf(el.name) > -1) { state[el.name] = el.value; setError(el.name, false); }
    else if (/^ko-/.test(el.name)) { state.ko[el.name.slice(3)] = el.value; setError(el.name, false); }
    else if (el.name === "slot") { state.time = +el.value; setError("time", false); }
    else if (el.hasAttribute("data-state-switch")) {
      var name = el.getAttribute("data-state-switch");
      applySwitch(name, el.checked);
      if (name === "noslots" && state.screen === "time") render("time");

    }
    refresh();
  });

  document.addEventListener("input", function (e) {
    if (e.target.id === "search") { state.q = e.target.value; state.sc = {}; syncTree(); return; }
    if (FIND && e.target.id === "desc") { if (e.target.value.trim().length >= 3) setError("describe", false); return; }
    var id = e.target.getAttribute && e.target.getAttribute("data-note");
    if (id) { state.notes[id] = e.target.value; if (e.target.value.trim()) setError("note-" + id, false); if (WIZ && e.target.id === "wnote" && e.target.value.trim().length >= 3) setError("wnote", false); refresh(); }
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { closeMenus(); if (!$("#sr-modal").hidden) closeModal(); }
    if (e.key === "Tab" && !$("#sr-modal").hidden) {
      var mb = modalEls(), first = mb[0], last = mb[mb.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
    if (FIND && e.target.id === "desc" && e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); describeNext(); }
    if (e.target.id === "search" && e.key === "Escape" && state.q) { state.q = ""; state.sc = {}; e.target.value = ""; syncTree(); }
    if (e.target.id === "search" && e.key === "Enter") e.preventDefault();
  });
  window.addEventListener("hashchange", function () { render(fromHash()); });

  /* ---------- Init ---------- */
  compileMatch(); buildTree();
  if (FIND) {
    $all(".step__n").forEach(function (n, i) { n.textContent = String(i + 1); });
    setText($('.step[data-step="job"] .step__t'), "Your jobs");
    $('[data-go="job"]').setAttribute("data-go", "describe");
    $('[data-go="describe"]').setAttribute("href", "#/describe");
  } else {
    /* Pick-it-yourself order: search and groups first, the selected jobs (with optional details) below them */
    $(".step.finder-only").remove();
    $("#pick-ui").appendChild($("#sel-sec"));
    setText($("#add-title label"), WIZ ? "Pick a job" : "Find your jobs");
    setText($("#search-hint"), WIZ ? "Search by job or category, or open a category. Pick one." : "Search by job or category, or open a category. You can pick up to 4.");
    if (WIZ) setText($('.step[data-step="job"] .step__t'), "Your jobs");
  }
  applySwitch("multi", true);
  render(fromHash());
})();
