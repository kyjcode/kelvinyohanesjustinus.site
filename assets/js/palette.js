(() => {
  const P = window.PORTFOLIO;
  const esc = window.esc;
  const dialog = document.getElementById('palette');
  const input = document.getElementById('paletteInput');
  const list = document.getElementById('paletteList');
  const openBtn = document.getElementById('paletteBtn');
  const go = sel => document.querySelector(sel).scrollIntoView({ block: 'start' });
  const click = sel => document.querySelector(sel)?.click();

  const commands = [
    { label: 'Go to About',       hint: '#about',      run: () => go('#about') },
    { label: 'Go to Skills',      hint: '#skills',     run: () => go('#skills') },
    { label: 'Go to Experience',  hint: '#experience', run: () => go('#experience') },
    { label: 'Go to Projects',    hint: '#projects',   run: () => go('#projects') },
    { label: 'Go to Contact',     hint: '#contact',    run: () => go('#contact') },
    { label: 'Copy email',        hint: P.profile.email, run: () => click('[data-action="copy-email"]') },
    { label: 'View CV',           hint: 'PDF',         run: () => click('#cvLink') },
    { label: 'Toggle theme',      hint: 'Dark / Light', run: () => click('#themeToggle') },
    { label: 'Toggle reduced motion', hint: 'Accessibility', run: () => { window.toggleReducedMotion(); toast('Motion preference updated'); } }
  ];

  let items = commands, idx = 0;

  function render(q = '') {
    items = commands.filter(c => c.label.toLowerCase().includes(q.trim().toLowerCase()));
    idx = 0;
    list.innerHTML = items.length
      ? items.map((c, i) => `<li role="option" id="cmd-${i}" aria-selected="${i === 0}">${esc(c.label)}<span class="muted">${esc(c.hint || '')}</span></li>`).join('')
      : '<li class="muted" role="presentation">No matching commands</li>';
    input.setAttribute('aria-activedescendant', items.length ? 'cmd-0' : '');
  }

  function select(i) {
    if (!items.length) return;
    idx = (i + items.length) % items.length;
    list.querySelectorAll('[role=option]').forEach((li, n) => li.setAttribute('aria-selected', String(n === idx)));
    input.setAttribute('aria-activedescendant', 'cmd-' + idx);
    document.getElementById('cmd-' + idx)?.scrollIntoView({ block: 'nearest' });
  }

  function run(i) {
    const c = items[i]; if (!c) return;
    dialog.close();
    c.run();
  }

  const openPalette = () => { input.value = ''; render(); dialog.showModal(); input.focus(); };

  input.addEventListener('input', () => render(input.value));
  input.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown') { e.preventDefault(); select(idx + 1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); select(idx - 1); }
    else if (e.key === 'Enter') { e.preventDefault(); run(idx); }
  });
  list.addEventListener('click', e => {
    const li = e.target.closest('[role=option]');
    if (li) run(Number(li.id.split('-')[1]));
  });
  openBtn.addEventListener('click', openPalette);
  document.addEventListener('keydown', e => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      dialog.open ? dialog.close() : openPalette();
    }
  });
  dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });

  render();
})();