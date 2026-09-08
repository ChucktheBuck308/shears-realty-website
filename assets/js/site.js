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

  /* ---- contact form: mailto fallback until Formspree is configured ----
     When contact.html still has the placeholder action (YOUR_FORM_ID), a submit
     opens a pre-filled email instead of posting to a dead endpoint. Once a real
     Formspree ID is pasted in, this check fails and Formspree handles it. */
  var form = document.querySelector('form.form-card');
  if (form && /YOUR_FORM_ID/.test(form.getAttribute('action') || '')) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var val = function (n) { var el = form.elements[n]; return el && el.value ? el.value.trim() : ''; };
      var picked = form.querySelector('input[name="reason"]:checked');
      var body = [
        'Name: ' + val('name'),
        'Phone: ' + val('phone'),
        'Email: ' + val('email'),
        'About: ' + (picked ? picked.value : ''),
        '',
        val('message')
      ].join('\n');
      window.location.href = 'mailto:charlie@shearsrealty.com'
        + '?subject=' + encodeURIComponent('Website enquiry — ' + (val('name') || 'no name'))
        + '&body=' + encodeURIComponent(body);
    });
  }
})();
