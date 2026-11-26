(() => {
  const loader = document.getElementById('loader');
  if (!loader) return;

  const bar = document.getElementById('loaderBar');
  const counter = document.getElementById('loaderCount');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const DURATION = reduced ? 300 : 7000; // total fill time (ms)
  const MAX_WAIT = 4000;                 // don't block forever if a CDN is slow

  let loaded = document.readyState === 'complete';
  let shown = -1;
  document.body.classList.add('is-loading');
  window.addEventListener('load', () => { loaded = true; });
  setTimeout(() => { loaded = true; }, MAX_WAIT);

  const ease = t => 1 - Math.pow(1 - t, 3);
  const start = performance.now();

  function setProgress(p) {
    if (p === shown) return;
    shown = p;
    bar.style.transform = `scaleX(${p / 100})`;
    counter.textContent = p + '%';
  }

  function finish() {
    loader.classList.add('hide');
    document.body.classList.remove('is-loading');
    loader.addEventListener('transitionend', () => loader.remove(), { once: true });
    setTimeout(() => loader.remove(), 900); // fallback if transitionend never fires
  }

  function frame(now) {
    const t = Math.min(1, (now - start) / DURATION);
    let p = Math.round(ease(t) * 100);
    if (!loaded && p > 92) p = 92; // hold at 92% until the page is ready
    if (loaded && t >= 1) p = 100;
    setProgress(p);
    if (p === 100) { setTimeout(finish, 250); return; }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();