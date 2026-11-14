/* Ruff-N-Fluff — review preview behavior */
(function () {
  "use strict";
  var root = document.documentElement;

  /* Widow guard: keeps the last two words of each text block together,
     so no line ends with a single word at any screen width. Wording is unchanged. */
  Array.prototype.forEach.call(
    document.querySelectorAll("h1, h2, h3, p, li, figcaption, summary, dd, .facts span"),
    function (el) {
      if (el.querySelector(".btn")) return; // leave button rows alone
      // Map the element's full text to its text nodes, then join the final two words.
      var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null), node, map = [], text = "";
      while ((node = walker.nextNode())) { map.push([node, text.length]); text += node.data; }
      var trimmed = text.replace(/\s+$/, ""), i = trimmed.search(/\s\S*$/);
      if (i < 1 || !/\S\s*\S/.test(trimmed.slice(0, i + 1) + "x")) return;
      for (var k = map.length - 1; k >= 0; k--) {
        if (map[k][1] <= i) {
          var n = map[k][0], j = i - map[k][1];
          n.data = n.data.slice(0, j) + "\u00A0" + n.data.slice(j + 1);
          break;
        }
      }
    }
  );

  /* Mobile menu */
  var toggle = document.querySelector("[data-menu-toggle]");
  var nav = document.querySelector("[data-nav]");
  function closeMenu() {
    nav.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  }
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) closeMenu();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) {
        closeMenu();
        toggle.focus();
      }
    });
  }

  /* Header border once the page scrolls */
  var header = document.querySelector("[data-header]");
  function onScroll() {
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 8);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* Review notes: hidden for visitors. Add ?review to the address to see them
     (for example www.ruff-n-fluff.com/?review), with a button to switch them off. */
  var reviewBtn = document.querySelector("[data-review-toggle]");
  if (/[?&]review\b/.test(location.search)) {
    root.classList.add("is-review");
    root.classList.add("review-mode");
  }
  if (reviewBtn) {
    reviewBtn.addEventListener("click", function () {
      var on = !root.classList.contains("is-review");
      root.classList.toggle("is-review", on);
      reviewBtn.setAttribute("aria-pressed", String(on));
      reviewBtn.textContent = "Review notes: " + (on ? "On" : "Off");
    });
  }

  /* Appointment form: validation + honest preview message.
     No submission service is connected, so nothing is sent. */
  var form = document.querySelector("[data-form]");
  var status = document.querySelector("[data-form-status]");
  if (form) {
    var required = Array.prototype.slice.call(form.querySelectorAll("[required]"));

    function check(field) {
      var ok = field.value.trim() !== "";
      var err = document.getElementById(field.id + "-error");
      field.setAttribute("aria-invalid", ok ? "false" : "true");
      if (err) err.hidden = ok;
      return ok;
    }

    required.forEach(function (field) {
      field.addEventListener("blur", function () {
        if (field.getAttribute("aria-invalid") === "true") check(field);
      });
      field.addEventListener("input", function () {
        if (field.getAttribute("aria-invalid") === "true") check(field);
      });
    });

    /* Fields stay gray until someone tries to send the form with required fields empty.
       Arriving at the form from any Request an Appointment link starts it fresh. */
    function resetFields() {
      required.forEach(function (field) {
        field.removeAttribute("aria-invalid");
        var err = document.getElementById(field.id + "-error");
        if (err) err.hidden = true;
      });
      if (status) status.hidden = true;
    }
    document.querySelectorAll('a[href="#contact"]').forEach(function (link) {
      link.addEventListener("click", resetFields);
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var firstInvalid = null;
      required.forEach(function (field) {
        if (!check(field) && !firstInvalid) firstInvalid = field;
      });
      if (firstInvalid) {
        status.hidden = true;
        firstInvalid.focus();
        return;
      }
      /* Build an email to Julie from the form and open the visitor's email app. */
      var to = form.getAttribute("data-mailto");
      var val = function (id) { var el = document.getElementById(id); return el ? el.value.trim() : ""; };
      var lines = [
        "Owner: " + val("owner-name"),
        "Phone or email: " + val("contact-pref"),
        "Pet’s name: " + val("pet-name"),
        "Species and breed: " + val("pet-breed"),
        "Size or weight: " + val("pet-size"),
        "Requested service: " + val("service"),
        "Preferred days and times: " + val("availability"),
        "Coat, behavior, or care notes: " + val("notes")
      ];
      var subject = "sPAWtime request for " + val("pet-name");
      window.location.href = "mailto:" + to + "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(lines.join("\n"));
      status.innerHTML =
        "<p><strong>Almost there.</strong> Your email app should open with your request ready to send. " +
        "Press Send to share it with Julie. If your email app does not open, email " +
        "<a href=\"mailto:" + to + "\">" + to + "</a> or text <a href=\"sms:+12085857374\">(208) 585-7374</a>.</p>";
      status.hidden = false;
    });
  }

  /* FAQs: one answer open at a time (backup for browsers without <details name>) */
  var faqs = Array.prototype.slice.call(document.querySelectorAll(".faq-list details"));
  faqs.forEach(function (d) {
    d.addEventListener("toggle", function () {
      if (!d.open) return;
      faqs.forEach(function (o) { if (o !== d && o.open) o.open = false; });
    });
  });

  /* Footer Call/Text button: Text, Call, or Cancel */
  var menu = document.querySelector("[data-call-menu]");
  if (menu) {
    var btn = menu.querySelector("[data-call-toggle]");
    var opts = menu.querySelector(".call-options");
    var setOpen = function (open) {
      opts.hidden = !open;
      btn.setAttribute("aria-expanded", String(open));
      if (open) opts.querySelector("a").focus();
    };
    btn.addEventListener("click", function () { setOpen(opts.hidden); });
    menu.querySelector("[data-call-cancel]").addEventListener("click", function () { setOpen(false); btn.focus(); });
    opts.addEventListener("click", function (e) { if (e.target.closest("a")) setOpen(false); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !opts.hidden) { setOpen(false); btn.focus(); }
    });
    document.addEventListener("click", function (e) { if (!menu.contains(e.target)) setOpen(false); });
  }

  /* Footer year */
  var year = document.querySelector("[data-year]");
  if (year) year.textContent = new Date().getFullYear();
})();
