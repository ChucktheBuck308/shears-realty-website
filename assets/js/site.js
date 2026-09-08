/* Shears Realty LLC — minimal progressive enhancement.
   Nothing here is required for the page to work; it degrades cleanly. */
(function () {
  'use strict';

  /* ---- mobile nav ---- */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('primary-nav');

  if (toggle && nav) {
    var setOpen = function (open) {
      nav.setAttribute('data-open', String(open));
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    };

    toggle.addEventListener('click', function () {
      setOpen(nav.getAttribute('data-open') !== 'true');
    });

    // close on link tap / escape / resize to desktop
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setOpen(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') setOpen(false);
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 860) setOpen(false);
    });
  }

  /* ---- footer year ---- */
  var y = document.querySelector('[data-year]');
  if (y) y.textContent = new Date().getFullYear();
})();
