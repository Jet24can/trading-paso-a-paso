/* Interfaz de Trading Paso a Paso. Depende de engine.js (TPE) y content.js (TPC). */
(function () {
  'use strict';
  var E = window.TPE, C = window.TPC;

  /* ---------- utilidades ---------- */
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function rich(s) { return esc(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>'); }
  function nf(n, d) {
    if (d == null) d = 2;
    if (!isFinite(n)) return n === Infinity ? '∞' : '–';
    try { return n.toLocaleString('es-AR', { minimumFractionDigits: d, maximumFractionDigits: d }); }
    catch (e) { return n.toFixed(d); }
  }
  function sgn(n, d) { return (n > 0 ? '+' : '') + nf(n, d); }
  function cls(n) { return n > 0 ? 'up' : (n < 0 ? 'down' : ''); }
  function css(n) { return getComputedStyle(document.documentElement).getPropertyValue(n).trim(); }
  function hashStr(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function shuffled(arr, seedFn) {
    var a = arr.slice(), r = seedFn || Math.random;
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }

  /* ---------- estado persistente ---------- */
  var KEY = 'tpp_v1';
  function defaults() { return { done: {}, quiz: {}, exam: {}, journal: [], plan: {}, check: {}, theme: 'auto' }; }
  function load() {
    try {
      var s = JSON.parse(localStorage.getItem(KEY));
      if (s && typeof s === 'object') return Object.assign(defaults(), s);
    } catch (e) { /* sin almacenamiento */ }
    return defaults();
  }
  var S = load();
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* sin almacenamiento */ } }

  var themeSetByUs = false;
  function applyTheme() {
    var r = document.documentElement;
    if (S.theme === 'light' || S.theme === 'dark') { r.setAttribute('data-theme', S.theme); themeSetByUs = true; }
    else if (themeSetByUs) { r.removeAttribute('data-theme'); themeSetByUs = false; }
  }

  /* ---------- datos derivados ---------- */
  var L = C.lessons;
  function lessonById(id) { return L.filter(function (l) { return l.id === id; })[0]; }
  function levelById(id) { return C.levels.filter(function (l) { return l.id === id; })[0]; }
  function lessonsOf(level) { return L.filter(function (l) { return l.level === level; }); }
  function levelProgress(level) {
    var ls = lessonsOf(level);
    return { done: ls.filter(function (l) { return S.done[l.id]; }).length, total: ls.length };
  }
  function stableOptions(q) {
    var seed = hashStr(q.q), r = E.mulberry32(seed);
    return shuffled(q.o.map(function (t, i) { return { t: t, i: i }; }), r);
  }

  /* ---------- figuras SVG ---------- */
  var FIGS = {
    candle:
      '<svg viewBox="0 0 320 176" role="img" aria-label="Vela alcista y vela bajista con sus partes">' +
      '<line class="svg-line" x1="60" y1="150" x2="140" y2="150" stroke-dasharray="2 3"/>' +
      '<g class="svg-up"><line x1="90" y1="18" x2="90" y2="158" stroke-width="2"/><rect x="76" y="48" width="28" height="70" rx="2"/></g>' +
      '<g class="svg-dn"><line x1="230" y1="18" x2="230" y2="158" stroke-width="2"/><rect x="216" y="48" width="28" height="70" rx="2"/></g>' +
      '<text class="svg-t" x="110" y="22">Máximo</text><text class="svg-t" x="110" y="52">Cierre</text>' +
      '<text class="svg-t" x="110" y="122">Apertura</text><text class="svg-t" x="110" y="162">Mínimo</text>' +
      '<text class="svg-t" x="250" y="52">Apertura</text><text class="svg-t" x="250" y="122">Cierre</text>' +
      '<text class="svg-t" x="62" y="176" text-anchor="start">Alcista</text><text class="svg-t" x="204" y="176">Bajista</text></svg>',
    trend:
      '<svg viewBox="0 0 320 170" role="img" aria-label="Tendencia alcista con máximos y mínimos crecientes">' +
      '<line class="svg-dash" x1="70" y1="118" x2="262" y2="66"/>' +
      '<polyline class="svg-path" points="10,138 50,98 80,118 130,72 160,94 215,46 245,68 300,26"/>' +
      '<circle class="svg-dot" cx="80" cy="118" r="4"/><circle class="svg-dot" cx="160" cy="94" r="4"/><circle class="svg-dot" cx="245" cy="68" r="4"/>' +
      '<circle class="svg-dot" cx="50" cy="98" r="4"/><circle class="svg-dot" cx="130" cy="72" r="4"/><circle class="svg-dot" cx="215" cy="46" r="4"/>' +
      '<text class="svg-t" x="64" y="136">mínimo</text><text class="svg-t" x="144" y="112">mínimo más alto</text>' +
      '<text class="svg-t" x="196" y="36">máximo más alto</text><text class="svg-t" x="10" y="160">Soporte dinámico (línea verde)</text></svg>'
  };

  /* ---------- gráficos en canvas ---------- */
  function setupCanvas(cv, h) {
    var dpr = window.devicePixelRatio || 1, w = cv.clientWidth || 320;
    cv.style.height = h + 'px';
    cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
    var ctx = cv.getContext && cv.getContext('2d');
    if (!ctx) return null;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    return { ctx: ctx, w: w, h: h };
  }
  function fnum(v) { return v >= 1000 ? v.toFixed(0) : (v >= 100 ? v.toFixed(1) : v.toFixed(2)); }
  function drawCandles(cv, candles, o) {
    var g = setupCanvas(cv, o.h || 280); if (!g) return;
    var ctx = g.ctx, w = g.w, h = g.h;
    var up = css('--up'), dn = css('--down'), ink = css('--ink'), mut = css('--muted'), ln = css('--line'), acc = css('--accent');
    var padR = 52, padT = 10, padB = 10, pw = w - padR, ph = h - padT - padB, lo = Infinity, hi = -Infinity;
    candles.forEach(function (c) { if (c.l < lo) lo = c.l; if (c.h > hi) hi = c.h; });
    (o.lines || []).forEach(function (l) { if (l.y < lo) lo = l.y; if (l.y > hi) hi = l.y; });
    var pad = (hi - lo) * 0.06 || 1; lo -= pad; hi += pad;
    function Y(v) { return padT + (hi - v) / (hi - lo) * ph; }
    var lastY = Y(candles[candles.length - 1].c);
    ctx.font = '11px "JetBrains Mono", ui-monospace, monospace'; ctx.textBaseline = 'middle';
    for (var k = 0; k <= 4; k++) {
      var v = lo + (hi - lo) * k / 4, y = Y(v);
      ctx.strokeStyle = ln; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(pw, y); ctx.stroke();
      if (Math.abs(y - lastY) > 14) { ctx.fillStyle = mut; ctx.fillText(fnum(v), pw + 6, y); }
    }
    var step = pw / Math.max(candles.length, o.slots || candles.length), bw = Math.max(1, step * 0.62);
    candles.forEach(function (c, i) {
      var x = (i + 0.5) * step, col = c.c >= c.o ? up : dn;
      ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x, Y(c.h)); ctx.lineTo(x, Y(c.l)); ctx.stroke();
      var y1 = Y(Math.max(c.o, c.c)), y2 = Y(Math.min(c.o, c.c));
      ctx.fillRect(x - bw / 2, y1, bw, Math.max(1, y2 - y1));
    });
    if (o.ema) {
      ctx.strokeStyle = acc; ctx.lineWidth = 1.8; ctx.beginPath();
      var st = false;
      o.ema.forEach(function (val, i) {
        if (!isFinite(val)) return;
        var x = (i + 0.5) * step, yy = Y(val);
        if (!st) { ctx.moveTo(x, yy); st = true; } else ctx.lineTo(x, yy);
      });
      ctx.stroke();
    }
    (o.lines || []).forEach(function (l) {
      ctx.strokeStyle = l.color; ctx.fillStyle = l.color; ctx.setLineDash([5, 4]); ctx.lineWidth = 1.3;
      ctx.beginPath(); ctx.moveTo(0, Y(l.y)); ctx.lineTo(pw, Y(l.y)); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillText(l.label, 6, Y(l.y) - 8);
    });
    var last = candles[candles.length - 1], yl = Y(last.c);
    ctx.fillStyle = ink; ctx.fillRect(pw + 1, yl - 8, padR - 1, 16);
    ctx.fillStyle = css('--bg'); ctx.fillText(fnum(last.c), pw + 4, yl);
  }
  function drawEquity(cv, series, o) {
    var g = setupCanvas(cv, o.h || 210); if (!g) return;
    var ctx = g.ctx, w = g.w, h = g.h;
    var mut = css('--muted'), ln = css('--line');
    var padR = 48, padT = 10, padB = 18, pw = w - padR, ph = h - padT - padB, lo = 1, hi = 1, n = 0;
    series.forEach(function (s) { n = Math.max(n, s.data.length); s.data.forEach(function (v) { if (isFinite(v)) { if (v < lo) lo = v; if (v > hi) hi = v; } }); });
    var pad = (hi - lo) * 0.08 || 0.02; lo -= pad; hi += pad;
    function Y(v) { return padT + (hi - v) / (hi - lo) * ph; }
    function X(i) { return i / Math.max(1, n - 1) * pw; }
    ctx.font = '11px "JetBrains Mono", ui-monospace, monospace'; ctx.textBaseline = 'middle';
    for (var k = 0; k <= 4; k++) {
      var v = lo + (hi - lo) * k / 4, y = Y(v);
      ctx.strokeStyle = ln; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(pw, y); ctx.stroke();
      ctx.fillStyle = mut; ctx.fillText(((v - 1) * 100).toFixed(0) + '%', pw + 6, y);
    }
    ctx.strokeStyle = mut; ctx.setLineDash([2, 3]); ctx.beginPath(); ctx.moveTo(0, Y(1)); ctx.lineTo(pw, Y(1)); ctx.stroke(); ctx.setLineDash([]);
    if (o.split != null && o.split > 0 && o.split < n) {
      var sx = X(o.split);
      ctx.strokeStyle = css('--warn'); ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(sx, padT); ctx.lineTo(sx, padT + ph); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = css('--warn'); ctx.textBaseline = 'alphabetic'; ctx.fillText('out-of-sample', Math.min(sx + 4, pw - 84), h - 4);
    }
    series.forEach(function (s) {
      ctx.strokeStyle = s.color; ctx.lineWidth = s.w || 2; ctx.setLineDash(s.dash || []); ctx.beginPath();
      s.data.forEach(function (val, i) { var x = X(i), yy = Y(val); if (i === 0) ctx.moveTo(x, yy); else ctx.lineTo(x, yy); });
      ctx.stroke(); ctx.setLineDash([]);
    });
  }

  /* ---------- router ---------- */
  var cur = { name: 'inicio', arg: '' }, drawFn = null, armed = null;
  var exam = null, sess = {};

  var ROUTES = {
    inicio: { t: 'Trading Paso a Paso', tab: 'inicio', v: vInicio },
    aprender: { t: 'Aprender', tab: 'aprender', v: vAprender },
    leccion: { t: lessonTitle, tab: 'aprender', up: 'aprender', v: vLeccion },
    examen: { t: 'Examen', tab: 'aprender', up: 'aprender', v: vExamen },
    practicar: { t: 'Practicar', tab: 'practicar', v: vPracticar },
    simulador: { t: 'Simulador', tab: 'practicar', up: 'practicar', v: vSim, m: mSim },
    backtest: { t: 'Backtester', tab: 'practicar', up: 'practicar', v: vBt, m: mBt },
    calculadora: { t: 'Calculadora de riesgo', tab: 'practicar', up: 'practicar', v: vCalc, m: mCalc },
    plan: { t: 'Mi plan y checklist', tab: 'practicar', up: 'practicar', v: vPlan, m: mPlan },
    estrategias: { t: 'Estrategias', tab: 'practicar', up: 'practicar', v: vEstrategias },
    diario: { t: 'Diario', tab: 'diario', v: vDiario },
    mas: { t: 'Más', tab: 'mas', v: vMas },
    glosario: { t: 'Glosario', tab: 'mas', up: 'mas', v: vGlosario, m: mGlosario }
  };
  function lessonTitle(arg) { var l = lessonById(arg); return l ? l.title : 'Lección'; }

  function route() {
    var raw = (location.hash || '#inicio').slice(1), i = raw.indexOf('-');
    var name = i < 0 ? raw : raw.slice(0, i), arg = i < 0 ? '' : raw.slice(i + 1);
    if (!ROUTES[name]) { name = 'inicio'; arg = ''; }
    cur = { name: name, arg: arg };
    exam = null; armed = null;
    render();
    window.scrollTo(0, 0);
  }
  function render() {
    var R = ROUTES[cur.name], view = $('#view');
    drawFn = null;
    view.innerHTML = R.v(cur.arg);
    var title = typeof R.t === 'function' ? R.t(cur.arg) : R.t;
    $('#hdr').innerHTML = (R.up ? '<a class="back" href="#' + R.up + '" aria-label="Volver"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg></a>' : '') +
      '<span class="ttl">' + esc(title) + '</span>';
    $$('#tabs a').forEach(function (a) {
      if (a.dataset.tab === R.tab) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    document.title = cur.name === 'inicio' ? 'Trading Paso a Paso' : title + ' · Trading Paso a Paso';
    if (R.m) R.m(cur.arg);
  }
  function go(to) { if (location.hash === '#' + to) route(); else location.hash = '#' + to; }

  /* ---------- Inicio ---------- */
  function levelCard(lv) {
    var p = levelProgress(lv.id), pct = Math.round(p.done / p.total * 100);
    return '<a class="lvl" href="#aprender" style="--c:var(--lv' + lv.n + ')"><span class="tag">Nivel ' + lv.n + '</span><b>' + esc(lv.name) + '</b>' +
      '<span class="muted">' + esc(lv.desc) + '</span><div class="bar"><i style="width:' + pct + '%"></i></div>' +
      '<div class="meta"><span>' + p.done + ' de ' + p.total + ' lecciones</span>' +
      (S.exam[lv.id] != null ? '<span>Examen ' + S.exam[lv.id] + '%</span>' : '') + '</div></a>';
  }
  function vInicio() {
    var done = L.filter(function (l) { return S.done[l.id]; }).length, total = L.length;
    var next = L.filter(function (l) { return !S.done[l.id]; })[0], pct = Math.round(done / total * 100);
    var tip = C.tips[Math.floor(Date.now() / 864e5) % C.tips.length];
    return '<section class="intro"><span class="eyebrow">Tu progreso</span>' +
      '<h1>' + (done === 0 ? 'Empecemos desde cero' : (next ? 'Seguí donde dejaste' : 'Completaste el recorrido')) + '</h1>' +
      '<div class="bar big"><i style="width:' + pct + '%"></i></div>' +
      '<p class="muted mono" style="font-size:.82rem">' + done + ' de ' + total + ' lecciones · ' + pct + '%</p>' +
      (next ? '<a class="btn" href="#leccion-' + next.id + '">' + (done ? 'Continuar: ' : 'Empezar: ') + esc(next.title) + '</a>' :
        '<p class="ok-note">Ya pasaste por todas las lecciones. Seguí practicando en demo.</p>') + '</section>' +
      '<h2>Tres niveles</h2><div class="levels">' + C.levels.map(levelCard).join('') + '</div>' +
      '<h2>Para practicar</h2><div class="tools">' +
      '<a class="tool" href="#simulador"><b>Simulador</b><span>Operá velas simuladas con stop y objetivo.</span></a>' +
      '<a class="tool" href="#backtest"><b>Backtester</b><span>Probá reglas sobre datos simulados o tu CSV.</span></a>' +
      '<a class="tool" href="#calculadora"><b>Calculadora</b><span>Tamaño de posición según tu riesgo.</span></a>' +
      '<a class="tool" href="#diario"><b>Diario</b><span>Registrá operaciones y mirá tus métricas.</span></a></div>' +
      '<div class="note"><span class="lbl">Dato del día</span><p style="margin:0">' + esc(tip) + '</p></div>' +
      '<p class="disc">Material educativo. No es recomendación de inversión. Operar implica riesgo de perder capital.</p>';
  }

  /* ---------- Aprender ---------- */
  function vAprender() {
    return C.levels.map(function (lv) {
      var p = levelProgress(lv.id), ls = lessonsOf(lv.id);
      return '<div class="lvl-head" style="--c:var(--lv' + lv.n + ')"><h2>' + esc(lv.name) + '</h2><span class="tag">Nivel ' + lv.n + ' · ' + p.done + '/' + p.total + '</span></div>' +
        '<p class="muted" style="margin:-4px 0 12px">' + esc(lv.desc) + '</p>' +
        ls.map(function (l, i) {
          var q = S.quiz[l.id];
          return '<a class="les' + (S.done[l.id] ? ' done' : '') + '" href="#leccion-' + l.id + '" style="--c:var(--lv' + lv.n + ')">' +
            '<span class="n">' + (S.done[l.id] ? '✓' : (i + 1)) + '</span>' +
            '<span class="t">' + esc(l.title) + '<small>' + l.mins + ' min</small></span>' +
            '<span class="s">' + (q != null ? q + '/' + l.quiz.length : '') + '</span></a>';
        }).join('') +
        '<a class="btn ghost" href="#examen-' + lv.id + '" style="margin-top:6px">Examen del nivel ' + esc(lv.name) + (S.exam[lv.id] != null ? ' · mejor: ' + S.exam[lv.id] + '%' : '') + '</a>';
    }).join('') + '<p class="disc">Podés saltear niveles. Si ya sabés algo, probá el examen para ver cómo te va.</p>';
  }

  function blockHtml(b) {
    switch (b[0]) {
      case 'h': return '<h3>' + esc(b[1]) + '</h3>';
      case 'p': return '<p>' + rich(b[1]) + '</p>';
      case 'ul': return '<ul>' + b[1].map(function (i) { return '<li>' + rich(i) + '</li>'; }).join('') + '</ul>';
      case 'ex': return '<div class="ex"><span class="lbl">Ejemplo</span><p>' + rich(b[1]) + '</p></div>';
      case 'tip': return '<div class="tipb"><span class="lbl">Clave</span><p>' + rich(b[1]) + '</p></div>';
      case 'table':
        return '<div class="scroll"><table><thead><tr>' + b[1][0].map(function (c) { return '<th>' + esc(c) + '</th>'; }).join('') + '</tr></thead><tbody>' +
          b[1].slice(1).map(function (r) { return '<tr>' + r.map(function (c) { return '<td>' + esc(c) + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table></div>';
      case 'svg': return '<div class="fig">' + (FIGS[b[1]] || '') + '</div>';
      case 'go': return '<p><a class="btn ghost" href="#' + esc(b[1]) + '">' + esc(b[2]) + '</a></p>';
    }
    return '';
  }
  function vLeccion(id) {
    var l = lessonById(id);
    if (!l) return '<p>No encontré esa lección.</p><a class="btn" href="#aprender">Volver</a>';
    var lv = levelById(l.level), idx = L.indexOf(l), prev = L[idx - 1], next = L[idx + 1];
    var best = S.quiz[l.id];
    return '<article class="lesson" style="--c:var(--lv' + lv.n + ')"><div class="meta"><span class="pill">Nivel ' + lv.n + ' · ' + esc(lv.name) + '</span><span class="pill">' + l.mins + ' min</span></div>' +
      '<h1>' + esc(l.title) + '</h1>' + l.blocks.map(blockHtml).join('') +
      '<section class="quiz"><h2>Comprobá lo aprendido</h2>' +
      (best != null ? '<p class="muted" style="margin-top:-6px">Mejor resultado: ' + best + ' de ' + l.quiz.length + '</p>' : '') +
      l.quiz.map(function (q, qi) {
        return '<div class="q" data-l="' + l.id + '" data-q="' + qi + '"><div class="qt">' + esc(q.q) + '</div>' +
          stableOptions(q).map(function (o) { return '<button class="opt" data-a="ans" data-o="' + o.i + '">' + esc(o.t) + '</button>'; }).join('') +
          '<p class="why" hidden>' + esc(q.why) + '</p></div>';
      }).join('') + '<p class="mono muted" id="qscore" style="font-size:.82rem"></p></section>' +
      '<button class="btn' + (S.done[l.id] ? ' ghost' : '') + '" data-a="done" data-l="' + l.id + '">' + (S.done[l.id] ? 'Completada ✓ (tocá para desmarcar)' : 'Marcar como completada') + '</button>' +
      '<div class="lnav">' + (prev ? '<a class="btn ghost" href="#leccion-' + prev.id + '">← Anterior</a>' : '') +
      (next ? '<a class="btn ghost" href="#leccion-' + next.id + '">Siguiente →</a>' : '<a class="btn ghost" href="#examen-' + l.level + '">Ir al examen</a>') + '</div></article>';
  }

  /* ---------- Examen ---------- */
  function vExamen(level) {
    var lv = levelById(level);
    if (!lv) return '<p>Nivel no encontrado.</p>';
    if (!exam) {
      var qs = [];
      lessonsOf(level).forEach(function (l) { l.quiz.forEach(function (q) { qs.push({ q: q, lid: l.id }); }); });
      exam = { level: level, qs: shuffled(qs), i: 0, ok: 0, answered: false, wrong: [] };
    }
    var e = exam, total = e.qs.length;
    if (e.i >= total) {
      var pct = Math.round(e.ok / total * 100), pass = pct >= 70;
      if (S.exam[level] == null || pct > S.exam[level]) { S.exam[level] = pct; save(); }
      var wr = e.wrong.filter(function (v, i, a) { return a.indexOf(v) === i; });
      return '<div class="card"><span class="eyebrow">Resultado · ' + esc(lv.name) + '</span><h1>' + pct + '%</h1>' +
        '<p class="' + (pass ? 'ok-note' : 'down') + '" style="margin-top:8px">' + (pass ? 'Aprobado. Podés pasar de nivel con confianza.' : 'Todavía no llegás al 70%. Repasá las lecciones de abajo y probá de nuevo.') + '</p>' +
        '<p class="muted">' + e.ok + ' de ' + total + ' correctas.</p></div>' +
        (wr.length ? '<h2>Para repasar</h2>' + wr.map(function (id) { return '<a class="les" href="#leccion-' + id + '"><span class="t">' + esc(lessonById(id).title) + '</span></a>'; }).join('') : '') +
        '<div class="stack" style="margin-top:16px"><button class="btn" data-a="exretry">Repetir examen</button><a class="btn ghost" href="#aprender">Volver a Aprender</a></div>';
    }
    var it = e.qs[e.i];
    return '<span class="eyebrow">Examen ' + esc(lv.name) + ' · pregunta ' + (e.i + 1) + ' de ' + total + '</span>' +
      '<div class="bar prog" style="--c:var(--lv' + lv.n + ');margin-bottom:16px"><i style="width:' + (e.i / total * 100) + '%"></i></div>' +
      '<div class="q"><div class="qt">' + esc(it.q.q) + '</div>' +
      stableOptions(it.q).map(function (o) { return '<button class="opt" data-a="exans" data-o="' + o.i + '">' + esc(o.t) + '</button>'; }).join('') +
      '<p class="why" hidden>' + esc(it.q.why) + '</p></div>' +
      '<button class="btn" id="exnext" data-a="exnext" hidden>' + (e.i === total - 1 ? 'Ver resultado' : 'Siguiente') + '</button>';
  }

  /* ---------- Practicar ---------- */
  function vPracticar() {
    return '<div class="stack">' +
      [['simulador', 'Simulador de trading', 'Velas simuladas: abrí compras y ventas con stop y objetivo, y mirá cómo se resuelven.'],
       ['backtest', 'Backtester', 'Probá cuatro estrategias con datos simulados o con tu propio CSV. Incluye tramo out-of-sample.'],
       ['calculadora', 'Calculadora de riesgo', 'Cuántas unidades comprar según tu capital, tu riesgo y tu stop.'],
       ['estrategias', 'Estrategias de oro y Nasdaq', 'Cuatro esquemas simples, de day trading y de swing, para probar en demo.'],
       ['plan', 'Mi plan y checklist', 'Escribí tus reglas y repasá una lista antes de cada operación.']
      ].map(function (t) { return '<a class="tool" href="#' + t[0] + '"><b>' + t[1] + '</b><span>' + t[2] + '</span></a>'; }).join('') + '</div>' +
      '<p class="disc">Los datos del simulador y del backtester son ficticios. Sirven para practicar la mecánica, no para predecir mercados reales.</p>';
  }

  /* ---------- Estrategias ---------- */
  function vEstrategias() {
    return '<p class="muted">Esquemas básicos para practicar en demo. No son promesas de rentabilidad: son reglas claras para medir.</p>' +
      C.strategies.map(function (s) {
        return '<div class="card strat" style="margin-bottom:12px"><span class="eyebrow">' + esc(s.style) + '</span><h3>' + esc(s.asset) + '</h3>' +
          '<p class="mono muted" style="font-size:.8rem;margin:4px 0 0">' + esc(s.tf) + '</p><dl>' +
          s.rows.map(function (r) { return '<div><dt>' + esc(r[0]) + '</dt><dd>' + esc(r[1]) + '</dd></div>'; }).join('') + '</dl></div>';
      }).join('') +
      '<div class="callout"><b>Regla común:</b> arriesgá 1% o menos por operación, definí el stop antes de entrar y no lo muevas en contra.</div>' +
      '<a class="btn ghost" href="#backtest">Probar una regla parecida en el backtester</a>';
  }

  /* ---------- Calculadora ---------- */
  var calc = { capital: 10000, riskPct: 1, entry: 2000, stop: 1980, tp: 2040, kind: 'gen' };
  function vCalc() {
    function f(id, label, val, step) { return '<div class="fld"><label for="' + id + '">' + label + '</label><input id="' + id + '" type="number" inputmode="decimal" step="' + (step || 'any') + '" value="' + val + '"></div>'; }
    return '<p class="muted">Valores de ejemplo cargados. Cambialos por los tuyos.</p>' +
      '<form class="form" id="calcform" onsubmit="return false">' +
      '<div class="grid2">' + f('c_cap', 'Capital', calc.capital) + f('c_risk', 'Riesgo por operación (%)', calc.riskPct, '0.1') + '</div>' +
      '<div class="grid2">' + f('c_entry', 'Precio de entrada', calc.entry) + f('c_stop', 'Precio del stop', calc.stop) + '</div>' +
      '<div class="grid2">' + f('c_tp', 'Objetivo (opcional)', calc.tp) +
      '<div class="fld"><label for="c_kind">Instrumento</label><select id="c_kind"><option value="gen"' + (calc.kind === 'gen' ? ' selected' : '') + '>Genérico (unidades)</option><option value="xau"' + (calc.kind === 'xau' ? ' selected' : '') + '>Oro XAUUSD (lotes)</option></select></div></div></form>' +
      '<div id="calcout" style="margin-top:16px"></div>';
  }
  function mCalc() {
    var form = $('#calcform');
    function run() {
      calc = { capital: $('#c_cap').value, riskPct: $('#c_risk').value, entry: $('#c_entry').value, stop: $('#c_stop').value, tp: $('#c_tp').value, kind: $('#c_kind').value };
      var r = E.calcRisk(calc), out = $('#calcout');
      if (r.error) { out.innerHTML = '<div class="callout warn">' + esc(r.error) + '</div>'; return; }
      var xau = calc.kind === 'xau';
      var st = [
        ['Dinero en riesgo', '$' + nf(r.riskAmt)],
        ['Distancia al stop', nf(r.dist) + ' (' + nf(r.distPct) + '%)'],
        [xau ? 'Tamaño en onzas' : 'Tamaño (unidades)', nf(r.units, 2)]
      ];
      if (xau) st.push(['Lotes (100 oz)', nf(r.units / 100, 3)]);
      st.push(['Valor de la posición', '$' + nf(r.notional)]);
      st.push(['Apalancamiento implícito', nf(r.lev, 2) + ' a 1']);
      if (r.rr != null) { st.push(['R:R', '1 : ' + nf(r.rr, 2)]); st.push(['Ganancia si llega al objetivo', '$' + nf(r.reward)]); }
      var lev = r.lev > 1 ? '<div class="callout warn">La posición vale ' + nf(r.lev, 1) + ' veces tu capital. Vas a necesitar apalancamiento y margen. Revisá que tu stop sea realista.</div>' : '';
      var warn = r.warn ? '<div class="callout bad">' + esc(r.warn) + '</div>' : '';
      var lots = xau ? '<p class="muted" style="font-size:.82rem">En muchos brókers 1 lote de XAUUSD equivale a 100 onzas. Confirmá el tamaño de contrato en el tuyo.</p>' : '';
      var cap = +calc.capital, rp = +calc.riskPct;
      out.innerHTML = warn + '<div class="stats">' + st.map(function (s) { return '<div class="stat"><div class="k">' + s[0] + '</div><div class="v">' + s[1] + '</div></div>'; }).join('') + '</div>' + lots + lev +
        '<h3>Si tenés una mala racha</h3><div class="scroll"><table><thead><tr><th>Pérdidas seguidas</th><th class="num">Capital</th><th class="num">Caída</th></tr></thead><tbody>' +
        [3, 5, 10, 15].map(function (n) { var v = E.capitalAfterLosses(cap, rp, n); return '<tr><td>' + n + '</td><td class="num">$' + nf(v, 0) + '</td><td class="num down">' + nf((v / cap - 1) * 100, 1) + '%</td></tr>'; }).join('') + '</tbody></table></div>';
    }
    form.addEventListener('input', run); form.addEventListener('change', run);
    run();
  }

  /* ---------- Plan y checklist ---------- */
  function vPlan() {
    return '<h2 style="margin-top:0">Mi plan</h2><p class="muted">Se guarda en este dispositivo.</p><div class="form">' +
      C.planFields.map(function (f) {
        return '<div class="fld"><label for="p_' + f[0] + '">' + esc(f[1]) + '</label><textarea id="p_' + f[0] + '" data-plan="' + f[0] + '" rows="2" placeholder="' + esc(f[2]) + '">' + esc(S.plan[f[0]] || '') + '</textarea></div>';
      }).join('') + '</div>' +
      '<h2>Checklist antes de operar</h2>' +
      C.checklist.map(function (c, i) { return '<label class="chk"><input type="checkbox" data-chk="' + i + '"' + (S.check[i] ? ' checked' : '') + '><span>' + esc(c) + '</span></label>'; }).join('') +
      '<p class="mono muted" id="chkres" style="font-size:.85rem"></p>' +
      '<button class="btn ghost" data-a="chkreset">Reiniciar checklist</button>';
  }
  function chkUpdate() {
    var el = $('#chkres'); if (!el) return;
    var n = C.checklist.filter(function (c, i) { return S.check[i]; }).length;
    el.textContent = n + ' de ' + C.checklist.length + ' puntos confirmados' + (n === C.checklist.length ? ' · listo para evaluar la entrada' : '');
  }
  function mPlan() { chkUpdate(); }

  /* ---------- Simulador ---------- */
  var sim = { mode: 'mixed', stopAtr: 1.5, rr: 2, risk: 1, ema: true, start: 10000, candles: null };
  function simNew() {
    sim.seed = Math.floor(Math.random() * 1e6) + 1;
    sim.candles = E.genSeries({ n: 700, seed: sim.seed, start: 2000, mode: sim.mode });
    var cl = sim.candles.map(function (c) { return c.c; });
    sim.atr = E.atr(sim.candles, 14); sim.e20 = E.ema(cl, 20);
    sim.idx = 80; sim.pos = null; sim.trades = []; sim.bal = sim.start; sim.msg = '';
  }
  function simOpen(dir) {
    if (sim.pos) return;
    if (sim.idx >= sim.candles.length - 2) { sim.msg = 'Se acabó la serie. Empezá una nueva.'; return; }
    var c = sim.candles[sim.idx], dist = sim.atr[sim.idx] * sim.stopAtr;
    sim.pos = { dir: dir, entry: c.c, dist: dist, stop: c.c - dir * dist, tp: c.c + dir * dist * sim.rr, riskAmt: sim.bal * sim.risk / 100 };
    sim.msg = (dir === 1 ? 'Compra' : 'Venta') + ' abierta en ' + nf(c.c) + '. Stop ' + nf(sim.pos.stop) + ' · objetivo ' + nf(sim.pos.tp) + '.';
  }
  function simClose(price, why) {
    var p = sim.pos, R = p.dir * (price - p.entry) / p.dist;
    sim.bal += p.riskAmt * R;
    sim.trades.push({ dir: p.dir, R: R, why: why });
    sim.msg = 'Operación cerrada por ' + why + ': ' + sgn(R, 2) + ' R (' + (R >= 0 ? '+' : '−') + '$' + nf(Math.abs(p.riskAmt * R)) + ').';
    sim.pos = null;
  }
  function simNext(k) {
    for (var j = 0; j < k; j++) {
      if (sim.idx >= sim.candles.length - 1) { sim.msg = 'Se acabó la serie. Empezá una nueva.'; break; }
      sim.idx++;
      if (sim.pos) {
        var hit = E.checkExit(sim.pos, sim.candles[sim.idx]);
        if (hit) { simClose(hit.price, hit.reason); break; }
      }
    }
  }
  function vSim() {
    if (!sim.candles) simNew();
    var tr = sim.trades, wins = tr.filter(function (t) { return t.R > 0; }).length, tot = tr.reduce(function (a, t) { return a + t.R; }, 0);
    var c = sim.candles[sim.idx], un = sim.pos ? sim.pos.dir * (c.c - sim.pos.entry) / sim.pos.dist : 0;
    function sel(k, opts) { return '<select data-c="sim" data-k="' + k + '" id="s_' + k + '">' + opts.map(function (o) { return '<option value="' + o[0] + '"' + (String(sim[k]) === String(o[0]) ? ' selected' : '') + '>' + o[1] + '</option>'; }).join('') + '</select>'; }
    return '<p class="muted">Datos ficticios. Decidí al cierre de la vela actual; el stop va a ' + nf(sim.stopAtr, 1) + ' × ATR y arriesgás ' + nf(sim.risk, 1) + '% del saldo.</p>' +
      '<canvas class="cv" id="simcv" role="img" aria-label="Gráfico de velas simulado"></canvas>' +
      '<div class="stats" style="margin-top:10px">' +
      '<div class="stat"><div class="k">Saldo</div><div class="v">$' + nf(sim.bal, 0) + '</div></div>' +
      '<div class="stat"><div class="k">Resultado acumulado</div><div class="v ' + cls(tot) + '">' + sgn(tot, 2) + ' R</div></div>' +
      '<div class="stat"><div class="k">Operaciones</div><div class="v">' + tr.length + (tr.length ? ' · ' + nf(wins / tr.length * 100, 0) + '% ganadas' : '') + '</div></div>' +
      '<div class="stat"><div class="k">Posición abierta</div><div class="v ' + cls(un) + '">' + (sim.pos ? (sim.pos.dir === 1 ? 'Compra ' : 'Venta ') + sgn(un, 2) + ' R' : 'Ninguna') + '</div></div></div>' +
      (sim.msg ? '<div class="callout" role="status">' + esc(sim.msg) + '</div>' : '') +
      '<div class="row" style="margin-top:12px"><button class="btn buy" data-a="sbuy"' + (sim.pos ? ' disabled' : '') + '>Comprar</button><button class="btn sell" data-a="ssell"' + (sim.pos ? ' disabled' : '') + '>Vender</button></div>' +
      '<div class="row" style="margin-top:10px"><button class="btn ghost" data-a="snext" data-k="1">Siguiente vela</button><button class="btn ghost" data-a="snext" data-k="5">+5 velas</button>' +
      '<button class="btn danger" data-a="sclose"' + (sim.pos ? '' : ' disabled') + '>Cerrar ahora</button></div>' +
      '<h2>Ajustes</h2><div class="grid2">' +
      '<div class="fld"><label for="s_mode">Tipo de mercado</label>' + sel('mode', [['mixed', 'Mixto'], ['trend', 'Tendencia'], ['range', 'Lateral']]) + '</div>' +
      '<div class="fld"><label for="s_stopAtr">Stop (× ATR)</label>' + sel('stopAtr', [[1, '1'], [1.5, '1,5'], [2, '2']]) + '</div>' +
      '<div class="fld"><label for="s_rr">Objetivo (R:R)</label>' + sel('rr', [[1, '1:1'], [1.5, '1:1,5'], [2, '1:2'], [3, '1:3']]) + '</div>' +
      '<div class="fld"><label for="s_risk">Riesgo por operación</label>' + sel('risk', [[0.5, '0,5%'], [1, '1%'], [2, '2%'], [5, '5%']]) + '</div></div>' +
      '<label class="chk" style="margin-top:10px"><input type="checkbox" data-c="simema"' + (sim.ema ? ' checked' : '') + '><span>Mostrar EMA 20</span></label>' +
      '<button class="btn ghost" data-a="snew">Nueva serie</button>';
  }
  function mSim() {
    drawFn = function () {
      var cv = $('#simcv'); if (!cv) return;
      var from = Math.max(0, sim.idx - 59), sl = sim.candles.slice(from, sim.idx + 1), lines = [];
      if (sim.pos) {
        lines.push({ y: sim.pos.entry, label: 'entrada', color: css('--ink') });
        lines.push({ y: sim.pos.stop, label: 'stop', color: css('--down') });
        lines.push({ y: sim.pos.tp, label: 'objetivo', color: css('--up') });
      }
      drawCandles(cv, sl, { h: 280, slots: 60, lines: lines, ema: sim.ema ? sim.e20.slice(from, sim.idx + 1) : null });
    };
    drawFn();
  }

  /* ---------- Backtester ---------- */
  var bt = { src: 'mixed', seed: 11, csv: null, csvInfo: '', err: '', strategy: 'pullback', p1: 50, p2: 20, dir: 'both', stopAtr: 1.5, rr: 2, risk: 1, cost: 0.02, maxBars: 30, oos: 30, res: null, csvText: '' };
  var BT_STRATS = {
    pullback: { name: 'Retroceso a EMA con vela de rechazo', l1: 'EMA de tendencia', l2: 'EMA del retroceso', d1: 50, d2: 20 },
    ema: { name: 'Cruce de dos EMAs', l1: 'EMA rápida', l2: 'EMA lenta', d1: 20, d2: 50 },
    rsi: { name: 'RSI vuelve de la sobreventa', l1: 'Nivel de sobreventa', l2: 'Filtro EMA (0 = sin filtro)', d1: 30, d2: 0 },
    breakout: { name: 'Ruptura de máximos y mínimos', l1: 'Ventana en velas', l2: null, d1: 20, d2: 0 }
  };
  function readBt() {
    function v(id, def) { var el = $('#' + id); return el ? el.value : def; }
    bt.src = v('b_src', bt.src); bt.seed = Math.max(1, parseInt(v('b_seed', bt.seed), 10) || 1);
    bt.strategy = v('b_strat', bt.strategy);
    bt.p1 = parseFloat(v('b_p1', bt.p1)); bt.p2 = parseFloat(v('b_p2', bt.p2));
    bt.dir = v('b_dir', bt.dir); bt.stopAtr = parseFloat(v('b_stop', bt.stopAtr)); bt.rr = parseFloat(v('b_rr', bt.rr));
    bt.risk = parseFloat(v('b_risk', bt.risk)); bt.cost = parseFloat(v('b_cost', bt.cost));
    bt.maxBars = parseInt(v('b_max', bt.maxBars), 10); bt.oos = parseInt(v('b_oos', bt.oos), 10);
    var ta = $('#b_csv'); if (ta) bt.csvText = ta.value;
  }
  function vBt() {
    var s = BT_STRATS[bt.strategy];
    function opt(val, label, curv) { return '<option value="' + val + '"' + (String(curv) === String(val) ? ' selected' : '') + '>' + label + '</option>'; }
    function num(id, label, val, step) { return '<div class="fld"><label for="' + id + '">' + label + '</label><input id="' + id + '" type="number" inputmode="decimal" step="' + (step || 'any') + '" value="' + val + '"></div>'; }
    return '<p class="muted">Probá una regla sobre datos pasados. La señal sale al cierre de una vela y se entra en la apertura de la siguiente. Si una vela toca stop y objetivo, gana el stop.</p>' +
      '<form class="form" id="btform" onsubmit="return false">' +
      '<div class="fld"><label for="b_src">Datos</label><select id="b_src">' + opt('mixed', 'Simulados · mixtos', bt.src) + opt('trend', 'Simulados · tendencia', bt.src) + opt('range', 'Simulados · lateral', bt.src) + opt('csv', 'Mi archivo CSV', bt.src) + '</select></div>' +
      (bt.src === 'csv' ?
        '<div class="fld"><label for="b_file">Archivo CSV (open, high, low, close)</label><input id="b_file" type="file" accept=".csv,.txt,text/csv,text/plain"></div>' +
        '<div class="fld"><label for="b_csv">O pegá el contenido acá</label><textarea id="b_csv" rows="4" placeholder="date,open,high,low,close&#10;2024-01-02,2060.5,2075.1,2051.2,2070.3">' + esc(bt.csvText) + '</textarea></div>' +
        '<button type="button" class="btn ghost sm" data-a="btcsv">Usar estos datos</button>' +
        (bt.err ? '<div class="callout bad">' + esc(bt.err) + '</div>' : '') + (bt.csvInfo ? '<div class="callout good">' + esc(bt.csvInfo) + '</div>' : '')
        : num('b_seed', 'Semilla de la serie (mismo número = misma serie)', bt.seed, '1')) +
      '<div class="fld"><label for="b_strat">Estrategia</label><select id="b_strat">' + Object.keys(BT_STRATS).map(function (k) { return opt(k, BT_STRATS[k].name, bt.strategy); }).join('') + '</select></div>' +
      '<div class="grid2">' + num('b_p1', s.l1, bt.p1, '1') + (s.l2 ? num('b_p2', s.l2, bt.p2, '1') : '') + '</div>' +
      '<div class="grid2"><div class="fld"><label for="b_dir">Dirección</label><select id="b_dir">' + opt('both', 'Compras y ventas', bt.dir) + opt('long', 'Solo compras', bt.dir) + opt('short', 'Solo ventas', bt.dir) + '</select></div>' +
      num('b_stop', 'Stop (× ATR)', bt.stopAtr, '0.1') + num('b_rr', 'Objetivo (R:R)', bt.rr, '0.1') + num('b_risk', 'Riesgo por operación (%)', bt.risk, '0.1') +
      num('b_cost', 'Costo por operación (%)', bt.cost, '0.01') + num('b_max', 'Máx. velas abierta', bt.maxBars, '1') + '</div>' +
      num('b_oos', 'Reservar el último tramo para validar (%)', bt.oos, '5') +
      '<button type="button" class="btn" data-a="btrun">Correr backtest</button></form>' +
      '<div id="btres" style="margin-top:18px"></div>';
  }
  function btCandles() {
    if (bt.src === 'csv') {
      if (!bt.csv) throw new Error('Cargá un archivo o pegá datos y tocá “Usar estos datos”.');
      return bt.csv;
    }
    return E.genSeries({ n: 1500, seed: bt.seed, start: 2000, mode: bt.src });
  }
  function btRun() {
    var box = $('#btres'); if (!box) return;
    var candles;
    try { candles = btCandles(); } catch (e) { box.innerHTML = '<div class="callout warn">' + esc(e.message) + '</div>'; return; }
    var s = BT_STRATS[bt.strategy];
    if (![bt.p1, bt.stopAtr, bt.rr, bt.risk, bt.maxBars].every(function (x) { return isFinite(x) && x > 0; }) || (s.l2 && !isFinite(bt.p2)) || bt.p2 < 0 || bt.oos < 0 || bt.oos > 60) {
      box.innerHTML = '<div class="callout warn">Revisá los parámetros: deben ser números mayores a 0 y el tramo reservado, entre 0 y 60.</div>'; return;
    }
    var res = E.backtest(candles, { strategy: bt.strategy, params: { p1: bt.p1, p2: s.l2 ? bt.p2 : 0 }, dir: bt.dir, atrLen: 14, stopAtr: bt.stopAtr, rr: bt.rr, riskPct: bt.risk, costPct: bt.cost, maxBars: bt.maxBars, oosPct: bt.oos });
    bt.res = res; bt.candlesN = candles.length;
    var m = res.all;
    if (m.n === 0) { box.innerHTML = '<div class="callout warn">Con estos parámetros no hubo ninguna operación. Probá otros valores o más datos.</div>'; return; }
    var hint = '';
    var synth = bt.src !== 'csv';
    if (m.n < 30) hint = '<div class="callout warn">Solo ' + m.n + ' operaciones: con tan pocas, el resultado puede ser puro azar.</div>';
    else if (res.oos.n >= 5 && res.inS.exp > 0 && res.oos.exp <= 0) hint = '<div class="callout bad">El tramo reservado no confirma el resultado del tramo de diseño. Es la señal clásica de sobreajuste.</div>';
    else if (res.oos.n >= 5 && res.inS.exp > 0 && res.oos.exp > 0) hint = '<div class="callout good">El tramo reservado también da positivo. Buena señal, pero faltan datos reales, costos reales y más pruebas.</div>';
    else if (m.exp <= 0) hint = '<div class="callout warn">La regla no muestra ventaja en estos datos.</div>';
    if (synth) hint += '<p class="muted" style="font-size:.84rem">Los datos son simulados: sirven para entender la mecánica. Cambiá el tipo de mercado y mirá cómo la misma regla rinde distinto.</p>';
    function st(k, v, c) { return '<div class="stat"><div class="k">' + k + '</div><div class="v ' + (c || '') + '">' + v + '</div></div>'; }
    function seg(name, x) { return '<tr><td>' + name + '</td><td class="num">' + x.n + '</td><td class="num">' + (x.n ? nf(x.winRate, 0) + '%' : '–') + '</td><td class="num ' + cls(x.exp) + '">' + (x.n ? sgn(x.exp, 2) : '–') + '</td><td class="num ' + cls(x.totalR) + '">' + sgn(x.totalR, 1) + '</td></tr>'; }
    box.innerHTML = '<h2 style="margin-top:0">Resultado</h2>' + hint + '<div class="stats">' +
      st('Operaciones', m.n) + st('Aciertos', nf(m.winRate, 0) + '%') +
      st('Expectativa', sgn(m.exp, 2) + ' R', cls(m.exp)) + st('Profit factor', nf(m.pf, 2)) +
      st('Retorno de la estrategia', sgn(res.ret, 1) + '%', cls(res.ret)) + st('Caída máxima', '−' + nf(res.dd, 1) + '%', 'down') +
      st('Comprar y mantener', sgn(res.hold, 1) + '%', cls(res.hold)) + st('Ganadora / perdedora media', sgn(m.avgWin, 2) + ' / ' + nf(m.avgLoss, 2) + ' R') + '</div>' +
      '<h3>Capital a lo largo del tiempo</h3><canvas class="cv" id="btcv" role="img" aria-label="Curva de capital del backtest"></canvas>' +
      '<p class="muted" style="font-size:.82rem;margin-top:6px"><span style="color:var(--accent)">━</span> estrategia · <span style="color:var(--muted)">┅</span> comprar y mantener' + (bt.oos > 0 ? ' · línea amarilla: inicio del tramo reservado' : '') + '</p>' +
      '<h3>Diseño contra validación</h3><div class="scroll"><table><thead><tr><th>Tramo</th><th class="num">Op.</th><th class="num">Acierto</th><th class="num">Exp. (R)</th><th class="num">Total R</th></tr></thead><tbody>' +
      seg('Diseño (' + (100 - bt.oos) + '%)', res.inS) + (bt.oos > 0 ? seg('Reservado (' + bt.oos + '%)', res.oos) : '') + seg('Todo', res.all) + '</tbody></table></div>' +
      '<h3>Últimas operaciones</h3><div class="scroll"><table><thead><tr><th>#</th><th>Tipo</th><th class="num">Entrada</th><th class="num">Salida</th><th class="num">R</th><th>Motivo</th></tr></thead><tbody>' +
      res.trades.slice(-15).reverse().map(function (t, i) { return '<tr><td>' + (res.trades.length - i) + '</td><td>' + (t.dir === 1 ? 'Compra' : 'Venta') + '</td><td class="num">' + nf(t.entry) + '</td><td class="num">' + nf(t.exit) + '</td><td class="num ' + cls(t.R) + '">' + sgn(t.R, 2) + '</td><td>' + t.reason + '</td></tr>'; }).join('') + '</tbody></table></div>';
    drawFn = function () {
      var cv = $('#btcv'); if (!cv || !bt.res) return;
      var base = candles[0].c;
      drawEquity(cv, [
        { data: candles.map(function (c) { return c.c / base; }), color: css('--muted'), dash: [4, 4], w: 1.4 },
        { data: bt.res.curve, color: css('--accent'), w: 2 }
      ], { split: bt.oos > 0 ? bt.res.split : null });
    };
    drawFn();
  }
  function mBt() { btRun(); }

  /* ---------- Diario ---------- */
  function journalStats() {
    var tr = S.journal.map(function (j) { return { R: j.R }; });
    return E.metrics(tr);
  }
  function vDiario() {
    var j = S.journal, m = journalStats();
    function f(id, label, type, extra) { return '<div class="fld"><label for="' + id + '">' + label + '</label><input id="' + id + '" type="' + type + '" ' + (extra || '') + '></div>'; }
    return (j.length ? '<div class="stats">' +
      '<div class="stat"><div class="k">Operaciones</div><div class="v">' + m.n + '</div></div>' +
      '<div class="stat"><div class="k">Aciertos</div><div class="v">' + nf(m.winRate, 0) + '%</div></div>' +
      '<div class="stat"><div class="k">Expectativa</div><div class="v ' + cls(m.exp) + '">' + sgn(m.exp, 2) + ' R</div></div>' +
      '<div class="stat"><div class="k">Total</div><div class="v ' + cls(m.totalR) + '">' + sgn(m.totalR, 2) + ' R</div></div></div>' +
      (m.n < 30 ? '<p class="muted" style="font-size:.84rem;margin-top:8px">Con menos de 30 operaciones las métricas son muy inestables.</p>' : '') : '<div class="callout">Todavía no cargaste operaciones. Registrá cada una apenas la cierres.</div>') +
      '<h2>Nueva operación</h2><form class="form" id="jform" onsubmit="return false">' +
      '<div class="grid2">' + f('j_asset', 'Activo', 'text', 'placeholder="XAUUSD" autocomplete="off"') +
      '<div class="fld"><label for="j_dir">Dirección</label><select id="j_dir"><option value="1">Compra</option><option value="-1">Venta</option></select></div></div>' +
      '<div class="grid2">' + f('j_entry', 'Entrada', 'number', 'inputmode="decimal" step="any"') + f('j_stop', 'Stop', 'number', 'inputmode="decimal" step="any"') + '</div>' +
      f('j_exit', 'Salida', 'number', 'inputmode="decimal" step="any"') +
      '<div class="fld"><label for="j_note">Por qué entraste y cómo te sentiste</label><textarea id="j_note" rows="3"></textarea></div>' +
      '<div id="jerr" role="alert"></div><button class="btn" data-a="jadd">Guardar operación</button></form>' +
      (j.length ? '<h2>Historial</h2>' + j.slice().reverse().map(function (x) {
        return '<div class="jitem"><div class="top"><b>' + esc(x.asset || 'Sin nombre') + ' · ' + (x.dir === 1 ? 'Compra' : 'Venta') + '</b><span class="r ' + cls(x.R) + '">' + sgn(x.R, 2) + ' R</span></div>' +
          '<span class="mono muted" style="font-size:.78rem">' + esc(x.date) + ' · ' + nf(x.entry) + ' → ' + nf(x.exit) + ' · stop ' + nf(x.stop) + '</span>' +
          (x.note ? '<p>' + esc(x.note) + '</p>' : '') +
          '<div><button class="btn ' + (armed === x.id ? 'danger' : 'ghost') + ' sm" data-a="jdel" data-id="' + x.id + '">' + (armed === x.id ? 'Confirmar borrado' : 'Borrar') + '</button></div></div>';
      }).join('') + '<div class="stack" style="margin-top:12px"><button class="btn ghost" data-a="jcsv">Copiar como CSV</button><textarea id="csvout" hidden readonly rows="6" aria-label="CSV del diario"></textarea></div>' : '');
  }

  /* ---------- Glosario ---------- */
  function vGlosario() {
    return '<div class="fld search"><label for="gsearch">Buscar término</label><input id="gsearch" type="text" placeholder="Ej: spread, ATR, drawdown" autocomplete="off"></div><div id="glist"></div>';
  }
  function glRender(q) {
    q = (q || '').toLowerCase().trim();
    var items = C.glossary.filter(function (g) { return !q || g[0].toLowerCase().indexOf(q) >= 0 || g[1].toLowerCase().indexOf(q) >= 0; });
    $('#glist').innerHTML = items.length ? items.map(function (g) { return '<div class="gl"><b>' + esc(g[0]) + '</b><p>' + esc(g[1]) + '</p></div>'; }).join('') : '<p class="muted">No encontré ese término.</p>';
  }
  function mGlosario() { glRender(''); $('#gsearch').addEventListener('input', function (e) { glRender(e.target.value); }); }

  /* ---------- Más ---------- */
  var deferredPrompt = null;
  function vMas() {
    var done = L.filter(function (l) { return S.done[l.id]; }).length;
    return '<h2 style="margin-top:0">Tu progreso</h2><div class="card">' +
      C.levels.map(function (lv) {
        var p = levelProgress(lv.id), qs = lessonsOf(lv.id).filter(function (l) { return S.quiz[l.id] != null; });
        return '<div style="margin-bottom:14px;--c:var(--lv' + lv.n + ')"><div style="display:flex;justify-content:space-between;gap:10px"><b>' + esc(lv.name) + '</b><span class="mono muted" style="font-size:.8rem">' + p.done + '/' + p.total + ' lecciones' + (S.exam[lv.id] != null ? ' · examen ' + S.exam[lv.id] + '%' : '') + '</span></div><div class="bar" style="margin-top:6px"><i style="width:' + Math.round(p.done / p.total * 100) + '%"></i></div></div>';
      }).join('') + '<p class="muted" style="margin:0;font-size:.85rem">' + done + ' de ' + L.length + ' lecciones completadas.</p></div>' +
      '<h2>Herramientas</h2><div class="stack"><a class="tool" href="#glosario"><b>Glosario</b><span>' + C.glossary.length + ' términos explicados en simple.</span></a></div>' +
      '<h2>Apariencia</h2><div class="seg" role="group" aria-label="Tema">' +
      [['auto', 'Automático'], ['light', 'Claro'], ['dark', 'Oscuro']].map(function (t) { return '<button data-a="theme" data-t="' + t[0] + '" aria-pressed="' + (S.theme === t[0]) + '">' + t[1] + '</button>'; }).join('') + '</div>' +
      '<h2>Instalar en el celular</h2><div class="card">' +
      (deferredPrompt ? '<button class="btn" data-a="install" style="margin-bottom:12px">Instalar app</button>' : '') +
      '<p><b>Android (Chrome):</b> menú ⋮ → “Instalar app” o “Agregar a la pantalla principal”.</p>' +
      '<p style="margin:0"><b>iPhone (Safari):</b> botón Compartir → “Agregar a inicio”.</p></div>' +
      '<h2>Datos</h2><p class="muted" style="font-size:.9rem">Tu progreso, diario y plan se guardan solo en este dispositivo.</p>' +
      '<button class="btn ' + (armed === 'reset' ? 'danger' : 'ghost') + '" data-a="reset">' + (armed === 'reset' ? 'Tocá de nuevo para borrar todo' : 'Borrar progreso y datos') + '</button>' +
      '<p class="disc">Material educativo. No es recomendación de inversión. Operar implica riesgo de perder capital. Los datos simulados no representan mercados reales.</p>';
  }

  /* ---------- eventos ---------- */
  var actions = {
    done: function (t) { var id = t.dataset.l; if (S.done[id]) delete S.done[id]; else S.done[id] = true; save(); render(); },
    ans: function (t) {
      var card = t.closest('.q'), l = lessonById(card.dataset.l), qi = +card.dataset.q, key = l.id + ':' + qi;
      if (sess[key] != null) return;
      var oi = +t.dataset.o, q = l.quiz[qi]; sess[key] = oi;
      $$('.opt', card).forEach(function (b) { b.disabled = true; var o = +b.dataset.o; if (o === q.a) b.classList.add('ok'); else if (o === oi) b.classList.add('bad'); });
      $('.why', card).hidden = false;
      var answered = 0, correct = 0;
      l.quiz.forEach(function (qq, i) { var a = sess[l.id + ':' + i]; if (a != null) { answered++; if (a === qq.a) correct++; } });
      var sc = $('#qscore'); if (sc) sc.textContent = answered === l.quiz.length ? 'Resultado: ' + correct + ' de ' + l.quiz.length : '';
      if (answered === l.quiz.length && (S.quiz[l.id] == null || correct > S.quiz[l.id])) { S.quiz[l.id] = correct; save(); }
    },
    exans: function (t) {
      if (exam.answered) return;
      exam.answered = true;
      var it = exam.qs[exam.i], oi = +t.dataset.o;
      $$('.opt', $('#view')).forEach(function (b) { b.disabled = true; var o = +b.dataset.o; if (o === it.q.a) b.classList.add('ok'); else if (o === oi) b.classList.add('bad'); });
      if (oi === it.q.a) exam.ok++; else exam.wrong.push(it.lid);
      $('.why', $('#view')).hidden = false; $('#exnext').hidden = false;
    },
    exnext: function () { exam.i++; exam.answered = false; render(); window.scrollTo(0, 0); },
    exretry: function () { exam = null; render(); window.scrollTo(0, 0); },
    chkreset: function () { S.check = {}; save(); $$('input[data-chk]').forEach(function (c) { c.checked = false; }); chkUpdate(); },
    sbuy: function () { simOpen(1); render(); },
    ssell: function () { simOpen(-1); render(); },
    snext: function (t) { simNext(+t.dataset.k); render(); },
    sclose: function () { if (sim.pos) { simClose(sim.candles[sim.idx].c, 'cierre manual'); render(); } },
    snew: function () { simNew(); render(); },
    btrun: function () { readBt(); btRun(); },
    btcsv: function () {
      readBt(); bt.err = ''; bt.csvInfo = '';
      try {
        bt.csv = E.parseCSV(bt.csvText);
        bt.csvInfo = 'Cargué ' + bt.csv.length + ' velas.';
      } catch (e) { bt.csv = null; bt.err = e.message; }
      render();
    },
    jadd: function () {
      var asset = $('#j_asset').value.trim(), dir = +$('#j_dir').value, en = parseFloat($('#j_entry').value), sp = parseFloat($('#j_stop').value), ex = parseFloat($('#j_exit').value);
      var err = $('#jerr');
      if (![en, sp, ex].every(isFinite) || en <= 0 || sp <= 0 || ex <= 0) { err.innerHTML = '<div class="callout warn">Completá entrada, stop y salida con números mayores a 0.</div>'; return; }
      if (en === sp) { err.innerHTML = '<div class="callout warn">La entrada y el stop no pueden ser iguales.</div>'; return; }
      if ((dir === 1 && sp >= en) || (dir === -1 && sp <= en)) { err.innerHTML = '<div class="callout warn">El stop está del lado equivocado: en una compra va por debajo de la entrada, en una venta por encima.</div>'; return; }
      S.journal.push({ id: Date.now().toString(36), date: new Date().toLocaleDateString('es-AR'), asset: asset, dir: dir, entry: en, stop: sp, exit: ex, R: E.journalR(dir, en, sp, ex), note: $('#j_note').value.trim() });
      save(); render();
    },
    jdel: function (t) {
      var id = t.dataset.id;
      if (armed === id) { S.journal = S.journal.filter(function (j) { return j.id !== id; }); armed = null; save(); } else armed = id;
      render();
    },
    jcsv: function () {
      var rows = [['fecha', 'activo', 'direccion', 'entrada', 'stop', 'salida', 'R', 'nota']].concat(S.journal.map(function (j) { return [j.date, j.asset, j.dir === 1 ? 'compra' : 'venta', j.entry, j.stop, j.exit, j.R.toFixed(2), j.note]; }));
      var txt = rows.map(function (r) { return r.map(function (c) { return '"' + String(c).replace(/"/g, '""').replace(/\r?\n/g, ' ') + '"'; }).join(','); }).join('\n');
      var ta = $('#csvout');
      function fallback() { ta.hidden = false; ta.value = txt; ta.focus(); ta.select(); }
      try { navigator.clipboard.writeText(txt).then(function () { ta.hidden = false; ta.value = 'Copiado al portapapeles.'; }, fallback); } catch (e) { fallback(); }
    },
    theme: function (t) { S.theme = t.dataset.t; save(); applyTheme(); render(); },
    install: function () {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      Promise.resolve(deferredPrompt.userChoice).catch(function () { }).then(function () { deferredPrompt = null; render(); });
    },
    reset: function () {
      if (armed === 'reset') { S = defaults(); save(); applyTheme(); armed = null; sess = {}; } else armed = 'reset';
      render();
    }
  };
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-a]');
    if (t && actions[t.dataset.a]) actions[t.dataset.a](t, e);
  });
  document.addEventListener('change', function (e) {
    var t = e.target;
    if (t.dataset && t.dataset.c === 'sim') {
      var k = t.dataset.k;
      sim[k] = k === 'mode' ? t.value : parseFloat(t.value);
      if (k === 'mode') simNew();
      render();
    } else if (t.dataset && t.dataset.c === 'simema') { sim.ema = t.checked; render(); }
    else if (t.dataset && t.dataset.chk != null) { S.check[t.dataset.chk] = t.checked; save(); chkUpdate(); }
    else if (t.id === 'b_strat') { readBt(); var s = BT_STRATS[bt.strategy]; bt.p1 = s.d1; bt.p2 = s.d2; render(); }
    else if (t.id === 'b_src') { readBt(); bt.err = ''; render(); }
    else if (t.id === 'b_file' && t.files && t.files[0]) {
      var fr = new FileReader();
      fr.onload = function () { bt.csvText = String(fr.result || ''); bt.err = ''; bt.csvInfo = ''; try { bt.csv = E.parseCSV(bt.csvText); bt.csvInfo = 'Cargué ' + bt.csv.length + ' velas.'; } catch (er) { bt.csv = null; bt.err = er.message; } render(); };
      fr.onerror = function () { bt.err = 'No pude leer el archivo.'; render(); };
      fr.readAsText(t.files[0]);
    }
  });
  document.addEventListener('input', function (e) {
    var t = e.target;
    if (t.dataset && t.dataset.plan) { S.plan[t.dataset.plan] = t.value; save(); }
  });
  window.addEventListener('hashchange', route);
  window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); deferredPrompt = e; if (cur.name === 'mas') render(); });
  function redraw() { if (drawFn) drawFn(); }
  window.addEventListener('resize', redraw);
  try { window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', redraw); } catch (e) { /* sin soporte */ }
  try { new MutationObserver(redraw).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] }); } catch (e) { /* sin soporte */ }

  /* ---------- arranque ---------- */
  applyTheme();
  route();
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
    window.addEventListener('load', function () { navigator.serviceWorker.register('sw.js').catch(function () { /* entorno sin service worker */ }); });
  }
})();
