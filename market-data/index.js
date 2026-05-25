'use strict';

// ─── Commodity price data ─────────────────────────────────────────────────────

const COMMODITY_PRICES = [
  { month:'Jul-24', fyYear:'FY25', fyQuarter:'FY25-Q1', goldUsdOz:2382, goldAudOz:3612, copperLmeUsdT:9180, copperAudTNet:11840, audUsd:0.660, dieselAudL:1.82, electricityAudMwh:138, anfoAudT:620,  cyanideAudT:1840, steelBallsAudT:1120, brentUsdBbl:84.2 },
  { month:'Aug-24', fyYear:'FY25', fyQuarter:'FY25-Q1', goldUsdOz:2448, goldAudOz:3724, copperLmeUsdT:9060, copperAudTNet:11700, audUsd:0.657, dieselAudL:1.78, electricityAudMwh:142, anfoAudT:618,  cyanideAudT:1850, steelBallsAudT:1115, brentUsdBbl:80.8 },
  { month:'Sep-24', fyYear:'FY25', fyQuarter:'FY25-Q1', goldUsdOz:2555, goldAudOz:3882, copperLmeUsdT:9380, copperAudTNet:12020, audUsd:0.658, dieselAudL:1.74, electricityAudMwh:145, anfoAudT:622,  cyanideAudT:1860, steelBallsAudT:1118, brentUsdBbl:74.1 },
  { month:'Oct-24', fyYear:'FY25', fyQuarter:'FY25-Q2', goldUsdOz:2680, goldAudOz:4085, copperLmeUsdT:9540, copperAudTNet:12260, audUsd:0.656, dieselAudL:1.71, electricityAudMwh:148, anfoAudT:625,  cyanideAudT:1870, steelBallsAudT:1122, brentUsdBbl:76.2 },
  { month:'Nov-24', fyYear:'FY25', fyQuarter:'FY25-Q2', goldUsdOz:2638, goldAudOz:4028, copperLmeUsdT:9320, copperAudTNet:12010, audUsd:0.655, dieselAudL:1.69, electricityAudMwh:152, anfoAudT:623,  cyanideAudT:1865, steelBallsAudT:1120, brentUsdBbl:72.8 },
  { month:'Dec-24', fyYear:'FY25', fyQuarter:'FY25-Q2', goldUsdOz:2617, goldAudOz:4002, copperLmeUsdT:9140, copperAudTNet:11820, audUsd:0.654, dieselAudL:1.72, electricityAudMwh:155, anfoAudT:620,  cyanideAudT:1860, steelBallsAudT:1118, brentUsdBbl:69.4 },
  { month:'Jan-25', fyYear:'FY25', fyQuarter:'FY25-Q3', goldUsdOz:2724, goldAudOz:4141, copperLmeUsdT:9020, copperAudTNet:11680, audUsd:0.657, dieselAudL:1.76, electricityAudMwh:158, anfoAudT:618,  cyanideAudT:1855, steelBallsAudT:1116, brentUsdBbl:78.3 },
  { month:'Feb-25', fyYear:'FY25', fyQuarter:'FY25-Q3', goldUsdOz:2882, goldAudOz:4384, copperLmeUsdT:9220, copperAudTNet:11940, audUsd:0.657, dieselAudL:1.79, electricityAudMwh:155, anfoAudT:616,  cyanideAudT:1850, steelBallsAudT:1114, brentUsdBbl:74.6 },
  { month:'Mar-25', fyYear:'FY25', fyQuarter:'FY25-Q3', goldUsdOz:3084, goldAudOz:4669, copperLmeUsdT:9560, copperAudTNet:12360, audUsd:0.661, dieselAudL:1.81, electricityAudMwh:152, anfoAudT:620,  cyanideAudT:1862, steelBallsAudT:1118, brentUsdBbl:71.2 },
  { month:'Apr-25', fyYear:'FY25', fyQuarter:'FY25-Q4', goldUsdOz:3102, goldAudOz:4706, copperLmeUsdT:9840, copperAudTNet:12680, audUsd:0.659, dieselAudL:1.83, electricityAudMwh:148, anfoAudT:625,  cyanideAudT:1870, steelBallsAudT:1122, brentUsdBbl:66.8 },
  { month:'May-25', fyYear:'FY25', fyQuarter:'FY25-Q4', goldUsdOz:3180, goldAudOz:4828, copperLmeUsdT:9520, copperAudTNet:12320, audUsd:0.659, dieselAudL:1.80, electricityAudMwh:145, anfoAudT:622,  cyanideAudT:1864, steelBallsAudT:1120, brentUsdBbl:62.4 },
  { month:'Jun-25', fyYear:'FY25', fyQuarter:'FY25-Q4', goldUsdOz:3246, goldAudOz:4920, copperLmeUsdT:9340, copperAudTNet:12120, audUsd:0.660, dieselAudL:1.77, electricityAudMwh:142, anfoAudT:618,  cyanideAudT:1858, steelBallsAudT:1116, brentUsdBbl:67.3 },
  { month:'Jul-25', fyYear:'FY26', fyQuarter:'FY26-Q1', goldUsdOz:3350, goldAudOz:5210, copperLmeUsdT:9140, copperAudTNet:11780, audUsd:0.643, dieselAudL:1.75, electricityAudMwh:145, anfoAudT:620,  cyanideAudT:1870, steelBallsAudT:1118, brentUsdBbl:71.4 },
  { month:'Aug-25', fyYear:'FY26', fyQuarter:'FY26-Q1', goldUsdOz:3380, goldAudOz:5256, copperLmeUsdT:9080, copperAudTNet:11720, audUsd:0.644, dieselAudL:1.78, electricityAudMwh:148, anfoAudT:622,  cyanideAudT:1880, steelBallsAudT:1120, brentUsdBbl:73.2 },
  { month:'Sep-25', fyYear:'FY26', fyQuarter:'FY26-Q1', goldUsdOz:3480, goldAudOz:5410, copperLmeUsdT:8960, copperAudTNet:11550, audUsd:0.643, dieselAudL:1.82, electricityAudMwh:152, anfoAudT:625,  cyanideAudT:1888, steelBallsAudT:1124, brentUsdBbl:70.8 },
  { month:'Oct-25', fyYear:'FY26', fyQuarter:'FY26-Q2', goldUsdOz:3450, goldAudOz:5408, copperLmeUsdT:9200, copperAudTNet:11900, audUsd:0.638, dieselAudL:1.84, electricityAudMwh:155, anfoAudT:628,  cyanideAudT:1895, steelBallsAudT:1126, brentUsdBbl:68.4 },
  { month:'Nov-25', fyYear:'FY26', fyQuarter:'FY26-Q2', goldUsdOz:3480, goldAudOz:5454, copperLmeUsdT:9360, copperAudTNet:12080, audUsd:0.638, dieselAudL:1.86, electricityAudMwh:158, anfoAudT:630,  cyanideAudT:1900, steelBallsAudT:1128, brentUsdBbl:65.2 },
  { month:'Dec-25', fyYear:'FY26', fyQuarter:'FY26-Q2', goldUsdOz:3490, goldAudOz:5468, copperLmeUsdT:9440, copperAudTNet:12190, audUsd:0.638, dieselAudL:1.88, electricityAudMwh:162, anfoAudT:632,  cyanideAudT:1908, steelBallsAudT:1130, brentUsdBbl:66.8 },
  { month:'Jan-26', fyYear:'FY26', fyQuarter:'FY26-Q3', goldUsdOz:3500, goldAudOz:5512, copperLmeUsdT:9560, copperAudTNet:12380, audUsd:0.635, dieselAudL:1.85, electricityAudMwh:165, anfoAudT:635,  cyanideAudT:1915, steelBallsAudT:1132, brentUsdBbl:69.4 },
  { month:'Feb-26', fyYear:'FY26', fyQuarter:'FY26-Q3', goldUsdOz:3560, goldAudOz:5606, copperLmeUsdT:9480, copperAudTNet:12280, audUsd:0.635, dieselAudL:1.82, electricityAudMwh:162, anfoAudT:632,  cyanideAudT:1910, steelBallsAudT:1130, brentUsdBbl:72.1 },
  { month:'Mar-26', fyYear:'FY26', fyQuarter:'FY26-Q3', goldUsdOz:3560, goldAudOz:5606, copperLmeUsdT:9380, copperAudTNet:12160, audUsd:0.635, dieselAudL:1.80, electricityAudMwh:158, anfoAudT:628,  cyanideAudT:1904, steelBallsAudT:1128, brentUsdBbl:70.8 },
  { month:'Apr-26', fyYear:'FY26', fyQuarter:'FY26-Q4', goldUsdOz:3500, goldAudOz:5486, copperLmeUsdT:9260, copperAudTNet:12010, audUsd:0.638, dieselAudL:1.78, electricityAudMwh:155, anfoAudT:625,  cyanideAudT:1898, steelBallsAudT:1126, brentUsdBbl:68.2 },
  { month:'May-26', fyYear:'FY26', fyQuarter:'FY26-Q4', goldUsdOz:3450, goldAudOz:5407, copperLmeUsdT:9140, copperAudTNet:11880, audUsd:0.638, dieselAudL:1.76, electricityAudMwh:152, anfoAudT:622,  cyanideAudT:1892, steelBallsAudT:1124, brentUsdBbl:65.4 },
  { month:'Jun-26', fyYear:'FY26', fyQuarter:'FY26-Q4', goldUsdOz:3410, goldAudOz:5344, copperLmeUsdT:9020, copperAudTNet:11750, audUsd:0.638, dieselAudL:1.75, electricityAudMwh:148, anfoAudT:618,  cyanideAudT:1886, steelBallsAudT:1122, brentUsdBbl:63.8 },
];

// Column name alias map (CSV column names → camelCase)
const COLUMN_ALIAS = {
  Gold_USD_oz:          'goldUsdOz',
  Gold_AUD_oz:          'goldAudOz',
  Copper_LME_USD_t:     'copperLmeUsdT',
  Copper_AUD_t_net:     'copperAudTNet',
  AUDUSD:               'audUsd',
  Diesel_AUD_L:         'dieselAudL',
  Electricity_AUD_MWh:  'electricityAudMwh',
  ANFO_AUD_t:           'anfoAudT',
  Cyanide_AUD_t:        'cyanideAudT',
  SteelBalls_AUD_t:     'steelBallsAudT',
  Brent_USD_bbl:        'brentUsdBbl',
};

const PRICE_COLUMNS = Object.keys(COLUMN_ALIAS);
const PRICE_COLUMNS_CC = Object.values(COLUMN_ALIAS);

// ─── Sensitivity & scenario data ──────────────────────────────────────────────

const SENSITIVITY_BASIS = {
  note:                    'Sensitivities calculated at FY26 H1 actual operating rates. All monetary impacts in A$000 per quarter unless noted.',
  goldSoldOzQtr:           41000,
  copperSoldTQtr:          1200,
  dieselConsumptionMlQtr:  6.8,
  electricityMwhQtr:       44000,
  oreMilledKtQtr:          2130,
  baseGoldPriceAudOz:      5368,
  baseCopperPriceAudT:     11924,
  baseDieselAudL:          1.83,
  baseElectricityAudMwh:   158,
  baseAiscAudOz:           2344,
  baseRevenueAud000Qtr:    232000,
  baseNpatAud000Qtr:       96000,
  taxRate:                 0.30,
};

const SENSITIVITIES = [
  { driver:'Gold Price',        unit:'A$/oz',   change:'+A$100/oz',           changeValue: 100,    direction:'favourable',   impacts:{ revenueAud000Qtr:4100,  ebitdaAud000Qtr:4100,  npatAud000Qtr:2870,  npatAud000FullYear:11480,  aiscAudOzChange:0  } },
  { driver:'Gold Price',        unit:'A$/oz',   change:'-A$100/oz',           changeValue:-100,    direction:'unfavourable', impacts:{ revenueAud000Qtr:-4100, ebitdaAud000Qtr:-4100, npatAud000Qtr:-2870, npatAud000FullYear:-11480, aiscAudOzChange:0  } },
  { driver:'Copper Price (LME)',unit:'US$/t',   change:'+US$500/t',           changeValue: 500,    direction:'favourable',   impacts:{ revenueAud000Qtr:940,   ebitdaAud000Qtr:940,   npatAud000Qtr:658,   npatAud000FullYear:2632,   aiscAudOzChange:-23 } },
  { driver:'Copper Price (LME)',unit:'US$/t',   change:'-US$500/t',           changeValue:-500,    direction:'unfavourable', impacts:{ revenueAud000Qtr:-940,  ebitdaAud000Qtr:-940,  npatAud000Qtr:-658,  npatAud000FullYear:-2632,  aiscAudOzChange:23  } },
  { driver:'AUD/USD Exchange',  unit:'rate',    change:'+0.01 (AUD strengthens)', changeValue:0.01, direction:'unfavourable', impacts:{ revenueAud000Qtr:-3380, ebitdaAud000Qtr:-3380, npatAud000Qtr:-2366, npatAud000FullYear:-9464,  aiscAudOzChange:0  } },
  { driver:'AUD/USD Exchange',  unit:'rate',    change:'-0.01 (AUD weakens)', changeValue:-0.01,   direction:'favourable',   impacts:{ revenueAud000Qtr:3380,  ebitdaAud000Qtr:3380,  npatAud000Qtr:2366,  npatAud000FullYear:9464,   aiscAudOzChange:0  } },
  { driver:'Diesel / Fuel',     unit:'A$/litre',change:'+A$0.10/L',           changeValue: 0.10,   direction:'unfavourable', impacts:{ revenueAud000Qtr:0,     ebitdaAud000Qtr:-680,  npatAud000Qtr:-476,  npatAud000FullYear:-1904,  aiscAudOzChange:17  } },
  { driver:'Diesel / Fuel',     unit:'A$/litre',change:'-A$0.10/L',           changeValue:-0.10,   direction:'favourable',   impacts:{ revenueAud000Qtr:0,     ebitdaAud000Qtr:680,   npatAud000Qtr:476,   npatAud000FullYear:1904,   aiscAudOzChange:-17 } },
  { driver:'Electricity',       unit:'A$/MWh',  change:'+A$10/MWh',           changeValue: 10,     direction:'unfavourable', impacts:{ revenueAud000Qtr:0,     ebitdaAud000Qtr:-440,  npatAud000Qtr:-308,  npatAud000FullYear:-1232,  aiscAudOzChange:11  } },
  { driver:'Electricity',       unit:'A$/MWh',  change:'-A$10/MWh',           changeValue:-10,     direction:'favourable',   impacts:{ revenueAud000Qtr:0,     ebitdaAud000Qtr:440,   npatAud000Qtr:308,   npatAud000FullYear:1232,   aiscAudOzChange:-11 } },
  { driver:'Cyanide',           unit:'A$/t',    change:'+A$200/t',            changeValue: 200,    direction:'unfavourable', impacts:{ revenueAud000Qtr:0,     ebitdaAud000Qtr:-170,  npatAud000Qtr:-119,  npatAud000FullYear:-476,   aiscAudOzChange:4   } },
  { driver:'Steel Grinding Media',unit:'A$/t',  change:'+A$100/t',            changeValue: 100,    direction:'unfavourable', impacts:{ revenueAud000Qtr:0,     ebitdaAud000Qtr:-90,   npatAud000Qtr:-63,   npatAud000FullYear:-252,   aiscAudOzChange:2   } },
  { driver:'ANFO Explosives',   unit:'A$/t',    change:'+A$50/t',             changeValue: 50,     direction:'unfavourable', impacts:{ revenueAud000Qtr:0,     ebitdaAud000Qtr:-60,   npatAud000Qtr:-42,   npatAud000FullYear:-168,   aiscAudOzChange:1   } },
  { driver:'Brent Crude Oil',   unit:'US$/bbl', change:'+US$10/bbl',          changeValue: 10,     direction:'unfavourable', impacts:{ revenueAud000Qtr:0,     ebitdaAud000Qtr:-598,  npatAud000Qtr:-419,  npatAud000FullYear:-1676,  aiscAudOzChange:15  } },
];

const COMBINED_SCENARIOS = [
  { name:'Bull Case',                  description:'High gold/copper, weak AUD, stable input costs',         assumptions:{ goldDeltaAudOz:300,  copperDeltaUsdT:1000, audUsdDelta:-0.02, dieselDeltaAudL:-0.05, electricityDeltaAudMwh:0  }, npatImpactAud000Qtr:18490,  npatImpactAud000FullYear:73960,  aiscChangeAudOz:-57 },
  { name:'Bear Case',                  description:'Lower gold, higher input costs, strong AUD',             assumptions:{ goldDeltaAudOz:-400, copperDeltaUsdT:-1000,audUsdDelta:0.02,  dieselDeltaAudL:0.20,  electricityDeltaAudMwh:20 }, npatImpactAud000Qtr:-25692, npatImpactAud000FullYear:-102768, aiscChangeAudOz:61 },
  { name:'Fuel Shock',                 description:'Oil price spike (+US$30/bbl) with AUD weakening',        assumptions:{ goldDeltaAudOz:120,  copperDeltaUsdT:0,    audUsdDelta:-0.01, dieselDeltaAudL:0.22,  electricityDeltaAudMwh:15 }, npatImpactAud000Qtr:1040,   npatImpactAud000FullYear:4160,   aiscChangeAudOz:-9  },
  { name:'Energy Transition Pressure', description:'Rising electricity, carbon cost uplift, stable commodities', assumptions:{ goldDeltaAudOz:0,   copperDeltaUsdT:0,    audUsdDelta:0,     dieselDeltaAudL:0.15,  electricityDeltaAudMwh:30 }, npatImpactAud000Qtr:-2950,  npatImpactAud000FullYear:-11800, aiscChangeAudOz:38  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function resolveColumn(name) {
  if (!name) return null;
  if (COLUMN_ALIAS[name]) return COLUMN_ALIAS[name];
  if (PRICE_COLUMNS_CC.includes(name)) return name;
  return null;
}

// ─── Response helpers ─────────────────────────────────────────────────────────

const CORS_HEADERS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function jsonRes(body, statusCode = 200) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    body: JSON.stringify(body),
  };
}

function csvRes(content, filename) {
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'text/csv', 'Content-Disposition': `attachment; filename="${filename}"`, ...CORS_HEADERS },
    body: content,
  };
}

function htmlRes(content) {
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8', ...CORS_HEADERS },
    body: content,
  };
}

function notFound(msg = 'Not found') { return jsonRes({ error: msg }, 404); }
function badRequest(msg)             { return jsonRes({ error: msg }, 400); }
function preflight()                 { return { statusCode: 204, headers: CORS_HEADERS, body: '' }; }

// ─── Route: GET / — dashboard HTML ───────────────────────────────────────────

function handleRoot() {
  const page = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Market Data Dashboard — Ironfield Resources FY26</title>
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.3/dist/chart.umd.min.js"><\/script>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg:#0f1117; --surface:#1a1d27; --border:#2a2d3a; --text:#e4e6f0; --muted:#8b8fa8;
    --gold:#f5a623; --copper:#c0704a; --blue:#4a9ef5; --green:#34c77b;
    --red:#e05555; --purple:#9b6bf5; --diesel:#e8a130; --elec:#4acfe8;
  }
  body { background:var(--bg); color:var(--text); font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif; font-size:14px; }
  header { background:var(--surface); border-bottom:1px solid var(--border); padding:16px 24px; display:flex; align-items:center; gap:16px; }
  header h1 { font-size:18px; font-weight:600; }
  header .sub { color:var(--muted); font-size:13px; }
  .api-status { margin-left:auto; font-size:11px; color:var(--muted); }
  .live-dot { display:inline-block; width:7px; height:7px; border-radius:50%; background:var(--green); margin-right:5px; animation:pulse 2s infinite; }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.3} }
  nav { display:flex; gap:4px; padding:16px 24px 0; border-bottom:1px solid var(--border); }
  nav button { background:none; border:none; color:var(--muted); font-size:13px; padding:8px 16px; cursor:pointer; border-bottom:2px solid transparent; margin-bottom:-1px; }
  nav button.active { color:var(--text); border-bottom-color:var(--gold); }
  .page { display:none; padding:24px; }
  .page.active { display:block; }
  .kpi-row { display:grid; grid-template-columns:repeat(auto-fill,minmax(160px,1fr)); gap:12px; margin-bottom:24px; }
  .kpi { background:var(--surface); border:1px solid var(--border); border-radius:8px; padding:16px; }
  .kpi .label { font-size:11px; color:var(--muted); text-transform:uppercase; letter-spacing:.04em; margin-bottom:6px; }
  .kpi .value { font-size:22px; font-weight:700; }
  .kpi .sub   { font-size:11px; color:var(--muted); margin-top:4px; }
  .kpi.gold .value { color:var(--gold); } .kpi.copper .value { color:var(--copper); }
  .kpi.diesel .value { color:var(--diesel); } .kpi.elec .value { color:var(--elec); }
  .kpi.audusd .value { color:var(--blue); } .kpi.brent .value { color:var(--purple); }
  .charts-2col { display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:24px; }
  .charts-1col { margin-bottom:16px; }
  .chart-card { background:var(--surface); border:1px solid var(--border); border-radius:8px; padding:16px; }
  .chart-card h3 { font-size:13px; color:var(--muted); margin-bottom:12px; font-weight:500; }
  .chart-card canvas { max-height:220px; }
  .sens-table { width:100%; border-collapse:collapse; }
  .sens-table th { font-size:11px; color:var(--muted); text-transform:uppercase; letter-spacing:.04em; padding:8px 12px; text-align:left; border-bottom:1px solid var(--border); font-weight:500; }
  .sens-table td { padding:10px 12px; border-bottom:1px solid var(--border); font-size:13px; }
  .sens-table tr:last-child td { border-bottom:none; }
  .fav { color:var(--green); } .unfav { color:var(--red); }
  .bar-cell { width:140px; }
  .bar-wrap { background:var(--border); border-radius:2px; height:6px; overflow:hidden; }
  .bar-fill  { height:100%; border-radius:2px; }
  .scenario-grid { display:grid; grid-template-columns:340px 1fr; gap:24px; align-items:start; }
  .slider-panel { background:var(--surface); border:1px solid var(--border); border-radius:8px; padding:20px; }
  .slider-panel h3 { font-size:14px; font-weight:600; margin-bottom:16px; }
  .slider-group { margin-bottom:18px; }
  .slider-group label { font-size:12px; color:var(--muted); display:flex; justify-content:space-between; margin-bottom:6px; }
  .slider-group label span { color:var(--text); font-weight:600; }
  input[type=range] { width:100%; accent-color:var(--gold); }
  .run-btn { width:100%; margin-top:8px; padding:10px; background:var(--gold); color:#000; border:none; border-radius:6px; font-weight:700; font-size:14px; cursor:pointer; }
  .run-btn:hover { opacity:.9; }
  .preset-row { display:flex; gap:8px; flex-wrap:wrap; margin-bottom:16px; }
  .preset-btn { padding:5px 12px; border:1px solid var(--border); background:var(--surface); color:var(--muted); border-radius:4px; font-size:12px; cursor:pointer; }
  .preset-btn:hover { border-color:var(--gold); color:var(--text); }
  .result-panel { background:var(--surface); border:1px solid var(--border); border-radius:8px; padding:20px; }
  .result-panel h3 { font-size:14px; font-weight:600; margin-bottom:16px; }
  .result-kpis { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; margin-bottom:20px; }
  .result-kpi { background:var(--bg); border-radius:6px; padding:14px; text-align:center; }
  .result-kpi .lbl { font-size:11px; color:var(--muted); margin-bottom:6px; }
  .result-kpi .val { font-size:20px; font-weight:700; }
  .waterfall-row { display:flex; align-items:center; gap:10px; margin-bottom:8px; font-size:13px; }
  .waterfall-row .name { width:120px; color:var(--muted); font-size:12px; }
  .waterfall-row .bar-outer { flex:1; background:var(--border); border-radius:3px; height:8px; overflow:hidden; }
  .waterfall-row .bar-inner { height:100%; border-radius:3px; transition:width .3s; }
  .waterfall-row .amt { width:70px; text-align:right; font-size:12px; }
  @media(max-width:900px) { .charts-2col { grid-template-columns:1fr; } .scenario-grid { grid-template-columns:1fr; } }
</style>
</head>
<body>

<header>
  <div>
    <h1>Market Data Dashboard</h1>
    <span class="sub">Ironfield Resources &mdash; FY25&ndash;FY26 commodity &amp; input price tracker</span>
  </div>
  <div class="api-status" id="apiStatus"></div>
</header>

<nav>
  <button class="active" onclick="showPage('prices',this)">Prices</button>
  <button onclick="showPage('sensitivity',this)">Sensitivity</button>
  <button onclick="showPage('scenario',this)">Scenario Builder</button>
</nav>

<div id="page-prices" class="page active">
  <div class="kpi-row" id="kpiRow"></div>
  <div class="charts-2col">
    <div class="chart-card"><h3>Gold Price &mdash; A$/oz &amp; US$/oz</h3><canvas id="chartGold"></canvas></div>
    <div class="chart-card"><h3>Copper LME &mdash; US$/t</h3><canvas id="chartCopper"></canvas></div>
    <div class="chart-card"><h3>Diesel (A$/L) &amp; Brent Crude (US$/bbl)</h3><canvas id="chartFuel"></canvas></div>
    <div class="chart-card"><h3>Electricity &mdash; A$/MWh</h3><canvas id="chartElec"></canvas></div>
  </div>
  <div class="chart-card charts-1col"><h3>AUD/USD Exchange Rate</h3><canvas id="chartFX"></canvas></div>
</div>

<div id="page-sensitivity" class="page">
  <div class="chart-card" style="margin-bottom:20px;">
    <h3>NPAT Impact &mdash; Full Year A$000 per unit price move</h3>
    <canvas id="chartSens" style="max-height:280px;"></canvas>
  </div>
  <div class="chart-card">
    <h3>Unit Price Sensitivity Detail</h3>
    <table class="sens-table" id="sensTable"></table>
  </div>
</div>

<div id="page-scenario" class="page">
  <div class="scenario-grid">
    <div>
      <div class="slider-panel">
        <h3>Price Assumptions</h3>
        <p style="font-size:12px;color:var(--muted);margin-bottom:16px;">Enter changes from FY26 base case. Positive = price increase.</p>
        <div class="preset-row" id="presetRow"></div>
        <div class="slider-group">
          <label>Gold Price <span id="goldLbl">&#177;0 A$/oz</span></label>
          <input type="range" id="goldSlider" min="-600" max="600" step="25" value="0" oninput="updateLabel('goldLbl',this.value,'A$/oz')">
        </div>
        <div class="slider-group">
          <label>Copper LME <span id="copperLbl">&#177;0 US$/t</span></label>
          <input type="range" id="copperSlider" min="-2000" max="2000" step="100" value="0" oninput="updateLabel('copperLbl',this.value,'US$/t')">
        </div>
        <div class="slider-group">
          <label>AUD/USD Rate <span id="fxLbl">&#177;0.000</span></label>
          <input type="range" id="fxSlider" min="-0.06" max="0.06" step="0.005" value="0" oninput="updateFxLabel(this.value)">
        </div>
        <div class="slider-group">
          <label>Diesel <span id="dieselLbl">&#177;0.00 A$/L</span></label>
          <input type="range" id="dieselSlider" min="-0.50" max="0.50" step="0.05" value="0" oninput="updateLabel('dieselLbl',this.value,'A$/L',2)">
        </div>
        <div class="slider-group">
          <label>Electricity <span id="elecLbl">&#177;0 A$/MWh</span></label>
          <input type="range" id="elecSlider" min="-60" max="60" step="5" value="0" oninput="updateLabel('elecLbl',this.value,'A$/MWh')">
        </div>
        <button class="run-btn" onclick="runScenario()">Calculate Impact</button>
      </div>
    </div>
    <div class="result-panel">
      <h3>Scenario Results</h3>
      <div class="result-kpis">
        <div class="result-kpi"><div class="lbl">NPAT Impact (Qtr)</div><div class="val" id="res-npat-qtr" style="color:var(--muted)">&#8212;</div></div>
        <div class="result-kpi"><div class="lbl">NPAT Impact (Full Year)</div><div class="val" id="res-npat-yr" style="color:var(--muted)">&#8212;</div></div>
        <div class="result-kpi"><div class="lbl">AISC Change (A$/oz)</div><div class="val" id="res-aisc" style="color:var(--muted)">&#8212;</div></div>
      </div>
      <div style="margin-bottom:12px;">
        <div style="font-size:12px;color:var(--muted);margin-bottom:10px;">NPAT Quarterly Impact Breakdown (A$000)</div>
        <div id="waterfall"></div>
      </div>
      <div style="font-size:12px;color:var(--muted);margin-top:16px;padding-top:12px;border-top:1px solid var(--border);">
        Base case: Gold A$5,368/oz &middot; AISC A$2,344/oz &middot; NPAT A$96m/quarter
      </div>
    </div>
  </div>
</div>

<script>
// ─── API base (auto-detected from current URL) ────────────────────────────────
const API_BASE = window.location.href.split('?')[0].replace(/\\/+$/, '');

// ─── Fallback data (mirrors embedded server data) ─────────────────────────────
const FALLBACK_DATA = [
  {m:"Jul-24",fy:"FY25",q:"FY25-Q1",gU:2382,gA:3612,cuU:9180,cuA:11840,fx:0.660,ds:1.82,el:138,bn:84.2},
  {m:"Aug-24",fy:"FY25",q:"FY25-Q1",gU:2448,gA:3724,cuU:9060,cuA:11700,fx:0.657,ds:1.78,el:142,bn:80.8},
  {m:"Sep-24",fy:"FY25",q:"FY25-Q1",gU:2555,gA:3882,cuU:9380,cuA:12020,fx:0.658,ds:1.74,el:145,bn:74.1},
  {m:"Oct-24",fy:"FY25",q:"FY25-Q2",gU:2680,gA:4085,cuU:9540,cuA:12260,fx:0.656,ds:1.71,el:148,bn:76.2},
  {m:"Nov-24",fy:"FY25",q:"FY25-Q2",gU:2638,gA:4028,cuU:9320,cuA:12010,fx:0.655,ds:1.69,el:152,bn:72.8},
  {m:"Dec-24",fy:"FY25",q:"FY25-Q2",gU:2617,gA:4002,cuU:9140,cuA:11820,fx:0.654,ds:1.72,el:155,bn:69.4},
  {m:"Jan-25",fy:"FY25",q:"FY25-Q3",gU:2724,gA:4141,cuU:9020,cuA:11680,fx:0.657,ds:1.76,el:158,bn:78.3},
  {m:"Feb-25",fy:"FY25",q:"FY25-Q3",gU:2882,gA:4384,cuU:9220,cuA:11940,fx:0.657,ds:1.79,el:155,bn:74.6},
  {m:"Mar-25",fy:"FY25",q:"FY25-Q3",gU:3084,gA:4669,cuU:9560,cuA:12360,fx:0.661,ds:1.81,el:152,bn:71.2},
  {m:"Apr-25",fy:"FY25",q:"FY25-Q4",gU:3102,gA:4706,cuU:9840,cuA:12680,fx:0.659,ds:1.83,el:148,bn:66.8},
  {m:"May-25",fy:"FY25",q:"FY25-Q4",gU:3180,gA:4828,cuU:9520,cuA:12320,fx:0.659,ds:1.80,el:145,bn:62.4},
  {m:"Jun-25",fy:"FY25",q:"FY25-Q4",gU:3246,gA:4920,cuU:9340,cuA:12120,fx:0.660,ds:1.77,el:142,bn:67.3},
  {m:"Jul-25",fy:"FY26",q:"FY26-Q1",gU:3350,gA:5210,cuU:9140,cuA:11780,fx:0.643,ds:1.75,el:145,bn:71.4},
  {m:"Aug-25",fy:"FY26",q:"FY26-Q1",gU:3380,gA:5256,cuU:9080,cuA:11720,fx:0.644,ds:1.78,el:148,bn:73.2},
  {m:"Sep-25",fy:"FY26",q:"FY26-Q1",gU:3480,gA:5410,cuU:8960,cuA:11550,fx:0.643,ds:1.82,el:152,bn:70.8},
  {m:"Oct-25",fy:"FY26",q:"FY26-Q2",gU:3450,gA:5408,cuU:9200,cuA:11900,fx:0.638,ds:1.84,el:155,bn:68.4},
  {m:"Nov-25",fy:"FY26",q:"FY26-Q2",gU:3480,gA:5454,cuU:9360,cuA:12080,fx:0.638,ds:1.86,el:158,bn:65.2},
  {m:"Dec-25",fy:"FY26",q:"FY26-Q2",gU:3490,gA:5468,cuU:9440,cuA:12190,fx:0.638,ds:1.88,el:162,bn:66.8},
  {m:"Jan-26",fy:"FY26",q:"FY26-Q3",gU:3500,gA:5512,cuU:9560,cuA:12380,fx:0.635,ds:1.85,el:165,bn:69.4},
  {m:"Feb-26",fy:"FY26",q:"FY26-Q3",gU:3560,gA:5606,cuU:9480,cuA:12280,fx:0.635,ds:1.82,el:162,bn:72.1},
  {m:"Mar-26",fy:"FY26",q:"FY26-Q3",gU:3560,gA:5606,cuU:9380,cuA:12160,fx:0.635,ds:1.80,el:158,bn:70.8},
  {m:"Apr-26",fy:"FY26",q:"FY26-Q4",gU:3500,gA:5486,cuU:9260,cuA:12010,fx:0.638,ds:1.78,el:155,bn:68.2},
  {m:"May-26",fy:"FY26",q:"FY26-Q4",gU:3450,gA:5407,cuU:9140,cuA:11880,fx:0.638,ds:1.76,el:152,bn:65.4},
  {m:"Jun-26",fy:"FY26",q:"FY26-Q4",gU:3410,gA:5344,cuU:9020,cuA:11750,fx:0.638,ds:1.75,el:148,bn:63.8},
];
const FALLBACK_SENS = [
  {driver:"Gold Price",     change:"+A$100/oz",         unit:"A$/oz",  npat_yr:11480,  aisc:0,   fav:true},
  {driver:"Gold Price",     change:"-A$100/oz",         unit:"A$/oz",  npat_yr:-11480, aisc:0,   fav:false},
  {driver:"Copper LME",     change:"+US$500/t",         unit:"US$/t",  npat_yr:2632,   aisc:-23, fav:true},
  {driver:"Copper LME",     change:"-US$500/t",         unit:"US$/t",  npat_yr:-2632,  aisc:23,  fav:false},
  {driver:"AUD/USD",        change:"-0.01 (weaker)",    unit:"rate",   npat_yr:9464,   aisc:0,   fav:true},
  {driver:"AUD/USD",        change:"+0.01 (stronger)",  unit:"rate",   npat_yr:-9464,  aisc:0,   fav:false},
  {driver:"Diesel",         change:"-A$0.10/L",         unit:"A$/L",   npat_yr:1904,   aisc:-17, fav:true},
  {driver:"Diesel",         change:"+A$0.10/L",         unit:"A$/L",   npat_yr:-1904,  aisc:17,  fav:false},
  {driver:"Electricity",    change:"-A$10/MWh",         unit:"A$/MWh", npat_yr:1232,   aisc:-11, fav:true},
  {driver:"Electricity",    change:"+A$10/MWh",         unit:"A$/MWh", npat_yr:-1232,  aisc:11,  fav:false},
];
const FALLBACK_PRESETS = {
  bull:   {gold:300,  copper:1000,  fx:-0.02, diesel:-0.05, elec:0},
  bear:   {gold:-400, copper:-1000, fx:0.02,  diesel:0.20,  elec:20},
  fuel:   {gold:120,  copper:0,     fx:-0.01, diesel:0.22,  elec:15},
  energy: {gold:0,    copper:0,     fx:0,     diesel:0.15,  elec:30},
  reset:  {gold:0,    copper:0,     fx:0,     diesel:0,     elec:0},
};

// ─── Live data (initialised from fallbacks, overwritten by API) ───────────────
let data = FALLBACK_DATA, sensData = FALLBACK_SENS, presets = FALLBACK_PRESETS;
let chartInstances = {};

// ─── Chart defaults ───────────────────────────────────────────────────────────
Chart.defaults.color = '#8b8fa8';
Chart.defaults.borderColor = '#2a2d3a';
const OPTS = {
  responsive: true, maintainAspectRatio: true,
  plugins: { legend: { labels: { boxWidth:10, font:{size:11} } } },
  scales: { x: { ticks:{font:{size:10}, maxRotation:45} }, y: { ticks:{font:{size:10}} } },
};
function lineDS(label, d, color, yAxisID) {
  return { label, data:d, borderColor:color, backgroundColor:color+'22', borderWidth:2, pointRadius:2, tension:0.3, fill:false, yAxisID };
}
function mkChart(id, config) {
  if (chartInstances[id]) chartInstances[id].destroy();
  chartInstances[id] = new Chart(document.getElementById(id), config);
}

// ─── Render functions ─────────────────────────────────────────────────────────
function renderCharts() {
  const labels = data.map(d => d.m);
  mkChart('chartGold', { type:'line', data:{ labels, datasets:[lineDS('A$/oz', data.map(d=>d.gA),'#f5a623','yA'), lineDS('US$/oz',data.map(d=>d.gU),'#e0c060','yU')] }, options:{...OPTS, scales:{x:OPTS.scales.x, yA:{position:'left',ticks:{font:{size:10}},title:{display:true,text:'A$/oz',font:{size:10}}}, yU:{position:'right',ticks:{font:{size:10}},grid:{drawOnChartArea:false},title:{display:true,text:'US$/oz',font:{size:10}}}}} });
  mkChart('chartCopper', { type:'line', data:{ labels, datasets:[lineDS('LME US$/t',data.map(d=>d.cuU),'#c0704a','y')] }, options:OPTS });
  mkChart('chartFuel', { type:'line', data:{ labels, datasets:[lineDS('Diesel A$/L',data.map(d=>d.ds),'#e8a130','yD'), lineDS('Brent US$/bbl',data.map(d=>d.bn),'#9b6bf5','yB')] }, options:{...OPTS, scales:{x:OPTS.scales.x, yD:{position:'left',ticks:{font:{size:10}},title:{display:true,text:'A$/L',font:{size:10}}}, yB:{position:'right',ticks:{font:{size:10}},grid:{drawOnChartArea:false},title:{display:true,text:'US$/bbl',font:{size:10}}}}} });
  mkChart('chartElec', { type:'line', data:{ labels, datasets:[lineDS('A$/MWh',data.map(d=>d.el),'#4acfe8','y')] }, options:OPTS });
  mkChart('chartFX', { type:'line', data:{ labels, datasets:[lineDS('AUD/USD',data.map(d=>d.fx),'#4a9ef5','y')] }, options:{...OPTS, scales:{x:OPTS.scales.x, y:{min:0.60,max:0.70,ticks:{font:{size:10}}}}} });
}

function renderKPIs() {
  const latest = data[data.length - 1];
  const kpiDefs = [
    {label:'Gold Price',  value:\`A\$\${latest.gA.toLocaleString()}\`, sub:'per oz',     cls:'gold'},
    {label:'Gold (USD)',  value:\`US\$\${latest.gU.toLocaleString()}\`,sub:'per oz',     cls:'gold'},
    {label:'Copper LME', value:\`US\$\${latest.cuU.toLocaleString()}\`,sub:'per tonne',  cls:'copper'},
    {label:'AUD/USD',    value:latest.fx.toFixed(3),                  sub:'exchange rate',cls:'audusd'},
    {label:'Diesel',     value:\`A\$\${latest.ds.toFixed(2)}\`,        sub:'per litre',  cls:'diesel'},
    {label:'Electricity',value:\`A\$\${latest.el}\`,                   sub:'per MWh',    cls:'elec'},
    {label:'Brent Crude',value:\`US\$\${latest.bn}\`,                  sub:'per barrel', cls:'brent'},
  ];
  document.getElementById('kpiRow').innerHTML = kpiDefs.map(k =>
    \`<div class="kpi \${k.cls}"><div class="label">\${k.label}</div><div class="value">\${k.value}</div><div class="sub">\${k.sub} &middot; \${latest.m}</div></div>\`
  ).join('');
}

function renderSensitivity() {
  const fav = sensData.filter(s => s.fav);
  mkChart('chartSens', {
    type:'bar',
    data:{ labels:fav.map(s=>\`\${s.driver} (\${s.change})\`), datasets:[{ label:'Full-Year NPAT A$000', data:fav.map(s=>s.npat_yr), backgroundColor:fav.map(s=>s.npat_yr>=0?'#34c77b88':'#e0555588'), borderColor:fav.map(s=>s.npat_yr>=0?'#34c77b':'#e05555'), borderWidth:1 }] },
    options:{...OPTS, indexAxis:'y', scales:{x:{ticks:{font:{size:10}}},y:{ticks:{font:{size:10}}}}},
  });
  const maxAbs = Math.max(...sensData.map(s=>Math.abs(s.npat_yr)));
  document.getElementById('sensTable').innerHTML = \`<tr>
    <th>Driver</th><th>Change</th><th>NPAT/yr (A$000)</th><th>AISC Change (A$/oz)</th><th class="bar-cell">Relative Impact</th>
  </tr>\` + sensData.map(s => {
    const pct = (Math.abs(s.npat_yr)/maxAbs*100).toFixed(0);
    const cls = s.fav ? 'fav' : 'unfav';
    const bc  = s.fav ? '#34c77b' : '#e05555';
    return \`<tr>
      <td>\${s.driver}</td><td>\${s.change}</td>
      <td class="\${cls}">\${s.npat_yr>=0?'+':''}\${s.npat_yr.toLocaleString()}</td>
      <td class="\${s.aisc<=0?'fav':'unfav'}">\${s.aisc===0?'&mdash;':(s.aisc>0?'+':'')+s.aisc}</td>
      <td class="bar-cell"><div class="bar-wrap"><div class="bar-fill" style="width:\${pct}%;background:\${bc};"></div></div></td>
    </tr>\`;
  }).join('');
}

function renderPresets() {
  const PRESET_LABELS = { bull:'Bull Case', bear:'Bear Case', fuel:'Fuel Shock', energy:'Energy Pressure', reset:'Reset' };
  document.getElementById('presetRow').innerHTML = Object.keys(PRESET_LABELS).map(k =>
    \`<button class="preset-btn" onclick="applyPreset('\${k}')">\${PRESET_LABELS[k]}</button>\`
  ).join('');
}

function renderAll() {
  renderKPIs();
  renderCharts();
  renderSensitivity();
  renderPresets();
  runScenario();
}

// ─── API bootstrap ────────────────────────────────────────────────────────────
async function apiFetch(path, params={}) {
  const url = new URL(API_BASE + path);
  Object.entries(params).forEach(([k,v]) => { if(v!=null) url.searchParams.set(k,String(v)); });
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(\`API \${res.status}\`);
  return res.json();
}

async function bootstrapFromAPI() {
  document.getElementById('apiStatus').innerHTML = 'Connecting to API&hellip;';
  try {
    const [prices, sens, scenarios] = await Promise.all([
      apiFetch('/api/market/prices'),
      apiFetch('/api/market/sensitivity'),
      apiFetch('/api/market/scenarios'),
    ]);
    data = prices.items.map(p => ({
      m:p.month, fy:p.fyYear, q:p.fyQuarter,
      gU:p.goldUsdOz, gA:p.goldAudOz,
      cuU:p.copperLmeUsdT, cuA:p.copperAudTNet,
      fx:p.audUsd, ds:p.dieselAudL,
      el:p.electricityAudMwh, bn:p.brentUsdBbl,
    }));
    sensData = sens.items.map(s => ({
      driver:s.driver, change:s.change, unit:s.unit,
      npat_yr:s.impacts.npatAud000FullYear,
      aisc:s.impacts.aiscAudOzChange,
      fav:s.direction==='favourable',
    }));
    const nameMap = {'Bull Case':'bull','Bear Case':'bear','Fuel Shock':'fuel','Energy Transition Pressure':'energy'};
    presets = { reset:{gold:0,copper:0,fx:0,diesel:0,elec:0} };
    scenarios.items.forEach(s => {
      const key = nameMap[s.name];
      if (key) presets[key] = { gold:s.assumptions.goldDeltaAudOz, copper:s.assumptions.copperDeltaUsdT, fx:s.assumptions.audUsdDelta, diesel:s.assumptions.dieselDeltaAudL, elec:s.assumptions.electricityDeltaAudMwh };
    });
    document.getElementById('apiStatus').innerHTML = '<span class="live-dot"></span>Live &mdash; API connected';
  } catch(e) {
    document.getElementById('apiStatus').textContent = 'Using embedded data';
  }
}

// ─── UI helpers ───────────────────────────────────────────────────────────────
function showPage(id, btn) {
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('nav button').forEach(b=>b.classList.remove('active'));
  document.getElementById('page-'+id).classList.add('active');
  if(btn) btn.classList.add('active');
}
function updateLabel(id, val, unit, dec=0) {
  const v=parseFloat(val); document.getElementById(id).textContent=(v>=0?'+':'')+v.toFixed(dec)+' '+unit;
}
function updateFxLabel(val) {
  const v=parseFloat(val); document.getElementById('fxLbl').textContent=(v>=0?'+':'')+v.toFixed(3);
}
function applyPreset(name) {
  const p=presets[name]||FALLBACK_PRESETS[name]; if(!p) return;
  document.getElementById('goldSlider').value=p.gold;     updateLabel('goldLbl',p.gold,'A$/oz');
  document.getElementById('copperSlider').value=p.copper; updateLabel('copperLbl',p.copper,'US$/t');
  document.getElementById('fxSlider').value=p.fx;         updateFxLabel(p.fx);
  document.getElementById('dieselSlider').value=p.diesel; updateLabel('dieselLbl',p.diesel,'A$/L',2);
  document.getElementById('elecSlider').value=p.elec;     updateLabel('elecLbl',p.elec,'A$/MWh');
  runScenario();
}

// ─── Scenario calculation (client-side, mirrors /api/market/scenario/run) ─────
function runScenario() {
  const gold   = parseFloat(document.getElementById('goldSlider').value);
  const copper = parseFloat(document.getElementById('copperSlider').value);
  const fx     = parseFloat(document.getElementById('fxSlider').value);
  const diesel = parseFloat(document.getElementById('dieselSlider').value);
  const elec   = parseFloat(document.getElementById('elecSlider').value);
  const goldNpat  = gold   * 28.70;
  const cuNpat    = copper *  1.316;
  const fxNpat    = (fx   / 0.001) * -338.0;
  const fuelNpat  = (diesel/ 0.01) * -476.0;
  const elecNpat  = elec   * -30.80;
  const cuAisc    = copper * -0.046;
  const fuelAisc  = (diesel/0.01) * 1.70;
  const elecAisc  = elec * 0.11;
  const totalNpat = goldNpat+cuNpat+fxNpat+fuelNpat+elecNpat;
  const totalAisc = cuAisc+fuelAisc+elecAisc;
  const color = v => v>=0?'var(--green)':'var(--red)';
  document.getElementById('res-npat-qtr').textContent=(totalNpat>=0?'+':'')+Math.round(totalNpat).toLocaleString()+' A$k';
  document.getElementById('res-npat-qtr').style.color=color(totalNpat);
  document.getElementById('res-npat-yr').textContent=(totalNpat*4>=0?'+':'')+Math.round(totalNpat*4).toLocaleString()+' A$k';
  document.getElementById('res-npat-yr').style.color=color(totalNpat);
  document.getElementById('res-aisc').textContent=(totalAisc>=0?'+':'')+Math.round(totalAisc)+' A$/oz';
  document.getElementById('res-aisc').style.color=color(-totalAisc);
  const breakdown=[{name:'Gold',val:goldNpat},{name:'Copper',val:cuNpat},{name:'AUD/USD',val:fxNpat},{name:'Diesel',val:fuelNpat},{name:'Electricity',val:elecNpat}];
  const maxB=Math.max(...breakdown.map(b=>Math.abs(b.val)),1);
  document.getElementById('waterfall').innerHTML=breakdown.map(b=>{
    const pct=(Math.abs(b.val)/maxB*100).toFixed(0);
    const bc=b.val>=0?'var(--green)':'var(--red)';
    return \`<div class="waterfall-row"><div class="name">\${b.name}</div><div class="bar-outer"><div class="bar-inner" style="width:\${pct}%;background:\${bc};"></div></div><div class="amt" style="color:\${bc}">\${b.val>=0?'+':''}\${Math.round(b.val).toLocaleString()}</div></div>\`;
  }).join('');
}

// ─── Init ─────────────────────────────────────────────────────────────────────
renderAll();
bootstrapFromAPI().then(() => renderAll());
window.addEventListener('resize', renderCharts);
<\/script>
</body>
</html>`;
  return htmlRes(page);
}

// ─── Route: GET /api/market/prices ────────────────────────────────────────────
/**
 * Query params:
 *   commodity  string   Column name (CSV or camelCase), e.g. "Gold_AUD_oz" or "goldAudOz"
 *   fyQuarter  string   e.g. "FY26-Q1"
 *   fyYear     string   e.g. "FY26"  (ignored if fyQuarter set)
 *   format     string   "json" | "csv"  (default: json)
 */
function handlePrices(args) {
  const format = (args.format || 'json').toLowerCase();
  if (!['json', 'csv'].includes(format)) return badRequest('format must be "json" or "csv"');

  let items = [...COMMODITY_PRICES];

  if (args.fyQuarter) {
    items = items.filter(r => r.fyQuarter === args.fyQuarter);
  } else if (args.fyYear) {
    items = items.filter(r => r.fyYear === args.fyYear);
  }

  const col = args.commodity ? resolveColumn(args.commodity) : null;
  if (args.commodity && !col) {
    return badRequest(`Unknown commodity "${args.commodity}". Valid values: ${PRICE_COLUMNS.concat(PRICE_COLUMNS_CC).join(', ')}`);
  }

  const filter = args.fyQuarter || args.fyYear || 'all periods';

  if (format === 'csv') {
    const colsOut = col ? ['month', 'fyYear', 'fyQuarter', col] : ['month', 'fyYear', 'fyQuarter', ...PRICE_COLUMNS_CC];
    const headerMap = { month:'Month', fyYear:'FY_Year', fyQuarter:'FY_Quarter', goldUsdOz:'Gold_USD_oz', goldAudOz:'Gold_AUD_oz', copperLmeUsdT:'Copper_LME_USD_t', copperAudTNet:'Copper_AUD_t_net', audUsd:'AUDUSD', dieselAudL:'Diesel_AUD_L', electricityAudMwh:'Electricity_AUD_MWh', anfoAudT:'ANFO_AUD_t', cyanideAudT:'Cyanide_AUD_t', steelBallsAudT:'SteelBalls_AUD_t', brentUsdBbl:'Brent_USD_bbl' };
    const headers = colsOut.map(c => headerMap[c] || c);
    const rows = items.map(r => colsOut.map(c => r[c] != null ? r[c] : '').join(','));
    return csvRes([headers.join(','), ...rows].join('\n'), 'ironfield_commodity_prices.csv');
  }

  const out = items.map(r => {
    const item = { month: r.month, fyYear: r.fyYear, fyQuarter: r.fyQuarter };
    if (col) {
      item[col] = r[col];
    } else {
      PRICE_COLUMNS_CC.forEach(c => { item[c] = r[c]; });
    }
    return item;
  });

  return jsonRes({
    total:     out.length,
    commodity: col || 'all',
    filter,
    columns:   col ? ['month','fyYear','fyQuarter',col] : ['month','fyYear','fyQuarter',...PRICE_COLUMNS_CC],
    items:     out,
  });
}

// ─── Route: GET /api/market/prices/latest ─────────────────────────────────────
/**
 * Returns the most recent month's prices as a flat object.
 */
function handlePricesLatest() {
  const latest = COMMODITY_PRICES[COMMODITY_PRICES.length - 1];
  return jsonRes({ asOf: latest.month, fyYear: latest.fyYear, fyQuarter: latest.fyQuarter, prices: latest });
}

// ─── Route: GET /api/market/sensitivity ──────────────────────────────────────
/**
 * Query params:
 *   driver     string  Filter by driver name (partial, case-insensitive)
 *   direction  string  "favourable" | "unfavourable"
 */
function handleSensitivity(args) {
  let items = [...SENSITIVITIES];

  if (args.driver) {
    const d = args.driver.toLowerCase();
    items = items.filter(s => s.driver.toLowerCase().includes(d));
  }
  if (args.direction) {
    const dir = args.direction.toLowerCase();
    if (!['favourable', 'unfavourable'].includes(dir)) return badRequest('direction must be "favourable" or "unfavourable"');
    items = items.filter(s => s.direction === dir);
  }

  return jsonRes({
    basis:            SENSITIVITY_BASIS,
    driverFilter:     args.driver || 'all',
    directionFilter:  args.direction || 'all',
    total:            items.length,
    items,
  });
}

// ─── Route: GET /api/market/scenarios ────────────────────────────────────────
function handleScenarios() {
  return jsonRes({ basis: SENSITIVITY_BASIS, total: COMBINED_SCENARIOS.length, items: COMBINED_SCENARIOS });
}

// ─── Route: GET /api/market/scenario/run ─────────────────────────────────────
/**
 * Query params (all optional, default 0):
 *   goldDeltaAudOz           number   e.g. +200 or -150
 *   copperDeltaUsdT          number   e.g. +500
 *   audUsdDelta              number   e.g. +0.02
 *   dieselDeltaAudL          number   e.g. +0.15
 *   electricityDeltaAudMwh   number   e.g. +20
 */
function handleScenarioRun(args) {
  const goldDelta  = parseFloat(args.goldDeltaAudOz          || 0);
  const cuDelta    = parseFloat(args.copperDeltaUsdT          || 0);
  const fxDelta    = parseFloat(args.audUsdDelta              || 0);
  const fuelDelta  = parseFloat(args.dieselDeltaAudL          || 0);
  const elecDelta  = parseFloat(args.electricityDeltaAudMwh   || 0);

  if ([goldDelta, cuDelta, fxDelta, fuelDelta, elecDelta].some(isNaN)) {
    return badRequest('All delta parameters must be numeric');
  }

  const UNIT = {
    goldAudOz:    { npatPer: 28.70,   aiscPer: 0.00    },
    copperUsdT:   { npatPer: 1.316,   aiscPer: -0.046  },
    audUsd001:    { npatPer: -338.0,  aiscPer: 0.00    },
    dieselAud01L: { npatPer: -476.0,  aiscPer: 1.70    },
    elecAudMwh:   { npatPer: -30.80,  aiscPer: 0.11    },
  };

  const r = v => Math.round(v * 10) / 10;

  const goldNpat  = goldDelta * UNIT.goldAudOz.npatPer;
  const goldAisc  = goldDelta * UNIT.goldAudOz.aiscPer;
  const cuNpat    = cuDelta   * UNIT.copperUsdT.npatPer;
  const cuAisc    = cuDelta   * UNIT.copperUsdT.aiscPer;
  const fxNpat    = (fxDelta   / 0.001) * UNIT.audUsd001.npatPer;
  const fxAisc    = (fxDelta   / 0.001) * UNIT.audUsd001.aiscPer;
  const fuelNpat  = (fuelDelta / 0.01)  * UNIT.dieselAud01L.npatPer;
  const fuelAisc  = (fuelDelta / 0.01)  * UNIT.dieselAud01L.aiscPer;
  const elecNpat  = elecDelta  * UNIT.elecAudMwh.npatPer;
  const elecAisc  = elecDelta  * UNIT.elecAudMwh.aiscPer;

  const totalNpatQtr = goldNpat + cuNpat + fxNpat + fuelNpat + elecNpat;
  const totalAisc    = goldAisc + cuAisc + fxAisc + fuelAisc + elecAisc;

  return jsonRes({
    inputs: { goldDeltaAudOz: goldDelta, copperDeltaUsdT: cuDelta, audUsdDelta: fxDelta, dieselDeltaAudL: fuelDelta, electricityDeltaAudMwh: elecDelta },
    baseCase: { goldPriceAudOz: SENSITIVITY_BASIS.baseGoldPriceAudOz, aiscAudOz: SENSITIVITY_BASIS.baseAiscAudOz, npatAud000Qtr: SENSITIVITY_BASIS.baseNpatAud000Qtr },
    scenario: {
      impliedGoldPriceAudOz: SENSITIVITY_BASIS.baseGoldPriceAudOz + goldDelta,
      impliedAiscAudOz:      Math.round(SENSITIVITY_BASIS.baseAiscAudOz + totalAisc),
      impliedNpatAud000Qtr:  Math.round(SENSITIVITY_BASIS.baseNpatAud000Qtr + totalNpatQtr),
    },
    impact: {
      totalNpatAud000Qtr:      r(totalNpatQtr),
      totalNpatAud000FullYear: r(totalNpatQtr * 4),
      totalAiscChangeAudOz:    r(totalAisc),
      breakdown: {
        goldPrice:   { npatQtr: r(goldNpat),  aisc: r(goldAisc)  },
        copperPrice: { npatQtr: r(cuNpat),    aisc: r(cuAisc)    },
        audUsd:      { npatQtr: r(fxNpat),    aisc: r(fxAisc)    },
        diesel:      { npatQtr: r(fuelNpat),  aisc: r(fuelAisc)  },
        electricity: { npatQtr: r(elecNpat),  aisc: r(elecAisc)  },
      },
    },
  });
}

// ─── Route: GET /api/market/summary ──────────────────────────────────────────
/**
 * Dashboard-ready rollup: latest prices + sensitivity highlights + FY26 base case.
 */
function handleSummary() {
  const latest  = COMMODITY_PRICES[COMMODITY_PRICES.length - 1];
  const fy26    = COMMODITY_PRICES.filter(r => r.fyYear === 'FY26');
  const fy25    = COMMODITY_PRICES.filter(r => r.fyYear === 'FY25');

  function avg(arr, key) {
    const vals = arr.map(r => r[key]).filter(v => v != null);
    return vals.length ? parseFloat((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2)) : null;
  }

  return jsonRes({
    asOf:       latest.month,
    fyYear:     latest.fyYear,
    fyQuarter:  latest.fyQuarter,
    latestPrices: {
      goldAudOz:          latest.goldAudOz,
      goldUsdOz:          latest.goldUsdOz,
      copperLmeUsdT:      latest.copperLmeUsdT,
      audUsd:             latest.audUsd,
      dieselAudL:         latest.dieselAudL,
      electricityAudMwh:  latest.electricityAudMwh,
      brentUsdBbl:        latest.brentUsdBbl,
    },
    fy26Averages: {
      goldAudOz:          avg(fy26, 'goldAudOz'),
      goldUsdOz:          avg(fy26, 'goldUsdOz'),
      copperLmeUsdT:      avg(fy26, 'copperLmeUsdT'),
      audUsd:             avg(fy26, 'audUsd'),
      dieselAudL:         avg(fy26, 'dieselAudL'),
      electricityAudMwh:  avg(fy26, 'electricityAudMwh'),
    },
    fy25Averages: {
      goldAudOz:          avg(fy25, 'goldAudOz'),
      goldUsdOz:          avg(fy25, 'goldUsdOz'),
      copperLmeUsdT:      avg(fy25, 'copperLmeUsdT'),
      audUsd:             avg(fy25, 'audUsd'),
      dieselAudL:         avg(fy25, 'dieselAudL'),
      electricityAudMwh:  avg(fy25, 'electricityAudMwh'),
    },
    planningBaseCase: {
      goldPriceAudOz: SENSITIVITY_BASIS.baseGoldPriceAudOz,
      aiscAudOz:      SENSITIVITY_BASIS.baseAiscAudOz,
      npatAud000Qtr:  SENSITIVITY_BASIS.baseNpatAud000Qtr,
    },
  });
}

// ─── Router ───────────────────────────────────────────────────────────────────

function route(method, rawPath, args) {
  const p = (rawPath || '/').replace(/\/$/, '') || '/';

  if (method === 'OPTIONS') return preflight();
  if (method !== 'GET')     return jsonRes({ error: `Method ${method} not allowed` }, 405);

  if (p === '' || p === '/') return handleRoot();

  if (p === '/api/market/prices/latest') return handlePricesLatest();
  if (p === '/api/market/prices')        return handlePrices(args);
  if (p === '/api/market/sensitivity')   return handleSensitivity(args);
  if (p === '/api/market/scenarios')     return handleScenarios();
  if (p === '/api/market/scenario/run')  return handleScenarioRun(args);
  if (p === '/api/market/summary')       return handleSummary();

  return notFound(`No route for GET ${p}`);
}

// ─── IBM Code Engine / OpenWhisk entrypoint ───────────────────────────────────

function main(args) {
  const method  = (args.__ow_method || args.__ce_method || args.method || 'GET').toUpperCase();
  const rawPath =  args.__ow_path   || args.__ce_path   || args.path   || '/';

  try {
    return route(method, rawPath, args);
  } catch (err) {
    console.error('Unhandled error:', err);
    return jsonRes({ error: 'Internal server error', detail: err.message }, 500);
  }
}

module.exports.main = main;
