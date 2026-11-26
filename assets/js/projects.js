(() => {
  const { projects } = window.PORTFOLIO;
  const esc = window.esc;
  const grid = document.getElementById('projectGrid');
  const chips = document.getElementById('projectFilters');
  const search = document.getElementById('projectSearch');
  const countEl = document.getElementById('projectCount');
  const emptyEl = document.getElementById('projectEmpty');
  const dialog = document.getElementById('projectDialog');
  const body = document.getElementById('projectDialogBody');
  let active = 'All', query = '', lastTrigger = null;

  const cats = ['All', ...new Set(projects.map(p => p.category))];
  chips.innerHTML = cats.map(c =>
    `<button type="button" class="chip" data-cat="${esc(c)}" aria-pressed="${c === active}">${esc(c)}</button>`).join('');

  chips.addEventListener('click', e => {
    const b = e.target.closest('[data-cat]'); if (!b) return;
    active = b.dataset.cat;
    chips.querySelectorAll('.chip').forEach(c => c.setAttribute('aria-pressed', String(c === b)));
    render();
  });

  search.addEventListener('input', () => { query = search.value.trim().toLowerCase(); render(); });

  const matches = p =>
    (active === 'All' || p.category === active) &&
    (!query || [p.title, p.summary, p.category, ...p.stack].join(' ').toLowerCase().includes(query));

  function render() {
    const list = projects.filter(matches);
    grid.innerHTML = list.map(p => `
      <article class="card project-card">
        <p class="eyebrow">${esc(p.category)}</p>
        <h3>${esc(p.title)}</h3>
        <p class="muted">${esc(p.summary)}</p>
        <ul class="tags">${p.stack.map(s => `<li>${esc(s)}</li>`).join('')}</ul>
        <button type="button" class="btn btn-ghost" data-open="${esc(p.id)}">
          View case study <span aria-hidden="true">→</span>
        </button>
      </article>`).join('');
    countEl.textContent = `Showing ${list.length} of ${projects.length} projects`;
    emptyEl.hidden = list.length !== 0;
  }

  function open(p) {
    if (!p) return;
    body.innerHTML = `
      <p class="eyebrow">${esc(p.category)}</p>
      <h2 id="projectDialogTitle">${esc(p.title)}</h2>
      <dl class="case">
        <div><dt>Problem</dt><dd>${esc(p.problem)}</dd></div>
        <div><dt>Solution</dt><dd>${esc(p.solution)}</dd></div>
        <div><dt>My role</dt><dd>${esc(p.role)}</dd></div>
        <div><dt>Impact</dt><dd><ul>${p.impact.map(i => `<li>${esc(i)}</li>`).join('')}</ul></dd></div>
      </dl>
      <h3>Tech stack</h3>
      <ul class="tags">${p.stack.map(s => `<li>${esc(s)}</li>`).join('')}</ul>
      <div class="hero-actions">
        ${p.live
          ? `<a class="btn btn-primary" href="${esc(p.live)}" target="_blank" rel="noopener">Live demo</a>`
          : `<span class="muted">Live demo coming soon</span>`}
        ${p.repo ? `<a class="btn" href="${esc(p.repo)}" target="_blank" rel="noopener">Repository</a>` : ''}
        <button type="button" class="btn" data-close>Close</button>
      </div>`;
    dialog.showModal();
  }

  grid.addEventListener('click', e => {
    const b = e.target.closest('[data-open]'); if (!b) return;
    lastTrigger = b;
    open(projects.find(p => p.id === b.dataset.open));
  });

  // Opened from the skills matrix ("Used in" links)
  document.addEventListener('open-project', e => {
    lastTrigger = null;
    open(projects.find(p => p.id === e.detail));
  });

  dialog.addEventListener('click', e => {
    if (e.target === dialog || e.target.closest('[data-close]')) dialog.close();
  });
  dialog.addEventListener('close', () => lastTrigger?.focus());

  render();
})();