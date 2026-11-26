(() => {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas || !canvas.getContext) return;
  const ctx = canvas.getContext('2d');
  const mqReduce = matchMedia('(prefers-reduced-motion: reduce)');

  // User override ('reduced' | 'full') wins; otherwise follow the OS setting
  const reducedMode = () => {
    const s = localStorage.getItem('motion');
    return s ? s === 'reduced' : mqReduce.matches;
  };

  let w = 0, h = 0, dpr = 1, nodes = [], raf = 0, rt;
  let colors = { node: '#fff', line: '#fff' };
  const pointer = { x: -1e3, y: -1e3 };
  let scrollV = 0, lastY = scrollY;

  function readColors() {
    const s = getComputedStyle(document.documentElement);
    colors.node = s.getPropertyValue('--bg-node').trim();
    colors.line = s.getPropertyValue('--bg-line').trim();
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = innerWidth; h = innerHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const small = w < 768;
    const count = Math.min(small ? 40 : 110, Math.floor(w * h / (small ? 14000 : 16000)));
    nodes = Array.from({ length: count }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25,
      z: 0.35 + Math.random() * 0.65                 // depth: nearer nodes move more
    }));
    paint();
  }

  function step() {
    for (const n of nodes) {
      n.x += n.vx * n.z;
      n.y += n.vy * n.z - scrollV * n.z * 0.15;      // scroll parallax
      const dx = n.x - pointer.x, dy = n.y - pointer.y, d = Math.hypot(dx, dy);
      if (d > 0 && d < 140) {                        // gentle pointer repulsion
        const f = ((140 - d) / 140) * 1.6;
        n.x += (dx / d) * f; n.y += (dy / d) * f;
      }
      if (n.x < -20) n.x = w + 20; else if (n.x > w + 20) n.x = -20;
      if (n.y < -20) n.y = h + 20; else if (n.y > h + 20) n.y = -20;
    }
    scrollV *= 0.9;
    if (Math.abs(scrollV) < 0.01) scrollV = 0;
  }

  function paint() {
    ctx.clearRect(0, 0, w, h);
    const max = 130;
    ctx.strokeStyle = colors.line;
    ctx.lineWidth = 1;
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j];
        const dx = a.x - b.x, dy = a.y - b.y, d2 = dx * dx + dy * dy;
        if (d2 < max * max) {
          ctx.globalAlpha = (1 - Math.sqrt(d2) / max) * 0.6;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
    }
    ctx.fillStyle = colors.node;
    for (const n of nodes) {
      ctx.globalAlpha = 0.4 + n.z * 0.6;
      ctx.beginPath(); ctx.arc(n.x, n.y, 1 + n.z * 1.4, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function loop() { step(); paint(); raf = requestAnimationFrame(loop); }
  function start() { if (!raf && !reducedMode() && !document.hidden) raf = requestAnimationFrame(loop); }
  function stop() { cancelAnimationFrame(raf); raf = 0; }

  function refresh() {
    stop();
    readColors();
    document.documentElement.dataset.motion = reducedMode() ? 'reduced' : 'full';
    if (reducedMode()) paint(); else start();      // reduced: one static frame
  }

  addEventListener('pointermove', e => { pointer.x = e.clientX; pointer.y = e.clientY; }, { passive: true });
  addEventListener('pointerup', e => { if (e.pointerType === 'touch') pointer.x = pointer.y = -1e3; });
  document.addEventListener('pointerout', e => { if (!e.relatedTarget) pointer.x = pointer.y = -1e3; });
  addEventListener('scroll', () => {
    const dy = scrollY - lastY; lastY = scrollY;
    scrollV = Math.max(-30, Math.min(30, scrollV + dy));
  }, { passive: true });

  document.addEventListener('visibilitychange', () => document.hidden ? stop() : start());
  addEventListener('themechange', refresh);
  addEventListener('motionchange', refresh);
  mqReduce.addEventListener('change', refresh);
  addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(resize, 150); });

  window.toggleReducedMotion = () => {
    localStorage.setItem('motion', reducedMode() ? 'full' : 'reduced');
    dispatchEvent(new Event('motionchange'));
  };

  readColors();
  resize();
  refresh();
})();