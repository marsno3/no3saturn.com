// Lightbox for the project hero + .project-images: click to enlarge, prev/next, Esc to close.
(function () {
  const items = Array.from(document.querySelectorAll('.project-hero .gallery-media, .project-images .gallery-media'));
  if (!items.length) return;

  const lb = document.createElement('div');
  lb.className = 'lightbox';
  lb.innerHTML =
    '<button class="lb-close" aria-label="Close">&times;</button>' +
    '<button class="lb-prev" aria-label="Previous">&lsaquo;</button>' +
    '<div class="lb-content"></div>' +
    '<button class="lb-next" aria-label="Next">&rsaquo;</button>';
  document.body.appendChild(lb);

  const content = lb.querySelector('.lb-content');
  let index = 0;

  function show(i) {
    index = (i + items.length) % items.length;
    const src = items[index].currentSrc || items[index].src;
    const isVideo = items[index].tagName === 'VIDEO';
    content.innerHTML = isVideo
      ? '<video src="' + src + '" controls autoplay playsinline></video>'
      : '<img src="' + src + '" alt="">';
  }

  function open(i) {
    show(i);
    lb.classList.add('open');
  }

  function close() {
    lb.classList.remove('open');
    content.innerHTML = '';
  }

  items.forEach((el, i) => {
    el.addEventListener('click', () => open(i));
  });

  lb.querySelector('.lb-close').addEventListener('click', close);
  lb.querySelector('.lb-prev').addEventListener('click', () => show(index - 1));
  lb.querySelector('.lb-next').addEventListener('click', () => show(index + 1));
  lb.addEventListener('click', (e) => {
    if (e.target === lb) close();
  });
  document.addEventListener('keydown', (e) => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') show(index - 1);
    if (e.key === 'ArrowRight') show(index + 1);
  });
})();
