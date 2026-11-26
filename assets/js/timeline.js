(() => {
  const { experience } = window.PORTFOLIO;
  const esc = window.esc;
  const root = document.getElementById('timeline');
  const lb = document.getElementById('lightbox');
  const lbImg = document.getElementById('lbImg');
  const lbCap = document.getElementById('lbCaption');
  let album = [], index = 0, lastTrigger = null;

  const gallery = (photos = [], entry) => !photos.length ? '' : `
    <ul class="tl-gallery">
      ${photos.map((ph, n) => `
        <li>
          <button type="button" class="tl-photo" data-entry="${entry}" data-index="${n}"
                  aria-label="Open photo: ${esc(ph.alt || ph.caption || 'photo')}">
            <img src="${esc(ph.src)}" alt="" loading="lazy" decoding="async">
          </button>
          ${ph.caption ? `<p class="tl-cap">${esc(ph.caption)}</p>` : ''}
        </li>`).join('')}
    </ul>`;

  root.innerHTML = experience.map((e, i) => `
    <li class="tl-item">
      <button type="button" class="tl-head" id="tl-b-${i}"
              aria-expanded="${i === 0}" aria-controls="tl-p-${i}">
        <span class="tl-dot" aria-hidden="true"></span>
        <span class="tl-meta">
          <strong>${esc(e.title)}</strong>
          <span class="muted">${esc(e.org)} · ${esc(e.period)}</span>
        </span>
        <i class="fa-solid fa-chevron-down tl-chev" aria-hidden="true"></i>
      </button>
      <div class="tl-panel" id="tl-p-${i}" role="region" aria-labelledby="tl-b-${i}" ${i === 0 ? '' : 'hidden'}>
        <p>${esc(e.summary)}</p>
        ${e.points.length ? `<ul>${e.points.map(p => `<li>${esc(p)}</li>`).join('')}</ul>` : ''}
        ${gallery(e.photos, i)}
      </div>
    </li>`).join('');

  // Hide photos that fail to load
  root.querySelectorAll('.tl-photo img').forEach(img =>
    img.addEventListener('error', () => { img.closest('li').hidden = true; }));

  // Accordion
  root.addEventListener('click', e => {
    const photo = e.target.closest('.tl-photo');
    if (photo) return openLightbox(Number(photo.dataset.entry), Number(photo.dataset.index), photo);
    const b = e.target.closest('.tl-head'); if (!b) return;
    const isOpen = b.getAttribute('aria-expanded') === 'true';
    b.setAttribute('aria-expanded', String(!isOpen));
    document.getElementById(b.getAttribute('aria-controls')).hidden = isOpen;
  });

  // Lightbox
  function show() {
    const ph = album[index];
    lbImg.src = ph.src;
    lbImg.alt = ph.alt || ph.caption || '';
    lbCap.textContent = ph.caption || '';
    lb.querySelector('[data-lb="prev"]').hidden = album.length < 2;
    lb.querySelector('[data-lb="next"]').hidden = album.length < 2;
  }
  function openLightbox(entryIdx, photoIdx, trigger) {
    album = experience[entryIdx].photos;
    index = photoIdx;
    lastTrigger = trigger;
    show();
    lb.showModal();
  }
  const step = d => { index = (index + d + album.length) % album.length; show(); };

  lb.addEventListener('click', e => {
    const act = e.target.closest('[data-lb]')?.dataset.lb;
    if (act === 'prev') step(-1);
    else if (act === 'next') step(1);
    else if (act === 'close' || e.target === lb) lb.close();
  });
  document.addEventListener('keydown', e => {
    if (!lb.open) return;
    if (e.key === 'ArrowLeft') step(-1);
    if (e.key === 'ArrowRight') step(1);
  });
  lb.addEventListener('close', () => lastTrigger?.focus());
})();