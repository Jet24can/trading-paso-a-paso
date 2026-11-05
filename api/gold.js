/* Función de Vercel: trae velas de 1 hora del oro desde Yahoo Finance y las devuelve como JSON.
   Se llama desde la app en /api/gold?symbol=GC=F . Yahoo no es una API oficial: si algún día cambia, la app sigue
   funcionando con datos simulados o con un CSV propio. */
const SYMBOLS = ['GC=F', 'XAUUSD=X'];

module.exports = async function handler(req, res) {
  try {
    const q = req.query || {};
    const symbol = SYMBOLS.includes(q.symbol) ? q.symbol : 'GC=F';
    const range = ['3mo', '6mo', '1y', '2y'].includes(q.range) ? q.range : '1y';
    const url = 'https://query1.finance.yahoo.com/v8/finance/chart/' + encodeURIComponent(symbol) +
      '?interval=1h&range=' + range + '&includePrePost=false';
    const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; TradingPasoAPaso/1.0)', Accept: 'application/json' } });
    if (!r.ok) throw new Error('Yahoo respondió ' + r.status);
    const j = await r.json();
    const d = j && j.chart && j.chart.result && j.chart.result[0];
    if (!d || !d.timestamp || !d.indicators || !d.indicators.quote || !d.indicators.quote[0]) throw new Error('Sin datos para ' + symbol);
    const qt = d.indicators.quote[0], out = [];
    for (let i = 0; i < d.timestamp.length; i++) {
      const o = qt.open[i], h = qt.high[i], l = qt.low[i], c = qt.close[i];
      if ([o, h, l, c].every((x) => typeof x === 'number' && isFinite(x)) && h >= l) out.push({ t: d.timestamp[i] * 1000, o, h, l, c });
    }
    if (out.length < 200) throw new Error('Llegaron muy pocas velas (' + out.length + ')');
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    res.status(200).json({ symbol, interval: '1h', fetchedAt: Date.now(), candles: out });
  } catch (e) {
    res.status(502).json({ error: String((e && e.message) || e) });
  }
};
