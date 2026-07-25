(() => {
  'use strict';

  const API = 'https://api.jolpi.ca/ergast/f1';

  const TEAM_COLORS = {
    mercedes: '#27F4D2', ferrari: '#E8002D', red_bull: '#3671C6', mclaren: '#FF8000',
    alpine: '#00A1E8', williams: '#1868DB', aston_martin: '#229971', rb: '#6C98FF',
    haas: '#B6BABD', sauber: '#52C41A', audi: '#B6002D', cadillac: '#8A8D93',
    alphatauri: '#2B4562', alfa: '#B12039', renault: '#FFF200', racing_point: '#F596C8'
  };
  const teamColor = id => TEAM_COLORS[id] || '#e10600';

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* ---------------- Loader ---------------- */
  window.addEventListener('load', () => {
    setTimeout(() => $('#loader').classList.add('done'), 400);
  });

  /* ---------------- Footer year ---------------- */
  $('#year').textContent = new Date().getFullYear();
  $('#heroSeason').textContent = new Date().getFullYear();

  /* ---------------- Navbar ---------------- */
  const navbar = $('#navbar');
  const navProgress = $('#navProgress');
  const navToggle = $('#navToggle');
  const navLinks = $('#navLinks');

  function onScroll() {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
    const h = document.documentElement;
    const scrollable = h.scrollHeight - h.clientHeight;
    const pct = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
    navProgress.style.width = pct + '%';
  }
  document.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('open');
    navLinks.classList.toggle('open');
  });
  $$('.nav-link').forEach(link => link.addEventListener('click', () => {
    navToggle.classList.remove('open');
    navLinks.classList.remove('open');
  }));

  /* ---------------- Cursor glow ---------------- */
  const cursorGlow = $('#cursorGlow');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasFinePointer = window.matchMedia('(pointer: fine)').matches;

  if (cursorGlow && !reduceMotion && hasFinePointer) {
    let targetX = window.innerWidth / 2, targetY = window.innerHeight / 2;
    let curX = targetX, curY = targetY;
    let rafId = null;

    function renderGlow() {
      curX += (targetX - curX) * 0.08;
      curY += (targetY - curY) * 0.08;
      cursorGlow.style.transform = `translate3d(${curX}px, ${curY}px, 0)`;
      if (Math.abs(targetX - curX) > 0.1 || Math.abs(targetY - curY) > 0.1) {
        rafId = requestAnimationFrame(renderGlow);
      } else {
        rafId = null;
      }
    }

    function wake() {
      if (!rafId) rafId = requestAnimationFrame(renderGlow);
    }

    window.addEventListener('mousemove', (e) => {
      targetX = e.clientX;
      targetY = e.clientY;
      cursorGlow.classList.add('active');
      wake();
    }, { passive: true });

    document.addEventListener('mouseleave', () => cursorGlow.classList.remove('active'));
  }

  /* ---------------- Reveal on scroll ---------------- */
  const revealItems = $$('.reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 });
  revealItems.forEach(el => io.observe(el));

  // helper to reveal dynamically-inserted nodes
  function observeReveal(el) {
    el.classList.add('reveal');
    io.observe(el);
    requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('in')));
  }

  /* ---------------- Fetch helper ---------------- */
  async function getJSON(path) {
    const res = await fetch(`${API}/${path}`, { headers: { 'Accept': 'application/json' } });
    if (!res.ok) throw new Error(`Request failed: ${res.status}`);
    return res.json();
  }

  /* =========================================================
     NEXT RACE
  ========================================================= */
  let countdownTimer = null;

  async function loadNextRace() {
    const card = $('#nextRaceCard');
    try {
      const data = await getJSON('current/next.json');
      const race = data.MRData.RaceTable.Races[0];
      if (!race) throw new Error('No upcoming race');
      renderNextRace(card, race);
    } catch (err) {
      card.innerHTML = `<div class="race-card-loading">Couldn't reach the timing feed right now. Refresh to try again.</div>`;
    }
  }

  function sessionDate(dateStr, timeStr) {
    if (!dateStr) return null;
    return new Date(`${dateStr}T${timeStr || '00:00:00Z'}`);
  }

  function renderNextRace(card, race) {
    const sessionDefs = [
      { key: 'FirstPractice', label: 'Practice 1' },
      { key: 'SecondPractice', label: 'Practice 2' },
      { key: 'ThirdPractice', label: 'Practice 3' },
      { key: 'SprintQualifying', label: 'Sprint Quali' },
      { key: 'SprintShootout', label: 'Sprint Shootout' },
      { key: 'Sprint', label: 'Sprint' },
      { key: 'Qualifying', label: 'Qualifying' },
    ];

    const sessions = sessionDefs
      .filter(s => race[s.key])
      .map(s => ({ ...s, dt: sessionDate(race[s.key].date, race[s.key].time) }));

    sessions.push({ key: 'Race', label: 'Race', dt: sessionDate(race.date, race.time) });
    sessions.sort((a, b) => a.dt - b.dt);

    const now = new Date();
    let nextSession = sessions.find(s => s.dt > now) || sessions[sessions.length - 1];

    const dtf = { weekday: 'short', month: 'short', day: 'numeric' };
    const tf = { hour: '2-digit', minute: '2-digit' };

    card.innerHTML = `
      <div class="race-top">
        <div>
          <div class="race-round">ROUND ${race.round} &middot; ${race.season}</div>
          <div class="race-name">${race.raceName}</div>
          <div class="race-location"><span>${race.Circuit.circuitName}</span> — ${race.Circuit.Location.locality}, ${race.Circuit.Location.country}</div>
        </div>
        <div class="countdown" id="countdown">
          ${['D','H','M','S'].map(u => `
            <div class="countdown-unit">
              <div class="countdown-num" data-unit="${u}">00</div>
              <div class="countdown-label">${{D:'Days',H:'Hrs',M:'Min',S:'Sec'}[u]}</div>
            </div>`).join('')}
        </div>
      </div>
      <div class="race-sessions">
        ${sessions.map(s => `
          <div class="session-chip ${s.key === nextSession.key ? 'is-next' : ''}">
            <div class="session-name">${s.label}</div>
            <div class="session-time">${s.dt.toLocaleTimeString(undefined, tf)}</div>
            <div class="session-date">${s.dt.toLocaleDateString(undefined, dtf)}</div>
          </div>`).join('')}
      </div>
    `;

    if (countdownTimer) clearInterval(countdownTimer);
    const target = sessionDate(race.date, race.time);
    tickCountdown(target);
    countdownTimer = setInterval(() => tickCountdown(target), 1000);
  }

  function tickCountdown(target) {
    const diff = target - new Date();
    const els = $$('#countdown .countdown-num');
    if (diff <= 0) {
      els.forEach(el => el.textContent = '00');
      clearInterval(countdownTimer);
      return;
    }
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    const pad = n => String(n).padStart(2, '0');
    const map = { D: d, H: h, M: m, S: s };
    els.forEach(el => { el.textContent = pad(map[el.dataset.unit]); });
  }

  /* =========================================================
     SEASON CALENDAR
  ========================================================= */
  const COUNTRY_FLAGS = {
    'Australia': '🇦🇺', 'China': '🇨🇳', 'Japan': '🇯🇵', 'Bahrain': '🇧🇭',
    'Saudi Arabia': '🇸🇦', 'USA': '🇺🇸', 'United States': '🇺🇸', 'Canada': '🇨🇦',
    'Monaco': '🇲🇨', 'Spain': '🇪🇸', 'Austria': '🇦🇹', 'UK': '🇬🇧',
    'United Kingdom': '🇬🇧', 'Great Britain': '🇬🇧', 'Belgium': '🇧🇪', 'Hungary': '🇭🇺',
    'Netherlands': '🇳🇱', 'Italy': '🇮🇹', 'Azerbaijan': '🇦🇿', 'Singapore': '🇸🇬',
    'Mexico': '🇲🇽', 'Brazil': '🇧🇷', 'Qatar': '🇶🇦', 'UAE': '🇦🇪',
    'United Arab Emirates': '🇦🇪', 'Portugal': '🇵🇹', 'France': '🇫🇷', 'Germany': '🇩🇪',
    'Russia': '🇷🇺', 'Turkey': '🇹🇷', 'South Korea': '🇰🇷', 'India': '🇮🇳'
  };
  const flagFor = country => COUNTRY_FLAGS[country] || '🏁';

  // Simplified, hand-approximated circuit silhouettes (not survey-accurate).
  // Keyed by Jolpica/Ergast circuitId. Unknown/new circuits fall back to
  // FALLBACK_TRACK below — add real entries here as they're confirmed,
  // same maintenance pattern as TEAM_COLORS above.
  const CIRCUIT_TRACKS = {
    albert_park: [[45,40],[90,25],[140,28],[170,45],[180,70],[165,90],[175,100],[160,115],[110,118],[70,110],[40,90],[35,65]],
    shanghai: [[100,25],[115,35],[110,48],[95,45],[92,33],[130,40],[165,50],[190,70],[185,95],[160,115],[110,120],[65,112],[35,90],[35,60],[60,40]],
    suzuka: [[40,45],[70,25],[100,35],[120,45],[145,25],[175,35],[190,55],[175,70],[155,60],[145,75],[165,90],[155,110],[120,115],[95,95],[110,80],[85,65],[60,70],[45,58]],
    bahrain: [[60,115],[40,95],[38,65],[55,42],[85,28],[130,25],[165,30],[185,50],[180,70],[160,68],[152,85],[168,100],[150,118],[100,120]],
    jeddah: [[20,75],[25,45],[55,22],[90,20],[110,10],[140,12],[165,25],[178,42],[172,55],[150,52],[145,65],[165,68],[190,78],[195,95],[175,110],[150,102],[130,112],[90,113],[55,105],[30,92]],
    miami: [[45,100],[32,80],[38,55],[60,40],[90,32],[118,38],[132,28],[150,18],[172,25],[180,42],[165,55],[150,52],[155,72],[168,85],[155,100],[135,95],[115,105],[85,110],[60,108]],
    villeneuve: [[55,25],[100,18],[145,22],[172,38],[180,58],[168,75],[178,95],[185,110],[160,118],[110,112],[70,105],[45,85],[42,55]],
    monaco: [[58,25],[85,20],[100,30],[92,40],[105,52],[125,45],[140,55],[132,65],[145,75],[160,68],[178,80],[180,98],[160,112],[125,105],[95,110],[65,100],[50,80],[55,55],[48,35]],
    catalunya: [[48,98],[32,80],[38,58],[60,42],[90,32],[115,38],[135,30],[160,40],[175,55],[168,72],[172,90],[158,105],[130,110],[95,106],[65,112]],
    red_bull_ring: [[58,100],[42,80],[48,58],[70,40],[100,30],[125,35],[145,45],[162,58],[155,72],[140,68],[132,85],[145,98],[120,108],[88,105]],
    silverstone: [[35,70],[38,50],[58,35],[75,32],[88,18],[108,15],[120,28],[112,40],[125,45],[140,38],[160,32],[180,45],[188,65],[178,80],[160,75],[150,88],[160,100],[140,110],[115,105],[95,113],[72,108],[50,95]],
    spa: [[55,25],[42,35],[45,48],[32,55],[22,70],[30,85],[48,88],[58,75],[72,80],[68,98],[85,112],[105,105],[118,88],[140,82],[165,90],[190,80],[205,95],[195,110],[172,105],[155,112],[125,118],[95,115],[70,110]],
    hungaroring: [[55,105],[38,85],[40,60],[58,42],[85,32],[110,38],[100,50],[115,55],[135,45],[158,50],[172,65],[162,80],[145,75],[132,88],[150,98],[135,112],[100,115],[75,110]],
    zandvoort: [[50,80],[55,55],[75,35],[105,25],[135,28],[160,42],[175,62],[172,85],[155,100],[130,110],[100,112],[72,102]],
    monza: [[35,60],[45,35],[75,22],[110,25],[105,40],[125,42],[150,25],[180,30],[195,50],[188,68],[165,70],[168,88],[190,95],[185,112],[150,118],[110,115],[70,105],[45,90]],
    baku: [[25,90],[20,65],[35,45],[55,35],[52,50],[62,55],[58,68],[75,72],[95,60],[115,65],[110,78],[125,82],[145,70],[165,60],[195,55],[205,68],[190,80],[160,85],[130,95],[95,100],[60,102]],
    marina_bay: [[45,100],[40,75],[45,50],[65,35],[65,55],[85,58],[85,38],[110,35],[130,50],[110,60],[125,75],[150,72],[170,50],[190,60],[180,80],[195,95],[175,110],[145,105],[145,90],[120,92],[115,110],[85,112],[65,108]],
    americas: [[35,50],[55,30],[80,35],[70,48],[85,55],[100,42],[118,50],[108,62],[125,68],[150,55],[175,60],[190,80],[178,98],[190,112],[165,120],[135,110],[100,115],[70,105],[45,90],[40,68]],
    rodriguez: [[45,95],[35,70],[45,45],[70,30],[100,25],[130,30],[155,22],[178,32],[185,50],[165,58],[170,75],[190,85],[182,105],[155,112],[125,108],[95,115],[65,112]],
    interlagos: [[50,95],[35,72],[42,48],[65,32],[95,28],[115,42],[100,55],[120,60],[140,45],[165,52],[172,72],[155,82],[135,78],[125,95],[145,108],[125,118],[95,112],[75,120],[58,110]],
    las_vegas: [[35,100],[30,55],[45,30],[85,25],[130,25],[170,28],[195,45],[195,90],[170,110],[130,115],[85,115],[50,112]],
    losail: [[40,70],[45,45],[65,28],[95,22],[120,32],[110,45],[130,48],[150,32],[175,35],[190,55],[178,70],[190,88],[172,105],[145,110],[115,102],[95,112],[65,105],[45,90]],
    yas_marina: [[45,60],[55,35],[85,25],[115,30],[105,45],[125,42],[140,25],[170,25],[190,42],[178,58],[190,75],[178,95],[190,110],[160,118],[130,105],[105,112],[75,108],[50,92]]
  };
  const FALLBACK_TRACK = [[50,90],[40,60],[60,35],[95,25],[130,30],[160,45],[175,70],[160,95],[125,112],[85,110],[60,105]];

  function roundedPolygonPath(points, r) {
    const n = points.length;
    const sub = (a, b) => ({ x: a[0] - b[0], y: a[1] - b[1] });
    const length = v => Math.hypot(v.x, v.y) || 1;
    const norm = v => { const l = length(v); return { x: v.x / l, y: v.y / l }; };
    let d = '';
    for (let i = 0; i < n; i++) {
      const curr = points[i];
      const prev = points[(i - 1 + n) % n];
      const next = points[(i + 1) % n];
      const toPrev = sub(prev, curr);
      const toNext = sub(next, curr);
      const rr = Math.min(r, length(toPrev) / 2, length(toNext) / 2);
      const p1dir = norm(toPrev);
      const p2dir = norm(toNext);
      const p1 = { x: curr[0] + p1dir.x * rr, y: curr[1] + p1dir.y * rr };
      const p2 = { x: curr[0] + p2dir.x * rr, y: curr[1] + p2dir.y * rr };
      d += (i === 0 ? `M${p1.x.toFixed(1)},${p1.y.toFixed(1)} ` : `L${p1.x.toFixed(1)},${p1.y.toFixed(1)} `);
      d += `Q${curr[0].toFixed(1)},${curr[1].toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)} `;
    }
    return d + 'Z';
  }

  async function loadCalendar() {
    const grid = $('#calendarGrid');
    try {
      const data = await getJSON('current.json');
      renderCalendar(grid, data.MRData.RaceTable.Races);
    } catch (err) {
      grid.innerHTML = `<div class="table-loading">Couldn't load the season calendar.</div>`;
    }
  }

  function renderCalendar(grid, races) {
    if (!races || !races.length) {
      grid.innerHTML = `<div class="table-loading">No calendar data available yet.</div>`;
      return;
    }
    grid.innerHTML = races.map(race => {
      const circuit = race.Circuit;
      const points = CIRCUIT_TRACKS[circuit.circuitId] || FALLBACK_TRACK;
      const pathD = roundedPolygonPath(points, 7);
      const start = points[0];
      const dateStr = new Date(`${race.date}T00:00:00`).toLocaleDateString(undefined, { day: '2-digit', month: 'short' });
      return `
        <div class="circuit-card">
          <div class="circuit-top">
            <span class="circuit-round">R${String(race.round).padStart(2, '0')}</span>
            <span class="circuit-date">${dateStr}</span>
          </div>
          <svg class="circuit-track" viewBox="0 0 220 140" aria-hidden="true">
            <path d="${pathD}"></path>
            <circle cx="${start[0]}" cy="${start[1]}" r="3.2"></circle>
          </svg>
          <div class="circuit-city">${flagFor(circuit.Location.country)} ${circuit.Location.locality}</div>
          <div class="circuit-country">${circuit.Location.country}</div>
          <div class="circuit-name">${circuit.circuitName}</div>
        </div>`;
    }).join('');
    $$('.circuit-card', grid).forEach(observeReveal);
  }

  /* =========================================================
     RESULTS (Race + Qualifying)
  ========================================================= */
  async function loadResults() {
    try {
      const data = await getJSON('current/last/results.json');
      const race = data.MRData.RaceTable.Races[0];
      $('#resultsRaceTitle').textContent = race ? `${race.raceName} — ${new Date(race.date).toLocaleDateString(undefined, { year:'numeric', month:'long', day:'numeric' })}` : '';
      renderRaceTable(race);
    } catch (err) {
      $('#raceTable tbody').innerHTML = `<tr><td colspan="5" class="table-loading">Couldn't load race results.</td></tr>`;
    }

    try {
      const data = await getJSON('current/last/qualifying.json');
      const race = data.MRData.RaceTable.Races[0];
      renderQualiTable(race);
    } catch (err) {
      $('#qualiTable tbody').innerHTML = `<tr><td colspan="6" class="table-loading">Couldn't load qualifying results.</td></tr>`;
    }
  }

  function renderRaceTable(race) {
    const tbody = $('#raceTable tbody');
    if (!race || !race.Results || !race.Results.length) {
      tbody.innerHTML = `<tr><td colspan="5" class="table-loading">No results available yet.</td></tr>`;
      return;
    }
    tbody.innerHTML = race.Results.slice(0, 10).map(r => {
      const timeOrStatus = r.Time ? r.Time.time : r.status;
      return `
        <tr>
          <td class="pos-cell pos-${r.position}">${r.position}</td>
          <td class="driver-cell">${r.Driver.givenName} ${r.Driver.familyName}</td>
          <td><span class="team-dot" style="background:${teamColor(r.Constructor.constructorId)}"></span>${r.Constructor.name}</td>
          <td class="mono">${timeOrStatus}</td>
          <td>${r.points}</td>
        </tr>`;
    }).join('');
  }

  function renderQualiTable(race) {
    const tbody = $('#qualiTable tbody');
    if (!race || !race.QualifyingResults || !race.QualifyingResults.length) {
      tbody.innerHTML = `<tr><td colspan="6" class="table-loading">No qualifying data available yet.</td></tr>`;
      return;
    }
    tbody.innerHTML = race.QualifyingResults.slice(0, 10).map(r => `
      <tr>
        <td class="pos-cell pos-${r.position}">${r.position}</td>
        <td class="driver-cell">${r.Driver.givenName} ${r.Driver.familyName}</td>
        <td><span class="team-dot" style="background:${teamColor(r.Constructor.constructorId)}"></span>${r.Constructor.name}</td>
        <td class="mono">${r.Q1 || '—'}</td>
        <td class="mono">${r.Q2 || '—'}</td>
        <td class="mono">${r.Q3 || '—'}</td>
      </tr>`).join('');
  }

  $$('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const tab = btn.dataset.tab;
      $('#raceTable').classList.toggle('hidden', tab !== 'race');
      $('#qualiTable').classList.toggle('hidden', tab !== 'quali');
    });
  });

  /* =========================================================
     STANDINGS
  ========================================================= */
  async function loadStandings() {
    try {
      const data = await getJSON('current/driverstandings.json');
      const list = data.MRData.StandingsTable.StandingsLists[0];
      renderDriverStandings(list ? list.DriverStandings : []);
    } catch (err) {
      $('#driverStandings').innerHTML = `<div class="table-loading">Couldn't load driver standings.</div>`;
    }

    try {
      const data = await getJSON('current/constructorstandings.json');
      const list = data.MRData.StandingsTable.StandingsLists[0];
      renderConstructorStandings(list ? list.ConstructorStandings : []);
    } catch (err) {
      $('#constructorStandings').innerHTML = `<div class="table-loading">Couldn't load constructor standings.</div>`;
    }
  }

  function renderDriverStandings(rows) {
    const wrap = $('#driverStandings');
    if (!rows.length) { wrap.innerHTML = `<div class="table-loading">No standings available yet.</div>`; return; }
    const maxPts = Math.max(...rows.map(r => Number(r.points)), 1);
    wrap.innerHTML = rows.map(r => {
      const team = r.Constructors[0];
      return `
        <div class="standing-row">
          <div class="standing-bar" data-width="${(Number(r.points) / maxPts) * 100}"></div>
          <div class="standing-pos">${r.position}</div>
          <div class="standing-info">
            <div class="standing-name">${r.Driver.givenName} ${r.Driver.familyName}</div>
            <div class="standing-team"><span class="team-dot" style="background:${teamColor(team.constructorId)}"></span>${team.name}</div>
          </div>
          <div class="standing-pts">${r.points}<small>PTS</small></div>
        </div>`;
    }).join('');
    animateBars(wrap);
  }

  function renderConstructorStandings(rows) {
    const wrap = $('#constructorStandings');
    if (!rows.length) { wrap.innerHTML = `<div class="table-loading">No standings available yet.</div>`; return; }
    const maxPts = Math.max(...rows.map(r => Number(r.points)), 1);
    wrap.innerHTML = rows.map(r => `
      <div class="standing-row">
        <div class="standing-bar" data-width="${(Number(r.points) / maxPts) * 100}"></div>
        <div class="standing-pos">${r.position}</div>
        <div class="standing-info">
          <div class="standing-name">${r.Constructor.name}</div>
          <div class="standing-team"><span class="team-dot" style="background:${teamColor(r.Constructor.constructorId)}"></span>${r.wins} win${r.wins === '1' ? '' : 's'}</div>
        </div>
        <div class="standing-pts">${r.points}<small>PTS</small></div>
      </div>`).join('');
    animateBars(wrap);
  }

  function animateBars(wrap) {
    const bars = $$('.standing-bar', wrap);
    const barIO = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const bar = e.target;
          requestAnimationFrame(() => { bar.style.width = bar.dataset.width + '%'; });
          barIO.unobserve(bar);
        }
      });
    }, { threshold: 0.2 });
    bars.forEach(b => barIO.observe(b));
  }

  /* =========================================================
     RECORDS (all-time)
  ========================================================= */
  const RECORDS = [
    { icon: '🏆', label: 'Most Drivers’ Championships', value: '7 Titles', sub: 'Michael Schumacher & Lewis Hamilton' },
    { icon: '🏁', label: 'Most Race Wins', value: '105 Wins', sub: 'Lewis Hamilton' },
    { icon: '⏱️', label: 'Most Pole Positions', value: '104 Poles', sub: 'Lewis Hamilton' },
    { icon: '🎯', label: 'Most Podium Finishes', value: '202 Podiums', sub: 'Lewis Hamilton' },
    { icon: '🛠️', label: 'Most Constructors’ Titles', value: '16 Titles', sub: 'Scuderia Ferrari' },
    { icon: '👑', label: 'Youngest World Champion', value: '23y 134d', sub: 'Sebastian Vettel — 2010' },
    { icon: '⚡', label: 'Youngest Race Winner', value: '18y 228d', sub: 'Max Verstappen — 2016 Spanish GP' },
    { icon: '📈', label: 'Most Wins in a Single Season', value: '19 Wins', sub: 'Max Verstappen — 2023' },
    { icon: '🔥', label: 'Longest Consecutive Win Streak', value: '10 Races', sub: 'Max Verstappen — 2023' },
    { icon: '🎖️', label: 'Oldest World Champion', value: '46 Years', sub: 'Juan Manuel Fangio — 1957' },
    { icon: '🧭', label: 'Most Grand Prix Entries', value: '400+ Starts', sub: 'Fernando Alonso' },
    { icon: '🛞', label: 'Fastest Pit Stop', value: '1.80 sec', sub: 'Red Bull Racing — 2019 Brazilian GP' },
  ];

  function loadRecords() {
    const grid = $('#recordsGrid');
    grid.innerHTML = RECORDS.map(r => `
      <div class="record-card">
        <span class="record-icon">${r.icon}</span>
        <div class="record-label">${r.label}</div>
        <div class="record-value">${r.value}</div>
        <div class="record-sub">${r.sub}</div>
      </div>`).join('');
    $$('.record-card', grid).forEach(observeReveal);
  }

  /* ---------------- Init ---------------- */
  loadNextRace();
  loadCalendar();
  loadResults();
  loadStandings();
  loadRecords();
})();
