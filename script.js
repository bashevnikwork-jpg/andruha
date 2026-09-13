/* =======================================================================
   Майстерня нестандартних рішень — interactions
   Vanilla JS. GSAP — progressive enhancement (сайт працює й без нього).
   ======================================================================= */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- PRELOADER ---------- */
  var pre = $('#preloader');
  function hidePreloader() { if (pre) pre.classList.add('done'); }
  window.addEventListener('load', hidePreloader);
  // запобіжник: не тримати екран довше, ніж треба
  setTimeout(hidePreloader, 2200);
  if (document.readyState === 'complete') hidePreloader();

  /* ---------- YEAR ---------- */
  var y = $('#year'); if (y) y.textContent = new Date().getFullYear();

  /* ---------- HEADER on scroll ---------- */
  var header = $('.site-header');
  function onScroll() { if (header) header.classList.toggle('scrolled', window.scrollY > 24); }
  onScroll(); window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- MOBILE NAV ---------- */
  var burger = $('#burger'), nav = $('#nav');
  function closeNav() { if (!nav) return; nav.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); }
  if (burger && nav) {
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      burger.setAttribute('aria-expanded', String(open));
    });
    $$('a', nav).forEach(function (a) { a.addEventListener('click', closeNav); });
  }

  /* ---------- SCROLLSPY ---------- */
  var navLinks = $$('.nav a');
  var sections = navLinks.map(function (a) { return $(a.getAttribute('href')); }).filter(Boolean);
  if ('IntersectionObserver' in window && sections.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          var id = '#' + e.target.id;
          navLinks.forEach(function (a) { a.classList.toggle('active', a.getAttribute('href') === id); });
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---------- SOLUTIONS TABS ---------- */
  var tabs = $$('.sol__tab');
  var panels = $$('.sol__panel');
  function selectTab(tab) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.classList.toggle('is-active', on);
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
    });
    panels.forEach(function (p) {
      var on = p.id === tab.getAttribute('aria-controls');
      p.classList.toggle('is-active', on);
      p.hidden = !on;
    });
  }
  tabs.forEach(function (tab, i) {
    tab.addEventListener('click', function () { selectTab(tab); });
    tab.addEventListener('keydown', function (e) {
      var idx = null;
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') idx = (i + 1) % tabs.length;
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') idx = (i - 1 + tabs.length) % tabs.length;
      if (idx !== null) { e.preventDefault(); tabs[idx].focus(); selectTab(tabs[idx]); }
    });
  });

  /* ---------- REVEAL (restrained) ---------- */
  var revealSel = ['.section-head', '.sol', '.works__cat', '.quality__list', '.quality__head',
    '.custom__main', '.custom__add', '.why__grid', '.contact__copy', '.contact__formwrap', '.flow', '.idea__title'];
  var revealEls = [];
  revealSel.forEach(function (s) { $$(s).forEach(function (el) { el.classList.add('reveal'); revealEls.push(el); }); });
  if (reduce) {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  } else if ('IntersectionObserver' in window) {
    var ro = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); obs.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });
    revealEls.forEach(function (el) { ro.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- HERO INTRO (GSAP if present) ---------- */
  function heroIntro() {
    if (reduce || !window.gsap) return;
    var t = window.gsap.timeline({ defaults: { ease: 'power3.out', duration: .8 } });
    t.from('.hero .eyebrow', { y: 18, opacity: 0 })
      .from('.hero__title', { y: 26, opacity: 0 }, '-=.5')
      .from('.hero__lead', { y: 20, opacity: 0 }, '-=.5')
      .from('.hero .slogan', { y: 16, opacity: 0 }, '-=.55')
      .from('.hero__cta .btn', { y: 16, opacity: 0, stagger: .1 }, '-=.5')
      .from('.hero__visual', { y: 30, opacity: 0, duration: 1 }, '-=.7');
  }

  /* ---------- TRANSFORMATION signature ---------- */
  function transform() {
    var stage = $('.tr__stage');
    var outline = $('.tr-body .van-outline');
    var progressI = $('.tr__progress i');
    if (!stage) return;

    function fill() { if (progressI) progressI.style.width = '100%'; }

    // GSAP-версія: малюємо контур і збираємо інтер'єр
    if (window.gsap && !reduce) {
      var st = window.ScrollTrigger;
      if (outline) {
        var len = outline.getTotalLength ? outline.getTotalLength() : 900;
        window.gsap.set(outline, { strokeDasharray: len, strokeDashoffset: len });
      }
      window.gsap.set('.tr-interior > *', { opacity: 0 });
      var tl = window.gsap.timeline({
        scrollTrigger: st ? { trigger: stage, start: 'top 72%' } : undefined
      });
      if (outline) tl.to(outline, { strokeDashoffset: 0, duration: 1.1, ease: 'power2.inOut' });
      tl.to('.tr-interior .fill-floor', { opacity: 1, duration: .4 }, '-=.35')
        .to('.tr-interior .fill-panels', { opacity: 1, duration: .4 }, '-=.15')
        .to('.tr-interior .fill-seats', { opacity: 1, duration: .5 }, '-=.1')
        .to('.tr-interior .fill-light', { opacity: 1, duration: .4 }, '-=.05')
        .add(fill, '-=.6');
      if (!st) { tl.progress(1); fill(); } // немає ScrollTrigger — показуємо одразу
      return;
    }

    // Fallback без GSAP: показуємо все + прогрес через IO
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (e, obs) {
        if (e[0].isIntersecting) { fill(); obs.disconnect(); }
      }, { rootMargin: '0px 0px -20% 0px' });
      io.observe(stage);
    } else { fill(); }
  }

  // запускаємо після можливого завантаження GSAP
  function boot() {
    if (window.gsap && window.ScrollTrigger) window.gsap.registerPlugin(window.ScrollTrigger);
    heroIntro();
    transform();
  }
  if (document.readyState === 'complete') boot();
  else window.addEventListener('load', boot);

  /* ---------- MODAL (quick call) ---------- */
  var modal = $('#callModal');
  var lastFocus = null;
  function openModal() {
    if (!modal) return;
    lastFocus = document.activeElement;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    var f = $('input', modal); if (f) setTimeout(function () { f.focus(); }, 60);
  }
  function closeModal() {
    if (!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  }
  $$('[data-open-call]').forEach(function (b) { b.addEventListener('click', openModal); });
  $$('[data-close-call]').forEach(function (b) { b.addEventListener('click', closeModal); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modal && modal.classList.contains('open')) closeModal();
    if (e.key === 'Tab' && modal && modal.classList.contains('open')) {
      var f = $$('button, [href], input, select, textarea', modal).filter(function (el) { return !el.disabled && el.offsetParent !== null; });
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* ---------- FORMS ---------- */
  function validPhone(v) {
    var d = (v || '').replace(/[^\d]/g, '');
    return d.length >= 9 && d.length <= 15;
  }
  function startCountdown(form) {
    var box = $('.form__success--call', form);
    if (!box) return;
    var el = $('[data-count]', box);
    var msg = $('.js-call-msg', box);
    var n = 30;
    if (reduce || !el) { if (msg) msg.textContent = 'Ми прийняли запит. Скоро зателефонуємо.'; return; }
    var id = setInterval(function () {
      n--; el.textContent = n;
      if (n <= 0) {
        clearInterval(id);
        var t = $('h3', box); if (t) t.textContent = 'Готово';
        if (msg) msg.textContent = 'Дякуємо! Менеджер зв’яжеться з вами.';
      }
    }, 1000);
  }

  $$('.js-form').forEach(function (form) {
    var phoneField = $('input[type="tel"]', form);
    var isQuick = form.classList.contains('js-form--quick');

    // легке форматування вводу
    if (phoneField) {
      phoneField.addEventListener('input', function () {
        var wrap = phoneField.closest('.field');
        if (wrap) wrap.classList.remove('invalid');
      });
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = true;
      if (phoneField) {
        var wrap = phoneField.closest('.field');
        if (!validPhone(phoneField.value)) { if (wrap) wrap.classList.add('invalid'); ok = false; phoneField.focus(); }
      }
      if (!ok) return;

      /* ===== ТУТ підключається реальна відправка =====
         Приклад:
         fetch('/api/lead', { method:'POST',
           headers:{'Content-Type':'application/json'},
           body: JSON.stringify(Object.fromEntries(new FormData(form))) });
         ============================================== */

      var success = $('.form__success', form);
      form.classList.add('is-sent');
      if (success) success.hidden = false;
      if (isQuick) startCountdown(form);
    });
  });

  /* ---------- WORKS CAROUSELS (swipe + arrows) ---------- */
  $$('.carousel').forEach(function (car) {
    var track = $('.carousel__track', car);
    var prev = $('.carousel__btn--prev', car);
    var next = $('.carousel__btn--next', car);
    if (!track) return;
    function step() {
      var card = $('.work', track);
      return (card ? card.offsetWidth : track.clientWidth * 0.8) + 14; // card + gap
    }
    function update() {
      var max = track.scrollWidth - track.clientWidth - 2;
      if (prev) prev.disabled = track.scrollLeft <= 2;
      if (next) next.disabled = track.scrollLeft >= max;
    }
    if (prev) prev.addEventListener('click', function () { track.scrollBy({ left: -step(), behavior: 'smooth' }); });
    if (next) next.addEventListener('click', function () { track.scrollBy({ left: step(), behavior: 'smooth' }); });
    track.addEventListener('scroll', function () { window.requestAnimationFrame(update); }, { passive: true });
    window.addEventListener('resize', update);
    update();
  });

  /* ---------- VIDEO FACADE (load only on tap) ---------- */
  $$('.video-lite').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var src = btn.getAttribute('data-src');
      if (!src) return;
      var v = document.createElement('video');
      v.src = src;
      v.controls = true;
      v.autoplay = true;
      v.playsInline = true;
      v.setAttribute('playsinline', '');
      v.preload = 'auto';
      var fig = btn.closest('.work');
      btn.replaceWith(v);
      if (fig) fig.classList.add('is-playing');
      var p = v.play(); if (p && p.catch) p.catch(function () {});
    });
  });

  /* ---------- LIGHTBOX ---------- */
  var lb = $('#lightbox');
  if (lb) {
    var lbImg = $('.lightbox__img', lb);
    var lbCount = $('[data-lb-count]', lb);
    var lbPrev = $('[data-lb-prev]', lb);
    var lbNext = $('[data-lb-next]', lb);
    var group = [];
    var idx = 0;
    var lbLast = null;

    function preload(i) {
      if (i < 0 || i >= group.length) return;
      var im = new Image(); im.src = group[i].src;
    }
    function render() {
      var item = group[idx];
      if (!item) return;
      lbImg.src = item.src;
      lbImg.alt = item.alt || '';
      var many = group.length > 1;
      lbPrev.hidden = !many; lbNext.hidden = !many;
      if (lbCount) lbCount.textContent = many ? (idx + 1) + ' / ' + group.length : '';
      preload(idx + 1); preload(idx - 1);
    }
    function go(d) { idx = (idx + d + group.length) % group.length; render(); }
    function open(list, start) {
      group = list; idx = start;
      lbLast = document.activeElement;
      lb.classList.add('open');
      lb.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      render();
      $('.lightbox__close', lb).focus();
    }
    function close() {
      lb.classList.remove('open');
      lb.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      lbImg.src = '';
      if (lbLast) lbLast.focus();
    }

    // open from any photo button (carousel or solution preview)
    $$('[data-full]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var track = btn.closest('.carousel__track');
        var buttons = track ? $$('[data-full]', track) : [btn];
        var list = buttons.map(function (b) {
          var img = $('img', b);
          return { src: b.getAttribute('data-full'), alt: img ? img.alt : '' };
        });
        open(list, buttons.indexOf(btn));
      });
    });

    lbPrev.addEventListener('click', function () { go(-1); });
    lbNext.addEventListener('click', function () { go(1); });
    $$('[data-lb-close]', lb).forEach(function (b) { b.addEventListener('click', close); });
    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowRight') go(1);
      else if (e.key === 'ArrowLeft') go(-1);
    });
    // swipe
    var sx = 0, sy = 0;
    lb.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
    lb.addEventListener('touchend', function (e) {
      var dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) { go(dx < 0 ? 1 : -1); }
      else if (dy > 70 && Math.abs(dy) > Math.abs(dx)) { close(); }
    }, { passive: true });
  }

})();
