// =========================================================
// ZEFIRO — redesign (local only)
// Every block is independent and guards its own elements.
// =========================================================

(function () {
  'use strict';

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ── 1. hero water ────────────────────────────────────────
  // Stacked sine waves on canvas: cheap, and it reads as moving
  // water without the weight of a video.
  const canvas = document.querySelector('[data-waves]');
  if (canvas && !reduced) {
    const ctx = canvas.getContext('2d');
    let w = 0, h = 0, raf = null, t = 0;

    const LAYERS = [
      { amp: 26, len: 0.0045, speed: 0.0022, y: 0.62, alpha: 0.30, width: 1.4 },
      { amp: 18, len: 0.0065, speed: 0.0031, y: 0.68, alpha: 0.20, width: 1.1 },
      { amp: 34, len: 0.0030, speed: 0.0014, y: 0.74, alpha: 0.14, width: 1.8 },
      { amp: 12, len: 0.0090, speed: 0.0042, y: 0.80, alpha: 0.10, width: 0.9 }
    ];

    function size() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function frame() {
      ctx.clearRect(0, 0, w, h);
      t += 1;

      LAYERS.forEach(function (L) {
        ctx.beginPath();
        ctx.lineWidth = L.width;
        ctx.strokeStyle = 'rgba(111, 227, 255, ' + L.alpha + ')';
        for (let x = 0; x <= w; x += 6) {
          const y = h * L.y
            + Math.sin(x * L.len + t * L.speed) * L.amp
            + Math.sin(x * L.len * 2.3 + t * L.speed * 1.7) * (L.amp * 0.3);
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
      });

      raf = requestAnimationFrame(frame);
    }

    size();
    frame();
    window.addEventListener('resize', size, { passive: true });

    // stop drawing when the hero is off screen
    const heroObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting && raf === null) { frame(); }
        else if (!e.isIntersecting && raf !== null) { cancelAnimationFrame(raf); raf = null; }
      });
    }, { threshold: 0 });
    heroObs.observe(canvas);
  }

  // ── 2. generic reveal ────────────────────────────────────
  const reveals = document.querySelectorAll('[data-reveal]');
  if (reveals.length) {
    const obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e, i) {
        if (!e.isIntersecting) return;
        setTimeout(function () { e.target.classList.add('shown'); }, i * 90);
        obs.unobserve(e.target);
      });
    }, { threshold: 0.15 });
    reveals.forEach(function (el) { obs.observe(el); });
  }

  // ── 3. manifesto, word by word ───────────────────────────
  const words = document.querySelectorAll('[data-word]');
  if (words.length) {
    const obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        const idx = [].indexOf.call(words, e.target);
        setTimeout(function () { e.target.classList.add('lit'); }, idx * 55);
        obs.unobserve(e.target);
      });
    }, { threshold: 0.6, rootMargin: '0px 0px -15% 0px' });
    words.forEach(function (el) { obs.observe(el); });
  }

  // ── 4. drag bar ──────────────────────────────────────────
  const delta = document.querySelector('[data-delta]');
  if (delta) {
    const obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        delta.style.width = '80%';
        obs.unobserve(e.target);
      });
    }, { threshold: 0.5 });
    obs.observe(delta);
  }

  // ── 5. counters ──────────────────────────────────────────
  const counters = document.querySelectorAll('[data-count]');
  if (counters.length) {
    const obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        run(e.target);
        obs.unobserve(e.target);
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { obs.observe(el); });

    function run(el) {
      const end = parseFloat(el.dataset.count);
      const dec = parseInt(el.dataset.decimals || '0', 10);
      const pre = el.dataset.prefix || '';
      const suf = el.dataset.suffix || '';
      const dur = 1100;

      if (reduced || end === 0) {
        el.textContent = pre + end.toFixed(dec) + suf;
        return;
      }

      const t0 = performance.now();
      (function step(now) {
        const p = Math.min((now - t0) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = pre + (end * eased).toFixed(dec) + suf;
        if (p < 1) requestAnimationFrame(step);
      })(t0);
    }
  }

  // ── 6. specs drive the sticky image ──────────────────────
  const specs = document.querySelectorAll('[data-spec]');
  const craftImg = document.querySelector('[data-craft-img]');
  const craftCap = document.querySelector('[data-craft-cap]');

  if (specs.length && craftImg && craftCap) {
    let current = null;

    const obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;

        specs.forEach(function (s) { s.classList.toggle('is-on', s === e.target); });

        const src = e.target.dataset.img;
        if (src && src !== current) {
          current = src;
          craftImg.style.opacity = '0';
          const next = new Image();
          next.onload = function () {
            craftImg.src = src;
            craftCap.textContent = e.target.dataset.cap || '';
            craftImg.style.opacity = '1';
          };
          next.src = src;
        }
      });
      // A spec is a full viewport tall, so "half of it is visible" is a
      // threshold it can barely reach. Collapsing the root to a band across
      // the middle makes this fire when a spec crosses the centre instead.
    }, { threshold: 0, rootMargin: '-45% 0px -45% 0px' });

    specs.forEach(function (s) { obs.observe(s); });
  }

  // ── 7. foil state ────────────────────────────────────────
  const stage = document.querySelector('[data-stage]');
  const states = document.querySelectorAll('[data-state]');

  if (stage && states.length) {
    const rig = stage.querySelector('.blueprint');
    const tag = stage.querySelector('[data-rig-tag]');
    const LABEL = ['Hull in the water', 'Flying — drag down 80%'];

    function set(i) {
      states.forEach(function (b, n) {
        const on = n === i;
        b.classList.toggle('is-on', on);
        b.setAttribute('aria-selected', String(on));
      });
      rig.classList.toggle('flying', i === 1);
      if (tag) tag.textContent = LABEL[i];
    }

    states.forEach(function (b, i) {
      b.addEventListener('click', function () { set(i); });
    });

    // show the lift once, when the section is first reached
    let played = false;
    const obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting || played) return;
        played = true;
        setTimeout(function () { set(1); }, 700);
      });
    }, { threshold: 0.45 });
    obs.observe(stage);
  }

  // ── 8. drag to scroll the routes ─────────────────────────
  const drag = document.querySelector('[data-drag]');
  if (drag) {
    let down = false, startX = 0, startLeft = 0, moved = 0;

    drag.addEventListener('pointerdown', function (e) {
      down = true; moved = 0;
      startX = e.clientX;
      startLeft = drag.scrollLeft;
      drag.classList.add('dragging');
    });

    drag.addEventListener('pointermove', function (e) {
      if (!down) return;
      const dx = e.clientX - startX;
      moved = Math.abs(dx);
      drag.scrollLeft = startLeft - dx;
    });

    function up() {
      if (!down) return;
      down = false;
      drag.classList.remove('dragging');
    }

    drag.addEventListener('pointerup', up);
    drag.addEventListener('pointerleave', up);
    drag.addEventListener('pointercancel', up);

    // a drag should not follow a link inside a card
    drag.addEventListener('click', function (e) {
      if (moved > 6) { e.preventDefault(); e.stopPropagation(); }
    }, true);
  }

  // ── 9. rail: progress + active section ───────────────────
  const fill = document.querySelector('[data-rail-fill]');
  const dots = document.querySelectorAll('[data-rail]');

  if (fill || dots.length) {
    const targets = [].map.call(dots, function (d) {
      return document.querySelector(d.getAttribute('href'));
    });

    function onScroll() {
      if (fill) {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const p = max > 0 ? window.scrollY / max : 0;
        fill.style.height = (p * 100) + '%';
      }

      let active = -1;
      targets.forEach(function (sec, i) {
        if (sec && sec.getBoundingClientRect().top <= window.innerHeight * 0.4) active = i;
      });
      dots.forEach(function (d, i) { d.classList.toggle('is-on', i === active); });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    onScroll();
  }

  // ── 10. enquiry form ─────────────────────────────────────
  // Posts to Formspree over fetch so the visitor is never taken off the
  // page. If the request itself fails the form falls back to a normal
  // submit, which still reaches Formspree.
  const form = document.querySelector('[data-enquiry]');
  const msg = document.querySelector('[data-form-msg]');
  const submit = document.querySelector('[data-submit]');

  if (form) {
    let sending = false;

    function say(text, kind) {
      if (!msg) return;
      msg.textContent = text;
      msg.dataset.kind = kind;
      msg.hidden = false;
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (sending) return;

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      sending = true;
      if (submit) { submit.disabled = true; submit.querySelector('span').textContent = 'Sending…'; }
      if (msg) msg.hidden = true;

      fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' }
      })
        .then(function (res) {
          if (!res.ok) throw new Error('HTTP ' + res.status);
          form.reset();
          say('Thank you — your enquiry is on its way. We read every one.', 'ok');
        })
        .catch(function () {
          say('Something went wrong sending this. Please email us directly instead.', 'bad');
        })
        .then(function () {
          sending = false;
          if (submit) { submit.disabled = false; submit.querySelector('span').textContent = 'Send enquiry'; }
        });
    });
  }

  // ── 11. hidden entry to the analytics page ───────────────
  // Five clicks on the footer mark within 3s open stats.htm. Not a security
  // measure — the page it opens holds no figures, only a way through to the
  // Google dashboard, which has a real sign-in.
  const insights = document.querySelector('[data-insights]');
  if (insights) {
    let taps = 0;
    let timer = null;

    insights.style.cursor = 'pointer';
    insights.addEventListener('click', function () {
      taps++;
      clearTimeout(timer);

      if (taps >= 5) {
        taps = 0;
        window.location.href = 'stats.htm';
        return;
      }
      timer = setTimeout(function () { taps = 0; }, 3000);
    });
  }

})();
