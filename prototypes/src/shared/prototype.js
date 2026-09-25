/* HomeHub prototype interactions. In-page only: links to other pages do nothing. */
(function () {
  "use strict";

  var body = document.body;

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  /* Toast */
  var toastTimer;
  function toast(message) {
    var el = $("#toast");
    if (!el) return;
    $("[data-toast-text]", el).textContent = message;
    el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.hidden = true; }, 2800);
  }

  /* Disclosure: <button data-toggle="id" data-open="Hide" data-closed="Show"> */
  function setDisclosure(btn, open) {
    var target = document.getElementById(btn.getAttribute("data-toggle"));
    if (!target) return;
    btn.setAttribute("aria-expanded", String(open));
    target.hidden = !open;
    var label = $("[data-label]", btn);
    if (label && btn.hasAttribute("data-open")) {
      label.textContent = open ? btn.getAttribute("data-open") : btn.getAttribute("data-closed");
    }
  }

  /* Menus: <button data-menu="id"> */
  function closeMenus(except) {
    $all("[data-menu]").forEach(function (btn) {
      var menu = document.getElementById(btn.getAttribute("data-menu"));
      if (menu && menu !== except) { menu.hidden = true; btn.setAttribute("aria-expanded", "false"); }
    });
  }

  /* Home switcher */
  function selectHome(id) {
    var item = $('[data-home="' + id + '"]');
    if (!item) return;
    $all("[data-home]").forEach(function (el) { el.setAttribute("aria-checked", String(el === item)); });
    var address = item.getAttribute("data-address");
    $all("[data-home-label]").forEach(function (el) { el.textContent = address; });
    closeMenus();
    if (id !== "mueller") toast("Prototype: sample data is the same for every home");
  }

  function isShown(el) { return el.getClientRects().length > 0; }

  /* Visible counts: <span data-count-visible=".selector"> */
  function updateVisibleCounts() {
    $all("[data-count-visible]").forEach(function (el) {
      var n = $all(el.getAttribute("data-count-visible")).filter(isShown).length;
      el.textContent = n;
      el.hidden = n === 0;
    });
  }

  /* Carousels: horizontal scroll with pager dots and "1 of N" (ref: plan pager) */
  function refreshCarousel(root) {
    var track = $("[data-carousel-track]", root);
    var dots = $("[data-carousel-dots]", root);
    var caption = $("[data-carousel-caption]", root);
    if (!track) return;
    var items = Array.prototype.slice.call(track.children).filter(isShown);
    var n = items.length;
    var index = 0;
    var best = Infinity;
    items.forEach(function (item, i) {
      var d = Math.abs(item.offsetLeft - track.offsetLeft - track.scrollLeft - parseFloat(getComputedStyle(track).paddingLeft || 0));
      if (d < best) { best = d; index = i; }
    });
    if (dots) {
      if (dots.children.length !== n) {
        dots.innerHTML = "";
        for (var i = 0; i < n; i++) dots.appendChild(document.createElement("span"));
      }
      Array.prototype.forEach.call(dots.children, function (dot, i) { dot.classList.toggle("is-active", i === index); });
    }
    if (caption) caption.textContent = (index + 1) + " of " + n;
  }
  function refreshCarousels() { $all("[data-carousel]").forEach(refreshCarousel); }
  $all("[data-carousel-track]").forEach(function (track) {
    track.addEventListener("scroll", function () { refreshCarousel(track.closest("[data-carousel]")); }, { passive: true });
  });
  window.addEventListener("resize", refreshCarousels);

  function refreshAll() { updateVisibleCounts(); refreshCarousels(); }

  /* Recommendations */
  function updateRecCounts() {
    var open = $all(".rec").filter(function (r) { return r.getAttribute("data-state") === "open" || r.getAttribute("data-state") === "declining"; }).length;
    $all("[data-rec-open-count]").forEach(function (el) { el.textContent = open; });
    $all("[data-rec-sum]").forEach(function (el) {
      var p = el.getAttribute("data-rec-sum");
      var n = $all('.rec[data-priority="' + p + '"]').filter(function (r) {
        var st = r.getAttribute("data-state");
        return st === "open" || st === "declining";
      }).length;
      el.textContent = n + " " + el.getAttribute("data-word");
      el.hidden = n === 0;
    });
    $all("[data-rec-nav-count]").forEach(function (el) { el.textContent = open; el.hidden = open === 0; });
    $all("[data-rec-mirror]").forEach(function (el) {
      var rec = $('.rec[data-title="' + el.getAttribute("data-rec-mirror") + '"]');
      var st = rec ? rec.getAttribute("data-state") : "open";
      el.hidden = !(st === "open" || st === "declining");
    });
    var selected = $all("[data-rec-select]").filter(function (c) {
      var rec = c.closest(".rec");
      return c.checked && rec && rec.getAttribute("data-state") === "open";
    }).length;
    $all("[data-rec-submit-selected]").forEach(function (btn) {
      btn.disabled = selected === 0;
      $("[data-label]", btn).textContent = selected > 0 ? "Submit selected (" + selected + ")" : "Submit selected";
    });
    refreshAll();
  }

  function setRecState(rec, state, note) {
    rec.setAttribute("data-state", state);
    if (note) $("[data-rec-note]", rec).textContent = note;
    if (state !== "open") {
      var box = $("[data-rec-select]", rec);
      if (box) box.checked = false;
    }
    updateRecCounts();
  }

  /* Prototype state switches */
  function applyState(name, on) {
    body.classList.toggle("is-" + name, on);
    $all('[data-state-switch="' + name + '"]').forEach(function (input) { input.checked = on; });
    refreshAll();
  }

  document.addEventListener("click", function (e) {
    var target = e.target;

    var dead = target.closest('a[href="#"]');
    if (dead) e.preventDefault();

    var toggle = target.closest("[data-toggle]");
    if (toggle) {
      setDisclosure(toggle, toggle.getAttribute("aria-expanded") !== "true");
      return;
    }

    var menuBtn = target.closest("[data-menu]");
    if (menuBtn) {
      var menu = document.getElementById(menuBtn.getAttribute("data-menu"));
      var willOpen = menu.hidden;
      closeMenus(menu);
      menu.hidden = !willOpen;
      menuBtn.setAttribute("aria-expanded", String(willOpen));
      return;
    }

    var home = target.closest("[data-home]");
    if (home) { selectHome(home.getAttribute("data-home")); return; }

    var switchHome = target.closest("[data-switch-home]");
    if (switchHome) { selectHome(switchHome.getAttribute("data-switch-home")); window.scrollTo({ top: 0, behavior: "smooth" }); return; }

    var dismiss = target.closest("[data-dismiss]");
    if (dismiss) { applyState(dismiss.getAttribute("data-dismiss"), false); return; }

    var rec = target.closest(".rec");
    if (rec) {
      var title = rec.getAttribute("data-title");
      if (target.closest("[data-rec-submit]")) {
        setRecState(rec, "submitted", "Sent to PreFix. We’ll contact you to schedule “" + title + "”.");
        return;
      }
      if (target.closest("[data-rec-decline]")) { setRecState(rec, "declining"); return; }
      if (target.closest("[data-rec-cancel-decline]")) { setRecState(rec, "open"); return; }
      var reason = target.closest("[data-reason]");
      if (reason) {
        setRecState(rec, "declined", "Declined: " + reason.getAttribute("data-reason") + ". You can reopen it anytime in Recommendations.");
        return;
      }
      if (target.closest("[data-rec-undo]")) { setRecState(rec, "open"); return; }
    }

    if (target.closest("[data-rec-submit-selected]")) {
      var picked = $all("[data-rec-select]").filter(function (c) { return c.checked; });
      picked.forEach(function (c) {
        var r = c.closest(".rec");
        setRecState(r, "submitted", "Sent to PreFix. We’ll contact you to schedule “" + r.getAttribute("data-title") + "”.");
      });
      toast(picked.length + (picked.length === 1 ? " recommendation" : " recommendations") + " sent to PreFix");
      return;
    }

    var filter = target.closest("[data-filter]");
    if (filter) {
      var group = filter.closest("[data-filter-group]");
      var kind = filter.getAttribute("data-filter");
      $all("[data-filter]", group).forEach(function (b) { b.setAttribute("aria-pressed", String(b === filter)); });
      $all("[data-kind]").forEach(function (item) {
        item.classList.toggle("is-filtered", kind !== "all" && item.getAttribute("data-kind") !== kind);
      });
      $all("[data-tl-section]").forEach(function (section) {
        var any = $all("[data-kind]", section).some(function (item) { return !item.classList.contains("is-filtered"); });
        section.classList.toggle("is-filtered", !any);
      });
      return;
    }

    var problem = target.closest("[data-problem]");
    if (problem) {
      var box = problem.closest(".problem");
      $(".problem__ask", box).hidden = true;
      $("[data-problem-note]", box).textContent = "Thanks. We\u2019ve told the team \u201c" + problem.textContent.trim() + "\u201d and will get back to you within 2 business hours.";
      $(".problem__done", box).hidden = false;
      return;
    }

    var protoToggle = target.closest("[data-proto-toggle]");
    if (protoToggle) {
      var panel = $("[data-proto-panel]");
      panel.hidden = !panel.hidden;
      protoToggle.setAttribute("aria-expanded", String(!panel.hidden));
      return;
    }

    if (!target.closest(".menu")) closeMenus();
  });

  document.addEventListener("change", function (e) {
    var stage = e.target.closest("[data-stage-radio]");
    if (stage) {
      var prev = (body.className.match(/\bstage-([a-z]+)/) || [])[1];
      ["active", "new", "payment", "renewal"].forEach(function (s) { body.classList.remove("stage-" + s); });
      body.classList.add("stage-" + stage.value);
      if (stage.value === "payment") applyState("payment", true);
      else if (prev === "payment") applyState("payment", false);
      refreshAll();
      window.scrollTo({ top: 0, behavior: "smooth" });
      toast("Dashboard reordered for: " + stage.nextElementSibling.textContent);
      return;
    }
    var sw = e.target.closest("[data-state-switch]");
    if (sw) { applyState(sw.getAttribute("data-state-switch"), sw.checked); return; }
    if (e.target.closest("[data-rec-select]")) updateRecCounts();
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeMenus();
  });

  updateRecCounts();
})();
