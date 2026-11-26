(() => {
  const { skills, skillCategories, projects } = window.PORTFOLIO;
  const esc = window.esc;
  const tabs = document.getElementById('skillTabs');
  const grid = document.getElementById('skillGrid');
  const detail = document.getElementById('skillDetail');
  const LEVEL_LABELS = ['Learning', 'Beginner', 'Working', 'Advanced', 'Expert'];
  let cat = skillCategories[0];

  tabs.innerHTML = skillCategories.map(c =>
    `<button type="button" role="tab" class="tab" data-cat="${esc(c)}" aria-selected="${c === cat}" tabindex="${c === cat ? 0 : -1}">${esc(c)}</button>`
  ).join('');

  // Arrow-key navigation between tabs
  tabs.addEventListener('keydown', e => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    const all = [...tabs.querySelectorAll('[role=tab]')];
    const i = all.findIndex(t => t.getAttribute('aria-selected') === 'true');
    const next = all[(i + (e.key === 'ArrowRight' ? 1 : -1) + all.length) % all.length];
    next.focus(); select(next.dataset.cat);
  });
  tabs.addEventListener('click', e => {
    const t = e.target.closest('[role=tab]'); if (t) select(t.dataset.cat);
  });

  function select(c) {
    cat = c;
    tabs.querySelectorAll('[role=tab]').forEach(t => {
      const on = t.dataset.cat === c;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
    });
    render();
  }

  function render() {
    const list = skills.filter(s => s.category === cat);
    grid.innerHTML = list.map(s => `
      <button type="button" class="skill-btn" data-skill="${esc(s.name)}">
        <span>${esc(s.name)}</span>
        <span class="level" aria-hidden="true"><span style="--w:${s.level * 20}%"></span></span>
      </button>`).join('');
    showDetail(list[0]);
  }

  function showDetail(s) {
    if (!s) return;
    const related = projects.filter(p => p.stack.includes(s.name));
    detail.innerHTML = `
      <p class="eyebrow">${esc(s.category)}</p>
      <h3>${esc(s.name)}</h3>
      <p>${esc(s.note)}</p>
      <p class="muted">Proficiency: <strong>${esc(LEVEL_LABELS[s.level - 1])}</strong> · Experience: ${esc(s.years)}</p>
      <h4>Used in</h4>
      ${related.length
        ? `<ul class="plain">${related.map(p =>
            `<li><button type="button" class="link-btn" data-jump="${esc(p.id)}">${esc(p.title)}</button></li>`).join('')}</ul>`
        : '<p class="muted">No linked projects yet.</p>'}`;
  }

  const byName = name => skills.find(s => s.name === name);

  // Hover (mouse) or focus updates the detail panel
  grid.addEventListener('pointerover', e => {
    const b = e.target.closest('[data-skill]');
    if (b && e.pointerType === 'mouse') showDetail(byName(b.dataset.skill));
  });
  grid.addEventListener('focusin', e => {
    const b = e.target.closest('[data-skill]');
    if (b) showDetail(byName(b.dataset.skill));
  });
  grid.addEventListener('click', e => {
    const b = e.target.closest('[data-skill]');
    if (b) showDetail(byName(b.dataset.skill));
  });

  detail.addEventListener('click', e => {
    const j = e.target.closest('[data-jump]'); if (!j) return;
    document.getElementById('projects').scrollIntoView();
    document.dispatchEvent(new CustomEvent('open-project', { detail: j.dataset.jump }));
  });

  render();
})();