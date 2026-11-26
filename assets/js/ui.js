(() => {
  const P = window.PORTFOLIO;
  const esc = window.esc;
  const get = path => path.split('.').reduce((o, k) => o?.[k], P);

  // Bind text and links from data.js
  document.querySelectorAll('[data-bind]').forEach(el => {
    const v = get(el.dataset.bind); if (v != null) el.textContent = v;
  });
  document.querySelectorAll('[data-bind-href]').forEach(el => {
    const v = get(el.dataset.bindHref); if (v) el.href = v;
  });
  document.querySelectorAll('[data-mailto]').forEach(el => { el.href = 'mailto:' + P.profile.email; });

  // About section
  document.getElementById('principles').innerHTML = P.principles
    .map(p => `<li><strong>${esc(p.title)}</strong> ${esc(p.text)}</li>`).join('');
  document.getElementById('focusList').innerHTML = P.focus
    .map(f => `<div class="focus-item"><dt>${esc(f.label)}</dt><dd><strong>${esc(f.value)}</strong><span class="muted">${esc(f.desc)}</span></dd></div>`).join('');

  // Toast
  const toastEl = document.getElementById('toast');
  let toastTimer;
  window.toast = msg => {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2600);
  };

  // Copy email with clipboard API and a fallback
  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(P.profile.email);
      toast('Email copied to clipboard');
    } catch {
      const ta = document.createElement('textarea');
      ta.value = P.profile.email; document.body.appendChild(ta); ta.select();
      const ok = document.execCommand('copy'); ta.remove();
      toast(ok ? 'Email copied to clipboard' : 'Copy failed: ' + P.profile.email);
    }
  }
  document.querySelectorAll('[data-action="copy-email"]').forEach(b => b.addEventListener('click', copyEmail));

  // CV download feedback
    document.querySelectorAll('[data-cv]').forEach(a => a.addEventListener('click', () => toast('Opening CV…')));

  // Magnetic CTA and card glow: only for fine pointers, and not in reduced-motion mode
  const canHover = matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (canHover && document.documentElement.dataset.motion !== 'reduced') {
    document.querySelectorAll('.card').forEach(c => c.addEventListener('pointermove', e => {
      const r = c.getBoundingClientRect();
      c.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      c.style.setProperty('--my', (e.clientY - r.top) + 'px');
    }));
    document.querySelectorAll('.btn-magnetic').forEach(b => {
      b.addEventListener('pointermove', e => {
        const r = b.getBoundingClientRect();
        b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.2}px, ${(e.clientY - r.top - r.height / 2) * 0.2}px)`;
      });
      b.addEventListener('pointerleave', () => { b.style.transform = ''; });
    });
  }

  // Highlight the active nav link while scrolling
  const links = [...document.querySelectorAll('.dock-links a')];
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting) links.forEach(l =>
        l.setAttribute('aria-current', String(l.hash === '#' + en.target.id)));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  document.querySelectorAll('main section[id]').forEach(s => io.observe(s));
})();