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
    updateMapTheme();
  });
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => updateMapTheme());

  /* ---------- Real map of central Stockholm (static, non-interactive) ---------- */
  let tiles = null;
  const STHLM = [59.3326, 18.0649]; // city centre
  // OpenStreetMap tiles; theme colouring is done with CSS filters (see .loc__real in styles.css)
  const tileUrl = () => 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
  function updateMapTheme() { /* CSS handles light/dark */ }
  const mapEl = document.getElementById('map');
  if (window.L && mapEl) {
    const map = L.map(mapEl, {
      zoomControl: false, attributionControl: false, dragging: false, scrollWheelZoom: false,
      doubleClickZoom: false, boxZoom: false, keyboard: false, touchZoom: false, tap: false,
      zoomSnap: 0.25, inertia: false,
    });
    tiles = L.tileLayer(tileUrl(), { maxZoom: 19, referrerPolicy: 'strict-origin-when-cross-origin' });
    tiles.once('load', () => mapEl.classList.add('ready'));
    tiles.addTo(map);
    // place the city centre under the pin (pin sits at 30% from right, 34% from top)
    const placeOnPin = () => {
      const s = map.getSize();
      const pin = L.point(s.x * 0.70, s.y * 0.34);
      map.setView(STHLM, 13.25, { animate: false });
      map.panBy(map.getSize().divideBy(2).subtract(pin), { animate: false });
    };
    placeOnPin();
    window.addEventListener('resize', () => { map.invalidateSize(); placeOnPin(); });
  }

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

  /* ---------- Cursor follower (mouse/trackpad only) ----------
     The system cursor stays visible; a soft ring trails it closely and only
     becomes noticeable over clickable things. The animation loop sleeps when
     the ring has caught up, so nothing runs while the mouse is still. */
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (finePointer && !reduceMotion) {
    const ring = document.createElement('div');
    ring.className = 'cursor-ring';
    ring.setAttribute('aria-hidden', 'true');
    document.body.append(ring);
    root.classList.add('has-cursor', 'cursor-hidden'); // stays hidden until the mouse first moves

    let mx = 0, my = 0, rx = 0, ry = 0, running = false, last = 0, started = false;
    const tick = (now) => {
      const dt = Math.min((now - last) / 16.67, 3); // frame-rate independent easing
      last = now;
      const k = 1 - Math.pow(1 - 0.32, dt);
      rx += (mx - rx) * k;
      ry += (my - ry) * k;
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
      if (Math.abs(mx - rx) + Math.abs(my - ry) > 0.2) requestAnimationFrame(tick);
      else running = false;
    };
    document.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      mx = e.clientX; my = e.clientY;
      if (!started) { rx = mx; ry = my; started = true; }
      root.classList.remove('cursor-hidden');
      if (!running) { running = true; last = performance.now(); requestAnimationFrame(tick); }
    }, { passive: true });
    document.documentElement.addEventListener('pointerleave', () => root.classList.add('cursor-hidden'));
    document.addEventListener('pointerdown', () => root.classList.add('cursor-down'));
    document.addEventListener('pointerup', () => root.classList.remove('cursor-down'));

    const interactive = 'a, button, [role="tab"], .cmdk__item';
    document.addEventListener('pointerover', (e) => {
      const t = e.target.closest && e.target.closest(interactive);
      root.classList.toggle('cursor-link', !!t);
    });
  }

  /* ---------- Command palette (Cmd/Ctrl + K) ---------- */
  const dlg = document.getElementById('cmdk');
  const input = document.getElementById('cmdkInput');
  const list = document.getElementById('cmdkList');
  const goTo = (id) => () => document.getElementById(id).scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
  const download = (href) => () => { const a = document.createElement('a'); a.href = href; a.download = ''; document.body.appendChild(a); a.click(); a.remove(); };
  const email = document.getElementById('copyEmail').dataset.email;
  const actions = [
    { group: 'Navigate', label: 'Experience', hint: 'Section', run: goTo('experience') },
    { group: 'Navigate', label: 'Skills', hint: 'Section', run: goTo('skills') },
    { group: 'Navigate', label: 'Education & languages', hint: 'Section', run: goTo('education') },
    { group: 'Navigate', label: 'Contact', hint: 'Section', run: goTo('contact') },
    { group: 'Actions', label: 'Copy email address', hint: email, run: () => navigator.clipboard && navigator.clipboard.writeText(email) },
    { group: 'Actions', label: 'Send an email', hint: 'mailto', run: () => { location.href = `mailto:${email}`; } },
    { group: 'Actions', label: 'Download CV (PDF)', hint: 'PDF', run: download('Dimitrios-Fragkoulis-CV.pdf') },
    { group: 'Actions', label: 'Download CV (Word)', hint: 'DOCX', run: download('Dimitrios-Fragkoulis-CV.docx') },
    { group: 'Actions', label: 'Open LinkedIn profile', hint: 'linkedin.com', run: () => window.open('https://www.linkedin.com/in/dimitrios-fragkoulis-1a848314b', '_blank', 'noopener') },
    { group: 'Actions', label: 'Toggle light / dark theme', hint: 'Theme', run: () => document.getElementById('themeToggle').click() },
  ];
  let filtered = actions, active = 0;

  const render = () => {
    list.innerHTML = '';
    if (!filtered.length) {
      list.innerHTML = '<li class="cmdk__empty">No results</li>';
      return;
    }
    let lastGroup = '';
    filtered.forEach((a, i) => {
      if (a.group !== lastGroup) {
        const g = document.createElement('li');
        g.className = 'cmdk__group'; g.textContent = a.group; g.setAttribute('role', 'presentation');
        list.appendChild(g); lastGroup = a.group;
      }
      const li = document.createElement('li');
      li.className = 'cmdk__item'; li.id = `cmdk-${i}`;
      li.setAttribute('role', 'option');
      li.setAttribute('aria-selected', i === active);
      li.innerHTML = `<span></span><small></small>`;
      li.firstChild.textContent = a.label;
      li.lastChild.textContent = a.hint;
      li.addEventListener('pointermove', () => { if (active !== i) { active = i; mark(); } });
      li.addEventListener('click', () => execute(i));
      list.appendChild(li);
    });
    input.setAttribute('aria-activedescendant', `cmdk-${active}`);
  };
  const mark = () => {
    list.querySelectorAll('.cmdk__item').forEach((el) => el.setAttribute('aria-selected', el.id === `cmdk-${active}`));
    input.setAttribute('aria-activedescendant', `cmdk-${active}`);
    const cur = document.getElementById(`cmdk-${active}`);
    if (cur) cur.scrollIntoView({ block: 'nearest' });
  };
  const open = () => {
    if (dlg.open) return;
    input.value = ''; filtered = actions; active = 0; render();
    dlg.showModal();
    input.focus();
  };
  const close = () => dlg.open && dlg.close();
  const execute = (i) => { const a = filtered[i]; if (!a) return; close(); setTimeout(a.run, 60); };

  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    filtered = actions.filter((a) => (a.label + ' ' + a.group + ' ' + a.hint).toLowerCase().includes(q));
    active = 0; render();
  });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); active = (active + 1) % Math.max(filtered.length, 1); mark(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); active = (active - 1 + filtered.length) % Math.max(filtered.length, 1); mark(); }
    else if (e.key === 'Enter') { e.preventDefault(); execute(active); }
  });
  dlg.addEventListener('click', (e) => { if (e.target === dlg) close(); });
  document.getElementById('cmdkBtn').addEventListener('click', open);
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); dlg.open ? close() : open(); }
  });
  const isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
  document.querySelectorAll('.kbd-mod').forEach((k) => (k.textContent = isMac ? '⌘' : 'Ctrl'));
})();
