(() => {
  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Theme toggle (remembers choice; defaults to OS) ---------- */
  const isDark = () =>
    root.dataset.theme ? root.dataset.theme === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  document.getElementById('themeToggle').addEventListener('click', () => {
    const next = isDark() ? 'light' : 'dark';
    root.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch (e) {}
  });

  /* ---------- Download CV -> print dialog (print stylesheet = clean CV) ---------- */
  document.getElementById('printBtn').addEventListener('click', () => window.print());

  /* ---------- Copy email ---------- */
  const copyBtn = document.getElementById('copyEmail');
  copyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(copyBtn.dataset.email);
      copyBtn.textContent = 'Copied';
    } catch (e) {
      copyBtn.textContent = copyBtn.dataset.email;
    }
    setTimeout(() => (copyBtn.textContent = 'Copy email'), 2000);
  });

  /* ---------- Cursor spotlight on tiles ---------- */
  document.addEventListener('pointermove', (e) => {
    const tile = e.target.closest && e.target.closest('.tile');
    if (!tile) return;
    const r = tile.getBoundingClientRect();
    tile.style.setProperty('--mx', `${e.clientX - r.left}px`);
    tile.style.setProperty('--my', `${e.clientY - r.top}px`);
  }, { passive: true });

  /* ---------- Count-up numbers ---------- */
  const countUp = (el) => {
    const target = +el.dataset.count;
    if (reduceMotion) { el.textContent = target; return; }
    const start = performance.now(), dur = 1200;
    const step = (now) => {
      const p = Math.min((now - start) / dur, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    };
    el.textContent = 0;
    requestAnimationFrame(step);
  };
  const countIO = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { countUp(en.target); countIO.unobserve(en.target); } });
  }, { threshold: 0.6 });
  document.querySelectorAll('[data-count]').forEach((el) => countIO.observe(el));

  /* ---------- Stockholm local time ---------- */
  const clock = document.getElementById('clock');
  const fmt = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Stockholm' });
  const tick = () => (clock.textContent = fmt.format(new Date()));
  tick();
  setInterval(tick, 15000);

  /* ---------- Experience tabs ---------- */
  const tabs = [...document.querySelectorAll('.exp__tab')];
  const indicator = document.querySelector('.exp__indicator');
  const moveIndicator = (tab) => {
    indicator.style.setProperty('--iy', `${tab.offsetTop}px`);
    indicator.style.setProperty('--ih', `${tab.offsetHeight}px`);
  };
  const select = (tab, focus) => {
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute('aria-selected', on);
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
    });
    moveIndicator(tab);
    if (focus) tab.focus();
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => select(t));
    t.addEventListener('keydown', (e) => {
      const dir = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
      if (!dir) return;
      e.preventDefault();
      select(tabs[(i + dir + tabs.length) % tabs.length], true);
    });
  });
  moveIndicator(tabs[0]);
  window.addEventListener('resize', () => moveIndicator(tabs.find((t) => t.getAttribute('aria-selected') === 'true')));

  /* ---------- Reveal on scroll + active nav ---------- */
  const links = [...document.querySelectorAll('.nav__links a')];
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      en.target.classList.add('visible');
      links.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === `#${en.target.id}`));
    });
  }, { threshold: 0.2 });
  document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

  document.getElementById('year').textContent = new Date().getFullYear();
})();
