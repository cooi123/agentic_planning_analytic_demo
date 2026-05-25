'use strict';

const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;
const STATIC = path.join(__dirname, 'static');

// ─── Navigation ───────────────────────────────────────────────────────────────

const NAV_STYLE = `
<style id="__ih-nav-css">
  #__ih-nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 99999;
    height: 56px; display: flex; align-items: center; gap: 8px;
    background: #1a1d27; border-bottom: 1px solid #2a2d3a;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 13px; padding: 0 20px; box-sizing: border-box;
    box-shadow: 0 8px 24px rgba(0,0,0,0.22);
  }
  #__ih-nav a.ih-brand {
    color: #f5a623; font-weight: 700; font-size: 14px; letter-spacing: 0.04em;
    text-decoration: none; margin-right: 18px; white-space: nowrap;
  }
  #__ih-nav a.ih-link {
    color: #8b8fa8; text-decoration: none; padding: 8px 14px;
    border-radius: 6px; transition: background 0.15s, color 0.15s, border-color 0.15s;
    white-space: nowrap; border: 1px solid transparent;
  }
  #__ih-nav a.ih-link:hover { background: #202432; color: #e4e6f0; border-color: #3a4052; }
  #__ih-nav a.ih-link.active { background: #202432; color: #e4e6f0; border-color: #f5a623; font-weight: 600; }
  #__ih-nav .ih-sep { flex: 1; }
  body { padding-top: 60px !important; }
</style>`;

function navBar(active) {
  const links = [
    { href: '/',         label: 'AI Agent',          key: 'agent'    },
    { href: '/market',   label: 'Market Data',       key: 'market'   },
    { href: '/planning', label: 'Planning Analytics',key: 'planning' },
    { href: '/reports',  label: 'Reports',           key: 'reports'  },
  ];
  const items = links
    .map(l => `<a href="${l.href}" class="ih-link${active === l.key ? ' active' : ''}">${l.label}</a>`)
    .join('');
  return `<nav id="__ih-nav"><a href="/" class="ih-brand">Ironfield Hub</a>${items}<span class="ih-sep"></span></nav>`;
}

function injectNav(html, active) {
  // Insert CSS before </head>
  html = html.replace('</head>', NAV_STYLE + '\n</head>');
  // Insert nav bar as first child of <body>
  html = html.replace(/<body([^>]*)>/i, (m, attrs) => `<body${attrs}>${navBar(active)}`);
  return html;
}

function readStatic(rel) {
  return fs.readFileSync(path.join(STATIC, rel), 'utf8');
}

// ─── Reports metadata ─────────────────────────────────────────────────────────

const REPORTS_META = [
  { file: 'half-year-dec-2025.html',            title: 'H1 FY26 Half-Year Report (Dec 2025)',     badge: 'H1 FY26'  },
  { file: 'quarterly-dec-2025.html',            title: 'Quarterly Report — Dec 2025',              badge: 'Q2 FY26'  },
  { file: 'quarterly-sep-2025.html',            title: 'Quarterly Report — Sep 2025',              badge: 'Q1 FY26'  },
  { file: 'investor-presentation-h1-fy26.html', title: 'Investor Presentation H1 FY26',            badge: 'Investor' },
  { file: 'creston-feasibility-study.html',     title: 'Creston Feasibility Study',                badge: 'Study'    },
  { file: 'fy26-guidance.html',                 title: 'FY26 Guidance',                            badge: 'Guidance' },
];

// ─── Reports index page ───────────────────────────────────────────────────────

function reportsIndex() {
  const items = REPORTS_META.map(r => `
    <a class="report-card" href="/reports/${r.file}">
      <span class="report-badge">${r.badge}</span>
      <span class="report-title">${r.title}</span>
      <span class="report-arrow">›</span>
    </a>`).join('');

  return `<!doctype html><html lang="en"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Reports — Ironfield Hub</title>
<style>
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  :root{
    --bg:#0f1117;--surface:#1a1d27;--border:#2a2d3a;--text:#e4e6f0;--muted:#8b8fa8;
    --gold:#f5a623;--green:#34c77b;
  }
  body{
    background:var(--bg);color:var(--text);
    font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
    font-size:14px;min-height:100vh;padding:32px 24px 40px;
  }
  .page{
    max-width:960px;margin:0 auto;
  }
  .hero{
    background:var(--surface);border:1px solid var(--border);border-radius:8px;
    padding:24px;margin-bottom:24px;
  }
  .eyebrow{
    color:var(--gold);font-size:11px;font-weight:700;letter-spacing:.08em;
    text-transform:uppercase;margin-bottom:10px;
  }
  h1{
    font-size:22px;font-weight:600;margin-bottom:8px;color:var(--text);
  }
  .sub{
    color:var(--muted);font-size:13px;line-height:1.5;max-width:680px;
  }
  .list{
    display:flex;flex-direction:column;gap:12px;
  }
  .report-card{
    display:flex;align-items:center;gap:16px;
    background:var(--surface);border:1px solid var(--border);border-radius:8px;
    padding:18px 20px;text-decoration:none;transition:border-color .15s,background .15s,transform .15s;
  }
  .report-card:hover{
    background:#202432;border-color:#3a4052;transform:translateY(-1px);
  }
  .report-badge{
    background:rgba(245,166,35,.14);color:var(--gold);
    font-size:11px;font-weight:700;border:1px solid rgba(245,166,35,.28);
    border-radius:999px;padding:4px 10px;white-space:nowrap;letter-spacing:.04em;
    text-transform:uppercase;
  }
  .report-title{
    color:var(--text);font-size:14px;font-weight:500;
  }
  .report-arrow{
    margin-left:auto;color:var(--muted);font-size:18px;transition:transform .15s,color .15s;
  }
  .report-card:hover .report-arrow{
    color:var(--gold);transform:translateX(2px);
  }
  @media (max-width:640px){
    body{padding:24px 16px 32px}
    .hero{padding:20px}
    .report-card{padding:16px;gap:12px;align-items:flex-start;flex-wrap:wrap}
    .report-title{width:100%}
    .report-arrow{display:none}
  }
</style>
</head><body>
<div class="page">
  <section class="hero">
    <div class="eyebrow">Investor Centre</div>
    <h1>Corporate Reports</h1>
    <p class="sub">Access Ironfield Resources reporting, presentations, studies and guidance updates in a dashboard style aligned with the market data experience.</p>
  </section>
  <div class="list">${items}</div>
</div>
</body></html>`;
}

// ─── Routes ───────────────────────────────────────────────────────────────────

app.get('/', (_req, res) => {
  res.type('html').send(injectNav(readStatic('agent.html'), 'agent'));
});

// /agent kept as alias
app.get('/agent', (_req, res) => res.redirect(301, '/'));

app.get('/market', (_req, res) => {
  let html = readStatic('market.html');
  // Fix API_BASE: the dashboard computes it from window.location.href which would
  // yield /market as the base, making API calls hit /market/api/market/* (wrong).
  html = html.replace(
    /const API_BASE\s*=\s*window\.location\.href[^;]+;/,
    'const API_BASE = window.location.origin;'
  );
  res.type('html').send(injectNav(html, 'market'));
});

app.get('/planning', (_req, res) => {
  res.type('html').send(injectNav(readStatic('planning.html'), 'planning'));
});

app.get('/reports', (_req, res) => {
  res.type('html').send(injectNav(reportsIndex(), 'reports'));
});

const ALLOWED_REPORTS = new Set(REPORTS_META.map(r => r.file));

app.get('/reports/:name', (req, res) => {
  const name = req.params.name;
  if (!ALLOWED_REPORTS.has(name)) return res.status(404).send('Not found');
  const html = readStatic(path.join('reports', name));
  res.type('html').send(injectNav(html, 'reports'));
});

// ─── Market data API (wraps Code Engine handler) ──────────────────────────────

const { main: marketMain } = require('./market-api');

app.get('/api/market/*', (req, res) => {
  const result = marketMain({
    __ow_method: 'GET',
    __ow_path: req.path,
    ...req.query,
  });
  const body = result.body;
  const status = result.statusCode || 200;
  const headers = result.headers || {};
  res.status(status);
  Object.entries(headers).forEach(([k, v]) => res.set(k, v));
  typeof body === 'string' ? res.send(body) : res.json(body);
});

// ─── Start ────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`Ironfield Hub listening on http://localhost:${PORT}`);
});
