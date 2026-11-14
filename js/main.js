/* Ruff-N-Fluff — review preview behavior */
(function () {
  "use strict";
  var root = document.documentElement;

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

  /* Review notes toggle (preview only; remove before launch) */
  var reviewBtn = document.querySelector("[data-review-toggle]");
  function setReview(on) {
    root.classList.toggle("is-review", on);
    if (reviewBtn) {
      reviewBtn.setAttribute("aria-pressed", String(on));
      reviewBtn.textContent = "Review notes: " + (on ? "On" : "Off");
    }
    try { localStorage.setItem("rnf-review", on ? "1" : "0"); } catch (err) { /* storage unavailable */ }
  }
  try {
    if (localStorage.getItem("rnf-review") === "0") setReview(false);
  } catch (err) { /* storage unavailable */ }
  if (reviewBtn) {
    reviewBtn.addEventListener("click", function () {
      setReview(!root.classList.contains("is-review"));
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
      status.innerHTML =
        "<p><strong>Preview only:</strong> this form is not connected to a delivery service yet, so the request was not sent. " +
        "Once Julie’s booking method is confirmed, this message will be replaced with the real confirmation text.</p>";
      status.hidden = false;
    });
  }

  /* Footer year */
  var year = document.querySelector("[data-year]");
  if (year) year.textContent = new Date().getFullYear();
})();
