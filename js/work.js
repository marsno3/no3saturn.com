// Work overview: the numbered steps drift a little as the pointer moves, each by a different
// distance, and ease toward the target so the motion feels fluid rather than stepped.
(function () {
  var steps = document.querySelector('.work-steps');
  if (!steps) return;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover:hover) and (pointer:fine)').matches;
  if (reduce || !fine) return;

  var tx = 0, ty = 0, x = 0, y = 0, raf = 0;

  function frame() {
    x += (tx - x) * 0.06;
    y += (ty - y) * 0.06;
    steps.style.setProperty('--px', x.toFixed(4));
    steps.style.setProperty('--py', y.toFixed(4));
    if (Math.abs(tx - x) > 0.0005 || Math.abs(ty - y) > 0.0005) raf = requestAnimationFrame(frame);
    else raf = 0;
  }

  window.addEventListener('pointermove', function (e) {
    // -0.5 .. 0.5 across the window
    tx = e.clientX / window.innerWidth - 0.5;
    ty = e.clientY / window.innerHeight - 0.5;
    if (!raf) raf = requestAnimationFrame(frame);
  }, { passive: true });
})();
