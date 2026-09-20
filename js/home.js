// Home page: slideshow with arrows, header switching once you scroll past it,
// and the animated sections below (work list preview, intro text, reveal).
(function () {
  const hero = document.querySelector('.slideshow');
  if (!hero) return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------- slideshow ---------- */
  const slides = Array.from(hero.querySelectorAll('.slide'));
  const counter = hero.querySelector('.slide-counter');
  let idx = 0;
  let timer = 0;

  function show(i) {
    if (!slides.length) return;
    slides[idx].classList.remove('show');
    idx = (i + slides.length) % slides.length;
    slides[idx].classList.add('show');
    if (counter) counter.textContent = idx + 1 + ' / ' + slides.length;
  }

  // autoplay; restarts after every manual move so it never jumps right after you click
  function restart() {
    clearInterval(timer);
    if (slides.length > 1) timer = setInterval(function () { show(idx + 1); }, 4500);
  }
  restart();

  hero.querySelectorAll('.slide-arrow').forEach(function (btn) {
    btn.addEventListener('click', function () {
      show(idx + Number(btn.dataset.dir));
      restart();
    });
  });
  // clicking the photo itself also goes forward
  hero.addEventListener('click', function (e) {
    if (slides.length < 2 || e.target.closest('a, button')) return;
    show(idx + 1);
    restart();
  });

  // swipe on touch screens
  let startX = null;
  hero.addEventListener('touchstart', function (e) {
    startX = e.touches[0].clientX;
  }, { passive: true });
  hero.addEventListener('touchend', function (e) {
    if (startX === null || slides.length < 2) return;
    const dx = e.changedTouches[0].clientX - startX;
    startX = null;
    if (Math.abs(dx) > 50) {
      show(dx < 0 ? idx + 1 : idx - 1);
      restart();
    }
  }, { passive: true });

  // arrow keys, only while the slideshow is what you are looking at
  document.addEventListener('keydown', function (e) {
    if (slides.length < 2 || window.scrollY > hero.offsetHeight * 0.5) return;
    if (e.key === 'ArrowRight') { show(idx + 1); restart(); }
    if (e.key === 'ArrowLeft') { show(idx - 1); restart(); }
  });

  /* ---------- header: white over the photos, dark once scrolled past ---------- */
  const intro = document.querySelector('.intro-text');
  let words = [];

  function onScroll() {
    // switch well before the slideshow is gone, otherwise the white side menu would sit on white sections
    document.body.classList.toggle('past-hero', window.scrollY > hero.offsetHeight * 0.4);
    updateIntro();
  }

  /* ---------- intro text: words go from grey to black as you scroll ---------- */
  if (intro) {
    intro.innerHTML = intro.textContent
      .trim()
      .split(/\s+/)
      .map(function (w) { return '<span class="w">' + w + '</span>'; })
      .join(' ');
    words = Array.from(intro.querySelectorAll('.w'));
  }
  function updateIntro() {
    if (!words.length) return;
    if (reduce) { words.forEach(function (w) { w.classList.add('on'); }); return; }
    // 0 when the text enters the bottom of the screen, 1 once its top reaches 35% from the top
    const r = intro.getBoundingClientRect();
    const vh = window.innerHeight;
    const p = Math.min(1, Math.max(0, (vh * 0.92 - r.top) / (vh * 0.57)));
    const n = Math.round(p * words.length);
    words.forEach(function (w, i) { w.classList.toggle('on', i < n); });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  /* ---------- reveal on scroll (only if we can actually animate) ---------- */
  const els = Array.from(document.querySelectorAll('.reveal'));
  if (!reduce && 'IntersectionObserver' in window && els.length) {
    document.documentElement.classList.add('js-reveal');
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('in');
        io.unobserve(en.target);
      });
    }, { rootMargin: '0px 0px -40px 0px' });
    els.forEach(function (el, i) {
      // small stagger for rows that appear together
      el.style.transitionDelay = (i % 4) * 60 + 'ms';
      io.observe(el);
    });
  }

  /* ---------- work list: preview image follows the pointer ---------- */
  const list = document.querySelector('.work-list');
  const preview = document.querySelector('.work-preview');
  if (list && preview && canHover) {
    const img = preview.querySelector('img');
    let px = 0, py = 0, tx = 0, ty = 0, raf = 0, on = false;

    function place() {
      px += (tx - px) * (reduce ? 1 : 0.18);
      py += (ty - py) * (reduce ? 1 : 0.18);
      preview.style.transform = 'translate3d(' + px + 'px,' + py + 'px,0)';
      raf = Math.abs(tx - px) > 0.3 || Math.abs(ty - py) > 0.3 ? requestAnimationFrame(place) : 0;
    }
    list.addEventListener('mousemove', function (e) {
      // above and to the right of the pointer, so it never covers the title being hovered
      tx = e.clientX + 28;
      ty = e.clientY - preview.offsetHeight - 64;
      if (!on) { px = tx; py = ty; }
      if (!raf) raf = requestAnimationFrame(place);
    });
    list.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('mouseenter', function () {
        const src = a.dataset.img;
        if (!src) { preview.classList.remove('on'); on = false; return; }
        if (img.getAttribute('src') !== src) img.setAttribute('src', src);
        preview.classList.add('on');
        on = true;
      });
    });
    list.addEventListener('mouseleave', function () {
      preview.classList.remove('on');
      on = false;
    });
  }
})();
