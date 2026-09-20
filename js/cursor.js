// Custom cursor: a small triangle whose tip is the click point.
// Only on devices with a real pointer (not touch). Falls back to the normal
// cursor if anything here fails, and keeps the normal cursor over form
// fields, videos and embedded players.
(function () {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ease = reduce ? 1 : 0.5; // 1 = glued to the pointer, lower = more trailing

  // Two stacked copies: the first inverts what is underneath (white on dark,
  // black on light), the second strips the colour from that result so the
  // cursor stays black/white even over red or blue photos.
  const html =
    '<svg class="cursor-tri" viewBox="0 0 14 14" width="14" height="14"><polygon points="0,0 13,5 5,13"/></svg>' +
    '<span class="cursor-label"></span>';
  const layers = ['cursor-a', 'cursor-b'].map(function (cls) {
    const d = document.createElement('div');
    d.className = 'cursor ' + cls;
    d.setAttribute('aria-hidden', 'true');
    d.innerHTML = html;
    document.body.appendChild(d);
    return d;
  });
  const labels = layers.map(function (d) {
    return d.querySelector('.cursor-label');
  });
  const setClass = function (name, on) {
    layers.forEach(function (d) {
      d.classList.toggle(name, on);
    });
  };
  const place = function () {
    const v = 'translate3d(' + x + 'px,' + y + 'px,0)';
    layers.forEach(function (d) {
      d.style.transform = v;
    });
  };

  let x = 0, y = 0, tx = 0, ty = 0;
  let started = false;
  let raf = 0;

  function frame() {
    x += (tx - x) * ease;
    y += (ty - y) * ease;
    place();
    raf = Math.abs(tx - x) > 0.1 || Math.abs(ty - y) > 0.1 ? requestAnimationFrame(frame) : 0;
  }

  // what the pointer is over decides the label / size / whether we hide
  function setState(t) {
    if (!t || !t.closest) return;
    const native = !!t.closest('input, textarea, select, iframe, video');
    let text = '';
    if (t.closest('.lb-close')) text = 'Close';
    else if (t.closest('.lb-prev')) text = 'Prev';
    else if (t.closest('.lb-next')) text = 'Next';
    else if (t.classList.contains('lightbox')) text = 'Close';
    else if (t.closest('.gallery-media')) text = 'Zoom';
    else if (t.closest('.work-item, .work-row a')) text = 'View';
    const link = !!text || !!t.closest('a, button, summary, [role="button"]');

    setClass('native', native);
    setClass('is-link', link);
    setClass('has-label', !!text);
    if (text)
      labels.forEach(function (l) {
        l.textContent = text;
      });
  }

  document.addEventListener('mousemove', function (e) {
    tx = e.clientX;
    ty = e.clientY;

    if (!started) {
      started = true;
      x = tx;
      y = ty;
      place();
      document.documentElement.classList.add('has-cursor');
      setClass('on', true);
    }
    if (!raf) raf = requestAnimationFrame(frame);
  });
  document.addEventListener('mouseover', function (e) {
    setState(e.target);
  });
  document.documentElement.addEventListener('mouseleave', function () {
    setClass('on', false);
  });
  document.documentElement.addEventListener('mouseenter', function () {
    if (started) setClass('on', true);
  });
})();
