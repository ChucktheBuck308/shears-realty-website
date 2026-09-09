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

  /* ---- hero background: a slow recursive tree (fractal) ----
     Faint, behind the hero only, non-interactive. Honours reduced-motion by
     drawing a single static frame. Pure canvas, no dependencies. */
  (function fractalHero() {
    var canvas = document.getElementById('fractal');
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext('2d');
    var host = canvas.parentElement;
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var w = 0, h = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
    var GOLD = 'rgba(185,138,52,'; // --brass, alpha appended per branch

    function resize() {
      w = host.clientWidth; h = host.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function branch(x, y, len, ang, depth, sway) {
      if (depth === 0 || len < 3) return;
      var x2 = x + Math.cos(ang) * len;
      var y2 = y + Math.sin(ang) * len;
      ctx.strokeStyle = GOLD + (0.06 + depth * 0.012).toFixed(3) + ')';
      ctx.lineWidth = Math.max(depth * 0.5, 0.6);
      ctx.beginPath();
      ctx.moveTo(x, y); ctx.lineTo(x2, y2); ctx.stroke();
      var spread = 0.42 + Math.sin(sway + depth) * 0.09;
      branch(x2, y2, len * 0.76, ang - spread, depth - 1, sway);
      branch(x2, y2, len * 0.76, ang + spread * 0.82, depth - 1, sway);
      if (depth % 2 === 0) branch(x2, y2, len * 0.5, ang + Math.sin(sway) * 0.15, depth - 2, sway);
    }

    function draw(sway) {
      ctx.clearRect(0, 0, w, h);
      var baseLen = Math.min(h, 620) * 0.20;
      branch(w * 0.5, h + 6, baseLen, -Math.PI / 2 + Math.sin(sway) * 0.05, 10, sway);
      branch(w * 0.14, h + 6, baseLen * 0.7, -Math.PI / 2 - 0.2 + Math.sin(sway * 1.3) * 0.06, 8, sway * 1.3);
      branch(w * 0.86, h + 6, baseLen * 0.7, -Math.PI / 2 + 0.2 + Math.sin(sway * 0.8) * 0.06, 8, sway * 0.8);
    }

    var t = 0, raf = 0, last = 0;
    function loop(now) {
      raf = requestAnimationFrame(loop);
      if (now - last < 66) return;      // ~15fps is plenty for a faint sway
      last = now; t += 0.006;
      draw(t);
    }

    resize();
    draw(0);
    canvas.classList.add('is-on');
    if (!reduce) raf = requestAnimationFrame(loop);

    var rt;
    window.addEventListener('resize', function () {
      clearTimeout(rt);
      rt = setTimeout(function () { resize(); draw(t); }, 150);
    });
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) { cancelAnimationFrame(raf); raf = 0; }
      else if (!reduce && !raf) { last = 0; raf = requestAnimationFrame(loop); }
    });
  })();

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
