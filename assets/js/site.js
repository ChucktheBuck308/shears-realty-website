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

  /* ---- hero background: slow topographic contours (noise-based) ----
     Faint brass survey-map lines that drift. Behind the hero only,
     non-interactive. Reduced-motion draws a single static frame. No deps. */
  (function contourHero() {
    var canvas = document.getElementById('fractal');
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext('2d');
    var host = canvas.parentElement;
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var w = 0, h = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
    var STEP = 26;                 // grid cell size (css px)
    var LEVELS = [0.12, 0.24, 0.36, 0.48, 0.60, 0.72, 0.84];
    var BRASS = '168,128,44';     // --brass rgb

    function resize() {
      w = host.clientWidth; h = host.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    // cheap hash-based value noise + 2 octaves of fbm
    function hash(x, y) {
      var n = (x * 374761393 + y * 668265263) | 0;
      n = (n ^ (n >> 13)) * 1274126177 | 0;
      return ((n ^ (n >> 16)) >>> 0) / 4294967295;
    }
    function vnoise(x, y) {
      var xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
      var u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
      var a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1);
      return (a * (1 - u) + b * u) * (1 - v) + (c * (1 - u) + d * u) * v;
    }
    function field(x, y, t) {
      var s = 0.010;
      return vnoise(x * s + t, y * s - t * 0.5) * 0.65
           + vnoise(x * s * 2.3 + 5.2, y * s * 2.3 + t * 0.3) * 0.35;
    }

    function lerp(a, b, t) { return a + (b - a) * t; }

    function draw(t) {
      ctx.clearRect(0, 0, w, h);
      ctx.lineWidth = 1;
      var cols = Math.ceil(w / STEP) + 1, rows = Math.ceil(h / STEP) + 1;
      var i, j, li, x0, y0, x1, y1, va, vb, vc, vd, L, idx, seg;
      for (li = 0; li < LEVELS.length; li++) {
        L = LEVELS[li];
        ctx.strokeStyle = 'rgba(' + BRASS + ',' + (0.055 + li * 0.014).toFixed(3) + ')';
        ctx.beginPath();
        for (j = 0; j < rows; j++) {
          for (i = 0; i < cols; i++) {
            x0 = i * STEP; y0 = j * STEP; x1 = x0 + STEP; y1 = y0 + STEP;
            va = field(x0, y0, t); vb = field(x1, y0, t);
            vc = field(x1, y1, t); vd = field(x0, y1, t);
            idx = (va > L ? 1 : 0) | (vb > L ? 2 : 0) | (vc > L ? 4 : 0) | (vd > L ? 8 : 0);
            if (idx === 0 || idx === 15) continue;
            // edge crossing points (top, right, bottom, left)
            var T = [x0 + STEP * (L - va) / (vb - va), y0];
            var R = [x1, y0 + STEP * (L - vb) / (vc - vb)];
            var B = [x0 + STEP * (L - vd) / (vc - vd), y1];
            var Lf = [x0, y0 + STEP * (L - va) / (vd - va)];
            seg = MS[idx];
            for (var k = 0; k < seg.length; k += 2) {
              var p = [T, R, B, Lf][seg[k]], q = [T, R, B, Lf][seg[k + 1]];
              ctx.moveTo(p[0], p[1]); ctx.lineTo(q[0], q[1]);
            }
          }
        }
        ctx.stroke();
      }
    }
    // marching-squares segment table (edge indices: 0=T 1=R 2=B 3=L)
    var MS = {
      1: [0, 3], 2: [0, 1], 3: [1, 3], 4: [1, 2], 5: [0, 1, 2, 3], 6: [0, 2],
      7: [2, 3], 8: [2, 3], 9: [0, 2], 10: [0, 3, 1, 2], 11: [1, 2],
      12: [1, 3], 13: [0, 1], 14: [0, 3]
    };

    var t = 0, raf = 0, last = 0;
    function loop(now) {
      raf = requestAnimationFrame(loop);
      if (now - last < 60) return;   // ~16fps, plenty for a slow drift
      last = now; t += 0.0016;
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
