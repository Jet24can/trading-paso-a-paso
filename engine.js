/* Motor de cálculo: datos simulados, indicadores, backtest, riesgo, CSV. Sin dependencias. */
(function (root) {
  'use strict';

  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function gauss(r) {
    var u = 0, v = 0;
    while (u === 0) u = r();
    while (v === 0) v = r();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }

  /* Serie simulada con regímenes de tendencia y lateralidad. Es ficticia. */
  function genSeries(o) {
    var n = o.n || 1000, r = mulberry32(o.seed || 1), mode = o.mode || 'mixed';
    var p = o.start || 2000, out = [], left = 0, reg = null;
    var t0 = Date.UTC(2021, 0, 4);
    for (var i = 0; i < n; i++) {
      if (left <= 0) {
        left = 40 + Math.floor(r() * 110);
        var kind = mode === 'mixed' ? (r() < 0.55 ? 'trend' : 'range') : mode;
        reg = {
          kind: kind,
          drift: (r() < 0.5 ? -1 : 1) * (0.0006 + r() * 0.0016),
          vol: 0.006 + r() * 0.006,
          center: p
        };
      }
      left--;
      var open = p, ret;
      if (reg.kind === 'trend') ret = reg.drift + reg.vol * gauss(r);
      else ret = -0.05 * Math.log(p / reg.center) + reg.vol * 0.8 * gauss(r);
      var close = open * Math.exp(ret);
      var hi = Math.max(open, close) + Math.abs(gauss(r)) * reg.vol * 0.45 * open;
      var lo = Math.min(open, close) - Math.abs(gauss(r)) * reg.vol * 0.45 * open;
      out.push({ t: t0 + i * 86400000, o: open, h: hi, l: lo, c: close });
      p = close;
    }
    return out;
  }

  function sma(v, n) {
    var out = new Array(v.length).fill(NaN), s = 0;
    for (var i = 0; i < v.length; i++) {
      s += v[i];
      if (i >= n) s -= v[i - n];
      if (i >= n - 1) out[i] = s / n;
    }
    return out;
  }
  function ema(v, n) {
    var out = new Array(v.length).fill(NaN), k = 2 / (n + 1), prev = NaN, s = 0;
    for (var i = 0; i < v.length; i++) {
      if (i < n - 1) s += v[i];
      else if (i === n - 1) { s += v[i]; prev = s / n; out[i] = prev; }
      else { prev = v[i] * k + prev * (1 - k); out[i] = prev; }
    }
    return out;
  }
  function rsi(v, n) {
    var out = new Array(v.length).fill(NaN);
    if (v.length <= n) return out;
    var g = 0, l = 0, d, i;
    for (i = 1; i <= n; i++) { d = v[i] - v[i - 1]; if (d >= 0) g += d; else l -= d; }
    g /= n; l /= n;
    out[n] = l === 0 ? 100 : 100 - 100 / (1 + g / l);
    for (i = n + 1; i < v.length; i++) {
      d = v[i] - v[i - 1];
      g = (g * (n - 1) + Math.max(d, 0)) / n;
      l = (l * (n - 1) + Math.max(-d, 0)) / n;
      out[i] = l === 0 ? 100 : 100 - 100 / (1 + g / l);
    }
    return out;
  }
  function atr(c, n) {
    var out = new Array(c.length).fill(NaN), prev = NaN, i, j, s;
    var tr = c.map(function (x, k) {
      return k === 0 ? x.h - x.l : Math.max(x.h - x.l, Math.abs(x.h - c[k - 1].c), Math.abs(x.l - c[k - 1].c));
    });
    for (i = 0; i < c.length; i++) {
      if (i < n - 1) continue;
      if (i === n - 1) { s = 0; for (j = 0; j < n; j++) s += tr[j]; prev = s / n; }
      else prev = (prev * (n - 1) + tr[i]) / n;
      out[i] = prev;
    }
    return out;
  }

  /* Salida de una operación dentro de una vela. Si toca stop y objetivo en la misma vela, gana el stop. */
  function checkExit(pos, b) {
    if (pos.dir === 1) {
      if (b.l <= pos.stop) return { price: Math.min(pos.stop, b.o), reason: 'stop' };
      if (b.h >= pos.tp) return { price: pos.tp, reason: 'objetivo' };
    } else {
      if (b.h >= pos.stop) return { price: Math.max(pos.stop, b.o), reason: 'stop' };
      if (b.l <= pos.tp) return { price: pos.tp, reason: 'objetivo' };
    }
    return null;
  }

  function buildSignals(c, cfg) {
    var n = c.length, close = c.map(function (x) { return x.c; }), p = cfg.params || {};
    var sig = new Array(n).fill(0), warm = 0, i;
    if (cfg.strategy === 'ema') {
      var f = ema(close, p.p1), s = ema(close, p.p2);
      warm = Math.max(p.p1, p.p2) + 1;
      for (i = 1; i < n; i++) {
        if (!isFinite(f[i]) || !isFinite(s[i]) || !isFinite(f[i - 1]) || !isFinite(s[i - 1])) continue;
        if (f[i - 1] <= s[i - 1] && f[i] > s[i]) sig[i] = 1;
        else if (f[i - 1] >= s[i - 1] && f[i] < s[i]) sig[i] = -1;
      }
    } else if (cfg.strategy === 'rsi') {
      var r = rsi(close, 14), os = p.p1, ob = 100 - p.p1;
      var tf = p.p2 > 0 ? ema(close, p.p2) : null;
      warm = Math.max(14, p.p2 || 0) + 2;
      for (i = 1; i < n; i++) {
        if (!isFinite(r[i]) || !isFinite(r[i - 1])) continue;
        if (r[i - 1] < os && r[i] >= os && (!tf || close[i] > tf[i])) sig[i] = 1;
        else if (r[i - 1] > ob && r[i] <= ob && (!tf || close[i] < tf[i])) sig[i] = -1;
      }
    } else if (cfg.strategy === 'breakout') {
      var N = p.p1; warm = N + 1;
      for (i = N; i < n; i++) {
        var hh = -Infinity, ll = Infinity;
        for (var j = i - N; j < i; j++) { if (c[j].h > hh) hh = c[j].h; if (c[j].l < ll) ll = c[j].l; }
        if (c[i].c > hh) sig[i] = 1; else if (c[i].c < ll) sig[i] = -1;
      }
    } else { /* pullback */
      var slow = ema(close, p.p1), fast = ema(close, p.p2);
      warm = Math.max(p.p1, p.p2) + 1;
      for (i = 1; i < n; i++) {
        if (!isFinite(slow[i]) || !isFinite(fast[i])) continue;
        var x = c[i];
        if (x.c > slow[i] && fast[i] > slow[i] && x.l <= fast[i] && x.c > fast[i] && x.c > x.o) sig[i] = 1;
        else if (x.c < slow[i] && fast[i] < slow[i] && x.h >= fast[i] && x.c < fast[i] && x.c < x.o) sig[i] = -1;
      }
    }
    return { sig: sig, warm: warm };
  }

  function metrics(trades) {
    var n = trades.length, wins = 0, sw = 0, sl = 0, tot = 0;
    trades.forEach(function (t) {
      tot += t.R;
      if (t.R > 0) { wins++; sw += t.R; } else sl += -t.R;
    });
    var losses = n - wins;
    return {
      n: n, wins: wins,
      winRate: n ? wins / n * 100 : NaN,
      avgWin: wins ? sw / wins : NaN,
      avgLoss: losses ? -sl / losses : NaN,
      exp: n ? tot / n : NaN,
      pf: sl > 0 ? sw / sl : (sw > 0 ? Infinity : NaN),
      totalR: tot
    };
  }

  function maxDrawdown(curve) {
    var peak = -Infinity, dd = 0;
    for (var i = 0; i < curve.length; i++) {
      if (curve[i] > peak) peak = curve[i];
      var d = (peak - curve[i]) / peak;
      if (d > dd) dd = d;
    }
    return dd * 100;
  }

  /* Backtest: la señal se calcula al cierre de la vela i y se entra en la apertura de la i+1. */
  function backtest(c, cfg) {
    var n = c.length, sg = buildSignals(c, cfg), a = atr(c, cfg.atrLen || 14);
    var rr = cfg.rr, risk = cfg.riskPct / 100, costPct = (cfg.costPct || 0) / 100, maxBars = cfg.maxBars || 30;
    var eq = 1, pos = null, trades = [], curve = new Array(n).fill(1);
    for (var i = 0; i < n; i++) {
      if (pos && i >= pos.i0) {
        var b = c[i], ex = checkExit(pos, b);
        if (!ex && i - pos.i0 + 1 >= maxBars) ex = { price: b.c, reason: 'tiempo' };
        if (ex) {
          var R = pos.dir * (ex.price - pos.entry) / pos.dist - pos.entry * costPct / pos.dist;
          eq *= Math.max(0, 1 + risk * R);
          trades.push({ i0: pos.i0, i1: i, dir: pos.dir, entry: pos.entry, exit: ex.price, R: R, reason: ex.reason });
          pos = null;
        }
      }
      curve[i] = eq;
      if (!pos && i < n - 1 && i >= sg.warm && sg.sig[i] !== 0) {
        var d = sg.sig[i];
        if ((cfg.dir === 'long' && d < 0) || (cfg.dir === 'short' && d > 0)) continue;
        var dist = a[i] * cfg.stopAtr;
        if (!isFinite(dist) || dist <= 0) continue;
        var entry = c[i + 1].o;
        pos = { dir: d, i0: i + 1, entry: entry, dist: dist, stop: entry - d * dist, tp: entry + d * dist * rr };
      }
    }
    var split = Math.floor(n * (1 - (cfg.oosPct || 0) / 100));
    var isT = trades.filter(function (t) { return t.i0 < split; });
    var oosT = trades.filter(function (t) { return t.i0 >= split; });
    return {
      trades: trades, curve: curve, split: split,
      all: metrics(trades), inS: metrics(isT), oos: metrics(oosT),
      ret: (eq - 1) * 100, dd: maxDrawdown(curve),
      hold: (c[n - 1].c / c[0].c - 1) * 100
    };
  }

  function calcRisk(o) {
    var cap = +o.capital, rp = +o.riskPct, e = +o.entry, s = +o.stop;
    var t = (o.tp === '' || o.tp == null) ? NaN : +o.tp;
    if (![cap, rp, e, s].every(isFinite) || cap <= 0 || rp <= 0 || e <= 0 || s <= 0)
      return { error: 'Completá capital, riesgo, entrada y stop con valores mayores a 0.' };
    if (e === s) return { error: 'La entrada y el stop no pueden ser iguales.' };
    var dir = e > s ? 1 : -1, dist = Math.abs(e - s), riskAmt = cap * rp / 100, units = riskAmt / dist;
    var out = { dir: dir, dist: dist, distPct: dist / e * 100, riskAmt: riskAmt, units: units, notional: units * e, lev: units * e / cap };
    if (isFinite(t)) {
      if ((t - e) * dir <= 0) out.warn = 'El objetivo está del lado equivocado de la entrada.';
      else { out.rr = Math.abs(t - e) / dist; out.reward = units * Math.abs(t - e); }
    }
    return out;
  }

  function capitalAfterLosses(cap, riskPct, n) { return cap * Math.pow(1 - riskPct / 100, n); }
  function journalR(dir, entry, stop, exit) {
    var dist = Math.abs(entry - stop);
    return dist > 0 ? dir * (exit - entry) / dist : NaN;
  }

  /* CSV de TradingView, Yahoo, MetaTrader o IOL: detecta separador y columnas. */
  function parseCSV(text) {
    text = String(text || '').replace(/^﻿/, '').trim();
    var lines = text.split(/\r?\n/).filter(function (l) { return l.trim(); });
    if (lines.length < 5) throw new Error('El archivo tiene muy pocas filas.');
    var delim = [',', ';', '\t'].map(function (d) { return [d, lines[0].split(d).length]; })
      .sort(function (a, b) { return b[1] - a[1]; })[0][0];
    var clean = function (s) { return s.trim().replace(/^"|"$/g, ''); };
    var head = lines[0].split(delim).map(function (s) { return clean(s).toLowerCase(); });
    var find = function (names) {
      for (var i = 0; i < head.length; i++) if (names.indexOf(head[i]) >= 0) return i;
      return -1;
    };
    var iD = find(['date', 'time', 'fecha', 'datetime', 'timestamp', 'hora', 'gmt time', 'local time']);
    var iO = find(['open', 'apertura', 'abre', 'o']);
    var iH = find(['high', 'max', 'maximo', 'máximo', 'alto', 'h']);
    var iL = find(['low', 'min', 'minimo', 'mínimo', 'bajo', 'l']);
    var iC = find(['close', 'cierre', 'último', 'ultimo', 'c', 'price', 'precio', 'adj close']);
    if (iO < 0 || iH < 0 || iL < 0 || iC < 0)
      throw new Error('No encontré las columnas open, high, low y close en la primera fila.');
    var num = function (s) {
      s = clean(String(s == null ? '' : s)).replace(/\s/g, '');
      if (s.indexOf(',') >= 0 && s.indexOf('.') >= 0) {
        if (s.lastIndexOf(',') > s.lastIndexOf('.')) s = s.replace(/\./g, '').replace(',', '.');
        else s = s.replace(/,/g, '');
      } else if (s.indexOf(',') >= 0) s = s.replace(',', '.');
      return parseFloat(s);
    };
    var rows = [];
    for (var k = 1; k < lines.length; k++) {
      var f = lines[k].split(delim);
      var o = num(f[iO]), h = num(f[iH]), l = num(f[iL]), c = num(f[iC]);
      if (![o, h, l, c].every(isFinite) || h < l) continue;
      var t = NaN;
      if (iD >= 0 && f[iD] != null) {
        var raw = clean(f[iD]);
        if (/^\d{9,13}$/.test(raw)) t = raw.length <= 10 ? +raw * 1000 : +raw;
        else t = Date.parse(raw);
      }
      rows.push({ t: isFinite(t) ? t : NaN, o: o, h: h, l: l, c: c });
    }
    if (rows.length < 60) throw new Error('Necesito al menos 60 velas válidas. Encontré ' + rows.length + '.');
    var f0 = rows[0].t, l0 = rows[rows.length - 1].t;
    if (isFinite(f0) && isFinite(l0) && f0 > l0) rows.reverse();
    return rows;
  }


  /* ================= Oro swing: sesgo diario + entrada en 4H ================= */
  var H1 = 3600000, DAY = 24 * H1;
  var nyFmt = null;
  try {
    nyFmt = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' });
  } catch (e) { nyFmt = null; }
  /* Hora de Nueva York + 7 h: el día del oro (y de TradingView/OANDA) cierra a las 17:00 de Nueva York. */
  function nyShift(t) {
    if (!nyFmt) return t + 2 * H1;
    var p = {};
    nyFmt.formatToParts(new Date(t)).forEach(function (x) { p[x.type] = x.value; });
    return Date.UTC(+p.year, +p.month - 1, +p.day, (+p.hour) % 24, +p.minute) + 7 * H1;
  }
  function aggregate(c, P) {
    var out = [], cur = null;
    for (var i = 0; i < c.length; i++) {
      var x = c[i], k = Math.floor(nyShift(x.t) / P);
      if (cur && cur.k === k) { if (x.h > cur.h) cur.h = x.h; if (x.l < cur.l) cur.l = x.l; cur.c = x.c; }
      else { cur = { t: x.t, k: k, o: x.o, h: x.h, l: x.l, c: x.c }; out.push(cur); }
    }
    return out;
  }
  /* Serie horaria ficticia, con fines de semana y regímenes de tendencia/lateral. */
  function genIntraday(o) {
    var days = o.days || 220, r = mulberry32(o.seed || 7), p = o.start || 3800, out = [], left = 0, reg = null;
    var d0 = Date.UTC(2025, 5, 1, 21, 0); /* domingo 21:00 UTC ~ 17:00 NY */
    for (var d = 0; d < days * 7 / 5 + 7 && out.length < days * 23; d++) {
      var dt = d0 + d * DAY, wd = new Date(dt).getUTCDay(); /* 0 dom ... 6 sáb */
      if (wd === 5 || wd === 6) continue;
      if (left <= 0) {
        left = 5 + Math.floor(r() * 18);
        reg = { trend: r() < 0.55, drift: (r() < 0.5 ? -1 : 1) * (0.00005 + r() * 0.00012), vol: 0.0011 + r() * 0.0009, center: p };
      }
      left--;
      for (var h = 0; h < 23; h++) {
        var open = p, ret = reg.trend ? reg.drift + reg.vol * gauss(r) : -0.012 * Math.log(p / reg.center) + reg.vol * 0.9 * gauss(r);
        var close = open * Math.exp(ret);
        var hi = Math.max(open, close) + Math.abs(gauss(r)) * reg.vol * 0.4 * open;
        var lo = Math.min(open, close) - Math.abs(gauss(r)) * reg.vol * 0.4 * open;
        out.push({ t: dt + h * H1, o: open, h: hi, l: lo, c: close });
        p = close;
      }
    }
    return out;
  }
  /* Prepara velas 1h/4h/1d en dos escalas: 4H (entradas) y 1D (sesgo). now = hora actual si son datos en vivo. */
  function goldPrepare(candles, now) {
    var dated = candles.filter(function (x) { return isFinite(x.t); }).sort(function (a, b) { return a.t - b.t; });
    var res = { mode: 'daily', h4: null, d1: null, openH4: false, openD1: false, note: '' };
    if (dated.length < candles.length * 0.9 || dated.length < 30) {
      res.d1 = candles.map(function (x, i) { return { t: NaN, k: i, o: x.o, h: x.h, l: x.l, c: x.c }; });
      res.note = 'El archivo no trae fechas: solo se puede usar el gráfico diario.';
      return res;
    }
    var diffs = [];
    for (var i = 1; i < dated.length && i < 400; i++) diffs.push(dated[i].t - dated[i - 1].t);
    diffs.sort(function (a, b) { return a - b; });
    var dt = diffs[Math.floor(diffs.length / 2)] || DAY;
    if (dt <= 4.5 * H1) {
      res.mode = 'intraday'; res.h4 = aggregate(dated, 4 * H1); res.d1 = aggregate(dated, DAY);
    } else if (dt <= 20 * H1) {
      res.d1 = aggregate(dated, DAY); res.note = 'Las velas son de más de 4 horas: solo se puede usar el gráfico diario.';
    } else {
      res.d1 = dated.map(function (x) { return { t: x.t, k: Math.floor(nyShift(x.t) / DAY), o: x.o, h: x.h, l: x.l, c: x.c }; });
      res.note = 'El archivo es diario: se usa la versión “solo diario” de la estrategia.';
    }
    if (now != null && res.mode === 'intraday') {
      var ns = nyShift(now), l4 = res.h4[res.h4.length - 1], ld = res.d1[res.d1.length - 1];
      res.openH4 = (l4.k + 1) * 4 * H1 > ns; res.openD1 = (ld.k + 1) * DAY > ns;
    }
    return res;
  }

  var GOLD_DEF = { fast: 20, slow: 50, rr: 2, buf: 0.25, swing: 6, maxStopAtr: 4, slope: 5, maxBars: 40, costPts: 0.5, riskPct: 1, capital: 10000, warmup: 60 };

  /* entry: velas de entrada (4H, o 1D en modo diario). d1c: velas diarias cerradas. mode: 'intraday' | 'daily'. */
  function goldRun(entry, d1c, mode, cfgIn) {
    var cfg = Object.assign({}, GOLD_DEF, cfgIn || {});
    var n = entry.length, close = entry.map(function (x) { return x.c; });
    var f = ema(close, cfg.fast), s = ema(close, cfg.slow), a = atr(entry, 14);
    var dc = d1c.map(function (x) { return x.c; }), fd = ema(dc, cfg.fast), sd = ema(dc, cfg.slow);
    var jOf = new Array(n), i, j = -1;
    for (i = 0; i < n; i++) {
      if (mode === 'daily') jOf[i] = i;
      else { var dk = Math.floor(entry[i].k / 6); while (j + 1 < d1c.length && d1c[j + 1].k < dk) j++; jOf[i] = j; }
    }
    function biasAt(jj) {
      if (jj < cfg.slope || !isFinite(sd[jj]) || !isFinite(sd[jj - cfg.slope]) || !isFinite(fd[jj])) return 0;
      var cl = dc[jj];
      if (cl > sd[jj] && fd[jj] > sd[jj] && sd[jj] > sd[jj - cfg.slope]) return 1;
      if (cl < sd[jj] && fd[jj] < sd[jj] && sd[jj] < sd[jj - cfg.slope]) return -1;
      return 0;
    }
    /* Evalúa la vela i al cerrar. */
    function evalBar(k) {
      var x = entry[k], jj = jOf[k], r = { i: k, bias: jj >= 0 ? biasAt(jj) : 0, f: f[k], s: s[k], a: a[k], dir: 0, signal: false };
      if (!isFinite(f[k]) || !isFinite(s[k]) || !isFinite(a[k]) || r.bias === 0) return r;
      var d = r.bias, zl = Math.min(f[k], s[k]), zh = Math.max(f[k], s[k]);
      r.touched = d === -1 ? x.h >= zl : x.l <= zh;
      r.confirm = d === -1 ? (x.c < zl && x.c < x.o) : (x.c > zh && x.c > x.o);
      var ext = d === -1 ? -Infinity : Infinity;
      for (var m = Math.max(0, k - cfg.swing + 1); m <= k; m++) ext = d === -1 ? Math.max(ext, entry[m].h) : Math.min(ext, entry[m].l);
      r.stop = d === -1 ? ext + cfg.buf * a[k] : ext - cfg.buf * a[k];
      var dist = Math.abs(r.stop - x.c);
      r.stopOk = dist > 0 && dist <= cfg.maxStopAtr * a[k] && (d === -1 ? r.stop > x.c : r.stop < x.c);
      r.dist = dist; r.stopAtr = dist / a[k];
      r.signal = r.touched && r.confirm && r.stopOk;
      r.dir = r.signal ? d : 0;
      return r;
    }
    var pos = null, trades = [], eq = 1, curve = new Array(n).fill(1), cap = cfg.capital, risk = cfg.riskPct / 100;
    for (i = 0; i < n; i++) {
      if (pos && i >= pos.i0) {
        var b = entry[i], ex = checkExit(pos, b);
        if (!ex && i - pos.i0 + 1 >= cfg.maxBars) ex = { price: b.c, reason: 'tiempo' };
        if (ex) {
          var R = pos.dir * (ex.price - pos.entry) / pos.dist - cfg.costPts / pos.dist;
          var pnl = cap * eq * risk * R;
          eq *= Math.max(0, 1 + risk * R);
          trades.push({ i0: pos.i0, i1: i, t0: entry[pos.i0].t, t1: b.t, dir: pos.dir, entry: pos.entry, stop: pos.stop, tp: pos.tp, exit: ex.price, R: R, pnl: pnl, reason: ex.reason, sigI: pos.sigI });
          pos = null;
        }
      }
      curve[i] = eq;
      if (!pos && i < n - 1 && i >= cfg.warmup) {
        var ev = evalBar(i);
        if (ev.signal) {
          var en = entry[i + 1].o, dd = Math.abs(en - ev.stop);
          var okSide = ev.dir === -1 ? ev.stop > en : ev.stop < en;
          if (okSide && dd > 0 && dd <= cfg.maxStopAtr * a[i]) {
            pos = { dir: ev.dir, i0: i + 1, entry: en, stop: ev.stop, dist: dd, tp: en + ev.dir * dd * cfg.rr, sigI: i };
          }
        }
      }
    }
    var open = null;
    if (pos && pos.i0 <= n - 1) {
      var lc = entry[n - 1].c, fR = pos.dir * (lc - pos.entry) / pos.dist;
      open = { i0: pos.i0, i1: n - 1, t0: entry[pos.i0].t, t1: entry[n - 1].t, dir: pos.dir, entry: pos.entry, stop: pos.stop, tp: pos.tp, exit: lc, R: fR, pnl: cap * eq * risk * fR, reason: 'abierta', open: true, sigI: pos.sigI };
    }
    var last = n - 1, st = n > 0 ? evalBar(last) : null, lastD = d1c.length - 1;
    var pend = null; /* señal en la última vela cerrada: se entra en la apertura de la siguiente */
    if (st && st.signal && !pos) {
      var rd = st.dist, ref = entry[last].c;
      pend = { dir: st.dir, ref: ref, stop: st.stop, tp: ref + st.dir * rd * cfg.rr, dist: rd,
        riskAmt: cap * eq * risk, oz: cap * eq * risk / rd, lots: cap * eq * risk / rd / 100, rewardAmt: cap * eq * risk * cfg.rr };
    }
    return {
      cfg: cfg, mode: mode, trades: trades, open: open, curve: curve, eq: eq, capital: cap * eq,
      m: metrics(trades), dd: maxDrawdown(curve), ret: (eq - 1) * 100,
      status: { ev: st, pend: pend, hasOpen: !!pos, t: n > 0 ? entry[last].t : NaN,
        fd: lastD >= 0 ? fd[lastD] : NaN, sd: lastD >= 0 ? sd[lastD] : NaN, dClose: lastD >= 0 ? dc[lastD] : NaN,
        f: f[last], s: s[last], a: a[last], close: close[last], n: n }
    };
  }

  var api = {
    mulberry32: mulberry32, genSeries: genSeries, sma: sma, ema: ema, rsi: rsi, atr: atr,
    checkExit: checkExit, buildSignals: buildSignals, metrics: metrics, maxDrawdown: maxDrawdown,
    backtest: backtest, calcRisk: calcRisk, capitalAfterLosses: capitalAfterLosses,
    journalR: journalR, parseCSV: parseCSV,
    nyShift: nyShift, aggregate: aggregate, genIntraday: genIntraday, goldPrepare: goldPrepare, goldRun: goldRun, GOLD_DEF: GOLD_DEF
  };
  root.TPE = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
