(() => {
  const root = document.documentElement;
  const btn = document.getElementById('themeToggle');
  const mq = matchMedia('(prefers-color-scheme: light)');
  const saved = () => { try { return localStorage.getItem('theme'); } catch { return null; } };
  let timer;

  function apply(theme, persist) {
    root.classList.add('theme-transition');          // enables smooth color fade
    root.dataset.theme = theme;
    if (persist) { try { localStorage.setItem('theme', theme); } catch {} }
    btn.querySelector('i').className = theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
    btn.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`);
    clearTimeout(timer);
    timer = setTimeout(() => root.classList.remove('theme-transition'), 400);
    dispatchEvent(new Event('themechange'));         // background re-reads colors
  }

  apply(saved() || (mq.matches ? 'light' : 'dark'), false);

  btn.addEventListener('click', () =>
    apply(root.dataset.theme === 'dark' ? 'light' : 'dark', true));

  // Follow system changes only if the user hasn't chosen a theme
  mq.addEventListener('change', e => { if (!saved()) apply(e.matches ? 'light' : 'dark', false); });
})();