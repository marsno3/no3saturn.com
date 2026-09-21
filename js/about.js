// About page motion: the intro text darkens word by word, the photo drifts a little slower than the
// page while scrolling, and the experience list / "What I Do" flow in as they come into view.
(function () {
  var layout = document.querySelector('.about-layout');
  if (!layout && !document.querySelector('.cv-section')) return;

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;
  document.documentElement.classList.add('js-about');

  /* ---------- intro text: words go from grey to black, one after another ---------- */
  var words = [];
  document.querySelectorAll('.about-layout .prose p').forEach(function (p) {
    var parts = p.textContent.trim().split(/\s+/);
    p.textContent = '';
    parts.forEach(function (w, i) {
      var span = document.createElement('span');
      span.className = 'w';
      span.textContent = w;
      p.appendChild(span);
      if (i < parts.length - 1) p.appendChild(document.createTextNode(' '));
      words.push(span);
    });
  });
  words.forEach(function (w, i) {
    w.style.transitionDelay = 0.45 + i * 0.02 + 's';
  });
  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      words.forEach(function (w) { w.classList.add('on'); });
    });
  });

  /* ---------- reveal on scroll ---------- */
  document.querySelectorAll('.cv-items').forEach(function (ul) {
    ul.querySelectorAll('li').forEach(function (li, k) { li.style.setProperty('--k', k); });
  });
  var targets = document.querySelectorAll('.cv-group, .about-block, .cv-section .page-title');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('in');
        io.unobserve(en.target);
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    targets.forEach(function (el) { io.observe(el); });
  } else {
    targets.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- photo: moves a little slower than the page while scrolling ---------- */
  var frame = document.querySelector('.about-photo-frame');
  if (!frame) return;
  var sy = 0, tsy = 0, raf = 0; // current / target offset in px

  function measureScroll() {
    var r = frame.getBoundingClientRect();
    var off = r.top + r.height / 2 - window.innerHeight / 2;
    tsy = Math.max(-22, Math.min(22, -off * 0.06));
  }
  function frameStep() {
    sy += (tsy - sy) * 0.12;
    frame.style.setProperty('--sy', sy.toFixed(2));
    raf = Math.abs(tsy - sy) > 0.02 ? requestAnimationFrame(frameStep) : 0;
  }
  function kick() { if (!raf) raf = requestAnimationFrame(frameStep); }

  window.addEventListener('scroll', function () { measureScroll(); kick(); }, { passive: true });
  window.addEventListener('resize', function () { measureScroll(); kick(); });
  measureScroll();
  sy = tsy;
  kick();
})();
